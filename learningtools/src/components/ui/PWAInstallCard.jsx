import { Download, Smartphone, Zap } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function PWAInstallCard() {
  const { install, isInstalled, isAvailable, hasDeferredPrompt } = usePWAInstall();

  // Não mostra se já estiver instalado
  if (isInstalled) return null;

  // Só mostra se estiver disponível ou se o usuário não tiver dispensado
  const dismissed = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissed && !isAvailable) return null;

  return (
    <div className="text-blue-600-100 rounded-2xl shadow-xl p-6 mb-6 text-blue relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 text-blue-600/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 text-blue-600/10 rounded-full -ml-12 -mb-12"></div>

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-blue-600 p-3 rounded-xl backdrop-blur-sm">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-blue-600">
              <Zap className="w-6 h-6" />
              Instale o App
            </h3>
            <p className="text-blue-600 text-sm leading-relaxed">
              Adicione o LearnFunTools à sua tela inicial para acesso rápido, 
              funcionalidades offline e uma experiência ainda melhor!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={install}
            disabled={!hasDeferredPrompt}
            className={`flex-1 min-w-[140px] bg-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
              hasDeferredPrompt
                ? 'text-blue-600 text-blue-600 hover:text-blue-600-50'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            title={!hasDeferredPrompt ? 'Aguardando navegador oferecer instalação...' : 'Instalar aplicativo'}
          >
            <Download className="w-5 h-5" />
            {hasDeferredPrompt ? 'Instalar Agora' : 'Aguardando...'}
          </button>
          <button
            onClick={() => {
              localStorage.setItem('pwa-prompt-dismissed', 'true');
              // Força re-render removendo do DOM
              window.location.reload();
            }}
            className="px-4 py-3 text-blue-600 hover:text-blue transition-colors font-semibold"
          >
            Talvez depois
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-blue-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 text-blue-600 rounded-full"></div>
            <span>Acesso offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 text-blue-600 rounded-full"></div>
            <span>Carregamento rápido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 text-blue-600 rounded-full"></div>
            <span>Notificações</span>
          </div>
        </div>
      </div>
    </div>
  );
}

