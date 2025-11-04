// src/services/referralService.js
// ⚠️ SALVAR EM: src/services/referralService.js

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Busca usuário pelo código de referral
 * @param {string} referralCode - Código no formato "NOME-XXXX"
 * @returns {Promise<{userId: string, referralData: object} | null>}
 */
export const findUserByReferralCode = async (referralCode) => {
  try {
    console.log('🔍 Buscando usuário com código:', referralCode);

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referral.code', '==', referralCode));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ Nenhum usuário encontrado com este código');
      return null;
    }

    const userDoc = snapshot.docs[0];
    console.log('✅ Usuário encontrado:', userDoc.id);

    return {
      userId: userDoc.id,
      referralData: userDoc.data().referral
    };
  } catch (error) {
    console.error('❌ Erro ao buscar código de referral:', error);
    return null;
  }
};

/**
 * Adiciona novo usuário à lista de pendentes do referrer
 * @param {string} referrerId - ID do usuário que convidou
 * @param {string} newUserId - ID do novo usuário
 */
export const addPendingInvite = async (referrerId, newUserId) => {
  try {
    const referrerDocRef = doc(db, 'users', referrerId);

    await updateDoc(referrerDocRef, {
      'referral.pending': arrayUnion(newUserId)
    });

    console.log(`✅ ${newUserId} adicionado aos pendentes de ${referrerId}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar pendente:', error);
    return false;
  }
};

/**
 * Processa recompensa quando amigo completa primeira frase
 * @param {string} referrerId - ID de quem convidou
 * @param {string} newUserId - ID do novo usuário
 */
export const confirmInviteAndReward = async (referrerId, newUserId) => {
  try {
    console.log('🎁 Processando recompensa:', { referrerId, newUserId });

    const referrerDocRef = doc(db, 'users', referrerId);
    const referrerDoc = await getDoc(referrerDocRef);

    if (!referrerDoc.exists()) {
      console.error('❌ Referrer não encontrado');
      return false;
    }

    const referrerData = referrerDoc.data();
    const pending = referrerData.referral?.pending || [];
    const successful = referrerData.referral?.successfulInvites || [];

    // Verifica se está nos pendentes
    if (!pending.includes(newUserId)) {
      console.log('⚠️ Usuário não está nos pendentes');
      return false;
    }

    // Verifica se já foi processado
    if (successful.includes(newUserId)) {
      console.log('⚠️ Recompensa já processada para este usuário');
      return false;
    }

    // Calcula recompensas
    const currentInvites = referrerData.referral?.totalInvites || 0;
    const newTotalInvites = currentInvites + 1;

    // +5 base por amigo
    const baseReward = 5;

    // Verifica milestone bonus
    let milestoneBonus = 0;
    const MILESTONES = { 5: 10, 10: 25, 25: 100 };

    Object.entries(MILESTONES).forEach(([milestone, bonus]) => {
      const m = parseInt(milestone);
      // Se acabou de atingir o milestone
      if (newTotalInvites === m) {
        milestoneBonus = bonus;
        console.log(`🎉 MILESTONE ATINGIDO: ${m} amigos = +${bonus} frases extras!`);
      }
    });

    const totalReward = baseReward + milestoneBonus;

    // Atualiza Firestore
    await updateDoc(referrerDocRef, {
      'referral.totalInvites': increment(1),
      'referral.successfulInvites': arrayUnion(newUserId),
      'referral.pending': referrerData.referral.pending.filter(id => id !== newUserId),
      'referral.rewards.skipPhrases': increment(totalReward),
      'referral.rewards.totalEarned': increment(totalReward)
    });

    console.log(`✅ Recompensa processada: +${totalReward} frases (${baseReward} base + ${milestoneBonus} milestone)`);
    console.log(`📊 Total de amigos: ${newTotalInvites}`);

    return {
      success: true,
      reward: totalReward,
      totalInvites: newTotalInvites,
      milestoneReached: milestoneBonus > 0
    };

  } catch (error) {
    console.error('❌ Erro ao processar recompensa:', error);
    return false;
  }
};

/**
 * Registra que novo usuário usou um código de referral
 * @param {string} newUserId - ID do novo usuário
 * @param {string} referrerCode - Código de quem convidou
 */
export const registerReferralUsage = async (newUserId, referrerCode) => {
  try {
    console.log('📝 Registrando uso de referral:', { newUserId, referrerCode });

    // 1. Busca quem convidou
    const referrerData = await findUserByReferralCode(referrerCode);

    if (!referrerData) {
      console.error('❌ Código de referral inválido ou usuário não encontrado');
      return false;
    }

    // 2. Adiciona aos pendentes
    await addPendingInvite(referrerData.userId, newUserId);

    // 3. Atualiza documento do novo usuário
    const newUserDocRef = doc(db, 'users', newUserId);
    await updateDoc(newUserDocRef, {
      'referral.referredBy': referrerCode
    });

    console.log('✅ Referral registrado com sucesso');

    return {
      success: true,
      referrerId: referrerData.userId
    };

  } catch (error) {
    console.error('❌ Erro ao registrar referral:', error);
    return false;
  }
};

/**
 * Verifica e processa referral quando usuário completa primeira frase
 * Deve ser chamado no incrementPhraseCompleted
 * @param {string} userId - ID do usuário atual
 * @param {number} totalPhrases - Total de frases completadas
 */
export const checkAndProcessFirstPhraseReferral = async (userId, totalPhrases, referredBy) => {
  // Só processa na primeira frase
  if (totalPhrases !== 1) return;

  if (!referredBy) {
    console.log('ℹ️ Usuário não foi convidado por ninguém');
    return;
  }

  console.log('🎯 Primeira frase completada! Processando referral...');

  try {
    // Busca quem convidou
    const referrerData = await findUserByReferralCode(referredBy);

    if (!referrerData) {
      console.error('❌ Referrer não encontrado');
      return;
    }

    // Processa recompensa
    const result = await confirmInviteAndReward(referrerData.userId, userId);

    if (result.success) {
      console.log('🎉 Recompensa entregue ao referrer!');

      // Analytics
      if (window.va) {
        window.va('event', {
          name: 'referral_reward_earned',
          data: {
            referrerId: referrerData.userId,
            newUserId: userId,
            reward: result.reward,
            totalInvites: result.totalInvites,
            milestoneReached: result.milestoneReached
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro ao processar referral de primeira frase:', error);
  }
};