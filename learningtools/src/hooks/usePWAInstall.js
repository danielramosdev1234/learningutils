import { useState, useEffect } from 'react';
import {
  initializePWAInstallManager,
  subscribeToPWAInstall,
  getDeferredPrompt,
  getIsInstalled,
  installPWA as globalInstallPWA
} from '../utils/pwaInstallManager';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // O manager já foi inicializado no main.jsx, mas garantimos aqui também
    initializePWAInstallManager();
    
    // Verifica estado inicial
    const currentPrompt = getDeferredPrompt();
    const installed = getIsInstalled();

    if (currentPrompt) {
      setDeferredPrompt(currentPrompt);
      setIsAvailable(true);
    }
    setIsInstalled(installed);

    // Subscreve para receber atualizações
    const unsubscribe = subscribeToPWAInstall((prompt) => {
      if (prompt) {
        setDeferredPrompt(prompt);
        setIsAvailable(true);
      } else {
        setDeferredPrompt(null);
        setIsAvailable(false);
        setIsInstalled(true);
      }
    });

    // Atualiza estado de instalação periodicamente
    const checkInterval = setInterval(() => {
      const installed = getIsInstalled();
      setIsInstalled(installed);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, []);

  const install = async () => {
    // Para iOS, mostra instruções
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert('Para instalar no iOS:\n1. Toque no botão de compartilhar (ícone de compartilhar na barra do navegador)\n2. Selecione "Adicionar à Tela de Início"\n3. Toque em "Adicionar"');
      return;
    }

    // Usa o manager global
    const promptToUse = getDeferredPrompt();

    if (!promptToUse) {
      // Tenta verificar se o evento ainda não foi disparado

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

      // Verifica se já está instalado
      if (getIsInstalled()) {
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
      return;
    }

    try {
      const accepted = await globalInstallPWA();

      if (accepted) {
        // Installation successful
      } else {
        // User cancelled installation
      }
    } catch (error) {
      alert(`Erro ao instalar: ${error.message}\n\nTente recarregar a página e tentar novamente.`);
    }
  };

  return {
    install,
    isInstalled,
    isAvailable: isAvailable && !isInstalled,
    canInstall: !!deferredPrompt && !isInstalled,
    hasDeferredPrompt: !!deferredPrompt,
  };
}

