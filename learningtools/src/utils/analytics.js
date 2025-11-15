/**
 * Utilitário centralizado para Analytics
 * Suporta Vercel Analytics e pode ser estendido para Google Analytics, etc.
 */

/**
 * Tracka um evento
 * @param {string} eventName - Nome do evento
 * @param {object} data - Dados do evento
 */
export const trackEvent = (eventName, data = {}) => {
  try {
    // Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: eventName,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          path: window.location.pathname
        }
      });
    }

    // Google Analytics (se configurado no futuro)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...data,
        event_category: data.category || 'general',
        event_label: data.label || eventName
      });
    }

    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, data);
    }
  } catch (error) {
    console.error('Erro ao trackear evento:', error);
  }
};

/**
 * Tracka visualização de página
 * @param {string} path - Caminho da página
 * @param {string} title - Título da página
 */
export const trackPageView = (path, title) => {
  try {
    if (typeof window !== 'undefined' && window.va) {
      window.va('pageview', { path, title });
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title
      });
    }
  } catch (error) {
    console.error('Erro ao trackear pageview:', error);
  }
};

/**
 * Tracka início de exercício
 * @param {string} exerciseType - Tipo de exercício
 * @param {object} metadata - Metadados adicionais
 */
export const trackExerciseStart = (exerciseType, metadata = {}) => {
  trackEvent('exercise_started', {
    category: 'exercise',
    exercise_type: exerciseType,
    ...metadata
  });
};

/**
 * Tracka conclusão de exercício
 * @param {string} exerciseType - Tipo de exercício
 * @param {number} accuracy - Acurácia (0-100)
 * @param {number} timeSpent - Tempo gasto em segundos
 * @param {object} metadata - Metadados adicionais
 */
export const trackExerciseComplete = (exerciseType, accuracy, timeSpent, metadata = {}) => {
  trackEvent('exercise_completed', {
    category: 'exercise',
    exercise_type: exerciseType,
    accuracy,
    time_spent: timeSpent,
    ...metadata
  });
};

/**
 * Tracka erro
 * @param {string} errorType - Tipo do erro
 * @param {string} errorMessage - Mensagem do erro
 * @param {object} context - Contexto adicional
 */
export const trackError = (errorType, errorMessage, context = {}) => {
  trackEvent('error_occurred', {
    category: 'error',
    error_type: errorType,
    error_message: errorMessage,
    ...context
  });
};

/**
 * Tracka ação do usuário
 * @param {string} action - Ação realizada
 * @param {object} metadata - Metadados adicionais
 */
export const trackUserAction = (action, metadata = {}) => {
  trackEvent('user_action', {
    category: 'user_interaction',
    action,
    ...metadata
  });
};

/**
 * Tracka tempo de sessão
 * @param {number} duration - Duração em segundos
 */
export const trackSessionDuration = (duration) => {
  trackEvent('session_duration', {
    category: 'engagement',
    duration
  });
};

export default {
  trackEvent,
  trackPageView,
  trackExerciseStart,
  trackExerciseComplete,
  trackError,
  trackUserAction,
  trackSessionDuration
};

