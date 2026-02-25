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

## Variáveis de ambiente (produção) — **OBRIGATÓRIO PARA DADOS COMPARTILHADOS**

Sem o Firebase configurado na Vercel, o app usa **localStorage** — cada aba, janela anônima ou dispositivo vê dados **isolados**. Bolões criados por um usuário não aparecem para outros.

**Como corrigir:** Vercel → seu projeto → **Settings** → **Environment Variables**

⚠️ **Marque o ambiente "Production"** ao adicionar cada variável. Se marcar apenas Preview, o deploy de produção continuará sem Firebase.

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

**Depois de salvar**, faça um novo deploy: **Deployments** → ⋮ no último deploy → **Redeploy**.

**Como verificar:** Após o deploy, se aparecer o banner amarelo "Modo local" no topo do app, as variáveis não foram carregadas.

---

## Banner amarelo continua? Checklist

1. **Ambiente correto** — Ao criar cada variável, marque **Production** e **Preview**. URLs com hash (ex: `-jne8vizrk-`) são Preview; se só Production estiver marcado, o Preview não terá as variáveis.
2. **Nomes exatos** — Use exatamente:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. **Redeploy** — Após salvar as variáveis: Deployments → ⋮ no último deploy → **Redeploy**.
4. **Modo local manual** — Se você clicou em "Firebase com problemas? Usar modo local" no app, isso gravou uma flag no navegador. Teste em **janela anônima** ou limpe os dados do site (F12 → Application → Local Storage → limpar).

---

## Firebase: domínio autorizado

Após o deploy, adicione o domínio em:
**Firebase Console** → **Authentication** → **Settings** → **Authorized domains**

Ex.: `seu-app.vercel.app` ou `seu-dominio.com`
