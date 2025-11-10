import { useDispatch, useSelector } from 'react-redux';
import { addXP } from '../store/slices/xpSlice';
import { calculateXPReward } from '../services/xpService';
import { useState, useCallback } from 'react';

export const useXP = () => {
  const dispatch = useDispatch();
  const xpState = useSelector(state => state.xp);
  const userId = useSelector(state => state.user.userId);
  const [lastEarnTime, setLastEarnTime] = useState(null);

  const earnXP = useCallback(async (mode, metadata = {}) => {
    // Anti-spam básico
    const now = Date.now();
    if (lastEarnTime && (now - lastEarnTime) < 2000) {
      console.warn('⚠️ XP earn too fast');
      return;
    }

    const xpAmount = calculateXPReward(mode, metadata);

    await dispatch(addXP({
      userId,
      mode,
      amount: xpAmount,
      metadata
    }));

    setLastEarnTime(now);
  }, [dispatch, userId, lastEarnTime]);

  return {
    ...xpState,
    earnXP
  };
};