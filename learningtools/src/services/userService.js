// userService.js - CORREÇÃO COMPLETA

import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getReferredBy } from '../utils/referralUtils';

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
    const referralStr = localStorage.getItem('learnfun_guest_referral');

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
      referral: referralStr ? JSON.parse(referralStr) : null
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
      referral: null
    };
  }
};

/**
 * Salva dados do guest no localStorage
 */
export const saveGuestData = (progress, stats, levelSystem, referral) => {
  try {
    localStorage.setItem('learnfun_guest_progress', JSON.stringify(progress));
    localStorage.setItem('learnfun_guest_stats', JSON.stringify(stats));
    localStorage.setItem('learnfun_guest_levelsystem', JSON.stringify(levelSystem));

    if (referral) {
      localStorage.setItem('learnfun_guest_referral', JSON.stringify(referral));
    }

    console.log('✅ Dados guest salvos (incluindo referral)');
  } catch (error) {
    console.error('❌ Erro ao salvar dados guest:', error);
  }
};

/**
 * Gera código de referral baseado no displayName
 */
const generateReferralCode = (displayName) => {
  if (!displayName) {
    return `USER-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  const cleanName = displayName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substr(0, 8);

  const randomChars = Math.random().toString(36).substr(2, 4).toUpperCase();

  return `${cleanName}-${randomChars}`;
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
      console.log('📍 CurrentIndex do Firebase:', data.progress?.chunkTrainer?.currentIndex);

      // Valida estrutura de referral
      if (data.referral) {
        const referralCode = data.referral.code || generateReferralCode(data.profile?.displayName);

        data.referral = {
          code: referralCode,
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

        // Salva o código gerado no Firestore se foi gerado agora
        if (!userDoc.data().referral.code) {
          await updateDoc(userDocRef, {
            'referral.code': referralCode
          });
          console.log('✅ Código de referral gerado:', referralCode);
        }
      }

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
export const saveAuthUserData = async (userId, profile, progress, stats, levelSystem, referral) => {
  try {
    console.log('💾 === DEBUG SAVE AUTH USER DATA ===');
    console.log('   User ID:', userId);
    console.log('   Progress:', progress);
    console.log('   CurrentIndex sendo salvo:', progress?.chunkTrainer?.currentIndex);

    const userDocRef = doc(db, 'users', userId);

    // ✅ Verifica se já tem código no Firestore antes de gerar novo
    if (referral && !referral.code) {
      const existingDoc = await getDoc(userDocRef);
      const existingCode = existingDoc.exists() ? existingDoc.data()?.referral?.code : null;

      if (existingCode) {
        referral.code = existingCode;
        console.log('🔄 Usando código existente:', existingCode);
      } else {
        referral.code = generateReferralCode(profile?.displayName);
        console.log('🎁 Código de referral gerado:', referral.code);
      }
    }

    const dataToSave = {
      profile,
      progress,
      stats,
      levelSystem,
      referral,
      lastUpdated: serverTimestamp()
    };

    await setDoc(userDocRef, dataToSave, { merge: true });

    console.log('✅ Dados salvos no Firestore');
    console.log('📍 CurrentIndex salvo:', progress?.chunkTrainer?.currentIndex);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar no Firestore:', error);
    console.error('   Stack:', error.stack);
    return false;
  }
};

/**
 * ✅ CORRIGIDO: Migra dados de guest para usuário autenticado
 */
export const migrateGuestToAuth = async (authUserId, authProfile) => {
  try {
    console.log('🔄 Iniciando migração de dados...');

    const guestData = loadGuestData();
    const referredByCode = getReferredBy();

    console.log('👤 Guest Data:', guestData);
    console.log('📍 CurrentIndex do guest:', guestData.progress?.chunkTrainer?.currentIndex);
    console.log('🎯 Código de convite (URL):', referredByCode);

    // ✅ Carrega dados existentes do Firestore
    const existingData = await loadAuthUserData(authUserId);

    // ✅ Se JÁ tem dados no Firestore, NÃO migra
    if (existingData && existingData.stats && existingData.stats.totalPhrases > 0) {
      console.log('ℹ️ Usuário já tem dados no Firestore. Mantendo dados existentes.');
      console.log(`   📊 Firestore: ${existingData.stats.totalPhrases} frases`);
      console.log(`   📍 Firestore CurrentIndex: ${existingData.progress?.chunkTrainer?.currentIndex}`);
      console.log(`   👤 Guest: ${guestData.stats.totalPhrases} frases (ignorado)`);

      // ⚠️ MAS PRESERVA O REFERRAL SE VEIO DA URL
      if (referredByCode && !existingData.referral?.referredBy) {
        console.log('⭐ Atualizando apenas o referredBy...');

        try {
          await updateDoc(doc(db, 'users', authUserId), {
            'referral.referredBy': referredByCode
          });
          console.log('✅ ReferredBy atualizado no Firestore');
        } catch (updateError) {
          console.error('❌ Erro ao atualizar referredBy:', updateError);
        }
      }

      // Limpa dados guest
      clearAllUserData();

      return {
        migrated: false,
        reason: 'user_has_data',
        phrasesCount: existingData.stats.totalPhrases
      };
    }

    // ✅ PREPARA REFERRAL CORRETAMENTE
    const defaultReferral = {
      code: null,
      referredBy: null,
      totalInvites: 0,
      successfulInvites: [],
      rewards: {
        skipPhrases: 0,
        totalEarned: 0
      },
      hasReceivedWelcomeBonus: false
    };

    let referralToMigrate = {
      ...defaultReferral,
      ...(guestData.referral || {})
    };

    // Se tem código de convite na URL, usa ele
    if (referredByCode && !referralToMigrate.referredBy) {
      referralToMigrate.referredBy = referredByCode;
    }

    console.log('📦 Referral a ser migrado:', referralToMigrate);

    const hasMeaningfulData =
      guestData.stats.totalPhrases > 0 ||
      guestData.progress.chunkTrainer.completedCount > 0;

    if (!hasMeaningfulData) {
      console.log('ℹ️ Sem dados significativos, criando perfil inicial com dados do Firebase (se existir)');

      // ✅ CORRIGIDO: Se não tem dados de guest mas tem no Firebase, MANTÉM os dados do Firebase
      if (existingData) {
        console.log('🔵 Usando dados existentes do Firebase');
        clearAllUserData();
        return {
          migrated: false,
          reason: 'no_guest_data_but_has_firebase',
          phrasesCount: existingData.stats.totalPhrases
        };
      }

      // ✅ Só cria perfil ZERADO se realmente não tem nada
      console.log('🆕 Criando perfil inicial zerado');
      await saveAuthUserData(
        authUserId,
        authProfile,
        {
          chunkTrainer: {
            currentIndex: 0, // ✅ Começa do zero SÓ se for primeira vez
            completedPhrases: [],
            completedCount: 0
          }
        },
        {
          totalPhrases: 0,
          totalAttempts: 0,
          correctCount: 0,
          accuracy: 0,
          streak: {
            current: 0,
            longest: 0,
            lastActivityDate: null,
            history: [],
            freezes: 0,
            freezesUsed: [],
            nextRewardAt: 7,
            rewardsEarned: [],
            showRewardModal: false,
            pendingReward: null
          },
          challengeHighScore: 0
        },
        {
          currentLevel: 1,
          globalCompletedPhrases: [],
          globalCompletedIndices: [],
          showLevelUpModal: false,
          pendingLevelUp: null
        },
        referralToMigrate
      );

      clearAllUserData();
      return { migrated: false, phrasesCount: 0 };
    }

    // ✅ Migra dados do guest COM currentIndex preservado
    console.log('🚀 Migrando dados do guest para Firebase');
    console.log('📍 CurrentIndex a ser migrado:', guestData.progress.chunkTrainer.currentIndex);

    await saveAuthUserData(
      authUserId,
      authProfile,
      guestData.progress, // ✅ Migra progress COMPLETO (com currentIndex)
      guestData.stats,
      guestData.levelSystem,
      referralToMigrate
    );

    clearAllUserData();

    console.log('✅ Migração concluída!');
    console.log(`   📊 ${guestData.stats.totalPhrases} frases migradas`);
    console.log(`   📍 CurrentIndex migrado: ${guestData.progress.chunkTrainer.currentIndex}`);
    console.log('   🎁 Referral:', referralToMigrate);

    return {
      migrated: true,
      phrasesCount: guestData.stats.totalPhrases,
      accuracy: guestData.stats.accuracy
    };

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    console.error('   Stack:', error.stack);
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
  localStorage.removeItem('learnfun_guest_referral');
  localStorage.removeItem('learnfun_current_phrase_index');
  console.log('🗑️ Todos os dados locais limpos');
};