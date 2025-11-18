import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useUILanguage } from '../../context/LanguageContext.jsx';
import {
  Bell, BellOff, Clock, Calendar, Flame, Trophy, Target,
  AlertCircle, Sparkles, Users, BookOpen, X, CheckCircle
} from 'lucide-react';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendTestNotification
} from '../../services/notificationService';
import { useFCM } from '../../hooks/useFCM';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

const NotificationSettings = ({ onBack }) => {
  const { userId, mode } = useSelector(state => state.user);
  const { language } = useUILanguage();
  const t = (pt, en) => (language === 'en-US' ? en : pt);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  
  // Hook FCM para verificar status de push notifications
  const { isInitialized, hasToken, isLoading: fcmLoading, error: fcmError } = useFCM();

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await loadNotificationSettings(userId || null);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const handleRequestPermission = async () => {
    const { granted, error } = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
      alert(t('✅ Permissão concedida! Agora você pode receber notificações.', '✅ Permission granted! You can now receive notifications.'));
    } else {
      alert(`❌ ${error || t('Permissão negada', 'Permission denied')}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNotificationSettings(settings, userId || null);
      alert(t('✅ Configurações salvas com sucesso!', '✅ Settings saved successfully!'));
    } catch (error) {
      alert(t('❌ Erro ao salvar configurações. Tente novamente.', '❌ Error saving settings. Please try again.'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification(t('Teste de Notificação', 'Notification Test'), {
        body: t('Se você está vendo isso, as notificações estão funcionando! 🎉', 'If you are seeing this, notifications are working! 🎉'),
        icon: '/pwa-192x192.png'
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } catch (error) {
      alert(`❌ ${t('Erro', 'Error')}: ${error.message}`);
    }
  };

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addDailyReminderTime = () => {
    const times = [...settings.dailyReminders.times, '09:00'];
    updateSetting('dailyReminders.times', times);
  };

  const removeDailyReminderTime = (index) => {
    const times = settings.dailyReminders.times.filter((_, i) => i !== index);
    updateSetting('dailyReminders.times', times);
  };

  const updateDailyReminderTime = (index, time) => {
    const times = [...settings.dailyReminders.times];
    times[index] = time;
    updateSetting('dailyReminders.times', times);
  };

  const toggleDayOfWeek = (day) => {
    const days = [...settings.dailyReminders.daysOfWeek];
    const index = days.indexOf(day);
    
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
    }
    
    updateSetting('dailyReminders.daysOfWeek', days.sort());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">{t('Carregando configurações...', 'Loading settings...')}</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">{t('Erro ao carregar configurações', 'Error loading settings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBack();
              }
            }}
            tabIndex={0}
            aria-label={t('Voltar', 'Back')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" aria-hidden="true" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{t('Notificações', 'Notifications')}</h1>
            <p className="text-sm text-gray-600">{t('Configure seus lembretes e alertas', 'Configure your reminders and alerts')}</p>
          </div>
          <button
            onClick={handleSave}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !saving) {
                e.preventDefault();
                handleSave();
              }
            }}
            tabIndex={0}
            aria-label={saving ? t('Salvando configurações', 'Saving settings') : t('Salvar configurações', 'Save settings')}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('Salvando...', 'Saving...') : t('Salvar', 'Save')}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Permissão de Notificações */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {permissionStatus === 'granted' ? (
                <Bell className="w-6 h-6 text-green-500" />
              ) : (
                <BellOff className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{t('Permissão de Notificações', 'Notification Permission')}</h2>
                <p className="text-sm text-gray-600">
                  {permissionStatus === 'granted'
                    ? t('Permissão concedida', 'Permission granted')
                    : permissionStatus === 'denied'
                    ? t('Permissão negada - Ative nas configurações do navegador', 'Permission denied - Enable it in your browser settings')
                    : t('Permissão não solicitada', 'Permission not requested')}
                </p>
              </div>
            </div>
            {permissionStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRequestPermission();
                  }
                }}
                tabIndex={0}
                aria-label={t('Solicitar permissão de notificações', 'Request notification permission')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('Solicitar Permissão', 'Request Permission')}
              </button>
            )}
          </div>

          {permissionStatus === 'granted' && (
            <button
              onClick={handleTestNotification}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTestNotification();
                }
              }}
              tabIndex={0}
              aria-label={testNotificationSent ? t('Notificação de teste enviada', 'Test notification sent') : t('Enviar notificação de teste', 'Send test notification')}
              className="w-full bg-green-50 text-green-700 px-4 py-3 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              {testNotificationSent ? (
                <>
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  {t('Notificação enviada!', 'Notification sent!')}
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  {t('Enviar Notificação de Teste', 'Send Test Notification')}
                </>
              )}
            </button>
          )}
        </div>


      </div>
    </div>
  );
};

// Componente auxiliar para seções de notificação
const NotificationSection = ({ icon: Icon, title, description, enabled, onToggle, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {enabled && <div className="mt-4">{children}</div>}
    </div>
  );
};

// Componente auxiliar para toggle options
const ToggleOption = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700 font-medium">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};

export default NotificationSettings;

