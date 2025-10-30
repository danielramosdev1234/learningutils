import { configureStore } from '@reduxjs/toolkit';
import userReducer, { saveProgress } from './slices/userSlice';

// Middleware para auto-save
const autoSaveMiddleware = store => next => action => {
  const result = next(action);

  // Lista de actions que devem disparar auto-save
  const autoSaveActions = [
    'user/updateChunkProgress',
    'user/incrementPhraseCompleted',
    'user/incrementIncorrectAttempt',
    'user/updateChallengeHighScore',
    'user/markPhraseCompleted'
  ];

  // Se a action está na lista, salva automaticamente (debounced)
  if (autoSaveActions.includes(action.type)) {
    // Debounce simples: cancela save anterior se houver
    if (window.autoSaveTimeout) {
      clearTimeout(window.autoSaveTimeout);
    }

    // Salva após 1 segundo de inatividade
    window.autoSaveTimeout = setTimeout(() => {
      store.dispatch(saveProgress());
    }, 1000);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignora checks de serialização para timestamps do Firebase
        ignoredActions: ['user/saveProgress/fulfilled'],
        ignoredPaths: ['user.progress', 'user.stats']
      }
    }).concat(autoSaveMiddleware)
});

export default store;