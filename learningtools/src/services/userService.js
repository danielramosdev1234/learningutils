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
  const levelSystemStr = localStorage.getItem('learnfun_guest_levelsystem');

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
    const levelSystemStr = localStorage.getItem('learnfun_guest_levelsystem');

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
      },
      levelSystem: levelSystemStr ? JSON.parse(levelSystemStr) : {
          currentLevel: 1,
          globalCompletedPhrases: []
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
      },
      levelSystem: {
        currentLevel: 1,
        globalCompletedPhrases: []
      }
    };
  }
};

/**
 * Salva dados do guest no localStorage
 */
export const saveGuestData = (progress, stats, levelSystem) => {
  try {
    localStorage.setItem('learnfun_guest_progress', JSON.stringify(progress));
    localStorage.setItem('learnfun_guest_stats', JSON.stringify(stats));
    localStorage.setItem('learnfun_guest_levelsystem', JSON.stringify(levelSystem));
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
export const saveAuthUserData = async (userId, profile, progress, stats, levelSystem) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    await setDoc(userDocRef, {
      profile,
      progress,
      stats,
      levelSystem,
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
    const levelSystemStr = localStorage.getItem('learnfun_guest_levelsystem');

    console.log('👤 Guest Data:', guestData);
    console.log('📊 Total Phrases:', guestData.stats.totalPhrases);
    console.log('📍 Current Index:', guestData.progress.chunkTrainer.currentIndex);
    console.log('✅ Completed:', guestData.progress.chunkTrainer.completedCount);
    console.log('✅ progress:', guestData.progress);

    // 2. Carrega dados existentes do Firestore
    const existingData = await loadAuthUserData(authUserId);

    // 3. Se JÁ tem dados no Firestore, NÃO migra nada do guest
    if (existingData && existingData.stats && existingData.stats.totalPhrases > 0) {
      console.log('ℹ️ Usuário já tem dados no Firestore. Mantendo dados existentes.');
      console.log(`   📊 Firestore: ${existingData.stats.totalPhrases} frases`);
      console.log(`   👤 Guest: ${guestData.stats.totalPhrases} frases (ignorado)`);

      // Limpa dados guest do localStorage
      localStorage.removeItem('learnfun_guest_progress');
      localStorage.removeItem('learnfun_guest_stats');
      localStorage.removeItem('learnfun_guest_id');

      return {
        migrated: false,
        reason: 'user_has_data',
        phrasesCount: existingData.stats.totalPhrases
      };
    }

    // 4. Se guest tem dados significativos, migra
    const hasMeaningfulData =
      guestData.stats.totalPhrases > 0 ||
      guestData.progress.chunkTrainer.completedCount > 0;

    if (!hasMeaningfulData) {
      console.log('ℹ️ Sem dados significativos para migrar');

      // Cria perfil novo vazio
      await saveAuthUserData(authUserId, authProfile, guestData.progress, guestData.stats);
      return { migrated: false, phrasesCount: 0 };
    }

    // 5. Salva no Firestore com dados do guest
    await setDoc(doc(db, 'users', authUserId), {
      profile: authProfile,
      progress: guestData.progress,
      stats: guestData.stats,
      levelSystem: guestData.levelSystem,
      migratedFrom: guestId,
      migratedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // 6. Limpa dados guest do localStorage
    localStorage.removeItem('learnfun_guest_progress');
    localStorage.removeItem('learnfun_guest_stats');
    localStorage.removeItem('learnfun_guest_levelsystem');
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
  localStorage.removeItem('learnfun_guest_levelsystem');
  localStorage.removeItem('learnfun_current_phrase_index');
  console.log('🗑️ Todos os dados locais limpos');
};