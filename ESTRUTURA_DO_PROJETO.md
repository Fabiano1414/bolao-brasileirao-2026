# Estrutura do repositório

```
bolao-brasileirao-2025/          ← Raiz do repositório Git
│
├── app/                         ← Pasta principal do app (use como Root no Vercel)
│   ├── index.html               ← HTML principal
│   ├── package.json             ← Dependências e scripts
│   ├── vite.config.ts           ← Config do Vite
│   ├── tailwind.config.js
│   ├── firestore.rules          ← Regras do Firestore
│   ├── .env                     ← Variáveis Firebase (não vai pro Git)
│   ├── .env.example
│   ├── DEPLOY.md
│   ├── FIREBASE_ERROS_COMUNS.md
│   │
│   └── src/
│       ├── main.tsx             ← Entrada do app React
│       ├── App.tsx              ← App principal
│       ├── index.css
│       │
│       ├── components/          ← Componentes React
│       │   ├── modals/          (CreatePoolModal, PoolDetailsModal, ProfileModal, etc.)
│       │   ├── ui/              (Button, Input, etc. + custom/)
│       │   └── ErrorBoundary.tsx
│       │
│       ├── sections/            ← Seções da página
│       │   ├── Hero.tsx         (Login/Registro)
│       │   ├── Navigation.tsx
│       │   ├── MyPools.tsx
│       │   ├── FeaturedPools.tsx
│       │   ├── TopRanking.tsx
│       │   └── ...
│       │
│       ├── context/              ← Contextos React
│       │   ├── PoolsContext.tsx
│       │   └── MatchesContext.tsx
│       │
│       ├── hooks/
│       │   └── useAuth.ts        ← Autenticação
│       │
│       ├── lib/                  ← Utilitários e APIs
│       │   ├── firebase.ts
│       │   ├── firebaseAuth.ts
│       │   ├── matchesApi.ts
│       │   └── ...
│       │
│       ├── data/                 ← Dados estáticos
│       └── types/                ← Tipos TypeScript
│
├── deploy-git.ps1               ← Script de deploy
└── ESTRUTURA_DO_PROJETO.md      ← Este arquivo
```

## Para deploy (Vercel, Netlify, etc.)

| Configuração | Valor |
|--------------|-------|
| **Root Directory** | `app` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

O código do app está em **`app/`**. A pasta `app` contém o `package.json`, `src/`, `index.html` e tudo que o Vite precisa para fazer o build.
