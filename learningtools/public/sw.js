/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// ============================================
// CACHE E PRECACHE
// ============================================

clientsClaim();
self.skipWaiting();

// Precache de assets
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
// 🔔 EVENTOS DE NOTIFICAÇÃO (CRÍTICO!)
// ============================================

/**
 * EVENTO PRINCIPAL: Quando o usuário clica na notificação
 * Este é o código que faz o app abrir!
 */
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificação clicada!', event);

  // Fecha a notificação
  event.notification.close();

  // URL para abrir (pode vir dos dados da notificação)
  const urlToOpen = event.notification.data?.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    // Procura por janelas/tabs abertas do app
    clients.matchAll({
      type: 'window',
      includeUninstalled: false
    }).then((clientList) => {
      console.log('📱 Janelas abertas:', clientList.length);

      // Se já existe uma janela do app aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          console.log('✅ Focando janela existente');
          return client.focus().then(() => {
            // Navega para a URL se for diferente
            if (client.url !== fullUrl && client.navigate) {
              return client.navigate(fullUrl);
            }
            return client;
          });
        }
      }

      // Se não existe janela aberta, abre uma nova
      if (clients.openWindow) {
        console.log('🆕 Abrindo nova janela');
        return clients.openWindow(fullUrl);
      }
    }).catch(error => {
      console.error('❌ Erro ao abrir janela:', error);
    })
  );
});

/**
 * Evento quando notificação é fechada (opcional)
 */
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notificação fechada:', event.notification.tag);

  // Aqui você pode registrar analytics
  event.waitUntil(
    Promise.resolve() // Placeholder para futuras ações
  );
});

/**
 * PUSH NOTIFICATIONS - Firebase Cloud Messaging (FCM)
 * Recebe mensagens push mesmo com o app fechado
 */
self.addEventListener('push', (event) => {
  console.log('📨 Push recebido (FCM):', event);

  let notificationData = {
    title: 'LearnFunTools',
    body: 'Nova notificação!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: { url: '/' },
    tag: 'learnfun-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  // Processa dados do FCM
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Payload FCM:', payload);

      // FCM envia dados em payload.notification e payload.data
      if (payload.notification) {
        notificationData.title = payload.notification.title || notificationData.title;
        notificationData.body = payload.notification.body || notificationData.body;
        
        // Converte caminho relativo do ícone para URL absoluta
        let iconPath = payload.notification.icon || notificationData.icon;
        if (iconPath && !iconPath.startsWith('http')) {
          iconPath = new URL(iconPath, self.location.origin).href;
        }
        notificationData.icon = iconPath;
        
        // Converte caminho relativo da imagem para URL absoluta
        if (payload.notification.image) {
          let imagePath = payload.notification.image;
          if (!imagePath.startsWith('http')) {
            imagePath = new URL(imagePath, self.location.origin).href;
          }
          notificationData.image = imagePath;
        }
      }
      
      // Verifica também em payload.webpush.notification (FCM pode enviar aqui)
      if (payload.webpush && payload.webpush.notification) {
        if (payload.webpush.notification.icon) {
          let iconPath = payload.webpush.notification.icon;
          if (!iconPath.startsWith('http')) {
            iconPath = new URL(iconPath, self.location.origin).href;
          }
          notificationData.icon = iconPath;
        }
        if (payload.webpush.notification.badge) {
          let badgePath = payload.webpush.notification.badge;
          if (!badgePath.startsWith('http')) {
            badgePath = new URL(badgePath, self.location.origin).href;
          }
          notificationData.badge = badgePath;
        }
      }

      // Dados customizados vêm em payload.data
      if (payload.data) {
        notificationData.data = {
          ...notificationData.data,
          ...payload.data
        };
        notificationData.tag = payload.data.tag || payload.data.type || notificationData.tag;
        
        // URL customizada se fornecida
        if (payload.data.url) {
          notificationData.data.url = payload.data.url;
        }
        
        // Ícone também pode vir em payload.data (fallback)
        if (payload.data.icon && !notificationData.icon.startsWith('http')) {
          let iconPath = payload.data.icon;
          if (!iconPath.startsWith('http')) {
            iconPath = new URL(iconPath, self.location.origin).href;
          }
          notificationData.icon = iconPath;
        }
        
        // Badge também pode vir em payload.data (fallback)
        if (payload.data.badge && !notificationData.badge.startsWith('http')) {
          let badgePath = payload.data.badge;
          if (!badgePath.startsWith('http')) {
            badgePath = new URL(badgePath, self.location.origin).href;
          }
          notificationData.badge = badgePath;
        }
      }

      // Configurações específicas do FCM
      if (payload.fcmOptions) {
        notificationData.requireInteraction = payload.fcmOptions.link || false;
      }
    } catch (e) {
      console.error('❌ Erro ao processar payload FCM:', e);
      // Fallback: tenta ler como texto
      try {
        notificationData.body = event.data.text();
      } catch (textError) {
        console.error('❌ Erro ao ler dados como texto:', textError);
      }
    }
  }

  // ✅ CRÍTICO: Converte caminhos relativos para URLs absolutas
  // Isso é necessário porque o Service Worker precisa de URLs absolutas
  // quando processa notificações push (app pode estar fechado)
  if (notificationData.icon && !notificationData.icon.startsWith('http')) {
    notificationData.icon = new URL(notificationData.icon, self.location.origin).href;
    console.log('🔗 [SW] Ícone convertido para URL absoluta:', notificationData.icon);
  }
  if (notificationData.badge && !notificationData.badge.startsWith('http')) {
    notificationData.badge = new URL(notificationData.badge, self.location.origin).href;
    console.log('🔗 [SW] Badge convertido para URL absoluta:', notificationData.badge);
  }
  if (notificationData.image && !notificationData.image.startsWith('http')) {
    notificationData.image = new URL(notificationData.image, self.location.origin).href;
    console.log('🔗 [SW] Imagem convertida para URL absoluta:', notificationData.image);
  }

  console.log('🔔 [SW] Exibindo notificação:', {
    title: notificationData.title,
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag
  });

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      actions: notificationData.actions,
      timestamp: Date.now()
    }).then(() => {
      console.log('✅ [SW] Notificação exibida com sucesso!');
    }).catch((error) => {
      console.error('❌ [SW] Erro ao exibir notificação:', error);
      console.error('❌ [SW] Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      });
    })
  );
});

/**
 * Evento de ação de notificação (quando tem botões)
 */
self.addEventListener('notificationactionclick', (event) => {
  console.log('🎯 Ação da notificação:', event.action);

  event.notification.close();

  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
  // Se for 'dismiss', apenas fecha a notificação (já fechada acima)
});

// ============================================
// SISTEMA DE NOTIFICAÇÕES AGENDADAS
// ============================================

const NOTIFICATION_STORAGE_KEY = 'learnfun_notification_settings';
const NOTIFICATION_DATA_KEY = 'learnfun_notification_data';

let notificationSettings = null;
let notificationData = null;
let dailyReminderIntervals = [];
let inactivityCheckInterval = null;
let streakCheckInterval = null;

// IndexedDB helper functions
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

async function loadNotificationSettings() {
  try {
    const db = await openNotificationDB();
    const settings = await getFromDB(db, NOTIFICATION_STORAGE_KEY);
    if (settings) {
      notificationSettings = settings;
      return settings;
    }
  } catch (error) {
    console.log('Erro ao carregar do IndexedDB');
  }
  return null;
}

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

function scheduleDailyReminders(config) {
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

      if (!config.daysOfWeek || !config.daysOfWeek.includes(currentDay)) {
        return;
      }

      if (now.getHours() === hours && now.getMinutes() === minutes) {
        self.registration.showNotification('Hora de treinar! 🎯', {
          body: 'Que tal praticar um pouco de inglês agora?',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: `daily-reminder-${timeStr}`,
          data: { url: '/' },
          requireInteraction: false,
          vibrate: [200, 100, 200]
        });
      }
    };

    const interval = setInterval(checkAndNotify, 60 * 1000);
    dailyReminderIntervals.push(interval);
    checkAndNotify();
  });
}

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

      self.registration.showNotification('Você está sem treinar!', {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'inactivity-reminder',
        data: { url: '/' },
        requireInteraction: false,
        vibrate: [200, 100, 200]
      });
    }
  }, 60 * 60 * 1000);
}

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

    if (daysSinceActivity === 1 && data.streak > 0) {
      const [hours, minutes] = settings.streakReminders.reminderTime.split(':').map(Number);
      const now = new Date();

      if (now.getHours() === hours && now.getMinutes() === minutes) {
        const message = settings.streakReminders.message.replace(
          '{streak}',
          data.streak
        );

        self.registration.showNotification('Não perca sua sequência!', {
          body: message,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'streak-reminder',
          data: { url: '/' },
          requireInteraction: false,
          vibrate: [200, 100, 200]
        });
      }
    }
  }, 60 * 1000);
}

async function initializeNotifications() {
  const settings = await loadNotificationSettings();

  if (!settings || !settings.enabled) {
    clearAllIntervals();
    return;
  }

  notificationSettings = settings;

  if (settings.dailyReminders?.enabled) {
    scheduleDailyReminders(settings.dailyReminders);
  }

  scheduleInactivityCheck(settings);
  scheduleStreakCheck(settings);
}

// Escuta mensagens do app
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SCHEDULE_DAILY_REMINDERS':
        try {
          const db = await openNotificationDB();
          await saveToDB(db, NOTIFICATION_STORAGE_KEY, event.data.config);
          await initializeNotifications();
        } catch (error) {
          console.error('Erro ao salvar configurações:', error);
        }
        break;

      case 'UPDATE_NOTIFICATION_SETTINGS':
        try {
          const db = await openNotificationDB();
          await saveToDB(db, NOTIFICATION_STORAGE_KEY, event.data.settings);
          notificationSettings = event.data.settings;
          clearAllIntervals();
          await initializeNotifications();
        } catch (error) {
          console.error('Erro ao atualizar configurações:', error);
        }
        break;

      case 'UPDATE_NOTIFICATION_DATA':
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

// Inicializa quando o SW é ativado
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      initializeNotifications(),
    ])
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});