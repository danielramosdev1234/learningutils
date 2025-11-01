import React from 'react';
import { X, Snowflake, AlertTriangle, Flame } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useFreeze } from '../../store/slices/userSlice';

export default function FreezeModal({ isOpen, onClose, missedDate }) {
  const dispatch = useDispatch();
  const { freezes, current } = useSelector((state) => state.user.stats.streak);

  if (!isOpen) return null;

  const handleUseFreeze = () => {
    dispatch(useFreeze({ missedDate }));
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Warning */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <AlertTriangle className="w-32 h-32" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Streak em Risco!</h2>
                <p className="text-sm opacity-90">Você perdeu 1 dia</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-90 mb-1">Seu streak atual</div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Flame className="w-6 h-6" fill="currentColor" />
                    {current} dias
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-90 mb-1">Freezes disponíveis</div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Snowflake className="w-6 h-6" />
                    {freezes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {freezes > 0 ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <Snowflake className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Use um Freeze?
                </h3>
                <p className="text-gray-600">
                  Você pode usar 1 freeze para manter seu streak de <strong>{current} dias</strong> intacto!
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleUseFreeze}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
                >
                  <Snowflake className="w-6 h-6" />
                  Usar 1 Freeze ({freezes - 1} restantes)
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Não usar (perder streak)
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                    <Snowflake className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong className="text-blue-600">Como ganhar mais freezes?</strong>
                    <p className="mt-1">A cada 7 dias consecutivos de prática, você ganha 1 freeze! 🎁</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <Flame className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Sem Freezes Disponíveis
                </h3>
                <p className="text-gray-600">
                  Infelizmente você não tem freezes para usar. Seu streak de <strong>{current} dias</strong> será reiniciado.
                </p>
              </div>

              <button
                onClick={handleSkip}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
              >
                Entendi, começar novo streak
              </button>

              <div className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong className="text-purple-600">Não desista!</strong>
                    <p className="mt-1">Todo grande streak começa com o dia 1. Você consegue! 💪</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}