# Firebase Cloud Messaging (FCM) - Guia de Configuração

## 📋 Pré-requisitos

1. **Firebase Project configurado** com Cloud Messaging habilitado
2. **VAPID Key** gerada no Firebase Console
3. **Variáveis de ambiente** configuradas

## 🔧 Configuração

### 1. Obter VAPID Key

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem) > **Cloud Messaging**
4. Na seção **Web configuration**, clique em **Generate key pair**
5. Copie a chave gerada (formato: `BK...`)

### 2. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
VITE_FIREBASE_VAPID_KEY=SUA_VAPID_KEY_AQUI
```

### 3. Estrutura de Dados no Firestore

O sistema cria automaticamente uma coleção `fcm_tokens` com a seguinte estrutura:

```javascript
{
  userId: "user123",
  token: "fcm_token_aqui",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  platform: "Win32",
  userAgent: "Mozilla/5.0..."
}
```

## 📤 Enviar Notificações Push

### Opção 1: Firebase Console (Teste)

1. Acesse **Cloud Messaging** no Firebase Console
2. Clique em **Send test message**
3. Cole o FCM token do usuário
4. Configure título, corpo e clique em **Test**

### Opção 2: Cloud Functions (Produção)

Exemplo de função para enviar notificações:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendNotification = functions.https.onCall(async (data, context) => {
  const { userId, title, body, data: notificationData } = data;
  
  // Busca token do usuário
  const tokenDoc = await admin.firestore()
    .collection('fcm_tokens')
    .doc(userId)
    .get();
  
  if (!tokenDoc.exists || !tokenDoc.data().token) {
    throw new functions.https.HttpsError('not-found', 'Token não encontrado');
  }
  
  const token = tokenDoc.data().token;
  
  // Envia notificação
  const message = {
    notification: {
      title,
      body
    },
    data: notificationData || {},
    token
  };
  
  try {
    await admin.messaging().send(message);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao enviar notificação');
  }
});
```

### Opção 3: Backend Customizado

Use a [FCM REST API](https://firebase.google.com/docs/cloud-messaging/send-message) ou SDK do Firebase Admin.

## 🔍 Verificar Status

1. Abra o app e faça login
2. Vá em **Configurações** > **Notificações**
3. Verifique o status de **Push Notifications (FCM)**
4. Deve mostrar "Ativo" se tudo estiver configurado corretamente

## 🐛 Troubleshooting

### Token não é gerado

- Verifique se `VITE_FIREBASE_VAPID_KEY` está configurado
- Verifique se o Service Worker está registrado
- Verifique se as permissões de notificação foram concedidas
- Abra o console do navegador e verifique erros

### Notificações não chegam

- Verifique se o token está salvo no Firestore (`fcm_tokens` collection)
- Verifique se o payload está no formato correto
- Verifique os logs do Service Worker (Application > Service Workers > Console)

### Erro "Firebase Messaging não é suportado"

- Verifique se está usando HTTPS ou localhost
- Verifique se o navegador suporta Service Workers
- Verifique se o Firebase está configurado corretamente

## 📚 Recursos

- [Documentação FCM](https://firebase.google.com/docs/cloud-messaging)
- [FCM Web Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

