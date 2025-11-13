import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  getFCMToken,
  saveFCMToken,
  removeFCMToken,
  setupFCMForegroundListener,
  checkFCMTokenStatus
} from '../services/fcmService';
import { requestNotificationPermission } from '../services/notificationService';
import { logFCMDiagnostics } from '../utils/fcmDiagnostics';

/**
 * Hook para gerenciar Firebase Cloud Messaging
 */
export function useFCM() {
  const { userId, mode } = useSelector(state => state.user);
  const [fcmToken, setFcmToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasToken, setHasToken] = useState(false);

  // Inicializa FCM quando o usuário está logado
  useEffect(() => {
    if (mode === 'guest' || !userId) {
      setIsInitialized(false);
      return;
    }

    const initializeFCM = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Verifica permissão de notificações
        const { granted } = await requestNotificationPermission();
        if (!granted) {
          console.warn('Permissão de notificações não concedida');
          setIsInitialized(false);
          setIsLoading(false);
          return;
        }

        // Aguarda Service Worker estar totalmente pronto
        if ('serviceWorker' in navigator) {
          let registration = null;
          try {
            registration = await navigator.serviceWorker.ready;
            console.log('✅ Service Worker pronto');
          } catch (swError) {
            console.error('❌ Erro ao aguardar Service Worker:', swError);
            throw new Error('Service Worker não está disponível. Recarregue a página.');
          }

          // Aguarda um pouco mais para garantir que está totalmente inicializado
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Verifica se já tem token salvo
        const status = await checkFCMTokenStatus(userId);
        if (status.hasToken) {
          setHasToken(true);
          setFcmToken(status.token);
        }

        // Obtém novo token FCM
        const token = await getFCMToken();
        setFcmToken(token);

        // Salva token no Firestore
        await saveFCMToken(userId, token);
        setHasToken(true);

        // Configura listener para mensagens em foreground
        setupFCMForegroundListener((payload) => {
          console.log('📨 Mensagem FCM recebida:', payload);
        });

        setIsInitialized(true);
        console.log('✅ FCM inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar FCM:', error);
        
        // Executa diagnóstico completo
        console.log('🔍 Executando diagnóstico FCM...');
        await logFCMDiagnostics();
        
        // Mensagem de erro mais detalhada
        let errorMessage = error.message;
        
        if (error.message.includes('Missing or insufficient permissions')) {
          errorMessage = 'Permissões insuficientes. Execute o diagnóstico no console (F12) para mais detalhes.';
        } else if (error.message.includes('applicationServerKey') || error.message.includes('not valid')) {
          errorMessage = 'VAPID_KEY inválida. Use o par de chaves completo do Firebase Console (não a chave privada).';
        }
        
        setError(errorMessage);
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFCM();
  }, [userId, mode]);

  // Atualiza token quando necessário
  const refreshToken = useCallback(async () => {
    if (!userId) return false;

    try {
      setIsLoading(true);
      setError(null);

      const token = await getFCMToken();
      setFcmToken(token);
      await saveFCMToken(userId, token);
      setHasToken(true);

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar token FCM:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Remove token quando usuário desativa notificações
  const removeToken = useCallback(async () => {
    if (!userId) return false;

    try {
      await removeFCMToken(userId);
      setFcmToken(null);
      setHasToken(false);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover token FCM:', error);
      setError(error.message);
      return false;
    }
  }, [userId]);

  return {
    fcmToken,
    isInitialized,
    isLoading,
    error,
    hasToken,
    refreshToken,
    removeToken
  };
}

