import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { initializeUser } from './store/slices/userSlice';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import TrainerSelector from './components/TrainerSelector';
import IncentiveModal from './components/modals/IncentiveModal';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { closeLevelUpModal } from './store/slices/xpSlice';
import { Analytics } from '@vercel/analytics/react';
import { observeAuthState } from './services/authService';
import {
  detectReferralFromURL,
  saveReferredBy,
  cleanReferralFromURL
} from './utils/referralUtils';
import { ReferralWelcomeBonusHandler } from './components/referral/ReferralWelcomeBonusHandler';
import { ReferralFieldInitializer } from './components/referral/ReferralFieldInitializer';
import MeetRoom from './components/social/MeetRoom';
import OfflineIndicator from './components/ui/OfflineIndicator';
import NotificationPrompt from './components/ui/NotificationPrompt';
import { useNotificationSync } from './hooks/useNotificationSync';
import { useFCM } from './hooks/useFCM';
import { useUILanguage } from './context/LanguageContext.jsx';
import { translateUI } from './i18n/uiTranslations.js';

// Lazy loading de páginas para melhor performance
const FAQ = lazy(() => import('./components/FAQ'));
const Home = lazy(() => import('./pages/Home'));
const Sobre = lazy(() => import('./pages/Sobre'));
const ComoFunciona = lazy(() => import('./pages/ComoFunciona'));
const Precos = lazy(() => import('./pages/Precos'));

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false);
  const { language } = useUILanguage();
  
  // Estado do XP System para o LevelUpModal
  const { showLevelUpModal, pendingLevelUp, totalXP } = useSelector(state => state.xp);

  // Sincroniza dados de notificação com Service Worker
  useNotificationSync();
  
  // Inicializa Firebase Cloud Messaging para push notifications
  useFCM();

  // Detecta referral na URL ANTES de inicializar
  useEffect(() => {
    const refCode = detectReferralFromURL();

    if (refCode) {
      console.log('🎁 Referral detectado na URL:', refCode);
      saveReferredBy(refCode);
      cleanReferralFromURL();

      // Analytics
      if (window.va) {
        window.va('event', {
          name: 'referral_link_clicked',
          data: { code: refCode }
        });
      }
    }
  }, []);

  useEffect(() => {
    // Aguarda o Firebase verificar o estado de autenticação
    const unsubscribe = observeAuthState((authState) => {
      // Só inicializa após o Firebase verificar a autenticação
      if (!authChecked) {
        // Inicializa e aguarda conclusão
        dispatch(initializeUser()).then(() => {
          setUserInitialized(true);
        });
        setAuthChecked(true);
      }
    });

    // Cleanup: cancela o observer quando o componente desmontar
    return () => unsubscribe();
  }, [dispatch, authChecked]);

  // Mostra loading enquanto verifica autenticação E inicializa usuário
  if (!authChecked || !userInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            {translateUI(language, 'common.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ReferralFieldInitializer />
        <ReferralWelcomeBonusHandler />
        <OfflineIndicator />
        <NotificationPrompt />

        <Suspense fallback={<LoadingSpinner fullScreen text={translateUI(language, 'common.loadingPage')} />}>
          <Routes>
            {/* Rota principal com todos os trainers */}
            <Route path="/" element={<TrainerSelector />} />

            {/* Páginas estáticas para SEO - Lazy loaded */}
            <Route 
              path="/home" 
              element={
                <Suspense fallback={<LoadingSpinner fullScreen text={translateUI(language, 'common.loading')} />}>
                  <Home />
                </Suspense>
              } 
            />
            <Route 
              path="/sobre" 
              element={
                <Suspense fallback={<LoadingSpinner fullScreen text={translateUI(language, 'common.loading')} />}>
                  <Sobre />
                </Suspense>
              } 
            />
            <Route 
              path="/como-funciona" 
              element={
                <Suspense fallback={<LoadingSpinner fullScreen text={translateUI(language, 'common.loading')} />}>
                  <ComoFunciona />
                </Suspense>
              } 
            />
            <Route 
              path="/precos" 
              element={
                <Suspense fallback={<LoadingSpinner fullScreen text={translateUI(language, 'common.loading')} />}>
                  <Precos />
                </Suspense>
              } 
            />
            <Route 
              path="/faq" 
              element={
                <Suspense fallback={<LoadingSpinner fullScreen text="Carregando..." />}>
                  <FAQ />
                </Suspense>
              } 
            />

            {/* Rota para entrar em uma sala específica */}
            <Route path="/jitsi-room/:roomId" element={<MeetRoom />} />
          </Routes>
        </Suspense>

        <IncentiveModal />
        <LevelUpModal
          isOpen={showLevelUpModal}
          onClose={() => dispatch(closeLevelUpModal())}
          newLevel={pendingLevelUp}
          totalXP={totalXP}
        />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;