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
  migrateGuestToAuth,
  loadAuthUserDataFromCache
} from '../../services/userService';
import {
  generateReferralCode,
  getReferredBy,
  clearReferredBy,
  hasProcessedReferral,
  markReferralAsProcessed,
  trackReferralEvent,
  calculateRewards,
  saveMyReferralCode,
  getMyReferralCode
} from '../../utils/referralUtils';
import {
  registerReferralUsage,
  confirmInviteAndReward
} from '../../services/referralService';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { checkAndCreateBackup } from '../../services/backupService';
import { loadXPData } from './xpSlice';

// Estado inicial
const initialState = {
  mode: 'guest',
  userId: null,

  profile: {
    displayName: 'Anonymous',
    email: null,
    photoURL: null
  },

  referral: {
    code: null,
    referredBy: null,
    totalInvites: 0,
    successfulInvites: [],
    rewards: {
      skipPhrases: 0,
      totalEarned: 0
    },
    hasReceivedWelcomeBonus: false
  },

  levelSystem: {
    currentLevel: 1,
    globalCompletedPhrases: [],
    globalCompletedIndices: [],
    showLevelUpModal: false,
    pendingLevelUp: null
  },

  progress: {
    chunkTrainer: {
      currentIndex: 0,
      completedPhrases: [],
      completedCount: 0
    },
    categories: {
      // Estrutura: { categoryId: { completedPhrases: [phraseId1, phraseId2, ...], lastIndex: 0 } }
    },
    sentenceBuilder: {
      // Estrutura: { categoryId: { completedPhrases: [phraseId1, phraseId2, ...], lastIndex: 0 } }
    }
  },

  stats: {
    totalPhrases: 0,
    totalAttempts: 0,
    correctCount: 0,
    accuracy: 0,
    streak: {
      current: 0,
      longest: 0,
      lastActivityDate: null,
      history: [],
      freezes: 0,
      freezesUsed: [],
      nextRewardAt: 7,
      rewardsEarned: [],
      showRewardModal: false,
      pendingReward: null
    },
    challengeHighScore: 0
  },

   incentives: {
     phrasesUntilPrompt: 5,
     hasSeenPrompt: false,
     lastPromptAt: null
   },

   assessment: {
     lastTestDate: null,
     currentCefrLevel: null,
     history: []
   },

   lastActivity: null,

  loading: false,
  error: null,
  syncStatus: 'synced'
};

/**
 * ⭐ REFATORADO: Inicializa usuário (Firebase First)
 */
export const initializeUser = createAsyncThunk(
  'user/initialize',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const currentUser = getCurrentUser();
      const referredByCode = getReferredBy();



      if (currentUser) {
        // ✅ USUÁRIO AUTENTICADO
  

        // ✅ PASSO 1: Carrega dados do Firebase (com retry automático e fallback para cache)
        const userData = await loadAuthUserData(currentUser.uid, 3);

        if (!userData) {


          // Última tentativa: tenta carregar do cache local
          const cachedData = loadAuthUserDataFromCache(currentUser.uid);
          if (cachedData) {


            // Se tem xpSystem no cache, carrega XP também
            if (cachedData.xpSystem) {
              try {
                await dispatch(loadXPData(currentUser.uid)).unwrap();
              } catch (xpError) {
                console.warn('⚠️ Erro ao carregar XP do cache (continuando):', xpError);
              }
            }

            return {
              mode: 'authenticated',
              userId: currentUser.uid,
              profile: {
                displayName: currentUser.displayName,
                email: currentUser.email,
                photoURL: currentUser.photoURL
              },
              progress: cachedData.progress || initialState.progress,
              stats: cachedData.stats || initialState.stats,
              levelSystem: cachedData.levelSystem || initialState.levelSystem,
              referral: cachedData.referral || {
                ...initialState.referral,
                referredBy: referredByCode || null
              }
            };
          }

          // Se não tem cache também, retorna estado inicial

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
            levelSystem: initialState.levelSystem,
            referral: {
              ...initialState.referral,
              referredBy: referredByCode || null
            }
          };
        }

        // ✅ Carrega dados de XP (todos os usuários já foram migrados)
        try {
          await dispatch(loadXPData(currentUser.uid)).unwrap();
        } catch (error) {
          console.error('⚠️ Erro ao carregar XP (continuando):', error);
          // Não falha a inicialização se XP não carregar
        }

        // ✅ PASSO 2: Prepara referral
        let referralData = userData.referral || {
          ...initialState.referral,
          referredBy: referredByCode || null
        };

        // ✅ PASSO 3: Inicializa sistema de referral
        await dispatch(initializeReferral({
          userId: currentUser.uid,
          displayName: currentUser.displayName,
          existingCode: referralData.code,
          existingReferredBy: referralData.referredBy
        }));

        // ✅ PASSO 4: Processa código de convite (se existir e ainda não foi processado)
        if (referredByCode && !referralData.referredBy && !hasProcessedReferral()) {
          try {
            const result = await registerReferralUsage(currentUser.uid, referredByCode);

            if (result && result.success) {
              // Dá recompensa para quem convidou
              const rewardResult = await confirmInviteAndReward(result.referrerId, currentUser.uid);

              // Atualiza APENAS o campo referredBy no Firebase
              await updateDoc(doc(db, 'users', currentUser.uid), {
                'referral.referredBy': referredByCode
              });

              // Atualiza localmente
              referralData.referredBy = referredByCode;

              // Limpa flags
              clearReferredBy();
              markReferralAsProcessed();
            }
          } catch (error) {
            console.error('❌ Erro ao processar referral:', error);
          }
        }

         // ✅ RETORNA DADOS DO FIREBASE (nunca sobrescreve)
          return {
            mode: 'authenticated',
            userId: currentUser.uid,
            profile: {
              displayName: userData.profile?.displayName || currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL
            },
            progress: userData.progress,
            stats: userData.stats,
            levelSystem: userData.levelSystem,
            referral: referralData,
            assessment: userData.assessment || initialState.assessment,
            lastActivity: userData.lastActivity || null
          };
      } else {
        // ✅ GUEST
        const guestId = getOrCreateGuestId();
        const guestData = loadGuestData();



        await dispatch(initializeReferral({
          userId: guestId,
          displayName: 'Anonymous'
        }));

         return {
           mode: 'guest',
           userId: guestId,
           profile: initialState.profile,
           progress: guestData.progress,
           stats: guestData.stats,
           levelSystem: guestData.levelSystem,
           referral: {
             ...guestData.referral || initialState.referral,
             referredBy: referredByCode || null
           },
           assessment: guestData.assessment || initialState.assessment
         };
      }
    } catch (error) {
      console.error('❌ ERRO CRÍTICO em initializeUser:', error);

      // Se o usuário está autenticado mas houve erro, tenta cache antes de retornar estado inicial
      const currentUser = getCurrentUser();
      if (currentUser) {
        const cachedData = loadAuthUserDataFromCache(currentUser.uid);

        if (cachedData) {

          // Se tem xpSystem no cache, carrega XP também
          if (cachedData.xpSystem) {
            try {
              await dispatch(loadXPData(currentUser.uid)).unwrap();
            } catch (xpError) {
              console.warn('⚠️ Erro ao carregar XP do cache (continuando):', xpError);
            }
          }

        return {
          mode: 'authenticated',
          userId: currentUser.uid,
          profile: {
            displayName: cachedData.profile?.displayName || currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL
          },
          progress: cachedData.progress || initialState.progress,
          stats: cachedData.stats || initialState.stats,
          levelSystem: cachedData.levelSystem || initialState.levelSystem,
          referral: cachedData.referral || initialState.referral
        };
        }


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
          levelSystem: initialState.levelSystem,
          referral: initialState.referral
        };
      }

      return rejectWithValue(error.message);
    }
  }
);

/**
 * Inicializa sistema de referral para o usuário
 */
export const initializeReferral = createAsyncThunk(
  'user/initializeReferral',
  async ({ userId, displayName, existingCode, existingReferredBy }, { rejectWithValue }) => {
    try {
      let code = existingCode || getMyReferralCode();

      if (!code) {
        code = generateReferralCode(displayName, userId);
        saveMyReferralCode(code);
      }

      const referredBy = existingReferredBy || getReferredBy();

      trackReferralEvent('initialized', { code, referredBy });

      return {
        code,
        referredBy: referredBy || null
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * ⭐ REFATORADO: Login com Google (Firebase First)
 */
export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {


      const result = await signInWithGoogle();

      if (!result.success) {
        return rejectWithValue(result.error);
      }

      const { user } = result;


      // ✅ MIGRAÇÃO (só acontece se Firebase estiver vazio)
      const migrationResult = await migrateGuestToAuth(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });



      // ✅ CARREGA DADOS DO FIREBASE (já salvos pela migração)
      const userData = await loadAuthUserData(user.uid, 3);

      if (!userData) {
        throw new Error('Falha ao carregar dados após login');
      }



      // ✅ Carrega dados de XP (todos os usuários já foram migrados)
      try {
        await dispatch(loadXPData(user.uid)).unwrap();
      } catch (error) {
        console.error('⚠️ Erro ao carregar XP (continuando):', error);
        // Não falha o login se XP não carregar
      }

        return {
          userId: user.uid,
          profile: {
            displayName: userData.profile?.displayName || user.displayName,
            email: user.email,
            photoURL: user.photoURL
          },
          progress: userData.progress,
          stats: userData.stats,
          levelSystem: userData.levelSystem,
          referral: userData.referral || initialState.referral,
          assessment: userData.assessment || initialState.assessment,
          migrationResult
        };
    } catch (error) {
      console.error('❌ Erro no login:', error);
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
      const currentState = getState().user;
      if (currentState.mode === 'authenticated') {
        saveGuestData(
          currentState.progress,
          currentState.stats,
          currentState.levelSystem
        );
      }

      await authSignOut();
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
 * ⭐ REFATORADO: Salva progresso (auto-sync)
 */
export const saveProgress = createAsyncThunk(
  'user/saveProgress',
  async (_, { getState }) => {
    const state = getState().user;



    if (state.mode === 'authenticated') {
      const referralToSave = state.referral || {
        code: null,
        referredBy: null,
        totalInvites: 0,
        successfulInvites: [],
        rewards: {
          skipPhrases: 0,
          totalEarned: 0
        },
        hasReceivedWelcomeBonus: false
      };

      try {
        await saveAuthUserData(
          state.userId,
          state.profile,
          state.progress,
          state.stats,
          state.levelSystem,
          referralToSave,
          state.lastActivity
        );


      } catch (error) {
        console.error('❌ Erro ao salvar no Firestore:', error);
        throw error;
      }
    } else {
      saveGuestData(
        state.progress,
        state.stats,
        state.levelSystem,
        state.referral
      );


    }

    return true;
  }
);

// ⭐ NOVO THUNK: Verifica e cria backup diário
export const checkDailyBackup = createAsyncThunk(
  'user/checkDailyBackup',
  async (_, { getState }) => {
    const state = getState().user;

    // Só faz backup para usuários autenticados
    if (state.mode !== 'authenticated') {
      return { success: false, reason: 'not_authenticated' };
    }

    const userData = {
      stats: state.stats,
      levelSystem: state.levelSystem,
      progress: state.progress,
      referral: state.referral
    };

    const result = await checkAndCreateBackup(state.userId, userData);

    if (result.success) {
      // Backup created successfully
    }

    return result;
  }
);

// ⭐ NOVO THUNK: Salva resultado do assessment
export const saveAssessmentResult = createAsyncThunk(
  'user/saveAssessmentResult',
  async ({ skillType, level, score, certificate, answers }, { getState }) => {
    const { userId, mode } = getState().user;
    const today = new Date().toISOString();

    const result = {
      date: today,
      level,
      score,
      certificate,
      answers
    };

    // Salvar Firebase (authenticated)
    if (mode === 'authenticated') {
      await updateDoc(doc(db, 'users', userId), {
        [`assessment.${skillType}.level`]: level,
        [`assessment.${skillType}.lastTestDate`]: today,
        [`assessment.${skillType}.history`]: arrayUnion(result)
      });
    }

    // Salvar localStorage (guest)
    const cacheKey = mode === 'authenticated'
      ? `learnfun_auth_cache_${userId}`
      : 'learnfun_guest_assessment';

    const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    cached.assessment = cached.assessment || {};
    cached.assessment[skillType] = {
      level,
      lastTestDate: today,
      history: [result, ...(cached.assessment[skillType]?.history || [])].slice(0, 10)
    };
    localStorage.setItem(cacheKey, JSON.stringify(cached));

    return result;
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

      if (!state.levelSystem.globalCompletedPhrases) {
        state.levelSystem.globalCompletedPhrases = [];
      }
      if (!state.levelSystem.globalCompletedIndices) {
        state.levelSystem.globalCompletedIndices = [];
      }

      if (!state.levelSystem.globalCompletedPhrases.includes(phraseId)) {
        state.levelSystem.globalCompletedPhrases.push(phraseId);
      }

      if (!state.levelSystem.globalCompletedIndices.includes(phraseIndex)) {
        state.levelSystem.globalCompletedIndices.push(phraseIndex);
      }

      const phrasesNeededForCurrentLevel = currentLevel * 10;
      const totalCompleted = state.levelSystem.globalCompletedIndices.length;

      if (totalCompleted >= phrasesNeededForCurrentLevel) {
        const nextLevel = currentLevel + 1;
        state.levelSystem.currentLevel = nextLevel;
        state.levelSystem.showLevelUpModal = true;
        state.levelSystem.pendingLevelUp = nextLevel;
      }
    },

    updateReferralData: (state, action) => {
      state.referral = {
        ...state.referral,
        ...action.payload
      };

    },

    giveWelcomeBonus: (state) => {
      if (!state.referral.hasReceivedWelcomeBonus && state.referral.referredBy) {
        state.referral.rewards.skipPhrases += 3;
        state.referral.hasReceivedWelcomeBonus = true;



        trackReferralEvent('welcome_bonus_received', {
          referredBy: state.referral.referredBy
        });
      }
    },

    useSkipPhrase: (state) => {
      if (state.referral.rewards.skipPhrases > 0) {
        state.referral.rewards.skipPhrases -= 1;


        trackReferralEvent('skip_phrase_used', {
          remaining: state.referral.rewards.skipPhrases
        });
      } else {

      }
    },

    confirmInviteSuccess: (state, action) => {
      const { userId } = action.payload;

      if (!state.referral.successfulInvites.includes(userId)) {
        state.referral.successfulInvites.push(userId);
        state.referral.totalInvites += 1;

        const baseReward = 5;
        state.referral.rewards.skipPhrases += baseReward;
        state.referral.rewards.totalEarned += baseReward;

        const { skipPhrases } = calculateRewards(state.referral.totalInvites);
        state.referral.rewards.skipPhrases = skipPhrases;



        trackReferralEvent('invite_confirmed', {
          totalInvites: state.referral.totalInvites,
          totalRewards: state.referral.rewards.skipPhrases
        });
      }
    },

    closeLevelUpModal: (state) => {
      state.levelSystem.showLevelUpModal = false;
      state.levelSystem.pendingLevelUp = null;
    },

    updateChunkProgress: (state, action) => {
      const { currentIndex, completedPhrases } = action.payload;
      state.progress.chunkTrainer.currentIndex = currentIndex;
      state.progress.chunkTrainer.completedPhrases = completedPhrases;
      state.progress.chunkTrainer.completedCount = completedPhrases.length;
    },

    markCategoryPhraseCompleted: (state, action) => {
      const { categoryId, phraseId, currentIndex } = action.payload;

      // Inicializa categories se não existir
      if (!state.progress.categories) {
        state.progress.categories = {};
      }

      // Inicializa a categoria se não existir
      if (!state.progress.categories[categoryId]) {
        state.progress.categories[categoryId] = {
          completedPhrases: [],
          lastIndex: 0
        };
      }

      // Adiciona a frase se ainda não estiver completada
      if (!state.progress.categories[categoryId].completedPhrases.includes(phraseId)) {
        state.progress.categories[categoryId].completedPhrases.push(phraseId);
      }

      // Atualiza o último índice
      state.progress.categories[categoryId].lastIndex = currentIndex;
    },

    markSentenceBuilderPhraseCompleted: (state, action) => {
      const { categoryId, phraseId, currentIndex } = action.payload;

      // Inicializa sentenceBuilder se não existir
      if (!state.progress.sentenceBuilder) {
        state.progress.sentenceBuilder = {};
      }

      // Inicializa a categoria se não existir
      if (!state.progress.sentenceBuilder[categoryId]) {
        state.progress.sentenceBuilder[categoryId] = {
          completedPhrases: [],
          lastIndex: 0
        };
      }

      // Adiciona a frase se ainda não estiver completada
      if (!state.progress.sentenceBuilder[categoryId].completedPhrases.includes(phraseId)) {
        state.progress.sentenceBuilder[categoryId].completedPhrases.push(phraseId);
      }

      // Atualiza o último índice
      state.progress.sentenceBuilder[categoryId].lastIndex = currentIndex;
    },

    incrementPhraseCompleted: (state, action) => {
      state.stats.totalPhrases += 1;
      state.stats.totalAttempts += 1;
      state.stats.correctCount += 1;
      state.stats.accuracy = Math.round((state.stats.correctCount / state.stats.totalAttempts) * 100);

      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.stats.streak?.lastActivityDate;

      if (!state.stats.streak || typeof state.stats.streak === 'number') {
        state.stats.streak = {
          current: 0,
          longest: 0,
          lastActivityDate: null,
          history: []
        };
      }

      // ⭐ NOVO: Se é primeira atividade do dia, marca para fazer backup
      if (lastDate !== today) {
        userSlice.caseReducers.updateStreak(state);

        // Flag para disparar backup
        state.needsBackup = true;
      }

      state.incentives.phrasesUntilPrompt -= 1;
    },

    incrementIncorrectAttempt: (state) => {
      state.stats.totalAttempts += 1;
      state.stats.accuracy = Math.round((state.stats.correctCount / state.stats.totalAttempts) * 100);
    },

    updateChallengeHighScore: (state, action) => {
      if (action.payload > state.stats.challengeHighScore) {
        state.stats.challengeHighScore = action.payload;
      }
    },

    markIncentiveAsSeen: (state) => {
      state.incentives.hasSeenPrompt = true;
      state.incentives.lastPromptAt = Date.now();
      state.incentives.phrasesUntilPrompt = 10;
    },

    resetIncentive: (state) => {
      state.incentives.phrasesUntilPrompt = 5;
    },

    closeRewardModal: (state) => {
      state.stats.streak.showRewardModal = false;
      state.stats.streak.pendingReward = null;
    },

    useFreeze: (state, action) => {
      const { missedDate } = action.payload;

      if (state.stats.streak.freezes <= 0) {
  
        return;
      }

      state.stats.streak.freezes -= 1;
      state.stats.streak.freezesUsed.push(missedDate);

      if (!state.stats.streak.history.includes(missedDate)) {
        state.stats.streak.history.push(missedDate);
      }

      const today = new Date().toISOString().split('T')[0];
      state.stats.streak.lastActivityDate = today;


    },

    updateStreak: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.stats.streak.lastActivityDate;

      if (!state.stats.streak.history) state.stats.streak.history = [];
      if (!state.stats.streak.freezes) state.stats.streak.freezes = 0;
      if (!state.stats.streak.freezesUsed) state.stats.streak.freezesUsed = [];
      if (!state.stats.streak.nextRewardAt) state.stats.streak.nextRewardAt = 7;
      if (!state.stats.streak.rewardsEarned) state.stats.streak.rewardsEarned = [];

      if (!lastDate) {
        state.stats.streak.current = 1;
        state.stats.streak.longest = 1;
        state.stats.streak.lastActivityDate = today;
        state.stats.streak.history = [today];
        state.stats.streak.nextRewardAt = 7;

        return;
      }

      if (lastDate === today) return;

      const lastDateObj = new Date(lastDate + 'T00:00:00');
      const todayObj = new Date(today + 'T00:00:00');
      const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.stats.streak.current += 1;
        state.stats.streak.lastActivityDate = today;

        if (!state.stats.streak.history.includes(today)) {
          state.stats.streak.history.push(today);
        }

        if (state.stats.streak.current > state.stats.streak.longest) {
          state.stats.streak.longest = state.stats.streak.current;
        }

        if (state.stats.streak.current % 7 === 0 && state.stats.streak.current >= 7) {
          const milestone = state.stats.streak.current;
          const alreadyRewarded = state.stats.streak.rewardsEarned.some(r => r.day === milestone);

          if (!alreadyRewarded) {
            state.stats.streak.freezes += 1;
            state.stats.streak.nextRewardAt = milestone + 7;
            state.stats.streak.rewardsEarned.push({
              day: milestone,
              date: today,
              claimed: true
            });
            state.stats.streak.showRewardModal = true;
            state.stats.streak.pendingReward = milestone;

          }
        }



      } else if (diffDays === 2 && state.stats.streak.freezes > 0) {
        // ⭐ FECHAMENTO DO IF ANTERIOR ADICIONADO ACIMA

        // AUTO-USAR FREEZE
        state.stats.streak.freezes -= 1;
        state.stats.streak.freezesUsed.push(lastDate);

        // Preenche o dia perdido
        const missedDateStr = new Date(lastDateObj.getTime() + 86400000)
          .toISOString().split('T')[0];

        if (!state.stats.streak.history.includes(missedDateStr)) {
          state.stats.streak.history.push(missedDateStr);
        }

        // Continua o streak
        state.stats.streak.current += 1;
        state.stats.streak.lastActivityDate = today;

        if (!state.stats.streak.history.includes(today)) {
          state.stats.streak.history.push(today);
        }



      } else {

        state.stats.streak.current = 1;
        state.stats.streak.lastActivityDate = today;

        if (!state.stats.streak.history.includes(today)) {
          state.stats.streak.history.push(today);
        }

        state.stats.streak.nextRewardAt = 7;
      }
    },

    updateLevelSystemIndices: (state, action) => {
      const { indices } = action.payload;
      state.levelSystem.globalCompletedIndices = indices;

    },

    updateLastActivity: (state, action) => {
      const { trainerType, mode, categoryId, phraseId, phraseIndex, resumeUrl, displayText } = action.payload;

      state.lastActivity = {
        timestamp: new Date().toISOString(),
        trainerType,
        mode,
        categoryId: categoryId || null,
        phraseId: phraseId || null,
        phraseIndex: phraseIndex || null,
        resumeUrl,
        displayText
      };


    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.loading = false;
        state.mode = action.payload.mode;
        state.userId = action.payload.userId;
        state.profile = action.payload.profile;
        state.progress = {
          ...action.payload.progress,
          chunkTrainer: action.payload.progress?.chunkTrainer || initialState.progress.chunkTrainer,
          categories: action.payload.progress?.categories || {}
        };
         state.stats = action.payload.stats;
         state.levelSystem = action.payload.levelSystem;
         state.assessment = action.payload.assessment || initialState.assessment;
         state.assessment = action.payload.assessment || initialState.assessment;
         state.lastActivity = action.payload.lastActivity || null;

        if (action.payload.referral) {
          state.referral = {
            ...initialState.referral,
            ...action.payload.referral,
            rewards: {
              ...initialState.referral.rewards,
              ...(action.payload.referral.rewards || {})
            },
            successfulInvites: action.payload.referral.successfulInvites || []
          };
        } else {
          state.referral = { ...initialState.referral };
        }
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

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
        state.progress = {
          ...action.payload.progress,
          chunkTrainer: action.payload.progress?.chunkTrainer || initialState.progress.chunkTrainer,
          categories: action.payload.progress?.categories || {}
        };
        state.stats = action.payload.stats;
        state.levelSystem = action.payload.levelSystem;

        if (action.payload.referral) {
          state.referral = {
            ...initialState.referral,
            ...action.payload.referral,
            rewards: {
              ...initialState.referral.rewards,
              ...(action.payload.referral.rewards || {})
            },
            successfulInvites: action.payload.referral.successfulInvites || []
          };
        } else {
          state.referral = { ...initialState.referral };
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(logout.fulfilled, (state, action) => {
        state.mode = 'guest';
        state.userId = action.payload.userId;
        state.profile = initialState.profile;
        state.progress = initialState.progress;
         state.stats = initialState.stats;
         state.incentives = initialState.incentives;
         state.referral = initialState.referral;
         state.assessment = initialState.assessment;
      });

    builder.addCase(initializeReferral.fulfilled, (state, action) => {
      state.referral.code = action.payload.code;
      state.referral.referredBy = action.payload.referredBy;


    });

    builder.addCase(checkDailyBackup.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.needsBackup = false;

      }
    });

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

    builder.addCase(saveAssessmentResult.fulfilled, (state, action) => {
      const { skillType, level, date, score, certificate, levelUpdated } = action.payload;

      // Update overall last test date
      state.assessment.lastTestDate = date;

      // Update per-skill data
      if (!state.assessment[skillType]) {
        state.assessment[skillType] = { level: null, lastTestDate: null, history: [] };
      }

      state.assessment[skillType].history = [certificate, ...state.assessment[skillType].history].slice(0, 10);

      if (levelUpdated) {
        state.assessment[skillType].level = level;
        state.assessment[skillType].lastTestDate = date;
      }

      // Optionally set currentCefrLevel to the latest level
      state.assessment.currentCefrLevel = level;
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.profile.displayName = action.payload.displayName;
    });
  }
});

// ⭐ NOVO THUNK: Atualiza perfil do usuário
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ displayName }, { getState, rejectWithValue }) => {
    const state = getState().user;

    if (state.mode !== 'authenticated') {
      return rejectWithValue('Only authenticated users can update profile');
    }

    try {
      await updateDoc(doc(db, 'users', state.userId), {
        'profile.displayName': displayName
      });

      return { displayName };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ⭐ NOVO SELECTOR: Verifica se pode fazer assessment (geral)
export const selectCanTakeAssessment = (state) => {
  const lastTestDate = state.user.assessment?.lastTestDate;
  if (!lastTestDate) return true;

  const lastDate = new Date(lastTestDate).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
};

// ⭐ NOVO SELECTOR: Verifica se pode fazer speaking assessment
export const selectCanTakeSpeakingAssessment = (state) => {
  const lastTestDate = state.user.assessment?.speaking?.lastTestDate;
  if (!lastTestDate) return true;

  const lastDate = new Date(lastTestDate).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
};

// ⭐ NOVO SELECTOR: Verifica se pode fazer listening assessment
export const selectCanTakeListeningAssessment = (state) => {
  const lastTestDate = state.user.assessment?.listening?.lastTestDate;
  if (!lastTestDate) return true;

  const lastDate = new Date(lastTestDate).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
};

export const {
  updateChunkProgress,
  markCategoryPhraseCompleted,
  markSentenceBuilderPhraseCompleted,
  incrementPhraseCompleted,
  incrementIncorrectAttempt,
  updateChallengeHighScore,
  markIncentiveAsSeen,
  resetIncentive,
  markPhraseCompleted,
  closeLevelUpModal,
  updateLevelSystemIndices,
  updateStreak,
  useFreeze,
  closeRewardModal,
  useSkipPhrase,
  confirmInviteSuccess,
  giveWelcomeBonus,
  updateReferralData,
  updateLastActivity
} = userSlice.actions;

export default userSlice.reducer;