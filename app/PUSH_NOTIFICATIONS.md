# Push Notifications

O app usa Firebase Cloud Messaging (FCM) para enviar notificações ao usuário.

## Configuração

1. **Firebase Console** → Project Settings → Cloud Messaging
2. Em **Web Push certificates**, clique em **Generate key pair**
3. Copie a chave e adicione no `.env`:

```env
VITE_FIREBASE_VAPID_KEY=sua-chave-vapid
```

4. O usuário ativa no **Perfil** → botão "Ativar" em Notificações

## Enviar notificações (Cloud Function)

O token FCM é salvo em `users/{uid}/fcmToken`. Use uma Cloud Function para enviar:

```js
const admin = require('firebase-admin');

exports.sendReminder = functions.pubsub
  .schedule('0 18 * * *') // Todo dia às 18h
  .onRun(async () => {
    const db = admin.firestore();
    const users = await db.collection('users').get();
    const messaging = admin.messaging();
    
    for (const doc of users.docs) {
      const { fcmToken } = doc.data();
      if (!fcmToken) continue;
      await messaging.send({
        token: fcmToken,
        notification: {
          title: 'Jogos de hoje!',
          body: 'Faça seus palpites antes que fechem.',
        },
        data: { url: '/' },
      });
    }
  });
```

## Foreground vs background

- **Foreground** (app aberto): mostra toast via `onMessage`
- **Background** (app minimizado/fechado): requer service worker com handler FCM. Atualmente o PWA sw não inclui o handler em background — notificações funcionam quando o app está aberto.
