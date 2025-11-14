import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Target, TrendingUp, Zap, ChevronDown, ChevronUp, Crown } from 'lucide-react';
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
  const [userRankingPosition, setUserRankingPosition] = useState(null);

  if (!totalXP && totalXP !== 0) return null;

  const progressPercent = xpProgress.percentage;
  const remaining = xpProgress.needed - xpProgress.current;
  const isLevelComplete = xpProgress.current >= xpProgress.needed;

  // Calcula frases completadas baseado no XP (cada frase = 10 XP)
  const phrasesCompleted = Math.floor(xpBreakdown.phrases / 10);

  const handleOpenRanking = () => {
    setShowRankingModal(true);
  };

  const handleCloseRanking = () => {
    setShowRankingModal(false);
  };

  const handleToggleXPBreakdown = () => {
    setShowXPBreakdown(prev => !prev);
  };

  const handleRankingClick = (e) => {
    e?.stopPropagation();
    handleOpenRanking();
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Busca posição do usuário no ranking
  useEffect(() => {
    const fetchUserRanking = async () => {
      if (!userId || variant === 'compact') return;
      
      try {
        const { loadLevelRanking } = await import('../../services/levelRankingService');
        const ranking = await loadLevelRanking(100);
        const userIndex = ranking.findIndex(u => u.userId === userId);
        if (userIndex !== -1) {
          setUserRankingPosition(userIndex + 1);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar posição no ranking:', error);
      }
    };

    fetchUserRanking();
  }, [userId, variant]);

  // Determina qual moldura usar baseado na posição
  const getMedalFrameClass = () => {
    if (!userRankingPosition) return null;
    
    if (userRankingPosition === 1) {
      // Gold Medal Frame - Efeito metálico dourado brilhante
      return 'absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 p-[4px] shadow-[0_0_25px_rgba(234,179,8,0.9),inset_0_2px_12px_rgba(255,255,255,0.6),inset_0_-2px_12px_rgba(217,119,6,0.6),0_3px_15px_rgba(234,179,8,0.6)]';
    } else if (userRankingPosition === 2) {
      // Silver Medal Frame - Efeito metálico prateado
      return 'absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 p-[3px] shadow-[0_0_20px_rgba(148,163,184,0.7),inset_0_2px_8px_rgba(255,255,255,0.5),inset_0_-2px_8px_rgba(100,116,139,0.5)]';
    } else if (userRankingPosition === 3) {
      // Bronze Medal Frame - Efeito metálico bronze
      return 'absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 p-[3px] shadow-[0_0_20px_rgba(217,119,6,0.7),inset_0_2px_8px_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(180,83,9,0.5)]';
    } else if (userRankingPosition <= 10) {
      // Top 10 Medal Frame - Efeito metálico roxo/rosa
      return 'absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-[0_0_20px_rgba(139,92,246,0.6),inset_0_2px_8px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(109,40,217,0.4)]';
    }
    return null;
  };

  const medalFrameClass = getMedalFrameClass();

  // Compact variant (para Navbar) - CLICÁVEL
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleOpenRanking}
          onKeyDown={(e) => handleKeyDown(e, handleOpenRanking)}
          tabIndex={0}
          aria-label={`Level ${currentLevel}. Click to view ranking`}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-500 transition-all transform hover:scale-105 active:scale-95"
        >
          <Trophy size={16} className="text-white" aria-hidden="true" />
          <span className="font-bold text-white text-sm">
            Lvl {currentLevel}
          </span>
          {isLevelComplete && (
            <CheckCircle size={14} className="text-white animate-pulse" aria-hidden="true" />
          )}
        </button>

        <LevelRankingModal
          isOpen={showRankingModal}
          onClose={handleCloseRanking}
          currentUserId={userId}
        />
      </>
    );
  }

  // Full variant
  const getProgressBarWidth = (percent) => {
    const clamped = Math.min(Math.max(percent, 0), 100);
    // Usa classes Tailwind para valores comuns, fallback para valor dinâmico
    if (clamped >= 100) return 'w-full';
    if (clamped >= 90) return 'w-[90%]';
    if (clamped >= 80) return 'w-[80%]';
    if (clamped >= 70) return 'w-[70%]';
    if (clamped >= 60) return 'w-[60%]';
    if (clamped >= 50) return 'w-[50%]';
    if (clamped >= 40) return 'w-[40%]';
    if (clamped >= 30) return 'w-[30%]';
    if (clamped >= 20) return 'w-[20%]';
    if (clamped >= 10) return 'w-[10%]';
    return 'w-0';
  };

  const progressBarWidthClass = getProgressBarWidth(progressPercent);

  return (
    <>
      {/* Main Level Card - Compact Futuristic Design */}
      <div className="relative group mb-4 sm:mb-6">
        {/* Glow sutil no hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
        
        {/* Card */}
        <div
          onClick={handleOpenRanking}
          onKeyDown={(e) => handleKeyDown(e, handleOpenRanking)}
          tabIndex={0}
          role="button"
          aria-label={`Level ${currentLevel} progress. Click to view global ranking`}
          className="relative bg-white rounded-2xl p-5 border border-gray-200 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
        >
          {/* Top: Level + Rank + Today XP em uma linha */}
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* Left: Level com Rank */}
            <div className="flex items-center gap-2">
              {/* Level Badge Compacto */}
              <div className="relative">
                {/* Badge de Nível - Compacto Futurístico */}
                <div className="relative flex items-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-yellow-300/40 shadow-md z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500">
                    <Trophy size={16} className="sm:w-5 sm:h-5 text-white" aria-hidden="true" />
                  </div>


                                    <div className="relative">
                                     {/* Label Ranking */}
                                                                         <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Ranking</p>

                                      {/* Glow Effect baseado na posição */}
                                      <div className={`absolute -inset-0.5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                        userRankingPosition === 1
                                          ? 'bg-gradient-to-r from-yellow-400/40 to-amber-500/40'
                                          : userRankingPosition === 2
                                          ? 'bg-gradient-to-r from-slate-400/40 to-slate-500/40'
                                          : userRankingPosition === 3
                                          ? 'bg-gradient-to-r from-amber-600/40 to-orange-600/40'
                                          : 'bg-gradient-to-r from-indigo-500/40 to-purple-500/40'
                                      }`} />

                                      <div className={`relative flex items-center gap-1.5 rounded-lg  py-1.5 sm:px-3 sm:py-2 `}>
                                        {userRankingPosition <= 3 && (
                                          <Crown size={12} className={`sm:w-4 sm:h-4 ${
                                            userRankingPosition === 1
                                              ? 'text-yellow-600'
                                              : userRankingPosition === 2
                                              ? 'text-slate-600'
                                              : 'text-orange-600'
                                          }`} aria-hidden="true" />
                                        )}
                                        <span className="text-gray-900 text-sm sm:text-base font-bold">#{userRankingPosition}</span>
                                      </div>
                                    </div>
                </div>
              </div>

              {/* Rank Badge Mini - Com Moldura de Medalha e Glow Effect */}
              {userRankingPosition && userRankingPosition <= 10 && (
                <div className="relative flex flex-col">

                </div>
              )}
            </div>

            {/* Right: Today XP Compacto */}
            {xpToday > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 border border-emerald-300/40 shadow-md" role="status" aria-label={`Today's XP: ${xpToday}`}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="sm:w-5 sm:h-5 text-emerald-600" aria-hidden="true" />
                  <div className="leading-none">
                    <p className="text-[9px] sm:text-xs text-emerald-700/80 font-semibold uppercase tracking-wide">Today</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">+{xpToday.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Section Compacta */}
          <div className="space-y-2">
            {/* Info linha única */}
            <div className="flex items-center justify-between">
              <span className="text-xl  text-gray-600 font-medium">Level {currentLevel + 1}</span>
              <span className="text-xl  sm:text-base font-bold text-gray-900">
                {xpProgress.current} <span className="text-gray-400 text-xl  sm:text-sm">/ {xpProgress.needed}</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress to level ${currentLevel + 1}: ${Math.round(progressPercent)}%`}>
              <div 
                className="h-full bg-purple-500 relative transition-all duration-700 ease-out rounded-full"
                style={{
                  width: `${Math.max(progressPercent, 3)}%`,
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Stats inline */}
            <div className="flex justify-between text-[14px]  text-gray-500">
              <span className="font-semibold text-purple-600">{Math.round(progressPercent)}% complete</span>
              <span>{remaining} XP left</span>
            </div>

            {/* Ready Badge - Compacto */}
            {isLevelComplete && (
              <div className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg text-xs font-bold shadow-lg animate-pulse" role="status" aria-label="Level complete, ready to level up">
                <CheckCircle size={14} aria-hidden="true" />
                <span>Ready to Level Up!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XP Breakdown Section */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-4 sm:mb-6">
          <button
            onClick={handleToggleXPBreakdown}
            onKeyDown={(e) => handleKeyDown(e, handleToggleXPBreakdown)}
            tabIndex={0}
            aria-expanded={showXPBreakdown}
            aria-controls="xp-breakdown-content"
            aria-label={showXPBreakdown ? 'Hide XP breakdown' : 'Show XP breakdown'}
            className="w-full p-3 sm:p-5 flex items-center justify-between hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 transition-all duration-200"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                <Zap size={16} className="sm:w-5 sm:h-5 text-white fill-white" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-lg font-bold text-gray-800">Como Ganhar XP</p>
            </div>
            <div className={`transform transition-transform duration-200 ${showXPBreakdown ? 'rotate-180' : ''}`}>
              {showXPBreakdown ? (
                <ChevronUp size={20} className="sm:w-6 sm:h-6 text-gray-600" aria-hidden="true" />
              ) : (
                <ChevronDown size={20} className="sm:w-6 sm:h-6 text-gray-600" aria-hidden="true" />
              )}
            </div>
          </button>

          {showXPBreakdown && (
            <div id="xp-breakdown-content" className="px-3 sm:px-5 pb-4 sm:pb-6 space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-300" role="region" aria-label="XP breakdown details">
              {/* Streak Bonus */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-amber-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">🔥</span>
                    <span className="font-bold text-amber-800 text-xs sm:text-sm truncate">Streak Bonus</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">+2 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-700">A cada exercício ganha +2 XP bônus por manter streak de 7+ dias</p>
              </div>
              {/* Phrases */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">💬</span>
                    <span className="font-bold text-blue-800 text-xs sm:text-sm truncate">Phrases</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">5 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mb-0.5 sm:mb-1">Acertar uma frase com 80%+ de precisão</p>
                <p className="text-[10px] sm:text-xs text-blue-600">+2 XP extra se acertar 90%+ | +5 XP se acertar 100%</p>
                {xpBreakdown.phrases > 0 && (
                  <p className="text-[10px] sm:text-xs text-blue-500 mt-1.5 sm:mt-2 font-semibold">✓ Total ganho: {xpBreakdown.phrases.toLocaleString()} XP</p>
                )}
              </div>

              {/* Categories */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">📚</span>
                    <span className="font-bold text-emerald-800 text-xs sm:text-sm truncate">Categories</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">5 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-700 mb-0.5 sm:mb-1">Acertar uma frase com 80%+ de precisão</p>
                <p className="text-[10px] sm:text-xs text-emerald-600">+2 XP extra se acertar 90%+ | +5 XP se acertar 100%</p>
                {xpBreakdown.categories > 0 && (
                  <p className="text-[10px] sm:text-xs text-emerald-500 mt-1.5 sm:mt-2 font-semibold">✓ Total ganho: {xpBreakdown.categories.toLocaleString()} XP</p>
                )}
              </div>

              {/* Translate */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-violet-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">🔄</span>
                    <span className="font-bold text-violet-800 text-xs sm:text-sm truncate">Translate</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-violet-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">5 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-violet-700 mb-0.5 sm:mb-1">Acertar uma frase com 80%+ de precisão</p>
                <p className="text-[10px] sm:text-xs text-violet-600">+2 XP extra se acertar 90%+ | +5 XP se acertar 100%</p>
                {xpBreakdown.translate > 0 && (
                  <p className="text-[10px] sm:text-xs text-violet-500 mt-1.5 sm:mt-2 font-semibold">✓ Total ganho: {xpBreakdown.translate.toLocaleString()} XP</p>
                )}
              </div>

              {/* Numbers */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">🔢</span>
                    <span className="font-bold text-orange-800 text-xs sm:text-sm truncate">Numbers</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">5 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-orange-700">Cada número correto</p>
                {xpBreakdown.numbers > 0 && (
                  <p className="text-[10px] sm:text-xs text-orange-500 mt-1.5 sm:mt-2 font-semibold">✓ Total ganho: {xpBreakdown.numbers.toLocaleString()} XP</p>
                )}
              </div>

              {/* Challenge */}
              <div className="bg-gradient-to-r from-rose-50 to-red-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-rose-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">🎯</span>
                    <span className="font-bold text-rose-800 text-xs sm:text-sm truncate">Challenge</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-rose-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">5 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-700">Cada frase correta</p>
                {xpBreakdown.challenge > 0 && (
                  <p className="text-[10px] sm:text-xs text-rose-500 mt-1.5 sm:mt-2 font-semibold">✓ Total ganho: {xpBreakdown.challenge.toLocaleString()} XP</p>
                )}
              </div>

              {/* Video */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="text-base sm:text-xl flex-shrink-0">🎥</span>
                    <span className="font-bold text-indigo-800 text-xs sm:text-sm truncate">Video</span>
                  </div>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm flex-shrink-0">5-10 XP</span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-700">Cada questão correta. Phrases: 5 XP | Scenes: 10 XP</p>
                {xpBreakdown.video > 0 && (
                  <p className="text-[10px] sm:text-xs text-indigo-500 mt-1.5 sm:mt-2 font-semibold">✓ Total ganho: {xpBreakdown.video.toLocaleString()} XP</p>
                )}
              </div>

              {/* Tip */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-gray-700 text-center">
                  <span className="text-base sm:text-lg mr-1 sm:mr-2">💡</span>
                  <span className="font-semibold">Dica:</span> Cada nível requer 100+(lvl×5) XP. Continue praticando!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <LevelRankingModal
        isOpen={showRankingModal}
        onClose={handleCloseRanking}
        currentUserId={userId}
      />
    </>
  );
};