import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator.standalone === true) || standalone;
      setIsInstalled(isInStandaloneMode);
    };

    checkInstalled();

    // Captura o evento de instalação
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detecta se já está instalado
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsAvailable(false);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      // Para iOS, mostra instruções
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Para instalar no iOS:\n1. Toque no botão de compartilhar\n2. Selecione "Adicionar à Tela de Início"');
        return;
      }
      return;
    }

    try {
      // Mostra o prompt nativo
      deferredPrompt.prompt();

      // Aguarda a escolha do usuário
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso!');
      } else {
        console.log('❌ Usuário cancelou a instalação');
      }

      setDeferredPrompt(null);
      setIsAvailable(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  return {
    install,
    isInstalled,
    isAvailable: isAvailable && !isInstalled,
    canInstall: !!deferredPrompt || !isInstalled,
  };
}

