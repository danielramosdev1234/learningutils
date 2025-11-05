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

  // ✅ Sistema de Referral
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
    phrasesUntilPrompt: 5,
    hasSeenPrompt: false,
    lastPromptAt: null
  },

  // Status
  loading: false,
  error: null,
  syncStatus: 'synced'
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
      const referredByCode = getReferredBy();

      console.log('🔍 Inicializando usuário...');
      console.log('   Autenticado:', !!currentUser);
      console.log('   Código de convite detectado:', referredByCode || 'Nenhum');

      if (currentUser) {
        // ✅ USUÁRIO AUTENTICADO
        console.log('👤 Carregando dados do Firestore...');
        const userData = await loadAuthUserData(currentUser.uid);

        // 1️⃣ Inicializa referral
        await dispatch(initializeReferral({
          userId: currentUser.uid,
          displayName: currentUser.displayName,
          existingCode: userData?.referral?.code,
          existingReferredBy: userData?.referral?.referredBy
        }));

        // 2️⃣ ⭐ PROCESSA REFERRAL IMEDIATAMENTE NO LOGIN
        if (referredByCode && !userData?.referral?.referredBy) {
          console.log('🎯 PROCESSANDO CÓDIGO DE CONVITE:', referredByCode);

          try {
            const result = await registerReferralUsage(currentUser.uid, referredByCode);

            if (result && result.success) {
              console.log('✅ Referral registrado com sucesso!');
              console.log('   Referrer ID:', result.referrerId);

              // ⭐ NOVA LÓGICA: Processa recompensa IMEDIATAMENTE
              console.log('💰 Processando recompensa para quem convidou...');
              const rewardResult = await confirmInviteAndReward(result.referrerId, currentUser.uid);

              if (rewardResult && rewardResult.success) {
                console.log('🎉 RECOMPENSA ENTREGUE!');
                console.log(`   +${rewardResult.reward} frases para quem convidou`);
                console.log(`   Total de amigos: ${rewardResult.totalInvites}`);

                if (rewardResult.milestoneReached) {
                  console.log('🏆 MILESTONE ALCANÇADO!');
                }
              }

              // Limpa localStorage
              clearReferredBy();
              markReferralAsProcessed();

              // ⭐ Atualiza userData para incluir referredBy
              if (userData) {
                userData.referral = userData.referral || {};
                userData.referral.referredBy = referredByCode;
              }
            } else {
              console.error('❌ Falha ao registrar referral');
              console.error('   Código pode ser inválido:', referredByCode);
            }
          } catch (error) {
            console.error('❌ ERRO ao processar referral:', error);
          }
        } else if (referredByCode && userData?.referral?.referredBy) {
          console.log('ℹ️ Referral já foi processado anteriormente');
          clearReferredBy();
        }

        if (userData) {
          return {
            mode: 'authenticated',
            userId: currentUser.uid,
            profile: userData.profile,
            progress: userData.progress,
            stats: userData.stats,
            levelSystem: userData.levelSystem || initialState.levelSystem,
            referral: userData.referral || initialState.referral
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
            referral: {
              ...initialState.referral,
              referredBy: referredByCode || null
            }
          };
        }
      } else {
        // ✅ GUEST
        const guestId = getOrCreateGuestId();
        const guestData = loadGuestData();

        console.log('🎭 Modo Guest');
        console.log('   Guest ID:', guestId);

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
          }
        };
      }
    } catch (error) {
      console.error('❌ ERRO CRÍTICO em initializeUser:', error);
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
        console.log('🎉 Novo código gerado e salvo:', code);
      } else {
        console.log('♻️ Código existente recuperado:', code);
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
 * Salva progresso (auto-sync)
 */
export const saveProgress = createAsyncThunk(
  'user/saveProgress',
  async (_, { getState }) => {
    const state = getState().user;

    console.log('💾 Salvando progresso...');
    console.log('   Mode:', state.mode);
    console.log('   User ID:', state.userId);
    console.log('   Referral Code:', state.referral?.code);

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

      console.log('📊 Dados de referral a salvar:', referralToSave);

      await saveAuthUserData(
        state.userId,
        state.profile,
        state.progress,
        state.stats,
        state.levelSystem,
        referralToSave
      );

      console.log('✅ Dados salvos no Firestore (incluindo referral)');
    } else {
      saveGuestData(
        state.progress,
        state.stats,
        state.levelSystem,
        state.referral
      );

      console.log('✅ Dados guest salvos (incluindo referral)');
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

      if (!state.levelSystem.globalCompletedPhrases) {
        state.levelSystem.globalCompletedPhrases = [];
      }
      if (!state.levelSystem.globalCompletedIndices) {
        state.levelSystem.globalCompletedIndices = [];
      }

      if (!state.levelSystem.globalCompletedPhrases.includes(phraseId)) {
        state.levelSystem.globalCompletedPhrases.push(phraseId);
        console.log(`✅ Frase ${phraseIndex + 1} (ID: ${phraseId}) adicionada!`);
      } else {
        console.log(`ℹ️ Frase ${phraseIndex + 1} já estava completada (prática adicional)`);
      }

      if (!state.levelSystem.globalCompletedIndices.includes(phraseIndex)) {
        state.levelSystem.globalCompletedIndices.push(phraseIndex);
        console.log(`📊 Índice ${phraseIndex} registrado nos completados`);
      }

      const phrasesNeededForCurrentLevel = currentLevel * 10;
      const totalCompleted = state.levelSystem.globalCompletedIndices.length;

      console.log(`📈 Progresso: ${totalCompleted}/${phrasesNeededForCurrentLevel} frases únicas`);

      if (totalCompleted >= phrasesNeededForCurrentLevel) {
        console.log(`🎉 Level ${currentLevel} completed! (${totalCompleted}/${phrasesNeededForCurrentLevel})`);

        const nextLevel = currentLevel + 1;
        state.levelSystem.currentLevel = nextLevel;
        state.levelSystem.showLevelUpModal = true;
        state.levelSystem.pendingLevelUp = nextLevel;

        console.log(`🔓 Level ${nextLevel} unlocked! Need ${nextLevel * 10} total phrases.`);
      }
    },

    updateReferralData: (state, action) => {
      state.referral = {
        ...state.referral,
        ...action.payload
      };
      console.log('✅ Referral data updated:', action.payload);
    },

    giveWelcomeBonus: (state) => {
      if (!state.referral.hasReceivedWelcomeBonus && state.referral.referredBy) {
        state.referral.rewards.skipPhrases += 3;
        state.referral.hasReceivedWelcomeBonus = true;

        console.log('🎁 Bônus de boas-vindas: +3 frases!');

        trackReferralEvent('welcome_bonus_received', {
          referredBy: state.referral.referredBy
        });
      }
    },

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

        console.log(`✅ Amigo confirmado! Total: ${state.referral.totalInvites}`);
        console.log(`🎁 Nova recompensa: ${state.referral.rewards.skipPhrases} frases`);

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

    incrementPhraseCompleted: (state) => {
      state.stats.totalPhrases += 1;
      state.stats.totalAttempts += 1;
      state.stats.correctCount += 1;
      state.stats.accuracy = Math.round((state.stats.correctCount / state.stats.totalAttempts) * 100);

      // Atualiza streak
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

      if (lastDate !== today) {
        userSlice.caseReducers.updateStreak(state);
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
        console.log('❌ Sem freezes disponíveis');
        return;
      }

      state.stats.streak.freezes -= 1;
      state.stats.streak.freezesUsed.push(missedDate);

      if (!state.stats.streak.history.includes(missedDate)) {
        state.stats.streak.history.push(missedDate);
      }

      const today = new Date().toISOString().split('T')[0];
      state.stats.streak.lastActivityDate = today;

      console.log(`❄️ Freeze usado! Restam: ${state.stats.streak.freezes}`);
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
        console.log('🔥 Streak iniciado: Dia 1');
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
            console.log(`🎁 RECOMPENSA! ${milestone} dias - Ganhou 1 freeze! Total: ${state.stats.streak.freezes}`);
          }
        }

        console.log(`🔥 Streak: ${state.stats.streak.current} dias!`);

      } else if (diffDays === 2 && state.stats.streak.freezes > 0) {
        console.log(`⚠️ Perdeu 1 dia! Você tem ${state.stats.streak.freezes} freeze(s) disponível(is)`);

      } else {
        console.log(`💔 Streak quebrado: ${state.stats.streak.current} dias`);
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
      console.log('✅ Level system indices updated:', indices);
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
        state.progress = action.payload.progress;
        state.stats = action.payload.stats;
        state.levelSystem = action.payload.levelSystem;
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
        state.progress = action.payload.progress;
        state.stats = action.payload.stats;
        state.levelSystem = action.payload.levelSystem;
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
      });

    builder.addCase(initializeReferral.fulfilled, (state, action) => {
      state.referral.code = action.payload.code;
      state.referral.referredBy = action.payload.referredBy;

      console.log('✅ Referral inicializado:', action.payload);
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
  updateLevelSystemIndices,
  updateStreak,
  useFreeze,
  closeRewardModal,
  useSkipPhrase,
  confirmInviteSuccess,
  giveWelcomeBonus,
  updateReferralData
} = userSlice.actions;

export default userSlice.reducer;