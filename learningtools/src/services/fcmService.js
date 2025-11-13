import { getFirebaseMessaging } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Obtém o token FCM do dispositivo
 */
export const getFCMToken = async () => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error('Firebase Messaging não está disponível');
    }

    // Verifica se o Service Worker está registrado
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker não é suportado');
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Obtém o token FCM
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Não foi possível obter o token FCM');
    }

    console.log('✅ Token FCM obtido:', token);
    return token;
  } catch (error) {
    console.error('❌ Erro ao obter token FCM:', error);
    throw error;
  }
};

/**
 * Salva o token FCM no Firestore associado ao usuário
 */
export const saveFCMToken = async (userId, token) => {
  try {
    if (!userId || !token) {
      throw new Error('userId e token são obrigatórios');
    }

    const tokenDocRef = doc(db, 'fcm_tokens', userId);
    const tokenDoc = await getDoc(tokenDocRef);

    const tokenData = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };

    if (tokenDoc.exists()) {
      // Atualiza token existente
      await updateDoc(tokenDocRef, {
        token,
        updatedAt: new Date().toISOString(),
        platform: navigator.platform,
        userAgent: navigator.userAgent
      });
      console.log('✅ Token FCM atualizado no Firestore');
    } else {
      // Cria novo documento
      await setDoc(tokenDocRef, tokenData);
      console.log('✅ Token FCM salvo no Firestore');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar token FCM:', error);
    throw error;
  }
};

/**
 * Remove o token FCM do Firestore
 */
export const removeFCMToken = async (userId) => {
  try {
    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    const tokenDocRef = doc(db, 'fcm_tokens', userId);
    await updateDoc(tokenDocRef, {
      token: null,
      removedAt: new Date().toISOString()
    });

    console.log('✅ Token FCM removido do Firestore');
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover token FCM:', error);
    throw error;
  }
};

/**
 * Configura listener para mensagens FCM quando o app está em foreground
 */
export const setupFCMForegroundListener = (callback) => {
  getFirebaseMessaging().then(messaging => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('📨 Mensagem FCM recebida (foreground):', payload);
      
      if (callback) {
        callback(payload);
      }

      // Mostra notificação mesmo em foreground (opcional)
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        
        if ('serviceWorker' in navigator && 'Notification' in window) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body,
              icon: icon || '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              tag: payload.data?.tag || 'fcm-notification',
              data: payload.data || {},
              requireInteraction: false
            });
          });
        }
      }
    });
  });
};

/**
 * Verifica se o token FCM está salvo e atualizado
 */
export const checkFCMTokenStatus = async (userId) => {
  try {
    if (!userId) return { hasToken: false };

    const tokenDocRef = doc(db, 'fcm_tokens', userId);
    const tokenDoc = await getDoc(tokenDocRef);

    if (!tokenDoc.exists()) {
      return { hasToken: false };
    }

    const data = tokenDoc.data();
    return {
      hasToken: !!data.token,
      token: data.token,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error('❌ Erro ao verificar status do token FCM:', error);
    return { hasToken: false, error: error.message };
  }
};

