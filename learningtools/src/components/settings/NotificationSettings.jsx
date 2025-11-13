import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' }
];

export default function NotificationSettings({ onBack }) {
  const { userId, mode } = useSelector(state => state.user);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [testNotificationSent, setTestNotificationSent] = useState(false);

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
      alert('✅ Permissão concedida! Agora você pode receber notificações.');
    } else {
      alert(`❌ ${error || 'Permissão negada'}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNotificationSettings(settings, userId || null);
      alert('✅ Configurações salvas com sucesso!');
    } catch (error) {
      alert('❌ Erro ao salvar configurações. Tente novamente.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification('Teste de Notificação', {
        body: 'Se você está vendo isso, as notificações estão funcionando! 🎉',
        icon: '/pwa-192x192.png'
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } catch (error) {
      alert(`❌ Erro: ${error.message}`);
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
          <p className="text-gray-600 font-semibold">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Erro ao carregar configurações</p>
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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
            <p className="text-sm text-gray-600">Configure seus lembretes e alertas</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar'}
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
                <h2 className="text-xl font-bold text-gray-800">Permissão de Notificações</h2>
                <p className="text-sm text-gray-600">
                  {permissionStatus === 'granted'
                    ? 'Permissão concedida'
                    : permissionStatus === 'denied'
                    ? 'Permissão negada - Ative nas configurações do navegador'
                    : 'Permissão não solicitada'}
                </p>
              </div>
            </div>
            {permissionStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Solicitar Permissão
              </button>
            )}
          </div>

          {permissionStatus === 'granted' && (
            <button
              onClick={handleTestNotification}
              className="w-full bg-green-50 text-green-700 px-4 py-3 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
            >
              {testNotificationSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Notificação enviada!
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Enviar Notificação de Teste
                </>
              )}
            </button>
          )}
        </div>

        {/* Toggle Geral */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Ativar Notificações</h2>
                <p className="text-sm text-gray-600">Liga/desliga todas as notificações</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {settings.enabled && (
          <>
            {/* Lembretes Diários */}
            <NotificationSection
              icon={Clock}
              title="Lembretes Diários"
              description="Configure horários para ser lembrado de treinar"
              enabled={settings.dailyReminders.enabled}
              onToggle={(enabled) => updateSetting('dailyReminders.enabled', enabled)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horários
                  </label>
                  <div className="space-y-2">
                    {settings.dailyReminders.times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateDailyReminderTime(index, e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                        {settings.dailyReminders.times.length > 1 && (
                          <button
                            onClick={() => removeDailyReminderTime(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addDailyReminderTime}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      + Adicionar Horário
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dias da Semana
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = settings.dailyReminders.daysOfWeek.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          onClick={() => toggleDayOfWeek(day.value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </NotificationSection>

            {/* Lembretes de Inatividade */}
            <NotificationSection
              icon={AlertCircle}
              title="Lembretes de Inatividade"
              description="Seja lembrado quando ficar sem treinar"
              enabled={settings.inactivityReminders.enabled}
              onToggle={(enabled) => updateSetting('inactivityReminders.enabled', enabled)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lembrar após quantos dias sem atividade?
                  </label>
                  <select
                    value={settings.inactivityReminders.daysWithoutActivity}
                    onChange={(e) => updateSetting('inactivityReminders.daysWithoutActivity', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1}>1 dia</option>
                    <option value={2}>2 dias</option>
                    <option value={3}>3 dias</option>
                    <option value={7}>1 semana</option>
                  </select>
                </div>
              </div>
            </NotificationSection>

            {/* Lembretes de Streak */}
            <NotificationSection
              icon={Flame}
              title="Lembretes de Sequência (Streak)"
              description="Não perca sua sequência de dias treinando"
              enabled={settings.streakReminders.enabled}
              onToggle={(enabled) => updateSetting('streakReminders.enabled', enabled)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horário do Lembrete
                  </label>
                  <input
                    type="time"
                    value={settings.streakReminders.reminderTime}
                    onChange={(e) => updateSetting('streakReminders.reminderTime', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lembrar quantos dias antes de expirar?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((days) => {
                      const isSelected = settings.streakReminders.daysBeforeExpiry.includes(days);
                      return (
                        <button
                          key={days}
                          onClick={() => {
                            const daysArray = [...settings.streakReminders.daysBeforeExpiry];
                            if (isSelected) {
                              const index = daysArray.indexOf(days);
                              daysArray.splice(index, 1);
                            } else {
                              daysArray.push(days);
                            }
                            updateSetting('streakReminders.daysBeforeExpiry', daysArray.sort());
                          }}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {days} dia{days > 1 ? 's' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </NotificationSection>

            {/* Lembretes de Conquistas */}
            <NotificationSection
              icon={Trophy}
              title="Lembretes de Conquistas"
              description="Seja notificado sobre suas conquistas e progressos"
              enabled={settings.achievementReminders.enabled}
              onToggle={(enabled) => updateSetting('achievementReminders.enabled', enabled)}
            >
              <div className="space-y-3">
                <ToggleOption
                  label="Subir de Nível"
                  checked={settings.achievementReminders.levelUp}
                  onChange={(checked) => updateSetting('achievementReminders.levelUp', checked)}
                />
                <ToggleOption
                  label="Marcos de XP"
                  checked={settings.achievementReminders.xpMilestones}
                  onChange={(checked) => updateSetting('achievementReminders.xpMilestones', checked)}
                />
                <ToggleOption
                  label="Desafio Completado"
                  checked={settings.achievementReminders.challengeCompleted}
                  onChange={(checked) => updateSetting('achievementReminders.challengeCompleted', checked)}
                />
              </div>
            </NotificationSection>

            {/* Lembretes Motivacionais */}
            <NotificationSection
              icon={Sparkles}
              title="Lembretes Motivacionais"
              description="Mensagens encorajadoras para manter sua motivação"
              enabled={settings.motivationalReminders.enabled}
              onToggle={(enabled) => updateSetting('motivationalReminders.enabled', enabled)}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequência
                </label>
                <select
                  value={settings.motivationalReminders.frequency}
                  onChange={(e) => updateSetting('motivationalReminders.frequency', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="biweekly">A cada 2 semanas</option>
                </select>
              </div>
            </NotificationSection>

            {/* Lembretes de Desafio Semanal */}
            <NotificationSection
              icon={Target}
              title="Desafio Semanal"
              description="Lembrete sobre novos desafios semanais"
              enabled={settings.weeklyChallengeReminders.enabled}
              onToggle={(enabled) => updateSetting('weeklyChallengeReminders.enabled', enabled)}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dia da Semana
                  </label>
                  <select
                    value={settings.weeklyChallengeReminders.dayOfWeek}
                    onChange={(e) => updateSetting('weeklyChallengeReminders.dayOfWeek', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label === 'Dom' ? 'Domingo' : day.label === 'Seg' ? 'Segunda-feira' : day.label === 'Ter' ? 'Terça-feira' : day.label === 'Qua' ? 'Quarta-feira' : day.label === 'Qui' ? 'Quinta-feira' : day.label === 'Sex' ? 'Sexta-feira' : 'Sábado'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={settings.weeklyChallengeReminders.time}
                    onChange={(e) => updateSetting('weeklyChallengeReminders.time', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </NotificationSection>

            {/* Lembretes de Revisão */}
            <NotificationSection
              icon={BookOpen}
              title="Lembretes de Revisão"
              description="Lembre-se de revisar frases que teve dificuldade"
              enabled={settings.reviewReminders.enabled}
              onToggle={(enabled) => updateSetting('reviewReminders.enabled', enabled)}
            >
              <div className="space-y-4">
                <ToggleOption
                  label="Revisar frases difíceis"
                  checked={settings.reviewReminders.enabledForDifficultPhrases}
                  onChange={(checked) => updateSetting('reviewReminders.enabledForDifficultPhrases', checked)}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precisão mínima para considerar difícil (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.reviewReminders.minAccuracy}
                    onChange={(e) => updateSetting('reviewReminders.minAccuracy', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Frases com precisão abaixo deste valor serão sugeridas para revisão
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frequência
                  </label>
                  <select
                    value={settings.reviewReminders.frequency}
                    onChange={(e) => updateSetting('reviewReminders.frequency', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                  </select>
                </div>
              </div>
            </NotificationSection>

            {/* Lembretes de Atividade de Amigos */}
            <NotificationSection
              icon={Users}
              title="Atividade de Amigos"
              description="Seja notificado sobre conquistas dos seus amigos"
              enabled={settings.friendActivityReminders.enabled}
              onToggle={(enabled) => updateSetting('friendActivityReminders.enabled', enabled)}
            >
              <div className="space-y-3">
                <ToggleOption
                  label="Amigo subiu de nível"
                  checked={settings.friendActivityReminders.friendLevelUp}
                  onChange={(checked) => updateSetting('friendActivityReminders.friendLevelUp', checked)}
                />
                <ToggleOption
                  label="Amigo completou desafio"
                  checked={settings.friendActivityReminders.friendChallenge}
                  onChange={(checked) => updateSetting('friendActivityReminders.friendChallenge', checked)}
                />
              </div>
            </NotificationSection>
          </>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para seções de notificação
function NotificationSection({ icon: Icon, title, description, enabled, onToggle, children }) {
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
}

// Componente auxiliar para toggle options
function ToggleOption({ label, checked, onChange }) {
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
}

