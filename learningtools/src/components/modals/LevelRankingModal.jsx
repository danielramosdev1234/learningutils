import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, Loader, Sparkles, Flame, Star, Zap } from 'lucide-react';

/**
 * Modal de Ranking de Níveis - Estilo Podium
 * Mostra Top 3 em pódio + Top 20 em lista
 */
export default function LevelRankingModal({ isOpen, onClose, currentUserId }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadRanking();
    }
  }, [isOpen, currentUserId]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      // ✅ BUSCA REAL DO FIREBASE
      const { loadLevelRanking } = await import('../../services/levelRankingService');
      const fullRanking = await loadLevelRanking(50);

      console.log('🔥 Ranking carregado:', fullRanking.length, 'usuários');

      // Top 20
      const top20 = fullRanking.slice(0, 20);
      setRanking(top20);

      // Busca posição do usuário atual
      const userIndex = fullRanking.findIndex(u => u.userId === currentUserId);
      if (userIndex !== -1) {
        setUserPosition(userIndex + 1);
        setCurrentUserData(fullRanking[userIndex]);
        console.log('📍 Sua posição:', userIndex + 1);
      } else {
        console.log('⚠️ Usuário não encontrado no ranking');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);

      // ⚠️ FALLBACK: Mock data caso Firebase falhe
      console.log('⚠️ Usando dados mock como fallback');
      const mockData = Array.from({ length: 25 }, (_, i) => {
        const totalXP = Math.max(100, 1000 - i * 40);
        const currentLevel = Math.floor(totalXP / 100) + 1;
        return {
          userId: `user_${i + 1}`,
          displayName: `Player ${i + 1}`,
          photoURL: null,
          currentLevel: currentLevel,
          totalXP: totalXP,
          totalCompleted: Math.max(10, 100 - i * 3),
          progressPercent: Math.floor(Math.random() * 100),
          streak: Math.floor(Math.random() * 30)
        };
      });

      const sorted = mockData.sort((a, b) => {
        if (b.currentLevel !== a.currentLevel) return b.currentLevel - a.currentLevel;
        if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
        return b.progressPercent - a.progressPercent;
      });

      setRanking(sorted.slice(0, 20));

      const userIndex = sorted.findIndex(u => u.userId === currentUserId);
      if (userIndex !== -1) {
        setUserPosition(userIndex + 1);
        setCurrentUserData(sorted[userIndex]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const top3 = ranking.slice(0, 3);
  const restOfRanking = ranking.slice(3);

  // Helper para obter avatar/emoji do usuário
  const getUserAvatar = (user) => {
    if (user.photoURL) return null; // Retorna null para usar img
    // Gera emoji baseado no nome ou usa inicial
    const emojis = ['👨‍💻', '😎', '⭐', '🎮', '🚀', '🎨', '⚡', '🔥', '💎', '🌟'];
    const index = (user.displayName?.charCodeAt(0) || 0) % emojis.length;
    return emojis[index];
  };

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 bg-opacity-95 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col relative border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">LEADERBOARD</h2>
                <p className="text-white/80 text-sm font-semibold">Top Performers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl animate-bounce">🏆</div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                aria-label="Close leaderboard"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {top3.length > 0 && (
                <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-2 pt-6 overflow-visible">
                  {/* Sparkles decoration */}
                  <div className="absolute top-2 left-8 text-2xl animate-pulse">✨</div>
                  <div className="absolute top-2 right-8 text-2xl animate-pulse delay-75">✨</div>

                  {/* Podium Container */}
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-3 items-end max-w-2xl mx-auto">
                      {/* 2nd Place */}
                      {top3[1] && (
                        <div className="text-center transform hover:scale-105 transition-transform relative z-10">
                          {/* Moldura Prateada para 2º lugar */}
                          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 p-[3px] shadow-[0_0_20px_rgba(148,163,184,0.7),inset_0_2px_8px_rgba(255,255,255,0.5),inset_0_-2px_8px_rgba(100,116,139,0.5)] z-0">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="relative inline-block mb-3">
                              <div className="absolute -inset-1 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full blur-md opacity-50"></div>
                              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-3xl border-4 border-white shadow-xl">
                                {top3[1].photoURL ? (
                                  <img
                                    src={top3[1].photoURL}
                                    alt={top3[1].displayName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span>{getUserAvatar(top3[1]) || top3[1].displayName?.charAt(0).toUpperCase() || '?'}</span>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
                                <Medal size={16} className="text-white" />
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 text-sm mb-1 truncate px-2">{top3[1].displayName}</p>
                            <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full mb-2">
                              <Trophy size={10} className="text-slate-500" />
                              <span className="text-xs font-semibold text-gray-700">Lvl {top3[1].currentLevel}</span>
                            </div>
                            <p className="text-indigo-600 font-bold text-base mb-1">{top3[1].totalXP || 0} XP</p>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-3">
                              <Flame size={12} className="text-orange-500" />
                              <span className="font-semibold">{top3[1].streak || 0}d</span>
                            </div>
                            <div className="bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl border-2 border-slate-300 shadow-lg h-24 flex items-center justify-center">
                              <span className="text-5xl font-black text-slate-400">2</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 1st Place */}
                      {top3[0] && (
                        <div className="text-center transform hover:scale-105 transition-transform relative z-30">
                          {/* Moldura Dourada para 1º lugar */}
                          <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 p-[4px] shadow-[0_0_25px_rgba(234,179,8,0.9),inset_0_2px_12px_rgba(255,255,255,0.6),inset_0_-2px_12px_rgba(217,119,6,0.6),0_3px_15px_rgba(234,179,8,0.6)] z-0">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-200 to-yellow-400"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="relative inline-block mb-3">
                              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center text-4xl border-4 border-white shadow-2xl">
                                {top3[0].photoURL ? (
                                  <img
                                    src={top3[0].photoURL}
                                    alt={top3[0].displayName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span>{getUserAvatar(top3[0]) || top3[0].displayName?.charAt(0).toUpperCase() || '?'}</span>
                                )}
                              </div>
                              {/* Coroa com z-index alto para aparecer acima de tudo */}
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-xl z-50">
                                <Crown size={24} className="text-white" fill="currentColor" />
                              </div>
                            </div>
                            <p className="font-black text-gray-900 text-base mb-1 truncate px-2">{top3[0].displayName}</p>
                            <div className="inline-flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full mb-2">
                              <Trophy size={12} className="text-yellow-600" />
                              <span className="text-sm font-bold text-gray-900">Lvl {top3[0].currentLevel}</span>
                            </div>
                            <p className="text-indigo-600 font-black text-xl mb-1">{top3[0].totalXP || 0} XP</p>
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-700 mb-3">
                              <Flame size={14} className="text-orange-500" />
                              <span className="font-bold">{top3[0].streak || 0}d streak</span>
                            </div>
                            <div className="bg-gradient-to-t from-yellow-300 via-yellow-200 to-yellow-100 rounded-t-2xl border-2 border-yellow-400 shadow-2xl h-36 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40"></div>
                              <span className="text-7xl font-black text-yellow-600 relative z-10">1</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3rd Place */}
                      {top3[2] && (
                        <div className="text-center transform hover:scale-105 transition-transform relative z-5">
                          {/* Moldura Bronze para 3º lugar */}
                          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 p-[3px] shadow-[0_0_20px_rgba(217,119,6,0.7),inset_0_2px_8px_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(180,83,9,0.5)] z-0">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-300 via-orange-200 to-amber-400"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="relative inline-block mb-3">
                              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full blur-md opacity-50"></div>
                              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-3xl border-4 border-white shadow-xl">
                                {top3[2].photoURL ? (
                                  <img
                                    src={top3[2].photoURL}
                                    alt={top3[2].displayName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span>{getUserAvatar(top3[2]) || top3[2].displayName?.charAt(0).toUpperCase() || '?'}</span>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
                                <Star size={16} className="text-white" fill="currentColor" />
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 text-sm mb-1 truncate px-2">{top3[2].displayName}</p>
                            <div className="inline-flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full mb-2">
                              <Trophy size={10} className="text-orange-600" />
                              <span className="text-xs font-semibold text-gray-700">Lvl {top3[2].currentLevel}</span>
                            </div>
                            <p className="text-indigo-600 font-bold text-base mb-1">{top3[2].totalXP || 0} XP</p>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-3">
                              <Flame size={12} className="text-orange-500" />
                              <span className="font-semibold">{top3[2].streak || 0}d</span>
                            </div>
                            <div className="bg-gradient-to-t from-orange-300 to-orange-100 rounded-t-2xl border-2 border-orange-400 shadow-lg h-20 flex items-center justify-center">
                              <span className="text-5xl font-black text-orange-500">3</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of Rankings (4+) */}
              {restOfRanking.length > 0 && (
                <div className="p-4 space-y-2 bg-white">
                  {restOfRanking.map((user, index) => {
                    const position = index + 4;
                    const isCurrentUser = user.userId === currentUserId;
                    const isTop10 = position <= 10;

                    return (
                      <div
                        key={user.userId}
                        className={`relative rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-all ${
                          isCurrentUser ? 'ring-2 ring-blue-400' : ''
                        }`}
                      >
                        {/* Moldura para lugares 4-10 */}
                        {isTop10 && (
                          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-[0_0_20px_rgba(139,92,246,0.6),inset_0_2px_8px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(109,40,217,0.4)] z-0">
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200"></div>
                          </div>
                        )}
                        
                        <div className={`relative z-10 w-full flex items-center gap-3 ${
                          isTop10 
                            ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50' 
                            : isCurrentUser 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50' 
                            : 'bg-gradient-to-r from-gray-50 to-gray-100'
                        } rounded-lg p-3 border ${isTop10 ? 'border-purple-300/50' : isCurrentUser ? 'border-blue-300' : 'border-gray-200'}`}>
                          <span className={`font-bold text-base w-8 text-center ${
                            isTop10 ? 'text-purple-700' : 'text-gray-500'
                          }`}>{position}</span>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl shadow-md">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span>{getUserAvatar(user) || user.displayName?.charAt(0).toUpperCase() || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                              <span className="truncate">{user.displayName}</span>
                              {isCurrentUser && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                  You
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center gap-0.5">
                                <Trophy size={10} className="text-indigo-500" />
                                Lv {user.currentLevel}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Flame size={10} className="text-orange-500" />
                                {user.streak || 0}d
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-600 text-sm">{user.totalXP || 0} XP</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User Position Outside Top 20 */}
              {userPosition && userPosition > 20 && currentUserData && (
                <div className="p-4 bg-white">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-all border-2 border-blue-400 ring-2 ring-blue-200">
                    <span className="text-gray-500 font-bold text-base w-8 text-center">{userPosition}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xl shadow-md">
                      {currentUserData.photoURL ? (
                        <img
                          src={currentUserData.photoURL}
                          alt={currentUserData.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{getUserAvatar(currentUserData) || currentUserData.displayName?.charAt(0).toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                        <span className="truncate">{currentUserData.displayName}</span>
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                          You
                        </span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-0.5">
                          <Trophy size={10} className="text-indigo-500" />
                          Lv {currentUserData.currentLevel}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Flame size={10} className="text-orange-500" />
                          {currentUserData.streak || 0}d
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600 text-sm">{currentUserData.totalXP || 0} XP</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}