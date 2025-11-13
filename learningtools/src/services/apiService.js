import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Obtém o token de autenticação Firebase
 */
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    throw error;
  }
};

/**
 * Faz uma requisição autenticada à API
 */
const authenticatedFetch = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.message || errorData.error || `Erro ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Serviço de Notificações Push
 */
export const notificationAPI = {
  /**
   * Envia notificação push personalizada
   */
  send: async (userId, notification) => {
    return authenticatedFetch('/api/notifications/send', {
      method: 'POST',
      body: JSON.stringify({ userId, notification })
    });
  },

  /**
   * Envia notificação para múltiplos usuários (apenas admin)
   */
  sendMultiple: async (userIds, notification) => {
    return authenticatedFetch('/api/notifications/send-multiple', {
      method: 'POST',
      body: JSON.stringify({ userIds, notification })
    });
  },

  /**
   * Envia lembrete diário
   */
  sendDailyReminder: async (userId, settings = {}) => {
    return authenticatedFetch('/api/notifications/daily-reminder', {
      method: 'POST',
      body: JSON.stringify({ userId, settings })
    });
  },

  /**
   * Envia notificação de inatividade
   */
  sendInactivity: async (userId, daysWithoutActivity) => {
    return authenticatedFetch('/api/notifications/inactivity', {
      method: 'POST',
      body: JSON.stringify({ userId, daysWithoutActivity })
    });
  },

  /**
   * Envia notificação de streak
   */
  sendStreak: async (userId, streak) => {
    return authenticatedFetch('/api/notifications/streak', {
      method: 'POST',
      body: JSON.stringify({ userId, streak })
    });
  },

  /**
   * Envia notificação de conquista
   */
  sendAchievement: async (userId, achievementType, details = {}) => {
    return authenticatedFetch('/api/notifications/achievement', {
      method: 'POST',
      body: JSON.stringify({ userId, achievementType, details })
    });
  },

  /**
   * Envia notificação de desafio semanal
   */
  sendWeeklyChallenge: async (userId) => {
    return authenticatedFetch('/api/notifications/weekly-challenge', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  /**
   * Envia notificação de atividade de amigo
   */
  sendFriendActivity: async (userId, friendName, action) => {
    return authenticatedFetch('/api/notifications/friend-activity', {
      method: 'POST',
      body: JSON.stringify({ userId, friendName, action })
    });
  },

  /**
   * Envia notificação de revisão
   */
  sendReview: async (userId, difficultPhrasesCount) => {
    return authenticatedFetch('/api/notifications/review', {
      method: 'POST',
      body: JSON.stringify({ userId, difficultPhrasesCount })
    });
  }
};

/**
 * Exporta função genérica para outras APIs
 */
export { authenticatedFetch };

