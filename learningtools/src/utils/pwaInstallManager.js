/**
 * Singleton para gerenciar o deferredPrompt globalmente
 * Evita múltiplos listeners competindo pelo mesmo evento
 */

let deferredPrompt = null;
let listeners = new Set();
let isInstalled = false;

// Verifica se já está instalado
function checkInstalled() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  isInstalled = (window.navigator.standalone === true) || standalone;
  return isInstalled;
}

// Handler global para beforeinstallprompt
function handleBeforeInstallPrompt(e) {
  console.log('🎯 [Global] Evento beforeinstallprompt capturado!');
  e.preventDefault();
  deferredPrompt = e;
  window.deferredPrompt = e; // Backup no window
  
  // Notifica todos os listeners
  listeners.forEach(callback => callback(deferredPrompt));
  console.log('✅ [Global] DeferredPrompt salvo e notificados', listeners.size, 'listeners');
}

// Handler global para appinstalled
function handleAppInstalled() {
  console.log('🎉 [Global] App instalado!');
  isInstalled = true;
  deferredPrompt = null;
  window.deferredPrompt = null;
  
  // Notifica todos os listeners
  listeners.forEach(callback => callback(null));
}

// Inicializa o sistema global (chamado apenas uma vez)
let initialized = false;

export function initializePWAInstallManager() {
  if (initialized) {
    console.log('⚠️ [Global] PWA Install Manager já inicializado');
    return;
  }

  console.log('🔧 [Global] Inicializando PWA Install Manager...');
  
  // Verifica se já está instalado
  checkInstalled();
  
  // Verifica se já existe um deferredPrompt (caso o evento tenha sido disparado antes)
  if (window.deferredPrompt) {
    console.log('📦 [Global] DeferredPrompt encontrado no window');
    deferredPrompt = window.deferredPrompt;
    listeners.forEach(callback => callback(deferredPrompt));
  }
  
  // Adiciona listeners globais (apenas uma vez)
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  
  initialized = true;
  console.log('✅ [Global] PWA Install Manager inicializado');
}

// Registra um listener para receber atualizações do deferredPrompt
export function subscribeToPWAInstall(callback) {
  listeners.add(callback);
  
  // Se já existe um deferredPrompt, notifica imediatamente
  if (deferredPrompt) {
    callback(deferredPrompt);
  }
  
  // Retorna função para desinscrever
  return () => {
    listeners.delete(callback);
  };
}

// Obtém o deferredPrompt atual
export function getDeferredPrompt() {
  return deferredPrompt || window.deferredPrompt || null;
}

// Verifica se está instalado
export function getIsInstalled() {
  return isInstalled || checkInstalled();
}

// Instala o PWA
export async function installPWA() {
  const promptToUse = getDeferredPrompt();
  
  if (!promptToUse) {
    throw new Error('DeferredPrompt não disponível');
  }
  
  try {
    await promptToUse.prompt();
    const { outcome } = await promptToUse.userChoice;
    return outcome === 'accepted';
  } catch (error) {
    console.error('Erro ao instalar PWA:', error);
    throw error;
  }
}

