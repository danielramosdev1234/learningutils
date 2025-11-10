import React, { useState } from 'react';
import { Trophy, Lock, CheckCircle, Target, TrendingUp, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import LevelRankingModal from '../modals/LevelRankingModal';

/**
 * Componente que mostra o progresso do nível atual usando XP System
 * Variantes: 'full' (ChunkTrainer) | 'compact' (Navbar)
 */
export const LevelIndicator = ({ variant = 'full' }) => {
  const { userId } = useSelector(state => state.user);
  const { totalXP, currentLevel, xpProgress, xpToday, xpBreakdown } = useSelector(state => state.xp);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showXPBreakdown, setShowXPBreakdown] = useState(false);

  if (!totalXP && totalXP !== 0) return null;

  const progressPercent = xpProgress.percentage;
  const remaining = xpProgress.needed - xpProgress.current;
  const isLevelComplete = xpProgress.current >= xpProgress.needed;

  // Calcula frases completadas baseado no XP (cada frase = 10 XP)
  const phrasesCompleted = Math.floor(xpBreakdown.phrases / 10);

  // Compact variant (para Navbar) - CLICÁVEL
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowRankingModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-500 transition-all transform hover:scale-105 active:scale-95"
        >
          <Trophy size={16} className="text-white" />
          <span className="font-bold text-white text-sm">
            Lvl {currentLevel}
          </span>
          {isLevelComplete && (
            <CheckCircle size={14} className="text-white animate-pulse" />
          )}
        </button>

        <LevelRankingModal
          isOpen={showRankingModal}
          onClose={() => setShowRankingModal(false)}
          currentUserId={userId}
        />
      </>
    );
  }

  // Full variant
  return (
    <>
      <div
        onClick={() => setShowRankingModal(true)}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 mb-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">

            <div>

                     <div   className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-500 transition-all ">

              <Trophy size={30} className="text-white" />
                        <span className="text-2xl font-bold  text-white ">
                          Lvl {currentLevel}
                        </span>
                        </div>
            </div>
          </div>


          <div className="flex items-center gap-2">
            {xpToday > 0 && (
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-600" />
                  <div>
                    <p className="text-xs text-green-700 font-semibold">Today</p>
                    <p className="text-sm font-bold text-green-600">+{xpToday} XP</p>
                  </div>
                </div>
              </div>
            )}

            {isLevelComplete && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle size={20} />
                <span>Ready!</span>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRankingModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
            >
              <TrendingUp size={18} />
              <span className="hidden sm:inline">View Ranking</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>Progress to Level {currentLevel + 1}</span>
            <span>{xpProgress.current} / {xpProgress.needed} XP</span>
          </div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              {progressPercent > 10 && (
                <span className="text-white text-xs font-bold">
                  {Math.round(progressPercent)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-yellow-600 fill-yellow-600" />
              <span className="text-xs text-gray-600 font-semibold">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{totalXP.toLocaleString()}</p>
          </div>

          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-orange-600" />
              <span className="text-xs text-gray-600 font-semibold">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{Math.max(remaining, 0)} XP</p>
            <p className="text-xs text-gray-500 mt-1">
              ~{Math.ceil(remaining / 10)} phrases
            </p>
          </div>

          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-xs text-gray-600 font-semibold">Phrases</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{phrasesCompleted}</p>
            <p className="text-xs text-gray-500 mt-1">
              {xpBreakdown.phrases} XP
            </p>
          </div>
        </div>

        {/* XP Breakdown */}
        {/* Hint to click */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <TrendingUp size={12} />
            Click to view global ranking
          </p>
        </div>
      </div>

      {/* 'Como Ganhar XP' SEPARADO */}
      <div className="max-w-3xl mx-auto">
        <div className="mt-2 mb-6 bg-white bg-opacity-70 rounded-lg border border-yellow-200 overflow-hidden">
          <button
            onClick={() => setShowXPBreakdown(!showXPBreakdown)}
            className="w-full p-4 flex items-center justify-between hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-600 fill-yellow-600" />
              <p className="text-base text-gray-700 font-bold">Como Ganhar XP</p>
            </div>
            {showXPBreakdown ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>

          {showXPBreakdown && (
            <div className="px-4 pb-4 space-y-4 text-sm">

                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-yellow-800">🔥 Streak Bonus</span>
                                  <span className="text-yellow-600 text-base font-bold">+2 XP</span>
                                </div>
                                <p className="text-yellow-700">A cada exercício ganha +2 XP bônus por manter streak de 7+ dias</p>
                              </div>
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-800">💬 Phrases (Falar Frases)</span>
                  <span className="text-blue-600 text-base font-bold">5 XP</span>
                </div>
                <p className="text-blue-700">Acertar uma frase com 80%+ de precisão</p>
                <p className="text-blue-600 mt-1">+2 XP extra se acertar 90%+ | +5 XP se acertar 100%</p>
                {xpBreakdown.phrases > 0 && (
                  <p className="text-blue-500 mt-1">Total ganho: {xpBreakdown.phrases} XP</p>
                )}
              </div>

              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-green-800">📚 Categories (Categorias)</span>
                  <span className="text-blue-600 text-base font-bold">5 XP</span>
                                  </div>
                                  <p className="text-blue-700">Acertar uma frase com 80%+ de precisão</p>
                                  <p className="text-blue-600 mt-1">+2 XP extra se acertar 90%+ | +5 XP se acertar 100%</p>
                {xpBreakdown.categories > 0 && (
                  <p className="text-green-500 mt-1">Total ganho: {xpBreakdown.categories} XP</p>
                )}
              </div>

              <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-purple-800">🔄 Translate (Tradução)</span>
                  <span className="text-blue-600 text-base font-bold">5 XP</span>
                                  </div>
                                  <p className="text-blue-700">Acertar uma frase com 80%+ de precisão</p>
                                  <p className="text-blue-600 mt-1">+2 XP extra se acertar 90%+ | +5 XP se acertar 100%</p>
                {xpBreakdown.translate > 0 && (
                  <p className="text-purple-500 mt-1">Total ganho: {xpBreakdown.translate} XP</p>
                )}
              </div>

              <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-orange-800">🔢 Numbers (Números)</span>
                  <span className="text-orange-600 text-base font-bold">5 XP</span>
                </div>
                <p className="text-orange-700">Cada numero correto.</p>
                {xpBreakdown.numbers > 0 && (
                  <p className="text-orange-500 mt-1">Total ganho: {xpBreakdown.numbers} XP</p>
                )}
              </div>

              <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-red-800">🎯 Challenge (Desafio)</span>
                  <span className="text-red-600 text-base font-bold">5 XP</span>
                </div>
                <p className="text-red-700">Cada frase correta.</p>
                {xpBreakdown.challenge > 0 && (
                  <p className="text-red-500 mt-1">Total ganho: {xpBreakdown.challenge} XP</p>
                )}
              </div>

              <div className="bg-indigo-50 p-3 rounded border-l-4 border-indigo-400">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-indigo-800">🎥 Video (Vídeo)</span>
                  <span className="text-indigo-600 text-base font-bold">5-10 XP</span>
                </div>
                <p className="text-indigo-700">Cada questão correta. Phrases: 5 XP | Scenes: 10 XP</p>
                {xpBreakdown.video > 0 && (
                  <p className="text-indigo-500 mt-1">Total ganho: {xpBreakdown.video} XP</p>
                )}
              </div>



              <div className="mt-3 pt-2 border-t border-yellow-300">
                <p className="text-[13px] text-gray-700 text-center">
                  💡 <span className="font-semibold">Dica:</span> Cada nível requer 100 XP. Continue praticando para subir de nível!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <LevelRankingModal
        isOpen={showRankingModal}
        onClose={() => setShowRankingModal(false)}
        currentUserId={userId}
      />
    </>
  );
};