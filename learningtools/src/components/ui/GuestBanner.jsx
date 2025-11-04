import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { loginWithGoogle } from '../../store/slices/userSlice';

const GuestBanner = ({ variant = 'minimal' }) => {
  const dispatch = useDispatch();
  const { mode, stats } = useSelector(state => state.user);

  // Não mostra para usuários autenticados
  if (mode !== 'guest') return null;

  const handleLogin = async () => {
    await dispatch(loginWithGoogle());
  };

  // Variante mínima (topo da página)
  if (variant === 'minimal') {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b-2 border-yellow-200 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
            <span className="text-gray-700">
              <span className="font-semibold">Modo Visitante</span> • Crie uma conta para salvar seu progresso
            </span>
          </div>
          <button
            onClick={handleLogin}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors shadow-sm flex-shrink-0"
          >
            Criar Conta
          </button>
        </div>
      </div>
    );
  }

  // Variante card (para usar em modais ou seções)
  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Sparkles className="text-purple-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Está gostando? Crie sua conta!
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <span>Salve seu progresso na nuvem</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <span>Apareça no leaderboard global</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
                <span>Sincronize entre dispositivos</span>
              </div>
              {stats.totalPhrases > 0 && (
                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                  <Sparkles className="text-purple-600 flex-shrink-0" size={18} />
                  <span>Migraremos suas {stats.totalPhrases} frases automaticamente!</span>
                </div>
              )}
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
            >
              Criar Conta com Google (grátis)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GuestBanner;