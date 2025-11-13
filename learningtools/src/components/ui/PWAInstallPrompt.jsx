import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Captura o evento de instalação
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Só mostra se o usuário ainda não instalou
      const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches;
      if (!alreadyInstalled) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detecta se já está instalado
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

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
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salva no localStorage para não mostrar novamente
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostra se já foi dispensado antes
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-2xl p-4 animate-slide-up z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Instalar LearnFunTools</h3>
          <p className="text-sm text-white/90 mt-1">
            Adicione à tela inicial para acesso rápido e funcionalidades offline!
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-white/90 hover:text-white transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

