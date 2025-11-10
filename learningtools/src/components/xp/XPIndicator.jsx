import React from 'react';
import { useSelector } from 'react-redux';
import { Zap, TrendingUp } from 'lucide-react';

export const XPIndicator = ({ variant = 'compact' }) => {
  const { totalXP, currentLevel, xpProgress, xpToday } = useSelector(state => state.xp);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
        <Zap className="w-5 h-5 fill-white" />
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold">Level {currentLevel}</span>
          <span className="text-[10px] opacity-90">{xpProgress.current}/{xpProgress.needed} XP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Level {currentLevel}</h3>
            <p className="text-sm text-gray-600">{totalXP.toLocaleString()} XP Total</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-green-700 font-semibold">Today</p>
            <p className="text-lg font-bold text-green-600">+{xpToday} XP</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress to Level {currentLevel + 1}</span>
          <span className="font-bold text-purple-600">{xpProgress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${xpProgress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center">
          {xpProgress.needed - xpProgress.current} XP to next level
        </p>
      </div>
    </div>
  );
};
