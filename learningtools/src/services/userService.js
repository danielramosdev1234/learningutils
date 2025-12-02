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
 * Salva dados do usuário autenticado no cache local (offline)
 * Inclui xpSystem se fornecido
 */
export const saveAuthUserDataToCache = (userId, userData, xpSystem = null) => {
  try {
    const cacheKey = `learnfun_auth_cache_${userId}`;
    const cacheData = {
      ...userData,
      ...(xpSystem && { xpSystem }), // Inclui xpSystem se fornecido
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('❌ Erro ao salvar cache local:', error);
  }
};

/**
 * Carrega dados do usuário autenticado do cache local (offline)
 */
export const loadAuthUserDataFromCache = (userId) => {
  try {
    const cacheKey = `learnfun_auth_cache_${userId}`;
    const cachedStr = localStorage.getItem(cacheKey);
    
    if (cachedStr) {
      const cachedData = JSON.parse(cachedStr);
      return cachedData;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro ao carregar cache local:', error);
    return null;
  }
};

/**
 * Verifica se está online
 */
const isOnline = () => {
  return navigator.onLine;
};

/**
 * Carrega dados do usuário autenticado do Firestore (com fallback para cache offline)
 */
export const loadAuthUserData = async (userId, retryCount = 3) => {
  try {
    if (!userId) {
      console.error('❌ userId é obrigatório');
      return null;
    }

    // Tenta carregar do Firestore
    let lastError = null;
    for (let i = 0; i < retryCount; i++) {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();

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

            }
          }

          // Salva no cache local para uso offline (inclui xpSystem se existir)
          const xpSystem = data.xpSystem || null;
          saveAuthUserDataToCache(userId, data, xpSystem);

          return data;
        } else {
          // Tenta carregar do cache mesmo sendo primeira vez (pode ter dados não sincronizados)
          const cachedData = loadAuthUserDataFromCache(userId);
          if (cachedData) {
            return cachedData;
          }
          
          return null;
        }
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Tentativa ${i + 1}/${retryCount} falhou:`, error.message);
        
        // Se não está online, tenta cache imediatamente
        if (!isOnline()) {
          break;
        }
        
        // Aguarda antes de tentar novamente (exceto na última tentativa)
        if (i < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    // Se todas as tentativas falharam, tenta carregar do cache local
    const cachedData = loadAuthUserDataFromCache(userId);

    if (cachedData) {
      return cachedData;
    }

    console.error('❌ Erro ao carregar dados do Firestore e cache local:', lastError);
    return null;
  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    
    // Última tentativa: cache local
    const cachedData = loadAuthUserDataFromCache(userId);
    if (cachedData) {
      return cachedData;
    }
    
    return null;
  }
};

/**
 * Remove valores undefined de um objeto (recursivo)
 * Firebase não aceita undefined, apenas null ou valores válidos
 * Preserva funções especiais do Firebase (como serverTimestamp)
 */
const removeUndefined = (obj) => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  // Preserva funções (como serverTimestamp do Firebase)
  if (typeof obj === 'function') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = removeUndefined(value);
        }
      }
    }
    return cleaned;
  }
  
  return obj;
};

/**
 * Salva dados do usuário autenticado no Firestore
 */
export const saveAuthUserData = async (userId, profile, progress, stats, levelSystem, referral, lastActivity = null) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    // ✅ Verifica se já tem código no Firestore antes de gerar novo
    if (referral && !referral.code) {
      const existingDoc = await getDoc(userDocRef);
      const existingCode = existingDoc.exists() ? existingDoc.data()?.referral?.code : null;

      if (existingCode) {
        referral.code = existingCode;
      } else {
        referral.code = generateReferralCode(profile?.displayName);
      }
    }

    const dataToSave = {
      profile,
      progress,
      stats,
      levelSystem,
      referral,
      lastActivity,
      lastUpdated: serverTimestamp()
    };

    // Remove valores undefined antes de salvar
    const cleanedData = removeUndefined(dataToSave);

    // Tenta salvar no Firestore
    try {
      await setDoc(userDocRef, cleanedData, { merge: true });
    } catch (firestoreError) {
      console.warn('⚠️ Erro ao salvar no Firestore (continuando para salvar cache):', firestoreError.message);
      // Continua para salvar no cache mesmo se Firestore falhar
    }

    // SEMPRE salva no cache local (para uso offline)
    const userData = {
      profile,
      progress,
      stats,
      levelSystem,
      referral,
      lastActivity
    };
    saveAuthUserDataToCache(userId, userData);

    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    console.error('   Stack:', error.stack);
    
    // Tenta salvar no cache mesmo em caso de erro
    try {
      const userData = {
        profile,
        progress,
        stats,
        levelSystem,
        referral,
        lastActivity
      };
      saveAuthUserDataToCache(userId, userData);

    } catch (cacheError) {
      console.error('❌ Erro ao salvar cache local:', cacheError);
    }
    
    return false;
  }
};

/**
 * ✅ CORRIGIDO: Migra dados de guest para usuário autenticado
 */
export const migrateGuestToAuth = async (authUserId, authProfile) => {
  try {
    const guestData = loadGuestData();
    const referredByCode = getReferredBy();

    // ✅ Carrega dados existentes do Firestore
    const existingData = await loadAuthUserData(authUserId);

    // ✅ Se JÁ tem dados no Firestore, NÃO migra
    if (existingData && existingData.stats && existingData.stats.totalPhrases > 0) {
      // ⚠️ MAS PRESERVA O REFERRAL SE VEIO DA URL
      if (referredByCode && !existingData.referral?.referredBy) {
        try {
          await updateDoc(doc(db, 'users', authUserId), {
            'referral.referredBy': referredByCode
          });
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