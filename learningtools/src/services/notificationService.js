import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const NOTIFICATION_STORAGE_KEY = 'learnfun_notification_settings';

/**
 * Carrega configurações de notificações do localStorage ou Firebase
 */
export const loadNotificationSettings = async (userId = null) => {
  const defaultSettings = {
    enabled: false,
    dailyReminders: {
      enabled: false,
      times: ['09:00', '18:00'], // Horários padrão
      frequency: 2, // vezes por dia
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0] // Todos os dias
    },
    inactivityReminders: {
      enabled: false,
      daysWithoutActivity: 1, // Lembrar após 1 dia sem atividade
      message: 'Você está sem treinar há {days} dia(s)! Volte e mantenha sua sequência! 🔥'
    },
    streakReminders: {
      enabled: false,
      reminderTime: '20:00', // Horário para lembrar de manter streak
      daysBeforeExpiry: [1], // Lembrar 1 dia antes de expirar
      message: 'Não perca sua sequência de {streak} dias! Treine hoje para manter o fogo! 🔥'
    },
    achievementReminders: {
      enabled: false,
      levelUp: true,
      xpMilestones: true,
      challengeCompleted: true,
      message: 'Parabéns! Você alcançou uma nova conquista! 🎉'
    },
    motivationalReminders: {
      enabled: false,
      frequency: 'daily', // daily, weekly, biweekly
      message: 'Continue praticando! Cada frase te aproxima da fluência! 💪'
    },
    weeklyChallengeReminders: {
      enabled: false,
      dayOfWeek: 1, // Segunda-feira
      time: '09:00',
      message: 'Novo desafio semanal disponível! Teste suas habilidades! 🏆'
    },
    reviewReminders: {
      enabled: false,
      enabledForDifficultPhrases: true,
      minAccuracy: 70, // Frases com menos de 70% de precisão
      frequency: 'daily',
      message: 'Tempo de revisar! Pratique as frases que você teve dificuldade! 📚'
    },
    friendActivityReminders: {
      enabled: false,
      friendLevelUp: true,
      friendChallenge: true,
      message: 'Seu amigo {friendName} acabou de {action}! Vamos competir? 👥'
    }
  };

  try {
    // Se tem userId, tenta carregar do Firebase
    if (userId) {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().notificationSettings) {
        return {
          ...defaultSettings,
          ...userDoc.data().notificationSettings
        };
      }
    }

    // Fallback para localStorage
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return {
        ...defaultSettings,
        ...JSON.parse(stored)
      };
    }

    return defaultSettings;
  } catch (error) {
    console.error('Erro ao carregar configurações de notificações:', error);
    return defaultSettings;
  }
};

/**
 * Salva configurações de notificações no Firebase ou localStorage
 */
export const saveNotificationSettings = async (settings, userId = null) => {
  try {
    // Salva no Firebase se tiver userId
    if (userId) {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        notificationSettings: settings,
        lastUpdated: new Date().toISOString()
      });
    }

    // Sempre salva no localStorage também (backup)
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));

    // Agenda notificações baseado nas novas configurações
    await scheduleNotifications(settings);

    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações de notificações:', error);
    return false;
  }
};

/**
 * Solicita permissão para notificações
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notificações não suportadas neste navegador' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, error: 'Permissão negada. Ative nas configurações do navegador.' };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      error: permission === 'denied' ? 'Permissão negada' : null
    };
  } catch (error) {
    return { granted: false, error: error.message };
  }
};

/**
 * Agenda notificações baseado nas configurações
 */
export const scheduleNotifications = async (settings) => {
  if (!settings.enabled) {
    // Cancela todas as notificações agendadas
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
    return;
  }

  // Verifica permissão
  const { granted } = await requestNotificationPermission();
  if (!granted) {
    console.warn('Permissão de notificações não concedida');
    return;
  }

  // Envia todas as configurações para o Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.postMessage({
        type: 'UPDATE_NOTIFICATION_SETTINGS',
        settings
      });
    });
  }
};

/**
 * Agenda lembretes diários
 */
const scheduleDailyReminders = (config) => {
  console.log('Lembretes diários configurados:', config);
  
  // Envia configurações para o Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.postMessage({
        type: 'SCHEDULE_DAILY_REMINDERS',
        config
      });
    });
  }
};

/**
 * Envia notificação imediata (para teste)
 */
export const sendTestNotification = async (title, options = {}) => {
  const { granted } = await requestNotificationPermission();
  
  if (!granted) {
    throw new Error('Permissão de notificações não concedida');
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body: options.body || 'Esta é uma notificação de teste',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'test-notification',
      requireInteraction: false,
      ...options
    });
  } else {
    // Fallback para navegadores sem Service Worker
    new Notification(title, {
      body: options.body || 'Esta é uma notificação de teste',
      icon: '/pwa-192x192.png',
      ...options
    });
  }
};

/**
 * Verifica se o usuário está inativo e envia notificação se necessário
 */
export const checkInactivityAndNotify = async (settings, lastActivityDate) => {
  if (!settings.inactivityReminders?.enabled) return;

  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceActivity >= settings.inactivityReminders.daysWithoutActivity) {
    const message = settings.inactivityReminders.message.replace(
      '{days}',
      daysSinceActivity
    );

    await sendTestNotification('Você está sem treinar!', {
      body: message,
      tag: 'inactivity-reminder'
    });
  }
};

/**
 * Verifica streak e envia notificação se necessário
 */
export const checkStreakAndNotify = async (settings, streak, lastActivityDate) => {
  if (!settings.streakReminders?.enabled) return;

  const today = new Date();
  const lastActivity = new Date(lastActivityDate);
  const daysSinceActivity = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Se está prestes a perder o streak (1 dia sem atividade)
  if (daysSinceActivity === 1 && streak > 0) {
    const message = settings.streakReminders.message.replace(
      '{streak}',
      streak
    );

    await sendTestNotification('Não perca sua sequência!', {
      body: message,
      tag: 'streak-reminder'
    });
  }
};

