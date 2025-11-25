// src/components/onboarding/LexySpeakingOnboarding.jsx

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Lottie from 'react-lottie-player';
import { Volume2, X } from 'lucide-react';
import { useUILanguage } from '../../context/LanguageContext';
import { translateUI } from '../../i18n/uiTranslations';
import learninhoTalking from '../../assets/animation.json';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '../../store/slices/userSlice';

// ============================================================================
// CONSTANTES
// ============================================================================

const PADDING = 16;

// Mapeamento de momentos → sequências de áudio
const AUDIO_MAP = {
  intro: [
    { file: '/src/assets/onboarding-lexy/01_intro_welcome.mp3', duration: 4000 },
    { file: '/src/assets/onboarding-lexy/02_intro_lets_go.mp3', duration: 3000, pauseBefore: 500 }
  ],
  instruction: [
    { file: '/src/assets/onboarding-lexy/03_instruction_phrase.mp3', duration: 4000 }
  ],
     listen: [
       { file: '/src/assets/onboarding-lexy/03b_instruction_listen.mp3', duration: 3000 }
     ],
  speak: [
    { file: '/src/assets/onboarding-lexy/04_instruction_speak.mp3', duration: 4500 }
  ],
  feedback_high: [
    { file: '/src/assets/onboarding-lexy/05_celebrate_high.mp3', duration: 2000 },
    { file: '/src/assets/onboarding-lexy/08_feedback_explain.mp3', duration: 4000, pauseBefore: 300 }
  ],
  feedback_medium: [
    { file: '/src/assets/onboarding-lexy/06_celebrate_medium.mp3', duration: 2000 },
    { file: '/src/assets/onboarding-lexy/08_feedback_explain.mp3', duration: 4000, pauseBefore: 300 }
  ],
  feedback_low: [
    { file: '/src/assets/onboarding-lexy/07_celebrate_low.mp3', duration: 2500 },
    { file: '/src/assets/onboarding-lexy/08_feedback_explain.mp3', duration: 4000, pauseBefore: 300 }
  ],
  next: [
    { file: '/src/assets/onboarding-lexy/09_next_phrase.mp3', duration: 4000 }
  ],

     login: [
       { file: '/src/assets/onboarding-lexy/10_login_intro.mp3', duration: 6000 },
       { file: '/src/assets/onboarding-lexy/11_login_benefits.mp3', duration: 7000, pauseBefore: 500 },
       { file: '/src/assets/onboarding-lexy/12_login_warning.mp3', duration: 5000, pauseBefore: 500 }
     ]
};

// Mapeamento de momentos → elementos a destacar
const HIGHLIGHT_MAP = {
  intro: null, // Sem highlight, apenas Lexy centralizado
  instruction: 'tour-phrase-text',
  listen: 'tour-hear-button',
  speak: 'tour-speak-button',
  waiting: null, // Lexy SOME completamente
  feedback: 'tour-feedback-area',
  next: 'tour-next-button',
  login: null
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

const createOverlaySegments = (rect) => {
  if (!rect) {
    return null;
  }

  const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();
  const expanded = {
    top: Math.max(rect.top - PADDING, 0),
    left: Math.max(rect.left - PADDING, 0),
    width: Math.min(rect.width + PADDING * 2, viewportWidth),
    height: Math.min(rect.height + PADDING * 2, viewportHeight)
  };

  return {
    top: {
      top: 0,
      left: 0,
      width: viewportWidth,
      height: expanded.top
    },
    bottom: {
      top: expanded.top + expanded.height,
      left: 0,
      width: viewportWidth,
      height: Math.max(viewportHeight - (expanded.top + expanded.height), 0)
    },
    left: {
      top: expanded.top,
      left: 0,
      width: expanded.left,
      height: expanded.height
    },
    right: {
      top: expanded.top,
      left: expanded.left + expanded.width,
      width: Math.max(viewportWidth - (expanded.left + expanded.width), 0),
      height: expanded.height
    },
    highlight: {
      top: expanded.top,
      left: expanded.left,
      width: expanded.width,
      height: expanded.height
    }
  };
};

// ============================================================================
// COMPONENTE: ARROW TO TARGET
// ============================================================================

const ArrowToTarget = ({ targetRect }) => {
  if (!targetRect) return null;

  const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  // Centro do elemento destacado
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  // Calcular ângulo
  const angle = Math.atan2(targetCenterY - centerY, targetCenterX - centerX) * (180 / Math.PI);

  // Distância
  const distance = Math.sqrt(
    Math.pow(targetCenterX - centerX, 2) + Math.pow(targetCenterY - centerY, 2)
  );

  // Ajustar comprimento da seta (não ultrapassar o elemento)
  const arrowLength = Math.min(distance - 100, 150);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        width: arrowLength,
        height: 4,
        background: 'linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(168, 85, 247, 0))',
        transformOrigin: 'left center',
        transition: 'all 0.3s ease-out'
      }}
    >
      {/* Ponta da seta */}
      <div
        className="absolute"
        style={{
          right: -10,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderLeft: '10px solid rgba(168, 85, 247, 0.8)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent'
        }}
      />
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const LexySpeakingOnboarding = ({
  visible,
  moment,
  userAccuracy,
  onMomentComplete,
  onSkip,
  onFinish
}) => {
  // --- Estados ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showReplayButton, setShowReplayButton] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [segments, setSegments] = useState(null);

  const audioRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);
  const { language } = useUILanguage();
  const dispatch = useDispatch();

  // ============================================================================
  // FUNÇÕES PRINCIPAIS
  // ============================================================================

  // 1. getMomentAudios() - retorna áudios baseado em momento + acurácia
  const getMomentAudios = () => {
    if (moment === 'feedback') {
      if (userAccuracy >= 80) return AUDIO_MAP.feedback_high;
      if (userAccuracy >= 60) return AUDIO_MAP.feedback_medium;
      return AUDIO_MAP.feedback_low;
    }
    return AUDIO_MAP[moment] || [];
  };
const handleLexyFinish = () => {
  console.log('✅ Onboarding concluído');
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOUR_STORAGE_KEY, 'completed');
  }
  setShowLexyOnboarding(false);
  setLexyMoment('intro');
  setUserAccuracy(0);
};

  // 2. playAudioSequence() - toca sequência de áudios com pausas
  const playAudioSequence = async (audios) => {
    if (!audios || audios.length === 0) {
      console.log('🦊 Sem áudios para tocar');
      return;
    }

    console.log(`🎵 Iniciando sequência de ${audios.length} áudio(s) para momento: ${moment}`);
    setShowReplayButton(false);
    setCurrentAudioIndex(0);

    for (let i = 0; i < audios.length; i++) {
      const audioConfig = audios[i];

      // Pausa antes do áudio (se configurada)
      if (audioConfig.pauseBefore) {
        console.log(`⏸️ Pausando ${audioConfig.pauseBefore}ms antes do áudio ${i + 1}`);
        await new Promise(resolve => {
          sequenceTimeoutRef.current = setTimeout(resolve, audioConfig.pauseBefore);
        });
      }

      // Tocar áudio
      console.log(`▶️ Tocando áudio ${i + 1}/${audios.length}: ${audioConfig.file}`);
      setCurrentAudioIndex(i);
      await playAudio(audioConfig.file);
    }

    // Sequência completa
    console.log('✅ Sequência de áudios concluída');
    setIsPlaying(false);
    setShowReplayButton(true);

    // Avançar para próximo momento automaticamente
    const nextMomentMap = {
      intro: 'instruction',
      instruction: 'listen',
        listen: null,
      speak: 'waiting',
      waiting: 'feedback',
      feedback: 'next',
       next: 'login',
      login: null
    };

    const nextMoment = nextMomentMap[moment];
    if (nextMoment) {
      console.log(`🦊 Avançando automaticamente: ${moment} → ${nextMoment}`);
      onMomentComplete(nextMoment);
    } else {
      console.log('🎉 Onboarding concluído!');
      onFinish();
    }
  };

  // 3. playAudio() - toca um único áudio (Promise)
  const playAudio = (audioFile) => {
    return new Promise((resolve, reject) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioFile);
      audioRef.current = audio;

      audio.onplay = () => {
        console.log('🔊 Áudio iniciado');
        setIsPlaying(true);
      };

      audio.onended = () => {
        console.log('🔇 Áudio finalizado');
        setIsPlaying(false);
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ Erro ao tocar áudio:', error);
        setIsPlaying(false);
        reject(error);
      };

      audio.play().catch((err) => {
        console.error('❌ Play error:', err);
        setIsPlaying(false);
        reject(err);
      });
    });
  };

  // 4. handleReplay() - replay do fragmento atual
  const handleReplay = () => {
    console.log('🔄 Replay solicitado');
    const audios = getMomentAudios();
    setShowReplayButton(false);
    playAudioSequence(audios);
  };

  // 5. handleSkipClick() - mostra modal de confirmação
  const handleSkipClick = () => {
    console.log('⏭️ Usuário clicou em Skip');
    setShowSkipConfirm(true);
  };

  // 6. confirmSkip() - pausa áudio + chama onSkip
  const confirmSkip = () => {
    console.log('✅ Skip confirmado');
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
    }
    setIsPlaying(false);
    setShowSkipConfirm(false);
    onSkip();
  };

  // 7. cancelSkip() - fecha modal sem pular
  const cancelSkip = () => {
    console.log('❌ Skip cancelado');
    setShowSkipConfirm(false);
  };

  // 8. updateHighlight() - atualiza posição do highlight
  const updateHighlight = () => {
    const targetId = HIGHLIGHT_MAP[moment];

    if (!targetId) {
      setTargetRect(null);
      setSegments(null);
      return;
    }

    const element = document.querySelector(`[data-tour-id="${targetId}"]`);
    if (!element) {
      console.warn(`⚠️ Elemento não encontrado: [data-tour-id="${targetId}"]`);
      setTargetRect(null);
      setSegments(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setTargetRect(rect);
    setSegments(createOverlaySegments(rect));

    // Scroll suave para o elemento
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  };

  // ============================================================================
  // useEffects
  // ============================================================================

  // Iniciar áudio quando momento muda
  useEffect(() => {
    if (!visible || moment === 'waiting') {
      console.log(`🦊 Momento: ${moment} - ${moment === 'waiting' ? 'Lexy sumiu' : 'Invisível'}`);
      return;
    }

    console.log(`🦊 Novo momento: ${moment}`);
    const audios = getMomentAudios();
    if (audios.length > 0) {
      playAudioSequence(audios);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment, visible, userAccuracy]);

  // Atualizar highlight quando momento muda
  useLayoutEffect(() => {
    if (!visible || moment === 'waiting') return;

    updateHighlight();

    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment, visible]);

  // Cleanup de áudio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (!visible) return null;

  // ⚠️ CRÍTICO: Se momento é 'waiting', NÃO renderiza nada (Lexy some)
  if (moment === 'waiting') {
    console.log('👻 Lexy está invisível (waiting)');
    return null;
  }

  return (
    <>
      {/* ======================================================================
          OVERLAY COM HIGHLIGHTS
      ====================================================================== */}
      <div className="fixed inset-0 z-[998] pointer-events-none">
        <div className="absolute inset-0">
          {segments ? (
            <>
              {/* Segmento superior */}
              <div
                className="absolute bg-slate-900/70 pointer-events-none"
                style={segments.top}
              />
              {/* Segmento inferior */}
              <div
                className="absolute bg-slate-900/70 pointer-events-none"
                style={segments.bottom}
              />
              {/* Segmento esquerdo */}
              <div
                className="absolute bg-slate-900/70 pointer-events-none"
                style={segments.left}
              />
              {/* Segmento direito */}
              <div
                className="absolute bg-slate-900/70 pointer-events-none"
                style={segments.right}
              />
              {/* Highlight (borda roxa pulsante) */}
              <div
                className="absolute border-2 border-purple-400 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] pointer-events-none transition-all duration-200 ease-out"
                style={segments.highlight}
              />
            </>
          ) : (
            // Sem highlight específico (momento 'intro')
            <div className="absolute inset-0 bg-slate-900/70 pointer-events-none" />
          )}
        </div>
      </div>

      {/* ======================================================================
          LEXY CENTRALIZADO COM SETA
      ====================================================================== */}
      <div
        className="fixed z-[999] pointer-events-none transition-all duration-300"
        style={{
          top: targetRect ? `${targetRect.top - 50}px` : '50%',
          left: targetRect ? `${targetRect.left + targetRect.width / 2}px` : '50%',
          transform: 'translate(-50%, -100%)'
        }}
      >
        {/* Animação Lottie */}
        <div className="relative">
          <div className="relative inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse" />
            <Lottie
              loop
              play={isPlaying}
              animationData={learninhoTalking}
              style={{ width: 150, height: 150 }}
            />

        </div>
      </div>

      {/* ======================================================================
          BOTÃO SKIP (canto superior direito)
      ====================================================================== */}
      <button
        onClick={handleSkipClick}
        className="fixed top-4 right-4 z-[999] pointer-events-auto bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-full shadow-lg transition-all border border-gray-200 hover:scale-110"
        aria-label="Pular tutorial"
        title="Pular tutorial"
      >
        <X size={20} />
      </button>

      {/* ======================================================================
          BOTÃO REPLAY (canto inferior direito)
      ====================================================================== */}
      {showReplayButton && !isPlaying && (
        <button
          onClick={handleReplay}
          className="fixed bottom-4 right-4 z-[999] pointer-events-auto flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300"
          aria-label={translateUI(language, 'categoryTrainer.lexyReplayAudio')}
        >
          <Volume2 size={20} />
          <span className="hidden sm:inline">
            {translateUI(language, 'categoryTrainer.lexyReplayAudio')}
          </span>
        </button>
      )}

      {/* ======================================================================
          MODAL DE CONFIRMAÇÃO DE SKIP (centralizado)
      ====================================================================== */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-purple-200 animate-in zoom-in-95 duration-200">
            {/* Título */}
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              {translateUI(language, 'categoryTrainer.lexySkipConfirm')}
            </h3>

            {/* Ilustração */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🦊</span>
              </div>
            </div>

            {/* Texto de apoio */}
            <p className="text-gray-600 text-center mb-6">
              O Lexy estava te ensinando a usar a plataforma...
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={cancelSkip}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
              >
                {translateUI(language, 'categoryTrainer.lexySkipNo')}
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all"
              >
                {translateUI(language, 'categoryTrainer.lexySkipYes')}
              </button>
            </div>
          </div>
        </div>
      )}



{/* ======================================================================
          MODAL DE LOGIN (momento final)
      ====================================================================== */}
      {moment === 'login' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-auto bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-4 border-purple-300 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">

            {/* Lexy animado no topo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-full p-4 border-4 border-purple-300 shadow-xl">
                  <Lottie
                    loop
                    play
                    animationData={learninhoTalking}
                    style={{ width: 100, height: 100 }}
                  />
                </div>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-3">
              🎉 {translateUI(language, 'categoryTrainer.lexyUnlockFeatures')}
            </h2>

            <p className="text-center text-gray-600 mb-6 text-base sm:text-lg">
              {translateUI(language, 'categoryTrainer.lexyLoginBenefit')}
            </p>

            {/* Lista de benefícios */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 mb-6 border-2 border-blue-200 shadow-inner">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <span className="text-2xl">✨</span>
                {translateUI(language, 'categoryTrainer.lexyAvailableResources')}
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-lg sm:text-xl flex-shrink-0">✅</span>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>{translateUI(language, 'categoryTrainer.lexyTrainingModes')}</strong>
                    <br />
                    <span className="text-xs sm:text-sm text-gray-600">
                      Categories, Speak, Translate, Numbers, Challenge, Video, Live Rooms
                    </span>
                  </p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-lg sm:text-xl flex-shrink-0">✅</span>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>{translateUI(language, 'categoryTrainer.lexyIPAAnalysis')}</strong>
                    <br />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {translateUI(language, 'categoryTrainer.lexyIPADescription')}
                    </span>
                  </p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-lg sm:text-xl flex-shrink-0">✅</span>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>{translateUI(language, 'categoryTrainer.lexyGamification')}</strong>
                    <br />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {translateUI(language, 'categoryTrainer.lexyGamificationDescription')}
                    </span>
                  </p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-lg sm:text-xl flex-shrink-0">✅</span>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>{translateUI(language, 'categoryTrainer.lexyLeaderboard')}</strong>
                  </p>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-green-600 font-bold text-lg sm:text-xl flex-shrink-0">✅</span>
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>{translateUI(language, 'categoryTrainer.lexyLiveRooms')}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Aviso importante */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6 shadow-sm">
              <p className="text-center text-gray-700 text-sm sm:text-base">
                <span className="font-bold text-yellow-700 text-base sm:text-lg">{translateUI(language, 'categoryTrainer.lexyImportant')}</span>
                <br />
                {translateUI(language, 'categoryTrainer.lexyNoSaveWarning')}
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  console.log('🔐 Usuário clicou em Login via Lexy Onboarding');

                  try {
                    const result = await dispatch(loginWithGoogle());

                    if (loginWithGoogle.fulfilled.match(result)) {
                      console.log('✅ Login realizado com sucesso!');
                      handleLexyFinish();
                    } else {
                      console.error('❌ Erro no login');
                      alert(translateUI(language, 'categoryTrainer.lexyLoginError'));
                    }
                  } catch (error) {
                    console.error('❌ Erro inesperado no login:', error);
                    alert(translateUI(language, 'categoryTrainer.lexyLoginError'));
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg"
              >
                <span className="text-xl sm:text-2xl"></span>
                {translateUI(language, 'categoryTrainer.lexyLoginWithGoogle')}
              </button>

              <button
                onClick={handleLexyFinish}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 sm:py-3 rounded-xl transition-all text-sm sm:text-base"
              >
                {translateUI(language, 'categoryTrainer.lexyContinueWithoutLogin')}
              </button>
            </div>

            {/* Texto extra */}
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
              {translateUI(language, 'categoryTrainer.lexyCanLoginLater')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};


export default LexySpeakingOnboarding;
