import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { calculateLevel } from '../store/slices/xpSlice';

/**
 * Calcula XP de um usuário nos últimos N dias
 */
const calculateXPInPeriod = (dailyXP, days) => {
  if (!dailyXP) return 0;

  const today = new Date();
  let totalXP = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    totalXP += dailyXP[dateKey] || 0;
  }

  return totalXP;
};

/**
 * Carrega ranking por período
 * @param {string} period - 'week' (7 dias), 'month' (30 dias), 'all' (global)
 * @param {number} limitCount - Número de usuários
 */
export const loadPeriodRanking = async (period = 'all', limitCount = 50) => {
  try {
    const usersRef = collection(db, 'users');

    // Para período, busca todos usuários com XP > 0
    const q = period === 'all'
      ? query(
        usersRef,
        where('xpSystem.totalXP', '>', 0),
        orderBy('xpSystem.totalXP', 'desc'),
        limit(limitCount)
      )
      : query(
        usersRef,
        where('xpSystem.totalXP', '>', 0), // Filtro básico
        limit(200) // Busca mais para filtrar localmente
      );

    const snapshot = await getDocs(q);
    const users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const xpSystem = data.xpSystem || {};

      let xpValue;

      if (period === 'week') {
        xpValue = calculateXPInPeriod(xpSystem.dailyXP, 7);
      } else if (period === 'month') {
        xpValue = calculateXPInPeriod(xpSystem.dailyXP, 30);
      } else {
        xpValue = xpSystem.totalXP || 0;
      }

      // Só adiciona se tiver XP no período
      if (xpValue > 0) {
        // Busca níveis de assessment (listening e speaking)
        const assessment = data.assessment || {};
        const listeningLevel = assessment.listening?.level || null;
        const speakingLevel = assessment.speaking?.level || null;

        users.push({
          userId: doc.id,
          displayName: data.profile?.displayName || 'Anonymous',
          email: data.profile?.email || null,
          photoURL: data.profile?.photoURL || null,
          xpEarned: xpValue,
          currentLevel: calculateLevel(xpSystem.totalXP || 0),
          totalXP: xpSystem.totalXP || 0,
          streak: data.stats?.streak?.current || 0,
          listening: listeningLevel ? { level: listeningLevel } : null,
          speaking: speakingLevel ? { level: speakingLevel } : null
        });
      }
    });

    // Ordena localmente por XP do período
    users.sort((a, b) => b.xpEarned - a.xpEarned);

    // Limita resultado
    return users.slice(0, limitCount);

  } catch (error) {
    console.error('❌ Erro ao carregar ranking:', error);
    return [];
  }
};

/**
 * Busca posição do usuário no ranking
 */
export const getUserPeriodPosition = async (userId, period = 'all') => {
  try {
    const ranking = await loadPeriodRanking(period, 100);
    const position = ranking.findIndex(u => u.userId === userId);

    if (position === -1) return null;

    return {
      position: position + 1,
      user: ranking[position],
      totalParticipants: ranking.length
    };
  } catch (error) {
    console.error('❌ Erro ao buscar posição:', error);
    return null;
  }
};