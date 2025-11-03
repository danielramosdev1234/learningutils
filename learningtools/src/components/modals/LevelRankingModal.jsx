import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, Loader, Sparkles } from 'lucide-react';

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
      const mockData = Array.from({ length: 25 }, (_, i) => ({
        userId: `user_${i + 1}`,
        displayName: `Player ${i + 1}`,
        photoURL: null,
        currentLevel: Math.max(1, 10 - Math.floor(i / 3)),
        totalCompleted: Math.max(10, 100 - i * 3),
        progressPercent: Math.floor(Math.random() * 100),
        streak: Math.floor(Math.random() * 30)
      }));

      const sorted = mockData.sort((a, b) => {
        if (b.currentLevel !== a.currentLevel) return b.currentLevel - a.currentLevel;
        if (b.totalCompleted !== a.totalCompleted) return b.totalCompleted - a.totalCompleted;
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

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 bg-opacity-95 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-5 right-5 w-16 h-16 bg-orange-500 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-red-500 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 left-5 w-12 h-12 bg-purple-500 rounded-full opacity-20 blur-xl"></div>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800 text-white px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-400 rounded-xl">
                <Trophy className="w-6 h-6 text-indigo-900" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">LEADERBOARD</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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
                <div className="px-6 py-8 relative">
                  {/* Sparkles decoration */}
                  <Sparkles className="absolute top-4 left-8 w-6 h-6 text-yellow-400 animate-pulse" />
                  <Sparkles className="absolute top-6 right-10 w-5 h-5 text-orange-400 animate-pulse delay-100" />

                  <div className="flex items-end justify-center gap-3 mb-6">
                    {/* 2nd Place - Left */}
                    {top3[1] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-3">
                          {top3[1].photoURL ? (
                            <img
                              src={top3[1].photoURL}
                              alt={top3[1].displayName}
                              className="w-16 h-16 rounded-full border-4 border-gray-300 shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-4 border-gray-300 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {top3[1].displayName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="absolute -top-2 -right-2 bg-gray-400 rounded-full p-1.5 shadow-md">
                            <Medal className="w-5 h-5 text-white" fill="currentColor" />
                          </div>
                        </div>
                        <p className="font-bold text-gray-800 text-sm text-center truncate w-full px-1">
                          {top3[1].displayName}
                        </p>
                        <p className="text-orange-600 font-black text-lg">
                          {top3[1].totalCompleted}
                        </p>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            Lv {top3[1].currentLevel}
                          </span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                            🔥 {top3[1].streak}d
                          </span>
                        </div>
                        <div className="bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-xl w-full h-20 mt-2 flex items-center justify-center shadow-md">
                          <span className="text-4xl font-black text-white">2</span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place - Center (Tallest) */}
                    {top3[0] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-3">
                          {top3[0].photoURL ? (
                            <img
                              src={top3[0].photoURL}
                              alt={top3[0].displayName}
                              className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-xl"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                              {top3[0].displayName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="absolute -top-3 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                            <Crown className="w-6 h-6 text-yellow-800" fill="currentColor" />
                          </div>
                        </div>
                        <p className="font-black text-gray-900 text-base text-center truncate w-full px-1">
                          {top3[0].displayName}
                        </p>
                        <p className="text-orange-600 font-black text-xl">
                          {top3[0].totalCompleted}
                        </p>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            Lv {top3[0].currentLevel}
                          </span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                            🔥 {top3[0].streak}d
                          </span>
                        </div>
                        <div className="bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-xl w-full h-28 mt-2 flex items-center justify-center shadow-lg">
                          <span className="text-5xl font-black text-yellow-800">1</span>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place - Right */}
                    {top3[2] && (
                      <div className="flex flex-col items-center flex-1">
                        <div className="relative mb-3">
                          {top3[2].photoURL ? (
                            <img
                              src={top3[2].photoURL}
                              alt={top3[2].displayName}
                              className="w-16 h-16 rounded-full border-4 border-orange-400 shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-4 border-orange-400 bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {top3[2].displayName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="absolute -top-2 -right-2 bg-orange-500 rounded-full p-1.5 shadow-md">
                            <Medal className="w-5 h-5 text-white" fill="currentColor" />
                          </div>
                        </div>
                        <p className="font-bold text-gray-800 text-sm text-center truncate w-full px-1">
                          {top3[2].displayName}
                        </p>
                        <p className="text-orange-600 font-black text-lg">
                          {top3[2].totalCompleted}
                        </p>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            Lv {top3[2].currentLevel}
                          </span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                            🔥 {top3[2].streak}d
                          </span>
                        </div>
                        <div className="bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-xl w-full h-16 mt-2 flex items-center justify-center shadow-md">
                          <span className="text-4xl font-black text-white">3</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rest of Rankings (4+) */}
              {restOfRanking.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                  {restOfRanking.map((user, index) => {
                    const position = index + 4;
                    const isCurrentUser = user.userId === currentUserId;

                    return (
                      <div
                        key={user.userId}
                        className={`rounded-2xl px-4 py-3 transition-all ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 shadow-md'
                            : 'bg-white shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Position */}
                          <span className="text-xl font-black text-gray-400 w-8 text-center flex-shrink-0">
                            {position}
                          </span>

                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-10 h-10 rounded-full border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                {user.displayName?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm truncate flex items-center gap-2">
                              <span className="truncate">{user.displayName}</span>
                              {isCurrentUser && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                  You
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-purple-600 font-semibold">
                                Lv {user.currentLevel}
                              </span>
                              <span className="text-xs text-orange-600 font-semibold">
                                🔥 {user.streak}d
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <span className="text-lg font-black text-orange-500 flex-shrink-0">
                            {user.totalCompleted}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* User Position Outside Top 20 */}
              {userPosition && userPosition > 20 && currentUserData && (
                <div className="px-4 pb-4">
                  <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-400 shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-blue-600 w-8 text-center flex-shrink-0">
                        {userPosition}
                      </span>

                      <div className="flex-shrink-0">
                        {currentUserData.photoURL ? (
                          <img
                            src={currentUserData.photoURL}
                            alt={currentUserData.displayName}
                            className="w-10 h-10 rounded-full border-2 border-blue-400"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                            {currentUserData.displayName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate">
                          {currentUserData.displayName}
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-purple-600 font-semibold">
                            Lv {currentUserData.currentLevel}
                          </span>
                          <span className="text-xs text-orange-600 font-semibold">
                            🔥 {currentUserData.streak}d
                          </span>
                        </div>
                      </div>

                      <span className="text-lg font-black text-orange-500 flex-shrink-0">
                        {currentUserData.totalCompleted}
                      </span>
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