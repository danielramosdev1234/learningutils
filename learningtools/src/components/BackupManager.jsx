// src/components/BackupManager.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { listBackups, restoreBackup, createBackup } from '../services/backupService';
import { saveAuthUserData } from '../services/userService';
import { initializeUser } from '../store/slices/userSlice';
import { X, Download, RefreshCw, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const BackupManager = () => {
  const dispatch = useDispatch();
  const { userId, mode, stats, levelSystem, progress, referral } = useSelector(state => state.user);

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoring, setRestoring] = useState(null);

  // Carrega lista de backups ao montar
  useEffect(() => {
    if (mode === 'authenticated') {
      loadBackups();
    }
  }, [mode, userId]);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);

    try {
      const backupList = await listBackups(userId);
      setBackups(backupList);
    } catch (err) {
      setError('Erro ao carregar backups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!window.confirm('Tem certeza? Seus dados atuais serão substituídos pelo backup.')) {
      return;
    }

    setRestoring(backupId);
    setError(null);

    try {
      const result = await restoreBackup(userId, backupId);

      if (result.success) {
        // Salva dados restaurados no Firestore
        await saveAuthUserData(
          userId,
          { displayName: 'User', email: '', photoURL: '' }, // Profile mantém igual
          { chunkTrainer: {
            currentIndex: 0,
            completedPhrases: [],
            completedCount: result.data.progress.completedCount
          }},
          result.data.stats,
          result.data.levelSystem,
          result.data.referral
        );

        alert('✅ Backup restaurado com sucesso!');

        // Recarrega dados
        dispatch(initializeUser());
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao restaurar backup');
      console.error(err);
    } finally {
      setRestoring(null);
    }
  };

  const handleManualBackup = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = { stats, levelSystem, progress, referral };
      const result = await createBackup(userId, userData);

      if (result.success) {
        alert('✅ Backup manual criado!');
        await loadBackups();
      } else if (result.reason === 'already_backed_up_today') {
        alert('ℹ️ Você já fez backup hoje');
      } else {
        setError('Erro ao criar backup');
      }
    } catch (err) {
      setError('Erro ao criar backup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toLocaleDateString('pt-BR');
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
      return `Hoje ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem ${timeStr}`;
    } else {
      return `${dateStr} ${timeStr}`;
    }
  };

  const getBackupIcon = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return '🟢';
    if (daysDiff <= 3) return '🟡';
    return '🟠';
  };

  if (mode !== 'authenticated') {
    return (
      <div style={styles.container}>
        <p>🔒 Backups disponíveis apenas para usuários autenticados</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Backups Automáticos</h2>

      <p style={styles.subtitle}>
        Seus dados são salvos automaticamente 1x por dia.
        Se precisar de ajuda nos contate por meio do whatsapp.
      </p>

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      <button
        onClick={handleManualBackup}
        disabled={loading}
        style={styles.manualButton}
      >
        {loading ? '⏳ Processando...' : '⬇️ Fazer Backup Manual'}
      </button>

      {loading && backups.length === 0 ? (
        <div style={styles.loading}>⏳ Carregando backups...</div>
      ) : backups.length === 0 ? (
        <div style={styles.empty}>
          📭 Nenhum backup disponível ainda
        </div>
      ) : (
        <div style={styles.list}>
          {backups.map((backup) => (
            <div key={backup.id} style={styles.backupItem}>
              <div style={styles.backupInfo}>
                <span style={styles.icon}>{getBackupIcon(backup.timestamp)}</span>
                <div style={styles.backupDetails}>
                  <div style={styles.backupDate}>
                    {formatDate(backup.timestamp)}
                  </div>
                  <div style={styles.backupStats}>
                    {backup.levelSystem.globalCompletedIndices.length} frases •
                    Level {backup.levelSystem.currentLevel} •
                    {backup.stats.accuracy}% precisão
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRestore(backup.id)}
                disabled={restoring === backup.id}
                style={styles.restoreButton}
              >
                {restoring === backup.id ? '⏳' : '♻️ Restaurar'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.info}>
        ℹ️ Mantemos seus últimos 10 backups automaticamente
      </div>

      <button
                      onClick={() => window.location.href = '/?mode=categories'}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                      title="Voltar para o início"
                    >
                      <ArrowLeft className="w-6 h-6" />Voltar
                    </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a202c'
  },
  subtitle: {
    color: '#718096',
    marginBottom: '20px'
  },
  error: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  manualButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'background-color 0.2s'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#a0aec0',
    backgroundColor: '#f7fafc',
    borderRadius: '8px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  backupItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  backupInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  icon: {
    fontSize: '24px'
  },
  backupDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  backupDate: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748'
  },
  backupStats: {
    fontSize: '14px',
    color: '#718096'
  },
  restoreButton: {
    padding: '8px 16px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  info: {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#ebf8ff',
    color: '#2c5282',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center'
  }
};

export default BackupManager;