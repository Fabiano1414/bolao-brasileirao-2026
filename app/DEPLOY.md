# Configuração para deploy (Vercel, Netlify, etc.)

## Comandos rápidos (na raiz do projeto)

```bash
# Firebase: publicar regras do Firestore (após editar app/firestore.rules)
npm run deploy:firebase

# Vercel: deploy manual (opcional — normalmente basta git push)
npm run vercel:deploy
```

**Vercel:** Conectado ao GitHub — cada `git push origin main` dispara deploy automático.

**Firebase:** Após alterar `app/firestore.rules`, rode `npm run deploy:firebase`.

---

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

## Variáveis de ambiente (produção) — **OBRIGATÓRIO PARA DADOS ENTRE NAVEGADORES**

Sem o Firebase configurado na Vercel, o app usa **localStorage** — os dados ficam só no navegador onde foram criados. Em outro navegador ou dispositivo, aparece vazio.

**Como corrigir:** Vercel → seu projeto → **Settings** → **Environment Variables**

Adicione todas estas variáveis (copie do seu `.env` local):

| Variável | Exemplo |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `seu-projeto` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `seu-projeto.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:...` |
| `VITE_FIREBASE_VAPID_KEY` | *(opcional, para push)* |

**Depois de salvar**, faça um novo deploy (ou aguarde o automático).

---

## Firebase: domínio autorizado

Após o deploy, adicione o domínio em:
**Firebase Console** → **Authentication** → **Settings** → **Authorized domains**

Ex.: `seu-app.vercel.app` ou `seu-dominio.com`
