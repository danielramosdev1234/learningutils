import { configureStore } from '@reduxjs/toolkit';
import userReducer, { saveProgress, checkDailyBackup } from './slices/userSlice';
import xpReducer from './slices/xpSlice';

// Middleware para auto-save
const autoSaveMiddleware = store => next => action => {
  const result = next(action);

  // Lista de actions que devem disparar auto-save
  const autoSaveActions = [
    'user/updateChunkProgress',
    'user/incrementPhraseCompleted',
    'user/incrementIncorrectAttempt',
    'user/updateChallengeHighScore',
    'user/markPhraseCompleted',
    'xp/addXP/fulfilled'
  ];

  // Se a action está na lista, salva automaticamente (debounced)
  if (autoSaveActions.includes(action.type)) {
    // Debounce simples: cancela save anterior se houver
    if (window.autoSaveTimeout) {
      clearTimeout(window.autoSaveTimeout);
    }

    // Salva após 1 segundo de inatividade
    window.autoSaveTimeout = setTimeout(() => {
          // XP já é salvo automaticamente, não precisa dispatch
        }, 1000);
      }

  return result;
};

// ⭐ NOVO: Middleware para backup automático diário
const autoBackupMiddleware = store => next => action => {
  const result = next(action);

  // Verifica se completou uma frase
  if (action.type === 'user/incrementPhraseCompleted') {
    const state = store.getState().user;

    // Se está marcado para fazer backup (primeira atividade do dia)
    if (state.needsBackup && state.mode === 'authenticated') {
      // Dispara backup após 2 segundos (espera salvar progresso primeiro)
      setTimeout(() => {
        store.dispatch(checkDailyBackup());
      }, 2000);
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    xp: xpReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora checks de serialização para timestamps do Firebase
        ignoredActions: ['user/saveProgress/fulfilled', 'user/checkDailyBackup/fulfilled',
                                                                                                   'xp/addXP/fulfilled',
                                                                                                   'xp/loadXPData/fulfilled'],
        ignoredPaths: ['user.progress', 'user.stats', 'xp.lastUpdated']
      }
    }).concat(autoSaveMiddleware, autoBackupMiddleware) // ⭐ Adiciona middleware de backup
});

export default store;