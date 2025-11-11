import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ⚙️ CONFIGURAÇÃO DO SISTEMA DE XP
export const XP_CONFIG = {
  BASE_XP: 100,           // XP base para cada nível
  XP_MULTIPLIER: 5,       // Multiplicador por nível
  REWARDS: {
    phrases: 5,
    categories: 5,
    translate: 5,
    numbers: 5,
    challenge: 5,
    video: 10,
    streak: 5,
    perfectScore: 5
  }
};

// 📊 FUNÇÕES AUXILIARES REFATORADAS

/**
 * Calcula XP necessário para completar um nível específico
 * Fórmula: 100 + (5 × nível)
 */
export const getXPRequiredForLevel = (level) => {
  return XP_CONFIG.BASE_XP + (XP_CONFIG.XP_MULTIPLIER * level);
};

/**
 * Calcula o XP total acumulado necessário para alcançar um nível
 * Soma progressiva: nível 1 precisa 105, nível 2 precisa 105+110=215, etc.
 */
export const getTotalXPForLevel = (level) => {
  let totalXP = 0;
  for (let i = 1; i <= level; i++) {
    totalXP += getXPRequiredForLevel(i);
  }
  return totalXP;
};

/**
 * Calcula o nível atual baseado no XP total
 * Usa busca iterativa para encontrar o nível correto
 */
export const calculateLevel = (totalXP) => {
  if (totalXP === 0) return 1;

  let level = 1;
  let accumulatedXP = 0;

  while (accumulatedXP <= totalXP) {
    const xpNeeded = getXPRequiredForLevel(level);
    accumulatedXP += xpNeeded;

    if (accumulatedXP > totalXP) {
      return level;
    }
    level++;
  }

  return level;
};

/**
 * Calcula XP total necessário para o próximo nível
 */
export const calculateXPForNextLevel = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  return getTotalXPForLevel(currentLevel);
};

/**
 * Calcula progresso no nível atual
 */
export const calculateXPProgress = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const xpForPreviousLevel = currentLevel > 1 ? getTotalXPForLevel(currentLevel - 1) : 0;
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);

  const xpInCurrentLevel = totalXP - xpForPreviousLevel;
  const xpNeededForLevel = xpForCurrentLevel - xpForPreviousLevel;

  return {
    current: xpInCurrentLevel,
    needed: xpNeededForLevel,
    percentage: Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
  };
};

// 📈 FUNÇÃO DE DEBUG (útil para testar)
export const debugXPSystem = () => {
  console.log('🔍 XP System Debug:');
  for (let level = 1; level <= 10; level++) {
    const xpRequired = getXPRequiredForLevel(level);
    const totalXP = getTotalXPForLevel(level);
    console.log(`Level ${level}: ${xpRequired} XP needed | Total accumulated: ${totalXP} XP`);
  }
};

// Estado inicial
const initialState = {
  totalXP: 0,
  currentLevel: 1,
  xpProgress: {
    current: 0,
    needed: 105, // Primeiro nível agora precisa de 105 XP
    percentage: 0
  },
  xpBreakdown: {
    phrases: 0,
    categories: 0,
    translate: 0,
    numbers: 0,
    challenge: 0,
    video: 0
  },
  xpToday: 0,
  lastUpdated: null,
  showLevelUpModal: false,
  pendingLevelUp: null,
  loading: false,
  error: null
};

// ============================================
// 🔄 THUNKS ASSÍNCRONOS
// ============================================

/**
 * Adiciona XP ao usuário
 * @param {Object} payload - { mode: 'phrases', amount: 10, metadata: {...} }
 */
export const addXP = createAsyncThunk(
  'xp/addXP',
  async ({ userId, mode, amount, metadata = {} }, { getState, rejectWithValue }) => {
    try {
      console.log(`✨ Adding ${amount} XP for ${mode}`);

      const state = getState().xp;
      const oldLevel = state.currentLevel;
      const newTotalXP = state.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);

      // 1️⃣ ATUALIZA DOCUMENTO PRINCIPAL (atomic operation)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'xpSystem.totalXP': increment(amount),
        [`xpSystem.xpBreakdown.${mode}`]: increment(amount),
        'xpSystem.xpToday': increment(amount),
        'xpSystem.lastUpdated': serverTimestamp()
      });

      // 2️⃣ REGISTRA NO HISTÓRICO (não bloqueia a operação principal)
      const historyRef = collection(db, 'users', userId, 'xp_history');
      addDoc(historyRef, {
        mode,
        xpEarned: amount,
        timestamp: serverTimestamp(),
        metadata
      }).catch(err => {
        // Log mas não falha a operação
        console.warn('⚠️ Failed to save XP history:', err);
      });

      console.log(`✅ XP updated: ${state.totalXP} → ${newTotalXP}`);

      return {
        amount,
        mode,
        newTotalXP,
        oldLevel,
        newLevel,
        leveledUp: newLevel > oldLevel
      };

    } catch (error) {
      console.error('❌ Error adding XP:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Carrega dados de XP do Firebase
 */
export const loadXPData = createAsyncThunk(
  'xp/loadXPData',
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return initialState;
      }

      const data = userDoc.data();
      const xpSystem = data.xpSystem || {};

      return {
        totalXP: xpSystem.totalXP || 0,
        xpBreakdown: xpSystem.xpBreakdown || initialState.xpBreakdown,
        xpToday: xpSystem.xpToday || 0,
        lastUpdated: xpSystem.lastUpdated
      };

    } catch (error) {
      console.error('❌ Error loading XP:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Carrega histórico de XP (para analytics)
 */
export const loadXPHistory = createAsyncThunk(
  'xp/loadXPHistory',
  async ({ userId, days = 7 }, { rejectWithValue }) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historyQuery = query(
        collection(db, 'users', userId, 'xp_history'),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(historyQuery);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📊 Loaded ${history.length} XP activities`);
      return history;

    } catch (error) {
      console.error('❌ Error loading XP history:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Reseta XP do dia (deve ser chamado por Cloud Function à meia-noite)
 * Mas também pode ser chamado manualmente se a última atualização foi ontem
 */
export const resetDailyXP = createAsyncThunk(
  'xp/resetDailyXP',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState().xp;

      // Verifica se já resetou hoje
      if (state.lastUpdated) {
        const lastUpdate = new Date(state.lastUpdated.seconds * 1000);
        const today = new Date();

        if (lastUpdate.toDateString() === today.toDateString()) {
          console.log('ℹ️ XP already reset today');
          return state.xpToday;
        }
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'xpSystem.xpToday': 0
      });

      console.log('🔄 Daily XP reset');
      return 0;

    } catch (error) {
      console.error('❌ Error resetting daily XP:', error);
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// 🎯 SLICE
// ============================================

const xpSlice = createSlice({
  name: 'xp',
  initialState,
  reducers: {
    // Fecha modal de level up
    closeLevelUpModal: (state) => {
      state.showLevelUpModal = false;
      state.pendingLevelUp = null;
    },

    // Atualiza XP localmente (para preview, antes de salvar)
    updateLocalXP: (state, action) => {
      const { mode, amount } = action.payload;
      state.xpBreakdown[mode] += amount;
      state.totalXP += amount;
      state.xpToday += amount;
      state.currentLevel = calculateLevel(state.totalXP);
      state.xpProgress = calculateXPProgress(state.totalXP);
    },

    // Reseta estado (logout)
    resetXPState: () => initialState
  },

  extraReducers: (builder) => {
    // ADD XP
    builder
      .addCase(addXP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addXP.fulfilled, (state, action) => {
        state.loading = false;

        const { amount, mode, newTotalXP, oldLevel, newLevel, leveledUp } = action.payload;

        // Atualiza breakdown
        state.xpBreakdown[mode] += amount;
        state.totalXP = newTotalXP;
        state.xpToday += amount;
        state.currentLevel = newLevel;
        state.xpProgress = calculateXPProgress(newTotalXP);
        state.lastUpdated = new Date();

        // Mostra modal se subiu de nível
        if (leveledUp) {
          state.showLevelUpModal = true;
          state.pendingLevelUp = newLevel;
          console.log(`🎉 LEVEL UP! ${oldLevel} → ${newLevel}`);
        }
      })
      .addCase(addXP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // LOAD XP DATA
    builder
      .addCase(loadXPData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadXPData.fulfilled, (state, action) => {
        state.loading = false;
        state.totalXP = action.payload.totalXP;
        state.xpBreakdown = action.payload.xpBreakdown;
        state.xpToday = action.payload.xpToday;
        state.lastUpdated = action.payload.lastUpdated;
        state.currentLevel = calculateLevel(action.payload.totalXP);
        state.xpProgress = calculateXPProgress(action.payload.totalXP);
      })
      .addCase(loadXPData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // RESET DAILY XP
    builder
      .addCase(resetDailyXP.fulfilled, (state, action) => {
        state.xpToday = action.payload;
      });
  }
});

export const {
  closeLevelUpModal,
  updateLocalXP,
  resetXPState
} = xpSlice.actions;

export default xpSlice.reducer;