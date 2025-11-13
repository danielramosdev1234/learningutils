/**
 * Utilitário para diagnosticar problemas com FCM
 */

export const diagnoseFCM = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    warnings: [],
    recommendations: []
  };

  // 1. Verifica VAPID Key
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  diagnostics.checks.vapidKey = {
    exists: !!vapidKey,
    length: vapidKey?.length || 0,
    hasHyphens: vapidKey?.includes('-') || false,
    hasUnderscores: vapidKey?.includes('_') || false,
    preview: vapidKey ? vapidKey.substring(0, 30) + '...' : 'não configurada'
  };

  if (!vapidKey) {
    diagnostics.errors.push('VAPID_KEY não configurada no .env');
    diagnostics.recommendations.push('Adicione VITE_FIREBASE_VAPID_KEY no arquivo .env');
  } else if (vapidKey.length < 80) {
    diagnostics.errors.push(`VAPID_KEY muito curta (${vapidKey.length} caracteres). Deve ter mais de 80 caracteres.`);
    diagnostics.recommendations.push('Use o "Par de chaves" completo do Firebase Console (não a chave privada)');
  }

  // 2. Verifica HTTPS/localhost
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
  diagnostics.checks.https = {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isSecure
  };

  if (!isSecure) {
    diagnostics.errors.push(`Não está em HTTPS ou localhost. Atual: ${window.location.protocol}//${window.location.hostname}`);
    diagnostics.recommendations.push('Use HTTPS ou localhost para push notifications funcionarem');
  }

  // 3. Verifica Service Worker
  const hasServiceWorker = 'serviceWorker' in navigator;
  diagnostics.checks.serviceWorker = {
    supported: hasServiceWorker
  };

  if (!hasServiceWorker) {
    diagnostics.errors.push('Service Worker não é suportado neste navegador');
  } else {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      diagnostics.checks.serviceWorker.registrations = registrations.length;
      diagnostics.checks.serviceWorker.scopes = registrations.map(r => r.scope);

      if (registrations.length === 0) {
        diagnostics.errors.push('Nenhum Service Worker registrado');
        diagnostics.recommendations.push('Recarregue a página para registrar o Service Worker');
      } else {
        const registration = await navigator.serviceWorker.ready;
        diagnostics.checks.serviceWorker.ready = true;
        diagnostics.checks.serviceWorker.scope = registration.scope;
        diagnostics.checks.serviceWorker.hasPushManager = !!registration.pushManager;

        if (!registration.pushManager) {
          diagnostics.errors.push('Push Manager não está disponível no Service Worker');
        }
      }
    } catch (error) {
      diagnostics.errors.push(`Erro ao verificar Service Worker: ${error.message}`);
    }
  }

  // 4. Verifica Permissões de Notificação
  const notificationPermission = 'Notification' in window ? Notification.permission : 'not-supported';
  diagnostics.checks.notificationPermission = {
    supported: 'Notification' in window,
    permission: notificationPermission
  };

  if (notificationPermission === 'not-supported') {
    diagnostics.errors.push('Notificações não são suportadas neste navegador');
  } else if (notificationPermission !== 'granted') {
    diagnostics.warnings.push(`Permissão de notificações: ${notificationPermission}`);
    diagnostics.recommendations.push('Solicite permissão de notificações primeiro');
  }

  // 5. Verifica Firebase Messaging
  try {
    const { getFirebaseMessaging } = await import('../config/firebase');
    const messaging = await getFirebaseMessaging();
    diagnostics.checks.firebaseMessaging = {
      available: !!messaging
    };

    if (!messaging) {
      diagnostics.errors.push('Firebase Messaging não está disponível');
    }
  } catch (error) {
    diagnostics.errors.push(`Erro ao verificar Firebase Messaging: ${error.message}`);
  }

  // 6. Resumo
  diagnostics.summary = {
    totalErrors: diagnostics.errors.length,
    totalWarnings: diagnostics.warnings.length,
    totalRecommendations: diagnostics.recommendations.length,
    status: diagnostics.errors.length === 0 ? 'ok' : 'error'
  };

  return diagnostics;
};

/**
 * Exibe diagnóstico no console de forma formatada
 */
export const logFCMDiagnostics = async () => {
  const diagnostics = await diagnoseFCM();
  
  console.group('🔍 Diagnóstico FCM');
  console.log('Timestamp:', diagnostics.timestamp);
  
  console.group('✅ Verificações');
  console.table(diagnostics.checks);
  console.groupEnd();
  
  if (diagnostics.errors.length > 0) {
    console.group('❌ Erros');
    diagnostics.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (diagnostics.warnings.length > 0) {
    console.group('⚠️ Avisos');
    diagnostics.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.group('💡 Recomendações');
    diagnostics.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
  }
  
  console.log('📊 Resumo:', diagnostics.summary);
  console.groupEnd();
  
  return diagnostics;
};

