import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, BellOff, X, Settings } from 'lucide-react';
import { requestNotificationPermission } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

const NotificationPrompt = () => {
  const { userId, mode } = useSelector(state => state.user);
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    checkNotificationStatus();
  }, [userId, mode]);

  const checkNotificationStatus = async () => {
    // Não mostra para guests
    if (mode === 'guest') {
      return;
    }

    // Verifica permissão do navegador
    if (!('Notification' in window)) {
      return; // Navegador não suporta notificações
    }

    const permission = Notification.permission;
    setPermissionStatus(permission);

    // Se já foi concedida, não mostra
    if (permission === 'granted') {
      return;
    }

    // Verifica se já foi dispensado nesta sessão
    const dismissedThisSession = sessionStorage.getItem('notification-prompt-dismissed');
    if (dismissedThisSession) {
      return;
    }

    // Verifica se já foi dispensado permanentemente
    const dismissedPermanently = localStorage.getItem('notification-prompt-dismissed');
    if (dismissedPermanently) {
      return;
    }

    // Verifica se as notificações estão habilitadas nas configurações
    const notificationSettings = localStorage.getItem('learnfun_notification_settings');
    if (notificationSettings) {
      try {
        const settings = JSON.parse(notificationSettings);
        if (settings.enabled && permission === 'granted') {
          return; // Já está tudo configurado
        }
      } catch (error) {
        // Ignora erro de parsing
      }
    }

    // Mostra o prompt após um pequeno delay para não ser intrusivo
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000); // 2 segundos após carregar

    return () => clearTimeout(timer);
  };

  const handleEnable = async () => {
    try {
      const { granted, error } = await requestNotificationPermission();

      if (granted) {
        // Redireciona para a tela de configurações
        // Vamos usar um estado global ou evento para abrir o modal
        // Por enquanto, vamos usar um evento customizado
        window.dispatchEvent(new CustomEvent('openNotificationSettings'));
        setShowPrompt(false);
        
        // Salva que o usuário aceitou
        localStorage.setItem('notification-prompt-accepted', 'true');
      } else {
        alert(`❌ ${error || 'Permissão negada'}`);
        handleDismiss();
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      alert('Erro ao solicitar permissão de notificações');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salva que foi dispensado nesta sessão
    sessionStorage.setItem('notification-prompt-dismissed', 'true');
  };

  const handleDismissPermanently = () => {
    setShowPrompt(false);
    // Salva que foi dispensado permanentemente
    localStorage.setItem('notification-prompt-dismissed', 'true');
    sessionStorage.setItem('notification-prompt-dismissed', 'true');
  };

  const handleKeyDownClose = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    } else if (e.key === 'Escape') {
      handleDismiss();
    }
  };

  const handleKeyDownEnable = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEnable();
    }
  };

  const handleKeyDownDismiss = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  const handleKeyDownDismissPermanently = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismissPermanently();
    }
  };

  const handleKeyDownBackdrop = (e) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  };

  if (!showPrompt) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleDismiss}
      onKeyDown={handleKeyDownBackdrop}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-prompt-title"
      aria-describedby="notification-prompt-description"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDismiss}
          onKeyDown={handleKeyDownClose}
          tabIndex={0}
          aria-label="Fechar prompt de notificações"
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
            {permissionStatus === 'denied' ? (
              <BellOff className="w-8 h-8 text-white" aria-hidden="true" />
            ) : (
              <Bell className="w-8 h-8 text-white" aria-hidden="true" />
            )}
          </div>
          
          <h2 id="notification-prompt-title" className="text-2xl font-bold text-gray-800 mb-2">
            Ative as Notificações
          </h2>
          
          <p id="notification-prompt-description" className="text-gray-600">
            {permissionStatus === 'denied' 
              ? 'As notificações estão bloqueadas. Ative nas configurações do navegador para receber lembretes de treino!'
              : 'Receba lembretes personalizados para treinar inglês e não perder sua sequência! 🔥'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEnable}
            onKeyDown={handleKeyDownEnable}
            tabIndex={0}
            aria-label={permissionStatus === 'denied' ? 'Ir para configurações do navegador' : 'Ativar notificações'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {permissionStatus === 'denied' 
              ? 'Ir para Configurações'
              : 'Ativar Notificações'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              onKeyDown={handleKeyDownDismiss}
              tabIndex={0}
              aria-label="Fechar prompt agora"
              className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
            >
              Agora não
            </button>
            <button
              onClick={handleDismissPermanently}
              onKeyDown={handleKeyDownDismissPermanently}
              tabIndex={0}
              aria-label="Não mostrar este prompt novamente"
              className="flex-1 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Não mostrar novamente
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <div className="flex-shrink-0 mt-0.5">
              <Settings className="w-4 h-4" aria-hidden="true" />
            </div>
            <p>
              Você pode configurar horários, frequência e tipos de notificações 
              na página de configurações a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;

