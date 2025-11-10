// services/migrationService.js

import { doc, updateDoc, collection, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { XP_CONFIG } from '../store/slices/xpSlice';

export const migrateUserToXPSystem = async (userId, levelSystem) => {
  try {
    console.log('🔄 Migrando usuário:', userId);

    const { globalCompletedIndices = [] } = levelSystem;
    const totalPhrasesCompleted = globalCompletedIndices.length;

    // Calcula XP baseado em frases completadas
    const totalXP = totalPhrasesCompleted * XP_CONFIG.REWARDS.phrases;

    // Cria estrutura de XP
    const xpSystem = {
      totalXP,
      currentLevel: Math.floor(totalXP / XP_CONFIG.XP_PER_LEVEL) + 1,
      xpBreakdown: {
        phrases: totalXP,
        categories: 0,
        translate: 0,
        numbers: 0,
        challenge: 0,
        video: 0
      },
      xpToday: 0,
      lastUpdated: new Date()
    };

    // Atualiza Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      xpSystem,
      // NÃO DELETAR levelSystem antigo (manter como backup)
      'migration': {
        migratedAt: new Date(),
        fromVersion: '1.0',
        toVersion: '2.0',
        originalPhraseCount: totalPhrasesCompleted
      }
    });

    console.log('✅ Migração concluída!');
    console.log(`   Frases: ${totalPhrasesCompleted}`);
    console.log(`   XP Total: ${totalXP}`);
    console.log(`   Level: ${xpSystem.currentLevel}`);

    return xpSystem;

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
};

/**
 * Migração em lote (Cloud Function ou script admin)
 */
export const migrateAllUsers = async () => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  let migrated = 0;
  let errors = 0;

  for (const docSnap of snapshot.docs) {
    try {
      const userData = docSnap.data();

      // Pula se já migrou
      if (userData.xpSystem) {
        console.log(`⏭️ ${docSnap.id} já migrado`);
        continue;
      }

      await migrateUserToXPSystem(docSnap.id, userData.levelSystem || {});
      migrated++;

    } catch (error) {
      console.error(`❌ Erro ao migrar ${docSnap.id}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Migração completa:`);
  console.log(`   ✅ Migrados: ${migrated}`);
  console.log(`   ❌ Erros: ${errors}`);
};