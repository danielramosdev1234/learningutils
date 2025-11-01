import React from 'react';
import { X, Flame, Trophy, Calendar, TrendingUp, Gift, Snowflake } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function StreakModal({ isOpen, onClose }) {
  const streak = useSelector((state) => state.user.stats.streak);

  if (!isOpen) return null;

  const currentStreak = streak?.current || 0;
  const longestStreak = streak?.longest || 0;
  const history = streak?.history || [];
  const lastActivityDate = streak?.lastActivityDate;

  // Calcula marcos de recompensa (a cada 7 dias)
  const calculateRewardMilestones = () => {
    const milestones = [];

    // Ordena o histórico por data para calcular streaks sequenciais
    const sortedHistory = [...history].sort();

    let consecutiveDays = 0;
    let lastDate = null;

    sortedHistory.forEach((dateStr) => {
      const currentDate = new Date(dateStr);

      if (lastDate) {
        const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          consecutiveDays++;
        } else if (dayDiff > 1) {
          consecutiveDays = 1;
        }
      } else {
        consecutiveDays = 1;
      }

      // Marco a cada 7 dias consecutivos
      if (consecutiveDays > 0 && consecutiveDays % 7 === 0) {
        milestones.push({
          date: dateStr,
          streakNumber: consecutiveDays
        });
      }

      lastDate = currentDate;
    });

    return milestones;
  };

  const rewardMilestones = calculateRewardMilestones();
  const rewardDates = rewardMilestones.map(m => m.date);

  // Gera calendário: 15 dias atrás + hoje + 15 dias à frente
  const generateCalendar = () => {
    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 15 dias no passado até hoje
    for (let i = 15; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      days.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        isCompleted: history.includes(dateStr),
        isReward: rewardDates.includes(dateStr),
        isToday: false,
        isPast: true,
        isFuture: false
      });
    }

    // Hoje
    const todayIsReward = (currentStreak > 0 && currentStreak % 7 === 0) && history.includes(todayStr);
    days.push({
      date: todayStr,
      dayOfWeek: today.getDay(),
      dayOfMonth: today.getDate(),
      isCompleted: history.includes(todayStr),
      isReward: todayIsReward,
      isToday: true,
      isPast: false,
      isFuture: false
    });

    // 15 dias no futuro (projetar próximas recompensas)
    for (let i = 1; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Calcula quando será a próxima recompensa
      const daysUntilNextReward = 7 - (currentStreak % 7);
      const nextRewardDay = currentStreak > 0 ? daysUntilNextReward : 7;
      const isFutureReward = i === nextRewardDay;

      days.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        isCompleted: false,
        isReward: isFutureReward,
        isToday: false,
        isPast: false,
        isFuture: true
      });
    }

    return days;
  };

  const calendar = generateCalendar();
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Calcula estatísticas (apenas dias passados + hoje)
  const totalDaysPracticed = history.length;
  const practiceRate = Math.round((totalDaysPracticed / 16) * 100); // 15 dias passados + hoje

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className=" bg-opacity-20 p-3 rounded-xl">
                <Flame className="w-8 h-8" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ofensiva</h2>
                <p className="text-sm opacity-90">Mantenha sua prática diária!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className=" bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-yellow-300 border-opacity-40">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-yellow-300" fill="currentColor" />
                <span className="text-xs font-semibold text-yellow-200">Atual</span>
              </div>
              <div className="text-3xl font-bold text-yellow-300">{currentStreak}</div>
              <div className="text-xs font-medium text-yellow-200">dias</div>
            </div>

            <div className=" bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-yellow-300 border-opacity-40">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-semibold text-yellow-200">Recorde</span>
              </div>
              <div className="text-3xl font-bold text-yellow-300">{longestStreak}</div>
              <div className="text-xs font-medium text-yellow-200">dias</div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg text-gray-800">15 dias atrás • Hoje • 15 dias à frente</h3>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendar.map((day, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative ${
                  day.isReward && day.isCompleted
                    ? 'bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 text-white shadow-xl scale-110 ring-4 ring-yellow-300 animate-pulse'
                    : day.isToday
                    ? day.isCompleted
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-110 ring-2 ring-orange-300'
                      : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg scale-110 ring-2 ring-blue-300'
                    : day.isFuture
                    ? day.isReward
                      ? 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-600 border-2 border-dashed border-yellow-400 shadow-md'
                      : 'bg-gray-50 text-gray-300 border-2 border-dashed border-gray-200'
                    : day.isCompleted
                    ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
                title={`${day.date}${day.isReward ? ' - 🎁 Recompensa!' : ''}`}
              >
                {day.isReward && (day.isCompleted || day.isFuture) ? (
                  <Gift className="w-6 h-6"  />
                ) : day.isFuture && !day.isReward ? (
                  <Snowflake className="w-3 h-3 opacity-30" />
                ) : day.isCompleted ? (
                  <Flame className="w-4 h-4" fill="currentColor" />
                ) : (
                  <span className="text-gray-600">{day.dayOfMonth}</span>
                )}
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-6 space-y-3">
            {/* Freeze Info */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-700 font-medium">Próxima recompensa</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {currentStreak > 0
                      ? `${7 - (currentStreak % 7)} dias`
                      : '7 dias'
                    }
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">Freezes ganhos</div>
                <div className="text-xl font-bold text-amber-600">
                  {Math.floor(longestStreak / 7)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-700 font-medium">Taxa de prática</div>
                  <div className="text-2xl font-bold text-blue-600">{practiceRate}%</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-700 font-medium">Dias praticados</div>
                  <div className="text-2xl font-bold text-purple-600">{totalDaysPracticed}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational message */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
            <p className="text-sm text-gray-700 text-center">
              {currentStreak === 0 ? (
                <>🚀 <strong>Comece sua ofensiva hoje!</strong> Complete uma frase para iniciar.</>
              ) : currentStreak === 1 ? (
                <>🔥 <strong>Ótimo começo!</strong> Volte amanhã para manter o streak!</>
              ) : currentStreak < 7 ? (
                <>💪 <strong>{currentStreak} dias!</strong> Continue assim, você está indo bem!</>
              ) : currentStreak < 30 ? (
                <>🌟 <strong>Impressionante!</strong> {currentStreak} dias de dedicação!</>
              ) : (
                <>👑 <strong>Lendário!</strong> {currentStreak} dias seguidos! Você é imparável!</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}