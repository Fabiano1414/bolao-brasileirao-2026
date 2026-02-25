/**
 * Simulação de dados para testes no modo admin.
 * Cria usuários, bolões, palpites e resultados de jogos.
 * Senha padrão para todos os usuários simulados: "123456"
 */

import type { User, Pool, PoolMember, Prediction, Match } from '@/types';
import { hashPassword } from '@/lib/passwordHash';
import { generateMatches } from '@/data/matches';

const USERS_STORAGE_KEY = 'bolao_users';
const POOLS_STORAGE_KEY = 'bolao_pools';
const PREDICTIONS_STORAGE_KEY = 'bolao_predictions';
const MATCH_RESULTS_STORAGE_KEY = 'bolao_match_results';
const MATCHES_STORAGE_KEY = 'bolao_matches';

type StoredUser = User & { passwordHash?: string; passwordSalt?: string };

const SIM_USER_NAMES = [
  'João Teste',
  'Maria Simulação',
  'Pedro Bolão',
  'Ana Apostadora',
  'Carlos Campeão',
  'Fernanda Flamenguista',
  'Lucas Palmeirense',
];

const SIM_POOL_NAMES = [
  { name: 'Bolão da Galera', description: 'Amigos do trabalho', isPrivate: true },
  { name: 'Grupo da Família', description: 'Tio, prima e afins', isPrivate: true },
  { name: 'Mega Bolão 2026', description: 'Todo mundo pode entrar. Participe!', isPrivate: false },
];

/** Placar plausível (0-4) para simulação */
function randomScore(): number {
  return Math.floor(Math.random() * 5);
}

/** Gera um palpite variado: às vezes exato, às vezes resultado, às vezes errado */
function randomPrediction(): { homeScore: number; awayScore: number } {
  return { homeScore: randomScore(), awayScore: randomScore() };
}

/** Resultados realistas para os primeiros jogos (variedade para testar pontos) */
const SAMPLE_RESULTS: Array<[number, number]> = [
  [2, 1], [1, 0], [0, 0], [3, 2], [1, 1], [0, 2], [2, 0], [1, 2], [3, 1], [2, 2],
  [0, 1], [1, 3], [2, 1], [0, 0], [1, 0], [3, 0], [1, 1], [0, 2], [2, 0], [1, 2],
];

export interface SimulateResult {
  usersCreated: number;
  poolsCreated: number;
  predictionsCreated: number;
  resultsSet: number;
  simulatedUserEmails: string[];
}

export async function runDataSimulation(): Promise<SimulateResult> {
  const result: SimulateResult = {
    usersCreated: 0,
    poolsCreated: 0,
    predictionsCreated: 0,
    resultsSet: 0,
    simulatedUserEmails: [],
  };

  const { hash, salt } = await hashPassword('123456');
  const matches: Match[] = (() => {
    try {
      const stored = localStorage.getItem(MATCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored, (key, val) =>
          key === 'date' ? new Date(val) : val
        );
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return generateMatches();
  })();

  const round1And2Matches = matches.filter((m) => m.round <= 2);
  const matchesWithResults = round1And2Matches.slice(0, Math.min(12, round1And2Matches.length));
  const matchesForPredictions = matches.filter((m) => m.round <= 3);

  if (matchesForPredictions.length === 0) {
    throw new Error('Nenhum jogo disponível para simulação. Verifique o cache de jogos.');
  }

  // 1. Criar usuários simulados
  const existingUsers = loadUsers();
  const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));
  const newUsers: StoredUser[] = [];
  const userCount = Math.min(5, SIM_USER_NAMES.length);

  for (let i = 0; i < userCount; i++) {
    const email = `teste${i + 1}@simulacao.local`;
    if (existingEmails.has(email)) continue;

    const user: StoredUser = {
      id: `sim-user-${Date.now()}-${i}`,
      name: SIM_USER_NAMES[i],
      email,
      points: 0,
      createdAt: new Date(),
      passwordHash: hash,
      passwordSalt: salt,
    };
    newUsers.push(user);
    existingUsers.push(user);
    existingEmails.add(email);
    result.simulatedUserEmails.push(email);
  }
  result.usersCreated = newUsers.length;
  if (newUsers.length > 0) {
    saveUsers(existingUsers);
  }

  const allSimUsers = [...existingUsers.filter((u) => u.email.endsWith('@simulacao.local')), ...newUsers];
  const usersForPools = allSimUsers.length >= 2 ? allSimUsers : [...existingUsers, ...newUsers];
  const toUser = (u: StoredUser): User => {
    const { passwordHash, passwordSalt, ...rest } = u;
    return rest;
  };

  if (usersForPools.length < 2) {
    return result;
  }

  // 2. Criar bolões
  const existingPools = loadPools();
  const poolCount = Math.min(3, SIM_POOL_NAMES.length);
  const createdPools: Pool[] = [];

  for (let i = 0; i < poolCount; i++) {
    const config = SIM_POOL_NAMES[i];
    const owner = usersForPools[i % usersForPools.length];
    const ownerUser = toUser(owner as StoredUser);
    const poolId = `sim-pool-${Date.now()}-${i}`;

    const members: PoolMember[] = [];
    const participantIds = new Set<string>([owner.id]);
    members.push({
      id: `member-${poolId}-${owner.id}`,
      userId: owner.id,
      user: ownerUser,
      poolId,
      points: 0,
      rank: 1,
      joinedAt: new Date(),
    });

    // Adicionar 2–4 participantes por bolão
    const numExtra = Math.min(4, usersForPools.length - 1);
    let added = 0;
    for (const u of usersForPools) {
      if (added >= numExtra) break;
      if (participantIds.has(u.id)) continue;
      participantIds.add(u.id);
      const uClean = toUser(u as StoredUser);
      members.push({
        id: `member-${poolId}-${u.id}`,
        userId: u.id,
        user: uClean,
        poolId,
        points: 0,
        rank: members.length + 1,
        joinedAt: new Date(),
      });
      added++;
    }

    const pool: Pool = {
      id: poolId,
      name: config.name,
      description: config.description,
      ownerId: owner.id,
      owner: ownerUser,
      members,
      matches: matchesForPredictions.slice(0, 15),
      isPrivate: config.isPrivate,
      predictionsPrivate: true,
      code: config.isPrivate ? `SIM${Math.random().toString(36).substring(2, 6).toUpperCase()}` : undefined,
      createdAt: new Date(),
      endsAt: new Date('2026-12-02'),
      status: 'active',
    };
    createdPools.push(pool);
    existingPools.push(pool);
    result.poolsCreated++;
  }

  if (createdPools.length > 0) {
    savePools(existingPools);
  }

  // 3. Definir resultados para jogos das rodadas 1–2
  const existingResults = loadMatchResults();
  matchesWithResults.forEach((match, idx) => {
    const [h, a] = SAMPLE_RESULTS[idx % SAMPLE_RESULTS.length];
    existingResults[match.id] = { homeScore: h, awayScore: a };
    result.resultsSet++;
  });
  saveMatchResults(existingResults);

  // 4. Criar palpites (garantir alguns acertos para o ranking aparecer)
  const existingPredictions = loadPredictions();
  const newPredictions: Prediction[] = [];
  const resultsById = new Map<string, [number, number]>();
  matchesWithResults.forEach((m, idx) => {
    resultsById.set(m.id, SAMPLE_RESULTS[idx % SAMPLE_RESULTS.length]);
  });

  for (const pool of createdPools) {
    const members = pool.members;
    for (const match of matchesForPredictions.slice(0, 12)) {
      const result = resultsById.get(match.id);
      const [resH, resA] = result ?? [-1, -1];

      members.forEach((member, memberIdx) => {
        const existing = existingPredictions.some(
          (p) => p.poolId === pool.id && p.userId === member.userId && p.matchId === match.id
        );
        if (existing) return;

        let homeScore: number;
        let awayScore: number;

        // Garantir acertos: 1º e 2º membro acertam placar exato, 3º acerta resultado
        if (result && memberIdx === 0) {
          homeScore = resH;
          awayScore = resA;
        } else if (result && memberIdx === 1) {
          homeScore = resH;
          awayScore = resA;
        } else if (result && memberIdx === 2) {
          if (resH === resA) {
            homeScore = resH;
            awayScore = resA;
          } else {
            homeScore = resH > resA ? 1 : 0;
            awayScore = resH > resA ? 0 : 1;
          }
        } else {
          const r = randomPrediction();
          homeScore = r.homeScore;
          awayScore = r.awayScore;
        }

        newPredictions.push({
          id: `pred-${pool.id}-${match.id}-${member.userId}`,
          poolId: pool.id,
          userId: member.userId,
          matchId: match.id,
          homeScore,
          awayScore,
          createdAt: new Date(),
        });
      });
    }
  }

  result.predictionsCreated = newPredictions.length;
  if (newPredictions.length > 0) {
    savePredictions([...existingPredictions, ...newPredictions]);
  }

  return result;
}

function loadUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((u: StoredUser & { createdAt: string }) => ({
            ...u,
            createdAt: new Date(u.createdAt),
          }))
        : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function loadPools(): Pool[] {
  try {
    const stored = localStorage.getItem(POOLS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored, (k, v) =>
        ['createdAt', 'endsAt', 'joinedAt', 'date'].includes(k) ? new Date(v) : v
      );
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function savePools(pools: Pool[]) {
  localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(pools));
}

function loadPredictions(): Prediction[] {
  try {
    const stored = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((p: Prediction & { createdAt: string }) => ({
            ...p,
            createdAt: new Date(p.createdAt),
          }))
        : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function savePredictions(predictions: Prediction[]) {
  localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
}

function loadMatchResults(): Record<string, { homeScore: number; awayScore: number }> {
  try {
    const stored = localStorage.getItem(MATCH_RESULTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    }
  } catch {
    // ignore
  }
  return {};
}

function saveMatchResults(results: Record<string, { homeScore: number; awayScore: number }>) {
  localStorage.setItem(MATCH_RESULTS_STORAGE_KEY, JSON.stringify(results));
}
