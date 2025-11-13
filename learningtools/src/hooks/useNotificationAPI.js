import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { notificationAPI } from '../services/apiService';

/**
 * Hook para usar a API de notificações push
 */
export function useNotificationAPI() {
  const { userId, mode } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendNotification = useCallback(async (type, data) => {
    if (mode === 'guest' || !userId) {
      console.warn('Usuário não autenticado, notificação não será enviada');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case 'achievement':
          result = await notificationAPI.sendAchievement(
            userId,
            data.achievementType,
            data.details || {}
          );
          break;

        case 'streak':
          result = await notificationAPI.sendStreak(userId, data.streak);
          break;

        case 'inactivity':
          result = await notificationAPI.sendInactivity(
            userId,
            data.daysWithoutActivity
          );
          break;

        case 'daily':
          result = await notificationAPI.sendDailyReminder(userId, data.settings || {});
          break;

        case 'weeklyChallenge':
          result = await notificationAPI.sendWeeklyChallenge(userId);
          break;

        case 'friendActivity':
          result = await notificationAPI.sendFriendActivity(
            userId,
            data.friendName,
            data.action
          );
          break;

        case 'review':
          result = await notificationAPI.sendReview(userId, data.difficultPhrasesCount);
          break;

        case 'custom':
          result = await notificationAPI.send(userId, data.notification);
          break;

        default:
          throw new Error(`Tipo de notificação desconhecido: ${type}`);
      }

      return { success: true, ...result };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao enviar notificação';
      setError(errorMessage);
      console.error('Erro ao enviar notificação push:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [userId, mode]);

  return {
    sendNotification,
    loading,
    error
  };
}

