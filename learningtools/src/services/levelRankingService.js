import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Carrega ranking global de níveis
 * Ordena por: currentLevel DESC, totalCompleted DESC
 *
 * @param {number} limitCount - Número de usuários a retornar (padrão: 50)
 * @param {boolean} includeGuests - Se deve incluir guests (padrão: false)
 * @returns {Promise<Array>} - Array de usuários com ranking
 */
export const loadLevelRanking = async (limitCount = 50, includeGuests = false) => {
  try {
    console.log('📄 Buscando ranking do Firestore...');

    // Busca todos os usuários
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    console.log(`📊 Total de documentos encontrados: ${querySnapshot.size}`);

    const users = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Valida se tem levelSystem (obrigatório)
      if (data.levelSystem) {
        const { currentLevel = 1, globalCompletedIndices = [] } = data.levelSystem;
        const totalCompleted = globalCompletedIndices.length;

        // Pula usuários sem progresso
        if (totalCompleted === 0 && currentLevel === 1) return;

        // Profile pode não existir em todos os usuários
        const profile = data.profile || {};
        const isGuest = !profile.email || data.isGuest;

        // Pula guests se não quiser incluir
        if (!includeGuests && isGuest) return;

        const phrasesNeeded = currentLevel * 10;
        const progressPercent = Math.min(100, Math.round((totalCompleted / phrasesNeeded) * 100));

        users.push({
          userId: doc.id,
          displayName: profile.displayName || profile.email?.split('@')[0] || 'Anonymous',
          email: profile.email || null,
          photoURL: profile.photoURL || null,
          currentLevel: currentLevel,
          totalCompleted: totalCompleted,
          progressPercent: progressPercent,
          streak: data.stats?.streak?.current || 0,
          lastUpdated: data.lastUpdated,
          isGuest: isGuest
        });
      }
    });

    // Ordena manualmente no cliente
    // Critérios: Level (desc) -> Total Completed (desc) -> Progress % (desc)
    users.sort((a, b) => {
      // 1º critério: Nível maior
      if (b.currentLevel !== a.currentLevel) {
        return b.currentLevel - a.currentLevel;
      }

      // 2º critério: Mais frases completadas
      if (b.totalCompleted !== a.totalCompleted) {
        return b.totalCompleted - a.totalCompleted;
      }

      // 3º critério: Maior progresso percentual
      return b.progressPercent - a.progressPercent;
    });

    // Limita ao número solicitado
    const limitedUsers = users.slice(0, limitCount);

    console.log(`✅ Ranking carregado: ${limitedUsers.length} usuários (${users.length} total)`);
    return limitedUsers;

  } catch (error) {
    console.error('❌ Erro ao carregar ranking:', error);

    // Fallback: retorna array vazio
    return [];
  }
};

/**
 * Busca a posição de um usuário específico no ranking
 *
 * @param {string} userId - ID do usuário
 * @param {Array} fullRanking - Ranking completo (opcional, para evitar buscar 2x)
 * @returns {Promise<Object|null>} - { position: number, user: Object } ou null
 */
export const getUserRankingPosition = async (userId, fullRanking = null) => {
  try {
    // Se não passou o ranking, busca
    const ranking = fullRanking || await loadLevelRanking(100);

    const position = ranking.findIndex(user => user.userId === userId);

    if (position === -1) {
      return null;
    }

    return {
      position: position + 1, // 1-indexed
      user: ranking[position]
    };

  } catch (error) {
    console.error('❌ Erro ao buscar posição do usuário:', error);
    return null;
  }
};

/**
 * Estatísticas gerais do ranking
 *
 * @returns {Promise<Object>} - { totalUsers, highestLevel, averageLevel }
 */
export const getRankingStats = async () => {
  try {
    const ranking = await loadLevelRanking(100);

    if (ranking.length === 0) {
      return {
        totalUsers: 0,
        highestLevel: 0,
        averageLevel: 0
      };
    }

    const totalUsers = ranking.length;
    const highestLevel = Math.max(...ranking.map(u => u.currentLevel));
    const averageLevel = Math.round(
      ranking.reduce((sum, u) => sum + u.currentLevel, 0) / totalUsers
    );

    return {
      totalUsers,
      highestLevel,
      averageLevel
    };

  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    return {
      totalUsers: 0,
      highestLevel: 0,
      averageLevel: 0
    };
  }
};