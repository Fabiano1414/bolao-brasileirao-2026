# Configuração para deploy (Vercel, Netlify, etc.)

## Diretório raiz / Root Directory

```
app
```

*(O projeto fica na pasta `app` dentro do repositório.)*

---

## Comandos

| Campo | Valor |
|-------|-------|
| **Root Directory** | `app` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

## Variáveis de ambiente (produção)

Adicione no painel do seu provedor de hospedagem:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=  # Push: Firebase Console > Cloud Messaging > Web Push
```

*(Copie os valores do seu `.env` local.)*

---

## Firebase: domínio autorizado

Após o deploy, adicione o domínio em:
**Firebase Console** → **Authentication** → **Settings** → **Authorized domains**

Ex.: `seu-app.vercel.app` ou `seu-dominio.com`
