import React, { useState } from 'react';
import { X, Flame, Trophy, ChevronLeft, ChevronRight, Snowflake, Gift } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function StreakModal({ isOpen, onClose }) {
  const streak = useSelector((state) => state.user.stats.streak);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  const currentStreak = streak?.current || 0;
  const longestStreak = streak?.longest || 0;
  const history = streak?.history || [];
  const freezesUsed = streak?.freezesUsed || [];
  const freezesAvailable = streak?.freezes || 0;

  // Navegação de mês
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Gera calendário mensal
  const generateMonthCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Dia da semana que começa (0 = Domingo)
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Preenche dias vazios no início
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Preenche os dias do mês
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isPast = date < today && !isToday;
      const isFuture = date > today;

      // Verifica se está no histórico (completado)
      const isCompleted = history.includes(dateStr);

      // Verifica se usou freeze
      const usedFreeze = freezesUsed.includes(dateStr);

      // Verifica se é um marco de troféu (múltiplo de 7 no streak)
      const isTrophyDay = isCompleted && !usedFreeze && calculateStreakAtDate(dateStr) % 7 === 0 && calculateStreakAtDate(dateStr) >= 7;

      days.push({
        date: dateStr,
        dayOfMonth: day,
        isToday,
        isPast,
        isFuture,
        isCompleted,
        usedFreeze,
        isTrophyDay
      });
    }

    return days;
  };

  // Calcula qual era o streak em uma data específica
  const calculateStreakAtDate = (targetDate) => {
    const sortedHistory = [...history].sort();
    const targetIndex = sortedHistory.indexOf(targetDate);

    if (targetIndex === -1) return 0;

    let count = 1;
    for (let i = targetIndex - 1; i >= 0; i--) {
      const currentDate = new Date(sortedHistory[i + 1]);
      const previousDate = new Date(sortedHistory[i]);
      const diffDays = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }

    return count;
  };

  const calendar = generateMonthCalendar();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Verifica se está no mês atual
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() &&
                         currentMonth.getFullYear() === new Date().getFullYear();

  // Calcula dias de check-in no mês atual
  const daysInCurrentMonth = calendar.filter(day => day && day.isCompleted).length;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 bg-opacity-50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Rosa/Roxo do Duolingo */}
        <div className="bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 text-white p-6 relative overflow-hidden">
          {/* Personagem e número grande */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl font-black">{currentStreak}</div>
              <div>
                <div className="text-2xl font-bold">dias de sequência!</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Dias de Check-in */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" fill="currentColor" />
                <span className="text-sm font-semibold text-gray-700">{daysInCurrentMonth} dias</span>
              </div>
              <div className="text-xs text-gray-600">Dias de Check-in</div>
            </div>

            {/* Dias Congelados */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">{freezesAvailable} dias</span>
              </div>
              <div className="text-xs text-gray-600">Dias Congelados</div>
            </div>
          </div>

          {/* Navegação do Calendário */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={goToCurrentMonth}
              className="text-lg font-bold text-gray-800"
            >
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </button>

            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className={`p-2 rounded-lg transition-colors ${
                isCurrentMonth
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

           {/* Grade do Calendário */}
                    <div className="grid grid-cols-7 gap-1 mb-6">
                      {calendar.map((day, i) => {
                        if (!day) {
                          return <div key={i} className="aspect-square" />;
                        }

                        // Calcula se este dia seria uma recompensa (múltiplo de 7)
                        const streakOnThisDay = calculateStreakAtDate(day.date);
                        const wouldBeReward = streakOnThisDay > 0 && streakOnThisDay % 7 === 0;

                        // Calcula se um dia futuro seria recompensa caso o streak continue
                        const daysFromToday = Math.ceil((new Date(day.date) - new Date(new Date().toISOString().split('T')[0])) / (1000 * 60 * 60 * 24));
                        const potentialStreak = currentStreak + daysFromToday;
                        const willBeReward = day.isFuture && potentialStreak > 0 && potentialStreak % 7 === 0;

                        return (
                          <div
                            key={i}
                            className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all relative ${
                              day.isTrophyDay
                                ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-white shadow-lg'
                                : day.usedFreeze
                                ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md'
                                : day.isCompleted && wouldBeReward
                                ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-white shadow-lg'
                                : day.isCompleted
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md'
                                : day.isToday
                                ? 'bg-blue-100 text-blue-600 border-2 border-blue-500 shadow-sm'
                                : willBeReward
                                ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
                                : 'bg-gray-50 text-gray-400'
                            }`}
                          >
                            {(day.isTrophyDay || (day.isCompleted && wouldBeReward)) ? (
                              <Trophy className="w-5 h-5" fill="currentColor" />
                            ) : day.usedFreeze ? (
                              <Snowflake className="w-5 h-5" />
                            ) : willBeReward ? (
                              <Gift className="w-5 h-5" />
                            ) : day.isCompleted ? (
                              day.dayOfMonth
                            ) : (
                              day.dayOfMonth
                            )}
                          </div>
                        );
                      })}
          </div>

          {/* Info da Sequência */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="w-6 h-6 text-orange-500" fill="currentColor" />
              <div className="text-lg font-bold text-gray-800">Sequência de {currentStreak} dias</div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentStreak === 0 ? (
                'O estudo consistente melhora as habilidades linguísticas 5x mais rápido!'
              ) : currentStreak < 7 ? (
                `Continue assim! Mais ${7 - currentStreak} dias para ganhar 1 freeze.`
              ) : (
                `Incrível! Você já ganhou ${Math.floor(currentStreak / 7)} freeze${Math.floor(currentStreak / 7) > 1 ? 's' : ''}!`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}