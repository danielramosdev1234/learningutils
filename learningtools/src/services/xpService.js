import { XP_CONFIG } from '../store/slices/xpSlice';

/**
 * Calcula XP baseado na performance
 */
export const calculateXPReward = (mode, performance = {}) => {
  // Se o metadata tem um amount customizado, usa ele
  if (performance.amount !== undefined) {
    return performance.amount;
  }

  let baseXP = XP_CONFIG.REWARDS[mode] || 10;

  // Bônus por accuracy
  if (performance.accuracy >= 100) {
    baseXP += XP_CONFIG.REWARDS.perfectScore;
  } else if (performance.accuracy >= 90) {
    baseXP += 2;
  }

  // Bônus por streak
  if (performance.streak >= 7) {
    baseXP += XP_CONFIG.REWARDS.streak;
  }
  console.warn('baseXP', baseXP);
  console.warn('performance', performance);

  return baseXP;
};

/**
 * Valida se pode ganhar XP (anti-cheat básico)
 */
export const validateXPEarn = (mode, lastEarnTime) => {
  // Não pode ganhar XP da mesma atividade em menos de 3 segundos
  const MIN_INTERVAL = 3000; // 3 segundos

  if (lastEarnTime) {
    const timeSinceLastEarn = Date.now() - lastEarnTime;
    if (timeSinceLastEarn < MIN_INTERVAL) {
      console.warn('⚠️ XP earn too fast, possible exploit');
      return false;
    }
  }

  return true;
};