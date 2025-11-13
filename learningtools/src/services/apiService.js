import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Log da URL do backend no carregamento
console.log('🔧 [API] API_BASE_URL configurada:', API_BASE_URL);
console.log('🔧 [API] VITE_API_BASE_URL do .env:', import.meta.env.VITE_API_BASE_URL || 'não configurado');

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
    console.log('🌐 [API] Fazendo requisição para:', `${API_BASE_URL}${endpoint}`);
    console.log('🌐 [API] Método:', options.method || 'GET');
    console.log('🌐 [API] Body:', options.body ? JSON.parse(options.body) : 'sem body');
    
    const token = await getAuthToken();
    console.log('🔑 [API] Token obtido (primeiros 20 chars):', token.substring(0, 20) + '...');
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 [API] URL completa:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    console.log('📥 [API] Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('❌ [API] Erro na resposta:', errorData);
      throw new Error(errorData.message || errorData.error || `Erro ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [API] Resposta bem-sucedida:', data);
    return data;
  } catch (error) {
    console.error(`❌ [API] Erro na requisição ${endpoint}:`, error);
    console.error('❌ [API] Stack:', error.stack);
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

