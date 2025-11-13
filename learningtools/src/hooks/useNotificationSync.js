import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook para sincronizar dados do usuário com o Service Worker
 * para permitir verificações de inatividade e streak em background
 */
export function useNotificationSync() {
  const { userId, stats, mode } = useSelector(state => state.user);

  useEffect(() => {
    if (mode !== 'authenticated' || !userId) {
      return;
    }

    // Sincroniza dados com o Service Worker periodicamente
    const syncData = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.postMessage({
            type: 'UPDATE_NOTIFICATION_DATA',
            data: {
              userId,
              streak: stats?.streak?.current || 0,
              lastActivityDate: stats?.streak?.lastActivityDate || new Date().toISOString(),
              totalPhrases: stats?.totalPhrases || 0,
            }
          });
        });
      }
    };

    // Sincroniza imediatamente
    syncData();

    // Sincroniza a cada 5 minutos
    const interval = setInterval(syncData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId, stats, mode]);
}

