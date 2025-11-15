import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { Provider } from 'react-redux';
import App from './App.jsx';
import store from './store/store.js';
import './index.css';
import { initializePWAInstallManager } from './utils/pwaInstallManager';

// Inicializa o PWA Install Manager ANTES de renderizar o React
// Isso garante que o listener esteja ativo desde o início
initializePWAInstallManager();

registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm('Nova versão disponível! Atualizar agora?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    // eslint-disable-next-line no-console
    console.log('App pronto para funcionar offline!');
  },
  onRegisterError(error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao registrar o Service Worker:', error);
  },
});

// Esconde conteúdo estático imediatamente quando React começa a montar
const rootElement = document.getElementById('root');
if (rootElement) {
  // Remove conteúdo estático antes do React renderizar
  const staticContent = rootElement.querySelector('.static-content-visible');
  if (staticContent) {
    staticContent.style.display = 'none';
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);

// Sinalizar que o app foi renderizado (útil para prerendering futuro)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Pequeno delay para garantir que React montou
    setTimeout(() => {
      document.dispatchEvent(new Event('app-rendered'));
    }, 100);
  });
}