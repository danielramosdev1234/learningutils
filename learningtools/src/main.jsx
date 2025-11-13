import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { Provider } from 'react-redux';
import App from './App.jsx';
import store from './store/store.js';
import './index.css';

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);