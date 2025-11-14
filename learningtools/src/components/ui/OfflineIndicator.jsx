import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Não mostra nada se estiver online e sem notificação
  if (isOnline && !showNotification) return null;

  // Helper para construir className sem ternários
  const getStatusClasses = () => {
    const baseClasses = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg transition-all duration-300 text-white';
    const statusClasses = isOnline 
      ? 'bg-green-500 animate-fade-in' 
      : 'bg-red-500';
    return `${baseClasses} ${statusClasses}`;
  };

  return (
    <div
      className={getStatusClasses()}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'Conectado à internet' : 'Sem conexão com a internet'}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi size={18} aria-hidden="true" />
            <span className="font-medium">Conectado!</span>
          </>
        ) : (
          <>
            <WifiOff size={18} aria-hidden="true" />
            <span className="font-medium">Você está offline</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

