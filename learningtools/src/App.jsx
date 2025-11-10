import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeUser } from './store/slices/userSlice';
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

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
  const [userInitialized, setUserInitialized] = useState(false);
  
  // Estado do XP System para o LevelUpModal
  const { showLevelUpModal, pendingLevelUp, totalXP } = useSelector(state => state.xp);

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
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ReferralFieldInitializer />
      <ReferralWelcomeBonusHandler />

      <Routes>
        {/* Rota principal com todos os trainers */}
        <Route path="/" element={<TrainerSelector />} />

        {/* Rota para entrar em uma sala específica */}
        <Route path="/jitsi-room/:roomId" element={<MeetRoom />} />
      </Routes>

      <IncentiveModal />
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => dispatch(closeLevelUpModal())}
        newLevel={pendingLevelUp}
        totalXP={totalXP}
      />
      <Analytics />
    </BrowserRouter>
  );
}

export default App;