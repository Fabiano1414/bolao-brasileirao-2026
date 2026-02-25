# Variáveis de ambiente para Vercel

Copie estas variáveis no painel da Vercel: **Settings** → **Environment Variables**.

Onde pegar os valores: **Firebase Console** → seu projeto (`bolaobrasileirao2026`) → ícone de engrenagem → **Project settings** → aba **General** → role até **Your apps** → selecione o app Web ou clique em **Add app** → Web.

---

## Obrigatórias (para dados compartilhados)

| Nome na Vercel | Onde pegar no Firebase |
|----------------|------------------------|
| `VITE_FIREBASE_API_KEY` | Config → apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | Config → authDomain |
| `VITE_FIREBASE_PROJECT_ID` | Config → projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | Config → storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Config → messagingSenderId |
| `VITE_FIREBASE_APP_ID` | Config → appId |

---

## Opcional (push notifications)

| Nome na Vercel | Onde pegar |
|----------------|------------|
| `VITE_FIREBASE_VAPID_KEY` | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Key pair |

---

## Exemplo (substitua pelos seus valores reais)

```
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=bolaobrasileirao2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bolaobrasileirao2026
VITE_FIREBASE_STORAGE_BUCKET=bolaobrasileirao2026.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

**Importante:**
- Ao criar cada variável, marque **Production** e **Preview** (se você abre URLs como `bolao-brasileirao-2026-xxx.vercel.app`, é Preview).
- Depois de salvar, faça **Redeploy** (Deployments → ⋮ → Redeploy). Pode usar "Clear cache and redeploy" se ainda não funcionar.
