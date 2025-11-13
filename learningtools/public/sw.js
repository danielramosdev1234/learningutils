/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheFirst } from 'workbox-strategies';

// Precache assets
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

// Navigation route
const handler = createHandlerBoundToURL('/index.html');
registerRoute(({ request }) => request.mode === 'navigate', handler);

// Cache strategies
registerRoute(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  })
);

// ============================================
// NOTIFICATION SYSTEM
// ============================================

const NOTIFICATION_STORAGE_KEY = 'learnfun_notification_settings';
const NOTIFICATION_DATA_KEY = 'learnfun_notification_data';

// Estado das notificações
let notificationSettings = null;
let notificationData = null;
let dailyReminderIntervals = [];
let inactivityCheckInterval = null;
let streakCheckInterval = null;

// Carrega configurações do IndexedDB ou localStorage via mensagem
async function loadNotificationSettings() {
  try {
    // Tenta carregar do IndexedDB primeiro
    const db = await openNotificationDB();
    const settings = await getFromDB(db, NOTIFICATION_STORAGE_KEY);
    
    if (settings) {
      notificationSettings = settings;
      return settings;
    }
  } catch (error) {
    console.log('Erro ao carregar do IndexedDB, usando fallback');
  }

  // Fallback: retorna null e espera mensagem do cliente
  return null;
}

// Carrega dados do usuário (streak, última atividade) via mensagem
async function loadNotificationData() {
  try {
    const db = await openNotificationDB();
    const data = await getFromDB(db, NOTIFICATION_DATA_KEY);
    notificationData = data;
    return data;
  } catch (error) {
    console.log('Erro ao carregar dados de notificação');
    return null;
  }
}

// IndexedDB helper
function openNotificationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('learnfun_notifications', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    };
  });
}

function getFromDB(db, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function saveToDB(db, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put(value, key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Limpa todos os intervalos de notificação
function clearAllIntervals() {
  dailyReminderIntervals.forEach(interval => clearInterval(interval));
  dailyReminderIntervals = [];
  
  if (inactivityCheckInterval) {
    clearInterval(inactivityCheckInterval);
    inactivityCheckInterval = null;
  }
  
  if (streakCheckInterval) {
    clearInterval(streakCheckInterval);
    streakCheckInterval = null;
  }
}

// Agenda notificações diárias
function scheduleDailyReminders(config) {
  // Limpa intervalos anteriores
  dailyReminderIntervals.forEach(interval => clearInterval(interval));
  dailyReminderIntervals = [];

  if (!config.enabled || !config.times || config.times.length === 0) {
    return;
  }

  config.times.forEach((timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const checkAndNotify = () => {
      const now = new Date();
      const currentDay = now.getDay();
      
      // Verifica se é um dia configurado
      if (!config.daysOfWeek || !config.daysOfWeek.includes(currentDay)) {
        return;
      }

      // Verifica se é o horário correto (com margem de 1 minuto)
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        showNotification('Hora de treinar! 🎯', {
          body: 'Que tal praticar um pouco de inglês agora?',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `daily-reminder-${timeStr}`,
          requireInteraction: false,
        });
      }
    };

    // Verifica a cada minuto
    const interval = setInterval(checkAndNotify, 60 * 1000);
    dailyReminderIntervals.push(interval);
    
    // Verifica imediatamente se já passou do horário hoje
    checkAndNotify();
  });
}

// Verifica inatividade periodicamente
function scheduleInactivityCheck(settings) {
  if (inactivityCheckInterval) {
    clearInterval(inactivityCheckInterval);
  }

  if (!settings.inactivityReminders?.enabled) {
    return;
  }

  inactivityCheckInterval = setInterval(async () => {
    const data = await loadNotificationData();
    if (!data || !data.lastActivityDate) return;

    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(data.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActivity >= settings.inactivityReminders.daysWithoutActivity) {
      const message = settings.inactivityReminders.message.replace(
        '{days}',
        daysSinceActivity
      );

      showNotification('Você está sem treinar!', {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'inactivity-reminder',
        requireInteraction: false,
      });
    }
  }, 60 * 60 * 1000); // Verifica a cada hora
}

// Verifica streak periodicamente
function scheduleStreakCheck(settings) {
  if (streakCheckInterval) {
    clearInterval(streakCheckInterval);
  }

  if (!settings.streakReminders?.enabled) {
    return;
  }

  streakCheckInterval = setInterval(async () => {
    const data = await loadNotificationData();
    if (!data || !data.lastActivityDate || !data.streak) return;

    const today = new Date();
    const lastActivity = new Date(data.lastActivityDate);
    const daysSinceActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Verifica se está prestes a perder o streak
    if (daysSinceActivity === 1 && data.streak > 0) {
      const [hours, minutes] = settings.streakReminders.reminderTime.split(':').map(Number);
      const now = new Date();
      
      // Só envia se for o horário configurado
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        const message = settings.streakReminders.message.replace(
          '{streak}',
          data.streak
        );

        showNotification('Não perca sua sequência!', {
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'streak-reminder',
          requireInteraction: false,
        });
      }
    }
  }, 60 * 1000); // Verifica a cada minuto
}

// Mostra notificação
async function showNotification(title, options) {
  if (Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions = {
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    requireInteraction: false,
    ...options,
  };

  await self.registration.showNotification(title, defaultOptions);
}

// Inicializa sistema de notificações
async function initializeNotifications() {
  const settings = await loadNotificationSettings();
  
  if (!settings || !settings.enabled) {
    clearAllIntervals();
    return;
  }

  notificationSettings = settings;

  // Agenda notificações diárias
  if (settings.dailyReminders?.enabled) {
    scheduleDailyReminders(settings.dailyReminders);
  }

  // Agenda verificação de inatividade
  scheduleInactivityCheck(settings);

  // Agenda verificação de streak
  scheduleStreakCheck(settings);
}

// Escuta mensagens do cliente
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SCHEDULE_DAILY_REMINDERS':
        // Salva configurações no IndexedDB
        try {
          const db = await openNotificationDB();
          await saveToDB(db, NOTIFICATION_STORAGE_KEY, event.data.config);
        } catch (error) {
          console.error('Erro ao salvar configurações:', error);
        }
        
        // Recarrega e agenda
        await initializeNotifications();
        break;

      case 'UPDATE_NOTIFICATION_SETTINGS':
        // Salva todas as configurações
        try {
          const db = await openNotificationDB();
          await saveToDB(db, NOTIFICATION_STORAGE_KEY, event.data.settings);
          notificationSettings = event.data.settings;
          
          // Reinicializa
          clearAllIntervals();
          await initializeNotifications();
        } catch (error) {
          console.error('Erro ao atualizar configurações:', error);
        }
        break;

      case 'UPDATE_NOTIFICATION_DATA':
        // Atualiza dados do usuário (streak, última atividade)
        try {
          const db = await openNotificationDB();
          await saveToDB(db, NOTIFICATION_DATA_KEY, event.data.data);
          notificationData = event.data.data;
        } catch (error) {
          console.error('Erro ao atualizar dados:', error);
        }
        break;

      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
    }
  }
});

// Inicializa quando o Service Worker é ativado
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      initializeNotifications(),
    ])
  );
});

// Inicializa quando o Service Worker é instalado
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

