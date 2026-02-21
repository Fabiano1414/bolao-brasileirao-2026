# Análise Completa — Bolão Brasileirão 2026

## Resumo
App React + Vite + TypeScript para bolões do Campeonato Brasileiro Série A 2026. Dados em `localStorage`, sem backend. API TheSportsDB para jogos e resultados.

---

## O que já está implementado

- **Autenticação** (mock): login/registro com qualquer email/senha, persistência em `localStorage`
- **Bolões**: criar, entrar (código), sair, excluir
- **Palpites**: salvar por jogo e bolão
- **Resultados**: manual e via API (TheSportsDB)
- **Ranking**: cálculo de pontos (5 exato, 3 resultado)
- **Jogos**: estáticos (rodadas 1–4) + API (rodadas 5+)
- **Cache**: jogos em `localStorage` para carregamento mais rápido
- **Perfil**: nome, foto, dados básicos
- **Convite**: link `?pool=ID&code=XXX`

---

## O que ainda precisa ser implementado

### Alta prioridade

| Item | Descrição |
|------|-----------|
| **1. Autenticação real** | Login ignora senha; registro cria usuário local. Falta backend (Firebase, Supabase, Auth0) e validação de credenciais. |
| **2. Perfil — stats reais** | `ProfileModal` usa `leaderboard` estático de `pools.ts`. Deveria usar `getGlobalLeaderboard()` do `PoolsContext`. |
| **3. Perfil — histórico real** | Histórico de palpites está fixo (Palmeiras 2x1, etc.). Deveria listar palpites reais do usuário com pontos ganhos. |
| **4. Perfil — conquistas dinâmicas** | Badges fixos. Deveria desbloquear conforme feitos (1º lugar, 10 placares exatos, etc.). |
| **5. Backend** | Tudo em `localStorage`. Para produção é necessário backend (API) para bolões, usuários, palpites. |

### Média prioridade

| Item | Descrição |
|------|-----------|
| **6. Estatísticas reais** | Números (10K usuários, R$50K prêmios) são fixos. Deveriam vir de dados reais ou API. |
| **7. "Ver Todos os Jogos"** | Hoje só faz scroll para a mesma seção. Falta tela/modal com calendário completo. |
| **8. Validação de formulários** | Login/registro sem validação (email, senha forte). Usar Zod + react-hook-form. |
| **9. Recuperação de senha** | Não implementado. |
| **10. Gravatar** | `lib/gravatar.ts` existe mas não é usado. Avatar poderia cair back para Gravatar quando não houver foto. |
| **11. Regra "5 min antes"** | Mencionada na UI, mas palpites ainda podem ser feitos após o jogo começar. |
| **12. Testes** | Sem testes unitários/integração no código do app. |

### Baixa prioridade

| Item | Descrição |
|------|-----------|
| **13. README do projeto** | README genérico do Vite. Falta instruções específicas do bolão. |
| **14. PWA / offline** | Não configurado. |
| **15. i18n** | Sem suporte a outros idiomas. |
| **16. Acessibilidade** | Poucos `aria-*` e roles explícitos. |
| **17. SEO** | Meta tags básicas; falta Open Graph, schema, etc. |

---

## Dados mock vs reais

| Dado | Fonte atual | Observação |
|------|-------------|------------|
| Usuários | `mockUsers` + `localStorage` | Login/registro cria usuário local |
| Bolões | `mockPools` iniciais + `localStorage` | Usuário cria bolões reais |
| Jogos | `matches.ts` (rodadas 1–4) + TheSportsDB (5+) | Parcialmente real |
| Resultados | TheSportsDB + manual | Parcialmente real |
| Ranking | Calculado a partir de palpites + resultados | Real |
| Leaderboard global | `leaderboard` estático em `pools.ts` | Usado só em ProfileModal; TopRanking usa `getGlobalLeaderboard()` |
| Estatísticas da home | Valores fixos (10K, R$50K, etc.) | Mock |
| Testimonials | Array estático | Mock |
| Histórico do perfil | Lista fixa de 3 jogos | Mock |
| Conquistas | 3 badges estáticos | Mock |

---

## Sugestão de ordem de implementação

1. **Perfil com dados reais** — `getGlobalLeaderboard()` e histórico de palpites
2. **Validação de formulários** — Zod + react-hook-form em login/registro
3. **Regra "fechamento 5 min antes"** — bloquear palpite após isso
4. **Tela "Ver Todos os Jogos"** — modal ou página com calendário completo
5. **Backend** — quando for levar a produção (Firebase/Supabase/API própria)
6. **Autenticação real** — integração com provider escolhido
7. **Testes** — início com componentes e fluxos principais

---

## Arquivos relevantes para as pendências

| Pendência | Arquivo(s) |
|-----------|------------|
| Perfil stats | `ProfileModal.tsx`, `PoolsContext.tsx` |
| Histórico real | `ProfileModal.tsx`, `PoolsContext.tsx` |
| Validação | `Hero.tsx`, `useAuth.ts` |
| Gravatar | `UserAvatar.tsx`, `gravatar.ts` |
| "Ver Todos Jogos" | `NextMatches.tsx`, `App.tsx` |
| Regra 5 min | `MatchCard.tsx`, `NextMatches.tsx` |

---

*Análise gerada em fevereiro de 2026*
