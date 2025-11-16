import { XP_CONFIG } from '../store/slices/xpSlice';

/**
 * Calcula XP baseado na performance
 * Se amount for fornecido (sistema de palavras), usa ele como base
 */
export const calculateXPReward = (mode, performance = {}) => {
  // Prioridade: amount customizado (para sistema de palavras - 1 XP por palavra)
  if (performance.amount !== undefined && performance.amount > 0) {
    let xp = performance.amount;
    
    // Aplica bônus de accuracy (valores fixos)
    if (performance.accuracy >= 100) {
      xp += 2; // +2 XP bônus para 100%
    } else if (performance.accuracy >= 90) {
      xp += 1; // +1 XP bônus para 90%+
    }
    
    // Bônus por streak (mantém sistema de streak)
    if (performance.streak >= 7) {
      xp += XP_CONFIG.REWARDS.streak || 2;
    }
    
    return Math.max(1, xp); // Mínimo 1 XP
  }

  // Sistema antigo (fallback para compatibilidade com modos que não usam palavras)
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