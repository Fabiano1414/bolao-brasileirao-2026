# Como fazer o app funcionar (dados compartilhados)

Siga estes passos **na ordem**.

---

## 1. Pegar as variáveis do Firebase

1. Acesse https://console.firebase.google.com
2. Selecione o projeto **bolaobrasileirao2026**
3. Clique no ícone ⚙️ → **Project settings**
4. Role até **Your apps**
5. Se não houver app Web: clique em **</> Add app** → Web → registre (nome qualquer)
6. Copie o objeto `firebaseConfig` que aparece

---

## 2. Adicionar na Vercel

1. Acesse https://vercel.com
2. Abra o projeto **bolao-brasileirao-2026**
3. **Settings** → **Environment Variables**
4. Para cada variável abaixo, clique **Add** e preencha:

| Nome (copie exato) | Valor (do Firebase) | Ambientes |
|-------------------|---------------------|-----------|
| VITE_FIREBASE_API_KEY | apiKey | ☑ Production ☑ Preview |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain | ☑ Production ☑ Preview |
| VITE_FIREBASE_PROJECT_ID | projectId | ☑ Production ☑ Preview |
| VITE_FIREBASE_STORAGE_BUCKET | storageBucket | ☑ Production ☑ Preview |
| VITE_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId | ☑ Production ☑ Preview |
| VITE_FIREBASE_APP_ID | appId | ☑ Production ☑ Preview |

5. **Marque Production E Preview** em cada uma
6. Clique **Save**

---

## 3. Verificar Root Directory

1. Vercel → **Settings** → **General**
2. Em **Root Directory**, deve estar: `app`
3. Se estiver vazio ou diferente, corrija para `app` e salve

---

## 4. Fazer deploy

1. **Deployments** → clique no ⋮ do último deploy
2. **Redeploy**
3. Opcional: marque **Clear cache and redeploy** se já tentou antes
4. Aguarde o build terminar

---

## 5. Conferir nos logs do build

Durante o build, aparecerá algo como:

```
[Firebase env]
  VITE_FIREBASE_API_KEY: ✓
  VITE_FIREBASE_PROJECT_ID: ✓
  ...
  → Firebase ativado
```

Se aparecer **✗ MISSING** em alguma variável, ela não foi carregada. Volte ao passo 2.

---

## 6. Autorizar o domínio no Firebase

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Clique **Add domain**
3. Adicione: `bolao-brasileirao-2026.vercel.app`
4. E também: `*.vercel.app` (se a Vercel usar subdomínios)

---

## 7. Testar

1. Abra o app em **janela anônima** (para evitar cache)
2. Se o banner amarelo **não** aparecer → funcionou!
3. Crie um bolão, abra em outro dispositivo/navegador → deve aparecer

---

## Ainda com problema?

- No app, clique em **Ver diagnóstico** no banner
- Mostre quais variáveis estão com ✗
- Verifique os logs do build na Vercel (Deployments → último → Building → procure [Firebase env])
