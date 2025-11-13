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
      
      if (isInStandaloneMode) {
        console.log('✅ App já está instalado');
      }
    };

    checkInstalled();

    // Captura o evento de instalação
    const handler = (e) => {
      console.log('🎯 Evento beforeinstallprompt capturado!');
      e.preventDefault();
      // Salva também no window para acesso global
      window.deferredPrompt = e;
      setDeferredPrompt(e);
      setIsAvailable(true);
      console.log('✅ DeferredPrompt salvo, instalação disponível');
    };

    // Verifica se o evento já foi disparado antes do listener ser adicionado
    // (isso pode acontecer se o componente montar depois do evento)
    if (window.deferredPrompt) {
      console.log('📦 DeferredPrompt encontrado no window');
      setDeferredPrompt(window.deferredPrompt);
      setIsAvailable(true);
    }

    window.addEventListener('beforeinstallprompt', handler);

    // Detecta se já está instalado
    const installedHandler = () => {
      console.log('🎉 App instalado!');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsAvailable(false);
      window.deferredPrompt = null;
    };

    window.addEventListener('appinstalled', installedHandler);

    // Log para debug
    console.log('🔍 usePWAInstall: Listener registrado. Aguardando beforeinstallprompt...');

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = async () => {
    // Para iOS, mostra instruções
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert('Para instalar no iOS:\n1. Toque no botão de compartilhar (ícone de compartilhar na barra do navegador)\n2. Selecione "Adicionar à Tela de Início"\n3. Toque em "Adicionar"');
      return;
    }

    // Tenta usar o deferredPrompt do estado ou do window
    const promptToUse = deferredPrompt || window.deferredPrompt;

    if (!promptToUse) {
      // Tenta verificar se o evento ainda não foi disparado
      console.log('⚠️ DeferredPrompt não disponível. Verificando requisitos...');
      
      // Verifica se está em HTTPS ou localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isSecure) {
        alert('❌ Para instalar o app, é necessário acessar via HTTPS ou localhost.\n\nAtualmente você está em: ' + window.location.protocol + '//' + window.location.hostname);
        return;
      }

      // Verifica se o manifest existe
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        alert('❌ Manifest não encontrado. O app pode não estar configurado corretamente.');
        return;
      }

      // Verifica se o Service Worker está registrado
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (!registration) {
            console.warn('⚠️ Service Worker não está registrado');
          } else {
            console.log('✅ Service Worker registrado:', registration.scope);
          }
        });
      }

      // Verifica se já está instalado (pode ter sido perdido no estado)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) {
        alert('✅ O app já está instalado! Procure pelo ícone na sua tela inicial.');
        return;
      }

      // Informa que o navegador ainda não ofereceu a instalação
      const message = `ℹ️ O navegador ainda não ofereceu a opção de instalação.

Isso pode acontecer se:
• Você já instalou o app (verifique sua tela inicial)
• O navegador ainda está avaliando se o app é instalável
• Você precisa interagir mais com o site
• O navegador não suporta instalação de PWAs

Tente:
1. Recarregar a página (F5)
2. Aguardar alguns segundos e tentar novamente
3. Verificar se o ícone de instalação aparece na barra de endereços do navegador

Se o problema persistir, verifique o console do navegador (F12) para mais detalhes.`;

      alert(message);
      console.log('📋 Informações de debug:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        hasManifest: !!manifestLink,
        hasServiceWorker: 'serviceWorker' in navigator,
        isStandalone,
        userAgent: navigator.userAgent
      });
      return;
    }

    try {
      console.log('🚀 Iniciando instalação do PWA...');
      
      // Mostra o prompt nativo
      await promptToUse.prompt();
      console.log('📱 Prompt de instalação exibido');

      // Aguarda a escolha do usuário
      const { outcome } = await promptToUse.userChoice;
      console.log('👤 Escolha do usuário:', outcome);

      if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso!');
        // Não limpa o deferredPrompt aqui, o evento appinstalled vai fazer isso
      } else {
        console.log('❌ Usuário cancelou a instalação');
        // Limpa apenas se cancelou
        setDeferredPrompt(null);
        setIsAvailable(false);
        window.deferredPrompt = null;
      }
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error);
      alert(`Erro ao instalar: ${error.message}\n\nTente recarregar a página e tentar novamente.`);
    }
  };

  return {
    install,
    isInstalled,
    isAvailable: isAvailable && !isInstalled,
    canInstall: (!!deferredPrompt || !!window.deferredPrompt) && !isInstalled,
    hasDeferredPrompt: !!deferredPrompt || !!window.deferredPrompt,
  };
}

