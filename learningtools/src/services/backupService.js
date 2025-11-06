// src/services/backupService.js

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Verifica se já fez backup hoje
 */
const hasBackupToday = (lastBackupDate) => {
  if (!lastBackupDate) return false;

  const today = new Date().toISOString().split('T')[0];
  const lastBackup = new Date(lastBackupDate).toISOString().split('T')[0];

  return today === lastBackup;
};

/**
 * Gera ID do backup baseado na data/hora
 */
const generateBackupId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

/**
 * Remove campos desnecessários para economizar espaço
 */
const compactData = (data) => {
  return {
    stats: {
      totalPhrases: data.stats.totalPhrases,
      accuracy: data.stats.accuracy,
      streak: {
        current: data.stats.streak?.current || 0,
        longest: data.stats.streak?.longest || 0
      },
      challengeHighScore: data.stats.challengeHighScore
    },
    levelSystem: {
      currentLevel: data.levelSystem.currentLevel,
      globalCompletedIndices: data.levelSystem.globalCompletedIndices
    },
    progress: {
      completedCount: data.progress?.chunkTrainer?.completedCount || 0
    },
    referral: {
      totalInvites: data.referral?.totalInvites || 0,
      rewards: {
        skipPhrases: data.referral?.rewards?.skipPhrases || 0
      }
    }
  };
};

/**
 * ⭐ Cria backup dos dados do usuário
 */
export const createBackup = async (userId, userData) => {
  try {
    // Verifica se é usuário autenticado
    if (!userId || userId.startsWith('guest_')) {
      console.log('ℹ️ Backup não disponível para guests');
      return { success: false, reason: 'guest_user' };
    }

    // Verifica se já fez backup hoje
    const lastBackup = localStorage.getItem(`learnfun_last_backup_${userId}`);

    if (hasBackupToday(lastBackup)) {
      console.log('✅ Backup já realizado hoje');
      return { success: false, reason: 'already_backed_up_today' };
    }

    console.log('💾 Criando backup diário...');

    // Gera ID do backup
    const backupId = generateBackupId();

    // Compacta dados
    const compactedData = compactData(userData);

    // Salva backup no Firestore
    const backupRef = doc(db, 'backups', userId, 'snapshots', backupId);

    await setDoc(backupRef, {
      ...compactedData,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    });

    // Atualiza localStorage com data do último backup
    localStorage.setItem(`learnfun_last_backup_${userId}`, new Date().toISOString());

    console.log('✅ Backup criado:', backupId);

    // Limpa backups antigos (mantém últimos 10)
    await cleanOldBackups(userId);

    return {
      success: true,
      backupId,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Remove backups antigos (mantém apenas os últimos 10)
 */
const cleanOldBackups = async (userId) => {
  try {
    console.log('🧹 Limpando backups antigos...');

    const backupsRef = collection(db, 'backups', userId, 'snapshots');
    const q = query(backupsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const backups = snapshot.docs;

    console.log(`📊 Total de backups: ${backups.length}`);

    // Se tem mais de 10, remove os mais antigos
    if (backups.length > 10) {
      const toDelete = backups.slice(10); // Pega do 11º em diante

      console.log(`🗑️ Removendo ${toDelete.length} backups antigos`);

      for (const backup of toDelete) {
        await deleteDoc(backup.ref);
        console.log(`   Removido: ${backup.id}`);
      }

      console.log('✅ Limpeza concluída');
    } else {
      console.log('✅ Nenhum backup para remover');
    }

  } catch (error) {
    console.error('❌ Erro ao limpar backups:', error);
  }
};

/**
 * Lista todos os backups do usuário
 */
export const listBackups = async (userId) => {
  try {
    if (!userId || userId.startsWith('guest_')) {
      return [];
    }

    console.log('📋 Listando backups...');

    const backupsRef = collection(db, 'backups', userId, 'snapshots');
    const q = query(backupsRef, orderBy('createdAt', 'desc'), limit(10));

    const snapshot = await getDocs(q);

    const backups = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        stats: data.stats,
        levelSystem: data.levelSystem,
        createdAt: data.createdAt
      };
    });

    console.log(`✅ ${backups.length} backups encontrados`);

    return backups;

  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    return [];
  }
};

/**
 * Restaura backup específico
 */
export const restoreBackup = async (userId, backupId) => {
  try {
    console.log('♻️ Restaurando backup:', backupId);

    const backupRef = doc(db, 'backups', userId, 'snapshots', backupId);
    const backupDoc = await getDoc(backupRef);

    if (!backupDoc.exists()) {
      console.error('❌ Backup não encontrado');
      return { success: false, error: 'Backup não encontrado' };
    }

    const backupData = backupDoc.data();

    console.log('📊 Dados do backup:', {
      totalPhrases: backupData.stats.totalPhrases,
      currentLevel: backupData.levelSystem.currentLevel
    });

    return {
      success: true,
      data: backupData
    };

  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifica se precisa fazer backup (chamada na primeira atividade do dia)
 */
export const checkAndCreateBackup = async (userId, userData) => {
  try {
    // Verifica se já fez backup hoje
    const lastBackup = localStorage.getItem(`learnfun_last_backup_${userId}`);

    if (hasBackupToday(lastBackup)) {
      console.log('ℹ️ Backup já realizado hoje, pulando');
      return { success: false, reason: 'already_backed_up_today' };
    }

    // Cria backup
    return await createBackup(userId, userData);

  } catch (error) {
    console.error('❌ Erro ao verificar/criar backup:', error);
    return { success: false, error: error.message };
  }
};