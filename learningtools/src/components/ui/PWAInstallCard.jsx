import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function PWAInstallCard() {
  const { install, isInstalled, isAvailable, hasDeferredPrompt } = usePWAInstall();

  // Não mostra se já estiver instalado
  if (isInstalled) return null;

  // Só mostra se estiver disponível ou se o usuário não tiver dispensado
  const dismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissed && !isAvailable) return null;

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    // Força re-render removendo do DOM (ou apenas esconde se o estado reagisse, mas reload garante)
    window.location.reload();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 relative overflow-hidden">
      {/* X button positioned in top right corner */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors z-10"
        aria-label="Dispensar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4 pr-10">
        <div className="bg-blue-50 p-2 rounded-lg shrink-0">
          <img src="/pwa-512x512.png" alt="App Icon" className="w-18 h-18" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              Instale o App LearnFun
            </h3>
            <p className="text-xs text-slate-500 truncate">
              Acesso offline e melhor performance
            </p>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={install}
              disabled={!hasDeferredPrompt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasDeferredPrompt ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              <Download className="w-3.5 h-3.5" />
              {hasDeferredPrompt ? 'Instalar App' : '...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

