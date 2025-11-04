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
import {  generateReferralCode,
  getReferredBy,
  clearReferredBy,
  hasProcessedReferral,
  markReferralAsProcessed,
  trackReferralEvent,
  calculateRewards
} from '../../utils/referralUtils';

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

  // ✅ NOVO: Sistema de Referral
    referral: {
      code: null,              // Código único do usuário (ex: DANIEL-XK7P)
      referredBy: null,        // Código de quem convidou
      totalInvites: 0,         // Total de amigos convidados
      successfulInvites: [],   // IDs dos amigos que completaram primeira frase
      pending: [],             // IDs dos amigos que ainda não completaram
      rewards: {
        skipPhrases: 0,        // Quantas frases pode pular
        totalEarned: 0         // Total acumulado de recompensas
      },
      hasReceivedWelcomeBonus: false  // Se já recebeu bônus inicial
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
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const currentUser = getCurrentUser();

      if (currentUser) {
        // Usuário autenticado
        const userData = await loadAuthUserData(currentUser.uid);

        // ✅ NOVO: Inicializa referral
        await dispatch(initializeReferral({
          userId: currentUser.uid,
          displayName: currentUser.displayName
        }));

        if (userData) {
          return {
            mode: 'authenticated',
            userId: currentUser.uid,
            profile: userData.profile,
            progress: userData.progress,
            stats: userData.stats,
            levelSystem: userData.levelSystem || initialState.levelSystem,
            referral: userData.referral || initialState.referral // ✅ NOVO
          };
        } else {
          // Primeira vez
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
            referral: initialState.referral // ✅ NOVO
          };
        }
      } else {
        // Guest
        const guestId = getOrCreateGuestId();
        const guestData = loadGuestData();

        // ✅ NOVO: Inicializa referral para guest
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
          referral: guestData.referral || initialState.referral // ✅ NOVO
        };
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Inicializa sistema de referral para o usuário
 */
export const initializeReferral = createAsyncThunk(
  'user/initializeReferral',
  async ({ userId, displayName }, { rejectWithValue }) => {
    try {
      // Gera código se não existir
      const code = generateReferralCode(displayName, userId);

      // Verifica se foi convidado por alguém
      const referredBy = getReferredBy();

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
 * Processa recompensa quando novo usuário completa primeira frase
 */
export const processReferralReward = createAsyncThunk(
  'user/processReferralReward',
  async ({ newUserId }, { getState, rejectWithValue }) => {
    try {
      const state = getState().user;

      // Verifica se já processou
      if (hasProcessedReferral()) {
        console.log('⚠️ Referral já processado anteriormente');
        return null;
      }

      const referredBy = getReferredBy();
      if (!referredBy) {
        console.log('ℹ️ Usuário não foi convidado por ninguém');
        return null;
      }

      // Marca como processado (evita duplicatas)
      markReferralAsProcessed();
      clearReferredBy();

      trackReferralEvent('reward_earned', {
        referrer: referredBy,
        newUser: newUserId
      });

      return {
        referrerCode: referredBy,
        newUserId,
        reward: 5 // +5 pular frases para quem convidou
      };
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
      // Salva no Firestore (INCLUINDO REFERRAL)
      await saveAuthUserData(
        state.userId,
        state.profile,
        state.progress,
        state.stats,
        state.levelSystem,
        state.referral // ✅ NOVO
      );
    } else {
      // Salva no localStorage (INCLUINDO REFERRAL)
      saveGuestData(
        state.progress,
        state.stats,
        state.levelSystem,
        state.referral // ✅ NOVO
      );
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

      // ✅ Adiciona ID (permite duplicatas para contar total de práticas)
      if (!state.levelSystem.globalCompletedPhrases.includes(phraseId)) {
        state.levelSystem.globalCompletedPhrases.push(phraseId);
        console.log(`✅ Frase ${phraseIndex + 1} (ID: ${phraseId}) adicionada!`);
      } else {
        console.log(`ℹ️ Frase ${phraseIndex + 1} já estava completada (prática adicional)`);
      }

      // ✅ Adiciona índice (ÚNICO - para progresso real)
      if (!state.levelSystem.globalCompletedIndices.includes(phraseIndex)) {
        state.levelSystem.globalCompletedIndices.push(phraseIndex);
        console.log(`📊 Índice ${phraseIndex} registrado nos completados`);
      }

      // ✅ IMPORTANTE: Usar globalCompletedIndices para cálculo de level up
      const phrasesNeededForCurrentLevel = currentLevel * 10;
      const totalCompleted = state.levelSystem.globalCompletedIndices.length; // ✅ Usar índices únicos!

      console.log(`📈 Progresso: ${totalCompleted}/${phrasesNeededForCurrentLevel} frases únicas`);

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

    // ✅ NOVO: Usar "pular frase"
      useSkipPhrase: (state) => {
        if (state.referral.rewards.skipPhrases > 0) {
          state.referral.rewards.skipPhrases -= 1;
          console.log(`🎁 Frase pulada! Restam: ${state.referral.rewards.skipPhrases}`);

          trackReferralEvent('skip_phrase_used', {
            remaining: state.referral.rewards.skipPhrases
          });
        } else {
          console.log('⚠️ Sem frases para pular disponíveis');
        }
      },

       // ✅ NOVO: Adicionar convite pendente
        addPendingInvite: (state, action) => {
          const { userId } = action.payload;

          if (!state.referral.pending.includes(userId)) {
            state.referral.pending.push(userId);
            console.log(`📝 Convite pendente adicionado: ${userId}`);
          }
        },

        // ✅ NOVO: Converter pendente em sucesso (quando amigo completa frase)
          confirmInviteSuccess: (state, action) => {
            const { userId } = action.payload;

            // Remove dos pendentes
            state.referral.pending = state.referral.pending.filter(id => id !== userId);

            // Adiciona aos sucessos
            if (!state.referral.successfulInvites.includes(userId)) {
              state.referral.successfulInvites.push(userId);
              state.referral.totalInvites += 1;

              // Adiciona recompensa
              const baseReward = 5; // +5 por amigo
              state.referral.rewards.skipPhrases += baseReward;
              state.referral.rewards.totalEarned += baseReward;

              // Verifica milestone
              const { skipPhrases } = calculateRewards(state.referral.totalInvites);
              state.referral.rewards.skipPhrases = skipPhrases;

              console.log(`✅ Amigo confirmado! Total: ${state.referral.totalInvites}`);
              console.log(`🎁 Nova recompensa: ${state.referral.rewards.skipPhrases} frases`);

              trackReferralEvent('invite_confirmed', {
                totalInvites: state.referral.totalInvites,
                totalRewards: state.referral.rewards.skipPhrases
              });
            }
          },

          // ✅ NOVO: Dar bônus de boas-vindas para novo usuário
            giveWelcomeBonus: (state) => {
              if (!state.referral.hasReceivedWelcomeBonus && state.referral.referredBy) {
                state.referral.rewards.skipPhrases += 3; // +3 bônus inicial
                state.referral.hasReceivedWelcomeBonus = true;

                console.log('🎁 Bônus de boas-vindas: +3 frases!');

                trackReferralEvent('welcome_bonus_received', {
                  referredBy: state.referral.referredBy
                });
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

      // ✅ NOVO: Atualiza streak quando completa frase
      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.stats.streak?.lastActivityDate;

      // Inicializa streak se não existir (migração de dados antigos)
      if (!state.stats.streak || typeof state.stats.streak === 'number') {
        state.stats.streak = {
          current: 0,
          longest: 0,
          lastActivityDate: null,
          history: []
        };
      }

      if (lastDate !== today) {
        // Só atualiza se ainda não praticou hoje
        userSlice.caseReducers.updateStreak(state);
      }

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

    closeRewardModal: (state) => {
      state.stats.streak.showRewardModal = false;
      state.stats.streak.pendingReward = null;
    },


    useFreeze: (state, action) => {
      const { missedDate } = action.payload;

      if (state.stats.streak.freezes <= 0) {
        console.log('❌ Sem freezes disponíveis');
        return;
      }

      // Usa 1 freeze
      state.stats.streak.freezes -= 1;
      state.stats.streak.freezesUsed.push(missedDate);

      // Adiciona o dia perdido ao histórico (como se tivesse praticado)
      if (!state.stats.streak.history.includes(missedDate)) {
        state.stats.streak.history.push(missedDate);
      }

      // Mantém o streak
      const today = new Date().toISOString().split('T')[0];
      state.stats.streak.lastActivityDate = today;

      console.log(`❄️ Freeze usado! Restam: ${state.stats.streak.freezes}`);
    },

    updateStreak: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.stats.streak.lastActivityDate;

      // Inicializa arrays se não existirem
      if (!state.stats.streak.history) state.stats.streak.history = [];
      if (!state.stats.streak.freezes) state.stats.streak.freezes = 0;
      if (!state.stats.streak.freezesUsed) state.stats.streak.freezesUsed = [];
      if (!state.stats.streak.nextRewardAt) state.stats.streak.nextRewardAt = 7;
      if (!state.stats.streak.rewardsEarned) state.stats.streak.rewardsEarned = [];

      // Primeira vez
      if (!lastDate) {
        state.stats.streak.current = 1;
        state.stats.streak.longest = 1;
        state.stats.streak.lastActivityDate = today;
        state.stats.streak.history = [today];
        state.stats.streak.nextRewardAt = 7;
        console.log('🔥 Streak iniciado: Dia 1');
        return;
      }

      // Já praticou hoje
      if (lastDate === today) return;

      // Calcula diferença de dias
      const lastDateObj = new Date(lastDate + 'T00:00:00');
      const todayObj = new Date(today + 'T00:00:00');
      const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // ✅ CONSECUTIVO!
        state.stats.streak.current += 1;
        state.stats.streak.lastActivityDate = today;

        if (!state.stats.streak.history.includes(today)) {
          state.stats.streak.history.push(today);
        }

        // Atualiza longest
        if (state.stats.streak.current > state.stats.streak.longest) {
          state.stats.streak.longest = state.stats.streak.current;
        }

        // 🎁 VERIFICA RECOMPENSA (múltiplos de 7)
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
            console.log(`🎁 RECOMPENSA! ${milestone} dias - Ganhou 1 freeze! Total: ${state.stats.streak.freezes}`);
          }
        }

        console.log(`🔥 Streak: ${state.stats.streak.current} dias!`);

      } else if (diffDays === 2 && state.stats.streak.freezes > 0) {
        // ❄️ PODE USAR FREEZE (perdeu 1 dia, mas tem freeze)
        // Não faz nada aqui - será tratado no modal
        console.log(`⚠️ Perdeu 1 dia! Você tem ${state.stats.streak.freezes} freeze(s) disponível(is)`);

      } else {
        // ❌ QUEBROU O STREAK (sem freezes ou perdeu 2+ dias)
        console.log(`💔 Streak quebrado: ${state.stats.streak.current} dias`);
        state.stats.streak.current = 1;
        state.stats.streak.lastActivityDate = today;

        if (!state.stats.streak.history.includes(today)) {
          state.stats.streak.history.push(today);
        }

        // Reseta o próximo milestone
        state.stats.streak.nextRewardAt = 7;
      }
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

      // ✅ Initialize Referral
        builder.addCase(initializeReferral.fulfilled, (state, action) => {
          state.referral.code = action.payload.code;
          state.referral.referredBy = action.payload.referredBy;

          console.log('✅ Referral inicializado:', action.payload);
        });

        // ✅ Process Referral Reward
        builder.addCase(processReferralReward.fulfilled, (state, action) => {
          if (action.payload) {
            // Esta ação seria disparada no backend/Firestore
            // para atualizar o usuário que convidou
            console.log('💰 Recompensa de referral processada:', action.payload);
          }
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
  updateLevelSystemIndices ,
  updateStreak,
  useFreeze,
  closeRewardModal,
  useSkipPhrase,
    addPendingInvite,
    confirmInviteSuccess,
    giveWelcomeBonus
} = userSlice.actions;

export default userSlice.reducer;