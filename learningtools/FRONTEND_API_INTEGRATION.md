# 🔗 Integração Frontend com API de Notificações

## 📋 Visão Geral

O frontend foi atualizado para usar a API de notificações push com autenticação. Todas as chamadas à API agora incluem automaticamente o token Firebase JWT.

## 🔧 Configuração

### Variável de Ambiente

Adicione ao arquivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Para produção, use a URL do seu backend:

```env
VITE_API_BASE_URL=https://seu-backend.com
```

## 📦 Estrutura

### 1. Serviço de API (`apiService.js`)

Serviço centralizado que:
- Obtém automaticamente o token Firebase
- Adiciona header `Authorization: Bearer <token>`
- Trata erros de forma consistente
- Fornece métodos para todos os tipos de notificações

### 2. Hook de Notificações (`useNotificationAPI.js`)

Hook React para facilitar o uso:

```javascript
import { useNotificationAPI } from '../hooks/useNotificationAPI';

function MyComponent() {
  const { sendNotification, loading, error } = useNotificationAPI();

  const handleLevelUp = async () => {
    await sendNotification('achievement', {
      achievementType: 'levelUp',
      details: { level: 10, xp: 5000 }
    });
  };
}
```

## 🚀 Uso

### Enviar Notificação de Conquista

```javascript
import { notificationAPI } from '../services/apiService';

// Quando usuário sobe de nível
await notificationAPI.sendAchievement(userId, 'levelUp', {
  level: 10,
  xp: 5000
});
```

### Enviar Notificação de Streak

```javascript
await notificationAPI.sendStreak(userId, 15);
```

### Enviar Notificação Personalizada

```javascript
await notificationAPI.send(userId, {
  title: 'Bem-vindo!',
  body: 'Comece a treinar agora!',
  type: 'welcome',
  url: '/',
  data: {
    screen: 'dashboard'
  }
});
```

## 🔄 Integrações Automáticas

### Level Up Modal

O `LevelUpModal` agora envia automaticamente notificação push quando:
- Usuário sobe de nível
- Notificações de conquista estão habilitadas
- Usuário está autenticado

**Código:**
```javascript
// Em LevelUpModal.jsx
useEffect(() => {
  if (isOpen && newLevel && mode !== 'guest' && userId) {
    const sendLevelUpNotification = async () => {
      const settings = await loadNotificationSettings(userId);
      
      if (settings?.achievementReminders?.enabled && 
          settings?.achievementReminders?.levelUp) {
        await notificationAPI.sendAchievement(userId, 'levelUp', {
          level: newLevel,
          xp: totalXP
        });
      }
    };
    
    sendLevelUpNotification();
  }
}, [isOpen, newLevel, userId, mode, totalXP]);
```

## 📝 Exemplos de Integração

### Exemplo 1: Notificação ao Completar Desafio

```javascript
import { notificationAPI } from '../services/apiService';
import { useSelector } from 'react-redux';

function ChallengeComponent() {
  const { userId, mode } = useSelector(state => state.user);

  const handleChallengeComplete = async () => {
    if (mode !== 'guest' && userId) {
      try {
        await notificationAPI.sendAchievement(userId, 'challengeCompleted', {
          challengeId: 'challenge123',
          score: 100
        });
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }
  };

  return <button onClick={handleChallengeComplete}>Completar</button>;
}
```

### Exemplo 2: Notificação de Streak

```javascript
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { notificationAPI } from '../services/apiService';
import { loadNotificationSettings } from '../services/notificationService';

function StreakComponent() {
  const { userId, mode, stats } = useSelector(state => state.user);
  const streak = stats?.streak?.current || 0;

  useEffect(() => {
    const checkStreak = async () => {
      if (mode === 'guest' || !userId || streak === 0) return;

      const settings = await loadNotificationSettings(userId);
      
      if (settings?.streakReminders?.enabled) {
        // Lógica para verificar se precisa enviar notificação
        const daysSinceActivity = /* calcular */;
        
        if (daysSinceActivity === 1) {
          await notificationAPI.sendStreak(userId, streak);
        }
      }
    };

    checkStreak();
  }, [userId, mode, streak]);

  return <div>Streak: {streak} dias</div>;
}
```

## 🐛 Tratamento de Erros

O serviço trata automaticamente:
- Usuário não autenticado
- Token expirado (tenta obter novo token)
- Erros de rede
- Erros da API

**Exemplo de tratamento:**

```javascript
try {
  await notificationAPI.sendAchievement(userId, 'levelUp', { level: 10 });
} catch (error) {
  if (error.message.includes('não autenticado')) {
    // Redirecionar para login
  } else if (error.message.includes('Token')) {
    // Token expirado, tentar novamente
  } else {
    // Outro erro
    console.error('Erro ao enviar notificação:', error);
  }
}
```

## 🔐 Autenticação

O serviço automaticamente:
1. Verifica se o usuário está autenticado
2. Obtém o token Firebase atualizado
3. Adiciona o token no header `Authorization`
4. Trata erros de autenticação

**Não é necessário** fazer isso manualmente em cada chamada.

## 📊 Tipos de Notificações Disponíveis

1. **achievement** - Conquistas (levelUp, xpMilestone, challengeCompleted)
2. **streak** - Lembretes de sequência
3. **inactivity** - Notificações de inatividade
4. **daily** - Lembretes diários
5. **weeklyChallenge** - Desafios semanais
6. **friendActivity** - Atividades de amigos
7. **review** - Lembretes de revisão
8. **custom** - Notificações personalizadas

## ✅ Checklist de Integração

- [x] Serviço de API criado
- [x] Hook de notificações criado
- [x] Integração no LevelUpModal
- [ ] Integração em outros eventos (desafios, streaks, etc.)
- [ ] Testes de integração
- [ ] Tratamento de erros em produção

## 🚨 Notas Importantes

1. **Apenas usuários autenticados** podem enviar notificações
2. **Usuários guest** são ignorados silenciosamente
3. **Erros não bloqueiam** a UI (são logados apenas)
4. **Verifica configurações** do usuário antes de enviar
5. **Token é atualizado** automaticamente se expirado

## 📚 Documentação Adicional

- [Backend API Docs](../learnfun-backend/FCM_API_DOCS.md)
- [Authentication Guide](../learnfun-backend/AUTHENTICATION.md)

