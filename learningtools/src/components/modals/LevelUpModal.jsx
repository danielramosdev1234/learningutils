import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Star, Sparkles, X, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useSelector } from 'react-redux';
import applausosSound from '../../assets/aplausos.wav';
import musicaVitoriaSound from '../../assets/musicadavitoria.mp3';
import { XP_CONFIG, calculateXPForNextLevel } from '../../store/slices/xpSlice';
import { notificationAPI } from '../../services/apiService';
import { loadNotificationSettings } from '../../services/notificationService';

/**
 * Modal de celebração quando passa de nível (XP System)
 */

export const LevelUpModal = ({ isOpen, onClose, newLevel, totalXP = 0 }) => {
  const { userId, mode } = useSelector(state => state.user);

  // Envia notificação push quando sobe de nível
  useEffect(() => {
    if (isOpen && newLevel && mode !== 'guest' && userId) {
      const sendLevelUpNotification = async () => {
        try {
          // Verifica se o usuário tem notificações de conquista habilitadas
          const settings = await loadNotificationSettings(userId);
          
          if (settings?.achievementReminders?.enabled && settings?.achievementReminders?.levelUp) {
            await notificationAPI.sendAchievement(userId, 'levelUp', {
              level: newLevel,
              xp: totalXP
            });
            console.log('✅ Notificação de level up enviada');
          }
        } catch (error) {
          console.error('Erro ao enviar notificação de level up:', error);
          // Não bloqueia a UI se falhar
        }
      };

      sendLevelUpNotification();
    }
  }, [isOpen, newLevel, userId, mode, totalXP]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false); // ✅ NOVO: Controla se já tentou tocar

  const applauseRef = useRef(null);
  const musicRef = useRef(null);

  // Função para iniciar os áudios (requer interação do usuário)
  const startAudio = () => {
    if (audioStarted) return; // Já tocou

    // 🎵 Toca aplausos
    if (applauseRef.current) {
      applauseRef.current.currentTime = 0;
      applauseRef.current.play()
        .then(() => console.log('🎵 Aplausos tocando!'))
        .catch(err => console.log('Erro ao tocar aplausos:', err.message));
    }

    // 🎶 Toca música da vitória (em loop)
    if (musicRef.current) {
      musicRef.current.currentTime = 0;
      musicRef.current.play()
        .then(() => {
          setIsPlayingMusic(true);
          console.log('🎶 Música tocando!');
        })
        .catch(err => console.log('Erro ao tocar música:', err.message));
    }

    setAudioStarted(true);
  };

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setAudioStarted(false); // Reset quando abre

      // Remove confetti após animação
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    } else {
      // Para a música quando fechar o modal
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        setIsPlayingMusic(false);
      }
    }
  }, [isOpen]);

  const toggleMusic = () => {
    if (!musicRef.current) return;

    if (isPlayingMusic) {
      musicRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      musicRef.current.currentTime = 0; // Reinicia do começo
      musicRef.current.play()
        .then(() => setIsPlayingMusic(true))
        .catch(err => console.log('Erro ao tocar música:', err));
    }
  };

  if (!isOpen) return null;

  // Frases motivacionais variadas
  const motivationalPhrases = [
    {
      main: "Grandes realizações são construídas por pequenos passos",
      sub: "E hoje você deu mais um passo para dominar a língua inglesa!"
    },
    {
      main: "Cada nível é uma vitória conquistada",
      sub: "Continue assim e logo estará falando inglês fluentemente!"
    },
    {
      main: "A persistência é o caminho do êxito",
      sub: "Você está provando isso a cada frase praticada!"
    },
    {
      main: "O sucesso é a soma de pequenos esforços repetidos",
      sub: "E você está acumulando vitórias todos os dias!"
    },
    {
      main: "Você está mais perto do seu objetivo do que ontem",
      sub: "Cada nível completado é um marco na sua jornada!"
    }
  ];

  // Seleciona frase aleatória (baseada no nível para consistência)
  const phrase = motivationalPhrases[(newLevel - 1) % motivationalPhrases.length];

  return (
    <>
      {/* Áudios - Usando imports */}
      <audio
        ref={applauseRef}
        src={applausosSound}
        preload="auto"
        onError={(e) => console.error('❌ Erro ao carregar aplausos:', e.target.error)}
      />

      <audio
        ref={musicRef}
        src={musicaVitoriaSound}
        loop
        preload="auto"
        onError={(e) => console.error('❌ Erro ao carregar música:', e.target.error)}
      />

      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto transform transition-all duration-500 animate-bounce-in relative cursor-pointer"
          onClick={(e) => {
            // Não propaga para o overlay
            e.stopPropagation();
            // Inicia áudio se ainda não começou
            if (!audioStarted) {
              startAudio();
            }
          }}
        >
          {/* Indicador visual para clicar (aparece apenas se áudio não iniciou) */}
          {!audioStarted && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                <span className="text-sm font-bold">👆 Clique para comemorar!</span>
              </div>
            </div>
          )}
          {/* Botão fechar */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // ✅ Impede que dispare o startAudio
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Botão de controle de música */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // ✅ Impede que dispare o startAudio duas vezes
              if (!audioStarted) {
                startAudio(); // Inicia pela primeira vez
              } else {
                toggleMusic(); // Alterna play/pause
              }
            }}
            className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg transition-all shadow-md z-10 ${
              isPlayingMusic
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            title={!audioStarted ? 'Tocar música' : isPlayingMusic ? 'Pausar música' : 'Tocar música'}
          >
            {isPlayingMusic ? (
              <>
                <VolumeX size={20} className="animate-pulse" />
                <span className="text-sm font-semibold">Pausar</span>
              </>
            ) : (
              <>
                <Volume2 size={20} />
                <span className="text-sm font-semibold">{!audioStarted ? '🎵 Tocar' : 'Tocar'}</span>
              </>
            )}
          </button>

          {/* Header com troféu animado */}
          <div className="text-center mb-6 mt-8">
            <div className="inline-block relative">
              {/* Círculo de fundo animado */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full animate-pulse scale-110" />

              {/* Troféu */}
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-full shadow-xl">
                <Trophy size={64} className="text-white animate-wiggle" />
              </div>

              {/* Estrelinhas ao redor */}
              <Star className="absolute -top-2 -right-2 text-yellow-400 animate-spin-slow" size={24} />
              <Star className="absolute -bottom-2 -left-2 text-yellow-400 animate-spin-slow" size={20} />
              <Sparkles className="absolute top-0 -left-4 text-orange-400 animate-pulse" size={20} />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text ">
            Parabéns! 🎉
          </h2>

          {/* Subtítulo do nível */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg mb-1">Você alcançou o</p>
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full shadow-lg">
              <span className="font-bold text-2xl">Level {newLevel}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-yellow-200 my-6" />

          {/* Frase motivacional */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <p className="text-gray-800 font-semibold text-lg text-center mb-3 leading-relaxed">
              "{phrase.main}"
            </p>
            <p className="text-gray-600 text-center text-sm leading-relaxed">
              {phrase.sub}
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 text-center">
              <p className="text-green-600 font-semibold text-sm mb-1">XP Total</p>
              <p className="text-green-700 font-bold text-3xl">{totalXP}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200 text-center">
              <p className="text-purple-600 font-semibold text-sm mb-1">Próximo Nível</p>
              <p className="text-purple-700 font-bold text-3xl">{calculateXPForNextLevel(totalXP)} XP</p>
            </div>
          </div>

          {/* Botão de continuar */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Continue Praticando</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#FCD34D', '#FB923C', '#F87171', '#A78BFA', '#60A5FA'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* CSS para animações */}
      <style >{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
          }
          50% {
            transform: scale(1.05) translateY(0);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </>
  );
};