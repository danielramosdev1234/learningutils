import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useSelector } from 'react-redux';
import StreakModal from '../modals/StreakModal';
import RewardModal from '../modals/RewardModal';
import FreezeModal from '../modals/FreezeModal';

export default function StreakIndicator({ variant = 'default' }) {
  const [showModal, setShowModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [missedDate, setMissedDate] = useState(null);
  const streak = useSelector((state) => state.user.stats.streak);

  // Verifica se precisa mostrar o modal de freeze ao montar
  useEffect(() => {
    const checkStreakStatus = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = streak?.lastActivityDate;

      if (!lastDate || lastDate === today) return;

      const lastDateObj = new Date(lastDate + 'T00:00:00');
      const todayObj = new Date(today + 'T00:00:00');
      const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

      // Se perdeu 1 dia e tem freezes, oferece usar
      if (diffDays === 2 && streak?.freezes > 0) {
        const yesterday = new Date(todayObj);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        setMissedDate(yesterdayStr);
        setShowFreezeModal(true);
      }
    };

    checkStreakStatus();
  }, [streak]);

  // Determina se o streak está ativo (praticou hoje)
  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = streak?.lastActivityDate === today;
  const currentStreak = streak?.current || 0;

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentStreak > 0
              ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
          }`}
          title={`${currentStreak} dias de ofensiva`}
        >
          <Flame
            className={`w-4 h-4 ${currentStreak > 0 && isActiveToday ? 'animate-pulse' : ''}`}
            fill={currentStreak > 0 ? 'currentColor' : 'none'}
          />
          <span className="font-bold text-sm">{currentStreak}</span>
        </button>

        {showModal && (
          <StreakModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Variant padrão (pode ser usado em outros lugares)
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          currentStreak > 0
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        <Flame
          className={`w-5 h-5 ${currentStreak > 0 && isActiveToday ? 'animate-pulse' : ''}`}
          fill={currentStreak > 0 ? 'currentColor' : 'none'}
        />
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium opacity-90">Ofensiva</span>
          <span className="text-lg font-bold">{currentStreak} dias</span>
        </div>
      </button>

      {showModal && (
        <StreakModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}