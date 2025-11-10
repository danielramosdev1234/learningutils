import React, { useState } from 'react';
import { Trophy, Lock, CheckCircle, Target, TrendingUp, Zap } from 'lucide-react';
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

  // Full variant (para ChunkTrainer) - CLICÁVEL
  return (
    <>
      <div
        onClick={() => setShowRankingModal(true)}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-yellow-300 mb-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-md">
              <Trophy size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Level {currentLevel}
              </h3>
              <p className="text-sm text-gray-600">
                {totalXP.toLocaleString()} XP Total • Earn {xpProgress.needed} XP to advance
              </p>
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
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-gray-600 font-semibold mb-2">XP Breakdown</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {xpBreakdown.categories > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold">Categories:</span> {xpBreakdown.categories}
              </div>
            )}
            {xpBreakdown.translate > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold">Translate:</span> {xpBreakdown.translate}
              </div>
            )}
            {xpBreakdown.numbers > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold">Numbers:</span> {xpBreakdown.numbers}
              </div>
            )}
            {xpBreakdown.challenge > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold">Challenge:</span> {xpBreakdown.challenge}
              </div>
            )}
            {xpBreakdown.video > 0 && (
              <div className="text-gray-600">
                <span className="font-semibold">Video:</span> {xpBreakdown.video}
              </div>
            )}
          </div>
        </div>

        {/* Next Level Preview */}
        {isLevelComplete && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
            <div className="flex items-center gap-2 text-purple-700 font-semibold mb-1">
              <Trophy size={16} />
              <span className="text-sm">Level {currentLevel} Complete! 🎉</span>
            </div>
            <p className="text-xs text-purple-600">
              Continue practicing to unlock Level {currentLevel + 1} (need {(currentLevel + 1) * 100} total XP)
            </p>
          </div>
        )}

        {/* Hint to click */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <TrendingUp size={12} />
            Click to view global ranking
          </p>
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