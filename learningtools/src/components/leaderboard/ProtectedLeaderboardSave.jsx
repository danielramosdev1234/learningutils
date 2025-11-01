import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trophy, Lock, Sparkles } from 'lucide-react';
import { loginWithGoogle } from '../../store/slices/userSlice';

/**
 * Componente que envolve o botão de salvar no leaderboard
 * Se guest: mostra modal pedindo login
 * Se autenticado: permite salvar normalmente
 */
const ProtectedLeaderboardSave = ({
  score,
  onSave,
  children,
  scoreLabel = "Score"
}) => {
  const dispatch = useDispatch();
  const { mode, profile } = useSelector(state => state.user);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = () => {
    if (mode === 'guest') {
      // Guest: mostra modal
      setShowAuthModal(true);
    } else {
      // Autenticado: salva normalmente
      onSave();
    }
  };

  const handleLogin = async () => {
    const result = await dispatch(loginWithGoogle());

    if (loginWithGoogle.fulfilled.match(result)) {
      setShowAuthModal(false);
      // Após login, salva automaticamente
      onSave();
    }
  };

  return (
    <>
      {/* Renderiza o botão original mas com onClick customizado */}
      {React.cloneElement(children, { onClick: handleClick })}

      {/* Modal de Autenticação para Guests */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white text-center">
              <div className="inline-block bg-white bg-opacity-20 rounded-full p-4 mb-3">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                Incrível! 🎉
              </h2>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-4">
                <p className="text-sm opacity-90 mb-1">Seu {scoreLabel}</p>
                <p className="text-4xl font-bold">{score}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <Lock className="text-amber-600 flex-shrink-0" size={24} />
                <p className="text-gray-700">
                  <span className="font-bold">Crie uma conta</span> para salvar seu recorde no leaderboard!
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="text-purple-600" size={18} />
                  </div>
                  <span>Apareça no ranking global</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-blue-600" size={18} />
                  </div>
                  <span>Desafie outros jogadores</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="text-green-600" size={18} />
                  </div>
                  <span>Acompanhe sua evolução</span>
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg mb-3"
              >
                🏆 Criar Conta e Salvar Recorde
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 transition-colors"
              >
                Voltar
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Login com Google • Rápido e seguro
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedLeaderboardSave;