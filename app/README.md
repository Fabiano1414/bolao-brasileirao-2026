# Bolão Brasileirão 2026

App de bolão para o Campeonato Brasileiro Série A. Crie bolões, faça palpites e dispute o ranking com amigos.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

## Funcionalidades

- **PWA** — Instalável no celular/computador, cache offline
- **Push notifications** — Lembretes e atualizações (Firebase + VAPID)
- **Responsivo** — Layout otimizado para mobile (nav sempre visível, modais scrolláveis)
- **Autenticação** — Login e registro (localStorage ou Firebase)
- **Bolões** — Crie bolões públicos ou privados, entre com código
- **Palpites** — Aposte no placar de cada jogo (fechamento 5 min antes)
- **Resultados automáticos** — Sincronização com TheSportsDB API
- **Ranking** — 3 pts placar exato, 1 pt resultado correto
- **Perfil** — Histórico, conquistas e estatísticas
- **Admin** — Painel para gerenciar usuários e resultados

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **yarn**

## Instalação

```bash
# Clone o repositório (se ainda não tiver)
git clone https://github.com/Fabiano1414/bolao-brasileirao-2025.git
cd bolao-brasileirao-2025/app

# Instale as dependências
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O app abre em **http://localhost:5173**. O navegador é aberto automaticamente.

## Build

```bash
npm run build
```

Saída em `dist/`. Para preview local:

```bash
npm run preview
```

## Regras de pontuação

| Acerto              | Pontos |
|---------------------|--------|
| Placar exato        | 3 pts  |
| Resultado correto   | 1 pt   |
| (vitória/empate)    |        |
| Errado              | 0 pts  |

**Regra:** Palpites são bloqueados 5 minutos antes do início do jogo.

## Configuração

### Modo local (padrão)

Sem configuração. Usa `localStorage` para usuários, bolões e palpites.

### Firebase (produção)

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Copie `.env.example` para `.env`
3. Preencha as variáveis:

```env
VITE_FIREBASE_API_KEY=sua-chave
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Push (Firebase Console > Cloud Messaging > Web Push certificates)
VITE_FIREBASE_VAPID_KEY=sua-chave-vapid
```

### Admin

Adicione seus emails em `src/lib/adminConfig.ts`:

```ts
export const ADMIN_EMAILS: string[] = [
  'seu-email@gmail.com',
];
```

## Deploy (Vercel / Netlify)

| Configuração   | Valor           |
|----------------|-----------------|
| **Root Directory** | `app`       |
| **Build Command**  | `npm run build` |
| **Output Directory** | `dist`   |

1. Conecte o repositório ao Vercel ou Netlify
2. Defina **Root Directory** como `app`
3. Adicione as variáveis de ambiente do Firebase
4. Após o deploy, autorize o domínio no Firebase Console → **Authentication** → **Settings** → **Authorized domains**

Ver `DEPLOY.md` para detalhes. Para enviar push (Cloud Function): `PUSH_NOTIFICATIONS.md`.

## Scripts

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Servidor de desenvolvimento   |
| `npm run build`| Build de produção            |
| `npm run preview` | Preview do build local    |
| `npm run lint` | Verificação ESLint           |
| `npm run test` | Testes (Vitest)              |
| `npm run test:run` | Testes uma vez            |

## Estrutura principal

```
app/
├── src/
│   ├── components/    # Componentes React (modais, UI)
│   ├── sections/      # Seções da página (Hero, Navigation, etc.)
│   ├── context/       # PoolsContext, MatchesContext
│   ├── hooks/         # useAuth
│   ├── lib/           # Firebase, APIs, utilitários
│   ├── data/          # Dados estáticos (times, jogos)
│   └── types/         # Tipos TypeScript
├── index.html
├── package.json
└── vite.config.ts
```

## PWA (instalar no celular)

O app é um Progressive Web App. No mobile:
1. Abra no Chrome/Safari
2. Toque em **"Adicionar à tela inicial"** ou **"Instalar app"**
3. O ícone aparece na home e abre em tela cheia

Cache offline: assets e API (TheSportsDB) são cacheados para uso sem internet.

## API (jogos e resultados)

- **TheSportsDB** — Calendário e resultados do Brasileirão (gratuita)
- Sincronização automática na carga e a cada 10 minutos

## Licença

Projeto privado.
