import React, { useEffect, useState } from 'react';
import { Gift, Snowflake, Sparkles, Trophy } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeRewardModal } from '../../store/slices/userSlice';

export default function RewardModal() {
  const dispatch = useDispatch();
  const { showRewardModal, pendingReward, freezes } = useSelector(
    (state) => state.user.stats.streak
  );
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showRewardModal) {
      setShowConfetti(true);
      // Remove confetti após animação
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [showRewardModal]);

  if (!showRewardModal) return null;

  const handleClose = () => {
    dispatch(closeRewardModal());
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles
                className={`w-4 h-4 ${
                  ['text-yellow-400', 'text-blue-400', 'text-pink-400', 'text-purple-400'][Math.floor(Math.random() * 4)]
                }`}
                fill="currentColor"
              />
            </div>
          ))}
        </div>
      )}

      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Celebration */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 animate-spin-slow">
              <Gift className="w-24 h-24" />
            </div>
            <div className="absolute bottom-4 left-4 animate-bounce">
              <Sparkles className="w-16 h-16" />
            </div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-4 animate-pulse">
              <Gift className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-bold mb-2">🎉 Parabéns!</h2>
            <p className="text-lg opacity-95">
              Você completou <strong>{pendingReward} dias</strong> de ofensiva!
            </p>
          </div>
        </div>

        {/* Body - Reward */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl mb-4 animate-bounce shadow-2xl">
              <Snowflake className="w-16 h-16 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Você ganhou 1 Freeze! ❄️
            </h3>
            <p className="text-gray-600 text-lg">
              Agora você tem <strong className="text-blue-600">{freezes} freeze{freezes > 1 ? 's' : ''}</strong> disponível{freezes > 1 ? 'is' : ''}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-xl flex-shrink-0">
                <Snowflake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">O que é um Freeze?</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Um freeze permite que você pule 1 dia sem perder seu streak!
                  Use sabiamente quando precisar dar aquela pausa. 😊
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
          >
            Incrível! Continuar praticando
          </button>

          {/* Next Milestone */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>
              Próxima recompensa em <strong className="text-purple-600">{pendingReward + 7} dias</strong>
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
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

        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
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

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}