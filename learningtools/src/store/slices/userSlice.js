import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithGoogle,
  signOut as authSignOut,
  getCurrentUser
} from '../../services/authService';
import {
  getOrCreateGuestId,
  loadGuestData,
  saveGuestData,
  loadAuthUserData,
  saveAuthUserData,
  migrateGuestToAuth
} from '../../services/userService';

// Estado inicial
const initialState = {
  // Modo do usuário
  mode: 'guest', // 'guest' | 'authenticated'
  userId: null,

  // Perfil
  profile: {
    displayName: 'Anonymous',
    email: null,
    photoURL: null
  },

  levelSystem: {
    currentLevel: 1,
    globalCompletedPhrases: [],  // IDs das frases
    globalCompletedIndices: [],  // ✅ NOVO: Índices das frases (para exibição)
    showLevelUpModal: false,
    pendingLevelUp: null
  },

  // Progresso
  progress: {
    chunkTrainer: {
      currentIndex: 0,
      completedPhrases: [],
      completedCount: 0
    }
  },

  // Estatísticas
  stats: {
    totalPhrases: 0,
    totalAttempts: 0,
    correctCount: 0,
    accuracy: 0,
    streak: 0,
    challengeHighScore: 0
  },

  // Incentivos
  incentives: {
    phrasesUntilPrompt: 5, // Mostra modal após 5 frases
    hasSeenPrompt: false,
    lastPromptAt: null
  },

  // Status
  loading: false,
  error: null,
  syncStatus: 'synced' // 'synced' | 'syncing' | 'error'
};

// Thunks Assíncronos

/**
 * Inicializa usuário (carrega dados)
 */
export const initializeUser = createAsyncThunk(
  'user/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = getCurrentUser();

      if (currentUser) {
        // Usuário autenticado
        const userData = await loadAuthUserData(currentUser.uid);

        if (userData) {
          return {
            mode: 'authenticated',
            userId: currentUser.uid,
            profile: userData.profile,
            progress: userData.progress,
            stats: userData.stats,
            levelSystem: userData.levelSystem || initialState.levelSystem
          };
        } else {
          // Primeira vez - retorna dados vazios
          return {
            mode: 'authenticated',
            userId: currentUser.uid,
            profile: {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL
            },
            progress: initialState.progress,
            stats: initialState.stats,
            levelSystem: initialState.levelSystem
          };
        }
      } else {
        // Usuário guest
        const guestId = getOrCreateGuestId();
        const guestData = loadGuestData();

        return {
          mode: 'guest',
          userId: guestId,
          profile: initialState.profile,
          progress: guestData.progress,
          stats: guestData.stats,
          levelSystem: guestData.levelSystem
        };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Faz login com Google
 */
export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (_, { getState, rejectWithValue }) => {
    try {
      const result = await signInWithGoogle();

      if (!result.success) {
        return rejectWithValue(result.error);
      }

      const { user } = result;

      // Migra dados do guest
      const migrationResult = await migrateGuestToAuth(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });

      // Carrega dados do Firestore (agora com dados migrados)
      const userData = await loadAuthUserData(user.uid);

      return {
        userId: user.uid,
        profile: {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        },
        progress: userData?.progress || initialState.progress,
        stats: userData?.stats || initialState.stats,
        levelSystem: userData?.levelSystem || initialState.levelSystem,
        migrationResult
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Faz logout
 */
export const logout = createAsyncThunk(
  'user/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Salva dados atuais como guest ANTES de deslogar
      const currentState = getState().user;
      if (currentState.mode === 'authenticated') {
        // Salva progresso atual no localStorage como guest
        saveGuestData(
          currentState.progress,
          currentState.stats,
          currentState.levelSystem
        );
      }

      await authSignOut();

      // Cria novo guest
      const newGuestId = getOrCreateGuestId();

      return {
        userId: newGuestId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Salva progresso (auto-sync)
 */
export const saveProgress = createAsyncThunk(
  'user/saveProgress',
  async (_, { getState }) => {
    const state = getState().user;

    if (state.mode === 'authenticated') {
      // Salva no Firestore
      await saveAuthUserData(
        state.userId,
        state.profile,
        state.progress,
        state.stats,
        state.levelSystem
      );
    } else {
      // Salva no localStorage
      saveGuestData(state.progress, state.stats, state.levelSystem);
    }

    return true;
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    markPhraseCompleted: (state, action) => {
      const { phraseId, phraseIndex } = action.payload;
      const { currentLevel } = state.levelSystem;

      // Inicializa arrays se não existirem
      if (!state.levelSystem.globalCompletedPhrases) {
        state.levelSystem.globalCompletedPhrases = [];
      }
      if (!state.levelSystem.globalCompletedIndices) {
        state.levelSystem.globalCompletedIndices = [];
      }

      // ✅ Adiciona frase ao array global de completadas (se não estiver)
      if (!state.levelSystem.globalCompletedPhrases.includes(phraseId)) {
        state.levelSystem.globalCompletedPhrases.push(phraseId);

        // Só adiciona o índice se não estiver presente
        if (!state.levelSystem.globalCompletedIndices.includes(phraseIndex)) {
          state.levelSystem.globalCompletedIndices.push(phraseIndex);
        }

        console.log(`✅ Phrase ${phraseIndex + 1} completed! Total: ${state.levelSystem.globalCompletedPhrases.length}`);
      }

      // Calcula quantas frases são necessárias para o nível atual
      const phrasesNeededForCurrentLevel = currentLevel * 10; // Nível 1=10, Nível 2=20, Nível 3=30...
      const totalCompleted = state.levelSystem.globalCompletedPhrases.length;

      // Verifica se completou o nível atual
      if (totalCompleted >= phrasesNeededForCurrentLevel) {
        console.log(`🎉 Level ${currentLevel} completed! (${totalCompleted}/${phrasesNeededForCurrentLevel})`);

        // Desbloqueia próximo nível
        const nextLevel = currentLevel + 1;
        state.levelSystem.currentLevel = nextLevel;

        state.levelSystem.showLevelUpModal = true;
        state.levelSystem.pendingLevelUp = nextLevel;

        console.log(`🔓 Level ${nextLevel} unlocked! Need ${nextLevel * 10} total phrases.`);
      }
    },

    closeLevelUpModal: (state) => {
      state.levelSystem.showLevelUpModal = false;
      state.levelSystem.pendingLevelUp = null;
    },

    // Atualiza progresso do ChunkTrainer
    updateChunkProgress: (state, action) => {
      const { currentIndex, completedPhrases } = action.payload;
      state.progress.chunkTrainer.currentIndex = currentIndex;
      state.progress.chunkTrainer.completedPhrases = completedPhrases;
      state.progress.chunkTrainer.completedCount = completedPhrases.length;
    },

    // Incrementa contadores de estatísticas
    incrementPhraseCompleted: (state) => {
      state.stats.totalPhrases += 1;
      state.stats.totalAttempts += 1;
      state.stats.correctCount += 1;
      state.stats.accuracy = Math.round((state.stats.correctCount / state.stats.totalAttempts) * 100);

      // Controle de incentivo
      state.incentives.phrasesUntilPrompt -= 1;
    },

    // Registra tentativa incorreta
    incrementIncorrectAttempt: (state) => {
      state.stats.totalAttempts += 1;
      state.stats.accuracy = Math.round((state.stats.correctCount / state.stats.totalAttempts) * 100);
    },

    // Atualiza high score do challenge
    updateChallengeHighScore: (state, action) => {
      if (action.payload > state.stats.challengeHighScore) {
        state.stats.challengeHighScore = action.payload;
      }
    },

    // Marca que viu o modal de incentivo
    markIncentiveAsSeen: (state) => {
      state.incentives.hasSeenPrompt = true;
      state.incentives.lastPromptAt = Date.now();
      state.incentives.phrasesUntilPrompt = 10; // Reseta contador
    },

    // Reset do incentivo (para mostrar novamente depois)
    resetIncentive: (state) => {
      state.incentives.phrasesUntilPrompt = 5;
    },

    // 🔄 NOVO: Atualiza globalCompletedIndices (para migração de dados antigos)
    updateLevelSystemIndices: (state, action) => {
      const { indices } = action.payload;
      state.levelSystem.globalCompletedIndices = indices;
      console.log('✅ Level system indices updated:', indices);
    }
  },
  extraReducers: (builder) => {
    // Initialize
    builder
      .addCase(initializeUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.loading = false;
        state.mode = action.payload.mode;
        state.userId = action.payload.userId;
        state.profile = action.payload.profile;
        state.progress = action.payload.progress;
        state.stats = action.payload.stats;
        state.levelSystem = action.payload.levelSystem;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.mode = 'authenticated';
        state.userId = action.payload.userId;
        state.profile = action.payload.profile;
        state.progress = action.payload.progress;
        state.stats = action.payload.stats;
        state.levelSystem = action.payload.levelSystem;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state, action) => {
        state.mode = 'guest';
        state.userId = action.payload.userId;
        state.profile = initialState.profile;
        state.progress = initialState.progress;
        state.stats = initialState.stats;
        state.incentives = initialState.incentives;
      });

    // Save Progress
    builder
      .addCase(saveProgress.pending, (state) => {
        state.syncStatus = 'syncing';
      })
      .addCase(saveProgress.fulfilled, (state) => {
        state.syncStatus = 'synced';
      })
      .addCase(saveProgress.rejected, (state) => {
        state.syncStatus = 'error';
      });
  }
});

export const {
  updateChunkProgress,
  incrementPhraseCompleted,
  incrementIncorrectAttempt,
  updateChallengeHighScore,
  markIncentiveAsSeen,
  resetIncentive,
  markPhraseCompleted,
  closeLevelUpModal,
  updateLevelSystemIndices  // ✅ NOVO
} = userSlice.actions;

export default userSlice.reducer;