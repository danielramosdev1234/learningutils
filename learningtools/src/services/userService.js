import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Gera ID único para guest
 */
const generateGuestId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Pega ou cria ID do guest
 */
export const getOrCreateGuestId = () => {
  let guestId = localStorage.getItem('learnfun_guest_id');

  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem('learnfun_guest_id', guestId);
    console.log('🎭 Novo guest criado:', guestId);
  }

  return guestId;
};

/**
 * Carrega dados do guest do localStorage
 */
export const loadGuestData = () => {
  try {
    const progressStr = localStorage.getItem('learnfun_guest_progress');
    const statsStr = localStorage.getItem('learnfun_guest_stats');

    return {
      progress: progressStr ? JSON.parse(progressStr) : {
        chunkTrainer: {
          currentIndex: 0,
          completedPhrases: [],
          completedCount: 0
        }
      },
      stats: statsStr ? JSON.parse(statsStr) : {
        totalPhrases: 0,
        totalAttempts: 0,
        correctCount: 0,
        accuracy: 0,
        streak: 0,
        challengeHighScore: 0
      }
    };
  } catch (error) {
    console.error('❌ Erro ao carregar dados guest:', error);
    return {
      progress: {
        chunkTrainer: {
          currentIndex: 0,
          completedPhrases: [],
          completedCount: 0
        }
      },
      stats: {
        totalPhrases: 0,
        totalAttempts: 0,
        correctCount: 0,
        accuracy: 0,
        streak: 0,
        challengeHighScore: 0
      }
    };
  }
};

/**
 * Salva dados do guest no localStorage
 */
export const saveGuestData = (progress, stats) => {
  try {
    localStorage.setItem('learnfun_guest_progress', JSON.stringify(progress));
    localStorage.setItem('learnfun_guest_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('❌ Erro ao salvar dados guest:', error);
  }
};

/**
 * Carrega dados do usuário autenticado do Firestore
 */
export const loadAuthUserData = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('✅ Dados carregados do Firestore');
      return data;
    } else {
      console.log('ℹ️ Primeira vez deste usuário');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados do Firestore:', error);
    return null;
  }
};

/**
 * Salva dados do usuário autenticado no Firestore
 */
export const saveAuthUserData = async (userId, profile, progress, stats) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    await setDoc(userDocRef, {
      profile,
      progress,
      stats,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log('✅ Dados salvos no Firestore');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar no Firestore:', error);
    return false;
  }
};

/**
 * Migra dados de guest para usuário autenticado
 */
export const migrateGuestToAuth = async (authUserId, authProfile) => {
  try {
    console.log('🔄 Iniciando migração de dados...');

    // 1. Carrega dados do guest
    const guestData = loadGuestData();
    const guestId = localStorage.getItem('learnfun_guest_id');

    // 2. Verifica se tem dados pra migrar
    const hasMeaningfulData =
      guestData.stats.totalPhrases > 0 ||
      guestData.progress.chunkTrainer.completedCount > 0;

    if (!hasMeaningfulData) {
      console.log('ℹ️ Sem dados significativos para migrar');

      // Cria perfil novo vazio
      await saveAuthUserData(authUserId, authProfile, guestData.progress, guestData.stats);
      return { migrated: false, phrasesCount: 0 };
    }

    // 3. Salva no Firestore com dados do guest
    await setDoc(doc(db, 'users', authUserId), {
      profile: authProfile,
      progress: guestData.progress,
      stats: guestData.stats,
      migratedFrom: guestId,
      migratedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // 4. Limpa dados guest do localStorage
    localStorage.removeItem('learnfun_guest_progress');
    localStorage.removeItem('learnfun_guest_stats');
    localStorage.removeItem('learnfun_guest_id');

    console.log('✅ Migração concluída!');
    console.log(`   📊 ${guestData.stats.totalPhrases} frases migradas`);

    return {
      migrated: true,
      phrasesCount: guestData.stats.totalPhrases,
      accuracy: guestData.stats.accuracy
    };

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return { migrated: false, error: error.message };
  }
};

/**
 * Limpa todos os dados do usuário (útil para debug)
 */
export const clearAllUserData = () => {
  localStorage.removeItem('learnfun_guest_id');
  localStorage.removeItem('learnfun_guest_progress');
  localStorage.removeItem('learnfun_guest_stats');
  localStorage.removeItem('learnfun_current_phrase_index');
  console.log('🗑️ Todos os dados locais limpos');
};