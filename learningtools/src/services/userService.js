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
    const levelSystemStr = localStorage.getItem('learnfun_guest_levelsystem');
    const referralStr = localStorage.getItem('learnfun_guest_referral'); // ✅ NOVO

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
      },
      referral: referralStr ? JSON.parse(referralStr) : null // ✅ NOVO
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
      },
      referral: null // ✅ NOVO
    };
  }
};

/**
 * Salva dados do guest no localStorage
 */
export const saveGuestData = (progress, stats, levelSystem, referral) => { // ✅ ADICIONADO referral
  try {
    localStorage.setItem('learnfun_guest_progress', JSON.stringify(progress));
    localStorage.setItem('learnfun_guest_stats', JSON.stringify(stats));
    localStorage.setItem('learnfun_guest_levelsystem', JSON.stringify(levelSystem));

    // ✅ NOVO: Salva referral
    if (referral) {
      localStorage.setItem('learnfun_guest_referral', JSON.stringify(referral));
    }

    console.log('✅ Dados guest salvos (incluindo referral)');
  } catch (error) {
    console.error('❌ Erro ao salvar dados guest:', error);
  }
};

/**
 * Carrega dados do usuário autenticado do Firestore
 */
export const loadAuthUserData = async (userId) => {
  try {
    if (!userId) {
      console.error('❌ userId é obrigatório');
      return null;
    }

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('✅ Dados carregados do Firestore');

      // ✅ Valida estrutura de referral
      if (data.referral) {
        data.referral = {
          code: data.referral.code || null,
          referredBy: data.referral.referredBy || null,
          totalInvites: data.referral.totalInvites || 0,
          successfulInvites: Array.isArray(data.referral.successfulInvites)
            ? data.referral.successfulInvites
            : [],
          pending: Array.isArray(data.referral.pending)
            ? data.referral.pending
            : [],
          rewards: {
            skipPhrases: data.referral.rewards?.skipPhrases || 0,
            totalEarned: data.referral.rewards?.totalEarned || 0
          },
          hasReceivedWelcomeBonus: data.referral.hasReceivedWelcomeBonus || false
        };
      }

      return data;
    } else {
      console.log('ℹ️ Primeira vez deste usuário');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados do Firestore:', error);
    console.error('   Stack:', error.stack);
    return null;
  }
};

/**
 * Salva dados do usuário autenticado no Firestore
 */
export const saveAuthUserData = async (userId, profile, progress, stats, levelSystem, referral) => { // ✅ ADICIONADO referral
  try {
    const userDocRef = doc(db, 'users', userId);

    // ✅ INCLUIR referral no documento
    await setDoc(userDocRef, {
      profile,
      progress,
      stats,
      levelSystem,
      referral, // ✅ NOVO: Salva dados de referral
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log('✅ Dados salvos no Firestore (incluindo referral)');
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

    console.log('👤 Guest Data:', guestData);
    console.log('📊 Total Phrases:', guestData.stats.totalPhrases);
    console.log('🎁 Referral:', guestData.referral);

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
      localStorage.removeItem('learnfun_guest_levelsystem');
      localStorage.removeItem('learnfun_guest_referral'); // ✅ NOVO
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

      // Cria perfil novo vazio (MAS MANTÉM REFERRAL SE EXISTIR)
      await saveAuthUserData(
        authUserId,
        authProfile,
        guestData.progress,
        guestData.stats,
        guestData.levelSystem,
        guestData.referral // ✅ NOVO: Migra referral mesmo sem dados
      );

      return { migrated: false, phrasesCount: 0 };
    }

    // 5. Salva no Firestore com dados do guest
    await setDoc(doc(db, 'users', authUserId), {
      profile: authProfile,
      progress: guestData.progress,
      stats: guestData.stats,
      levelSystem: guestData.levelSystem,
      referral: guestData.referral, // ✅ NOVO: Migra referral
      migratedFrom: guestId,
      migratedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // 6. Limpa dados guest do localStorage
    localStorage.removeItem('learnfun_guest_progress');
    localStorage.removeItem('learnfun_guest_stats');
    localStorage.removeItem('learnfun_guest_levelsystem');
    localStorage.removeItem('learnfun_guest_referral'); // ✅ NOVO
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
  localStorage.removeItem('learnfun_guest_referral'); // ✅ NOVO
  localStorage.removeItem('learnfun_current_phrase_index');
  console.log('🗑️ Todos os dados locais limpos');
};