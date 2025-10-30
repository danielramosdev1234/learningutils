import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Trophy, TrendingUp, Shield, Zap } from 'lucide-react';
import { loginWithGoogle, markIncentiveAsSeen } from '../store/slices/userSlice';

const IncentiveModal = () => {
  const dispatch = useDispatch();
  const { mode, stats, incentives } = useSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Só mostra para guests
    if (mode !== 'guest') return;

    // Não mostra se já viu recentemente (últimas 24h)
    if (incentives.hasSeenPrompt) {
      const hoursSinceLastPrompt = (Date.now() - incentives.lastPromptAt) / (1000 * 60 * 60);
      if (hoursSinceLastPrompt < 24) return;
    }

    // Mostra quando contador chega a zero (após 5 frases)
    if (incentives.phrasesUntilPrompt <= 0) {
      setIsOpen(true);
    }
  }, [mode, incentives, stats.totalPhrases]);

  const handleLogin = async () => {
    const result = await dispatch(loginWithGoogle());

    if (loginWithGoogle.fulfilled.match(result)) {
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    dispatch(markIncentiveAsSeen());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center">
            <div className="inline-block bg-white bg-opacity-20 rounded-full p-4 mb-3">
              <Trophy size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Parabéns! 🎉
            </h2>
            <p className="text-lg opacity-90">
              Você completou {stats.totalPhrases} frases!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-6 text-lg">
            Está curtindo o LearnFun? <span className="font-bold">Crie sua conta</span> e desbloqueie:
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Shield className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Progresso Salvo</h3>
                <p className="text-sm text-gray-600">Nunca perca suas conquistas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full">
                <Trophy className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Leaderboard Global</h3>
                <p className="text-sm text-gray-600">Apareça no ranking oficial</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Estatísticas Detalhadas</h3>
                <p className="text-sm text-gray-600">Acompanhe sua evolução</p>
              </div>
            </div>

            {stats.totalPhrases > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border-2 border-amber-300">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Zap className="text-amber-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Migração Automática</h3>
                  <p className="text-sm text-gray-600">
                    Suas <span className="font-bold">{stats.totalPhrases} frases</span> serão migradas!
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg mb-3"
          >
            🚀 Criar Conta Grátis com Google
          </button>

          <button
            onClick={handleClose}
            className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 transition-colors"
          >
            Continuar como visitante
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Leva apenas 30 segundos • 100% gratuito
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default IncentiveModal;