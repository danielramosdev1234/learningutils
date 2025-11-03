import React, { useState } from 'react';
import { Trophy, Lock, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import LevelRankingModal from '../modals/LevelRankingModal';

/**
 * Componente que mostra o progresso do nível atual (CUMULATIVO)
 * Variantes: 'full' (ChunkTrainer) | 'compact' (Navbar)
 */
export const LevelIndicator = ({ variant = 'full' }) => {
  const { levelSystem, userId } = useSelector(state => state.user);
  const [showRankingModal, setShowRankingModal] = useState(false);

  if (!levelSystem) return null;

  const { currentLevel, globalCompletedIndices = [] } = levelSystem;

  const totalNeededForLevel = currentLevel * 10;
  const totalCompleted = globalCompletedIndices.length;
  const progressPercent = (totalCompleted / totalNeededForLevel) * 100;
  const remaining = totalNeededForLevel - totalCompleted;
  const isLevelComplete = totalCompleted >= totalNeededForLevel;

  // Calcula quais frases ainda faltam
  const allIndices = Array.from({ length: totalNeededForLevel }, (_, i) => i);
  const remainingIndices = allIndices
    .filter(idx => !globalCompletedIndices.includes(idx))
    .map(idx => idx + 1)
    .sort((a, b) => a - b);

  const displayIndices = remainingIndices;

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
                Complete {totalNeededForLevel} phrases total to advance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <span>Progress</span>
            <span>{totalCompleted} / {totalNeededForLevel} phrases</span>
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
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-xs text-gray-600 font-semibold">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
          </div>

          <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-orange-600" />
              <span className="text-xs text-gray-600 font-semibold">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{Math.max(remaining, 0)}</p>

            {displayIndices.length > 0 && displayIndices.length <= 10 && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                ({displayIndices.join(', ')})
              </p>
            )}

            {displayIndices.length > 10 && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                ({displayIndices.slice(0, 10).join(', ')}, ...)
              </p>
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
              Continue practicing to unlock Level {currentLevel + 1} ({(currentLevel + 1) * 10} phrases total)
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