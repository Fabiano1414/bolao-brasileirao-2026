import type { Pool, LeaderboardEntry } from '@/types';
import { matches } from './matches';

export const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', avatar: undefined, points: 245, createdAt: new Date('2026-01-15') },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', avatar: undefined, points: 312, createdAt: new Date('2026-01-20') },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', avatar: undefined, points: 189, createdAt: new Date('2026-02-01') },
  { id: '4', name: 'Ana Paula', email: 'ana@email.com', avatar: undefined, points: 278, createdAt: new Date('2026-02-10') },
  { id: '5', name: 'Carlos Eduardo', email: 'carlos@email.com', avatar: undefined, points: 156, createdAt: new Date('2026-02-15') }
];

// Bolões de exemplo - Brasileirão Série A 2026
export const mockPools: Pool[] = [
  {
    id: '1',
    name: 'Bolão Série A 2026 - Trabalho',
    description: 'Bolão entre colegas para acompanhar o Campeonato Brasileiro Série A 2026. 38 rodadas, quem acertar mais leva!',
    ownerId: '1',
    owner: mockUsers[0],
    members: [
      { id: '1', userId: '1', user: mockUsers[0], poolId: '1', points: 245, rank: 2, joinedAt: new Date('2026-01-25') },
      { id: '2', userId: '2', user: mockUsers[1], poolId: '1', points: 312, rank: 1, joinedAt: new Date('2026-01-25') },
      { id: '3', userId: '3', user: mockUsers[2], poolId: '1', points: 189, rank: 3, joinedAt: new Date('2026-01-26') }
    ],
    matches: matches.slice(0, 10),
    isPrivate: true,
    code: 'SERIE2026',
    createdAt: new Date('2026-01-20'),
    endsAt: new Date('2026-12-02'),
    prize: 'R$ 500,00',
    status: 'active'
  },
  {
    id: '2',
    name: 'Brasileirão 2026 - Família',
    description: 'Bolão em família para a temporada 2026. Flamengo, Palmeiras, São Paulo... quem vai levantar a taça?',
    ownerId: '2',
    owner: mockUsers[1],
    members: [
      { id: '4', userId: '2', user: mockUsers[1], poolId: '2', points: 278, rank: 1, joinedAt: new Date('2026-01-28') },
      { id: '5', userId: '4', user: mockUsers[3], poolId: '2', points: 245, rank: 2, joinedAt: new Date('2026-01-28') },
      { id: '6', userId: '5', user: mockUsers[4], poolId: '2', points: 156, rank: 3, joinedAt: new Date('2026-01-29') }
    ],
    matches: matches.slice(0, 10),
    isPrivate: true,
    code: 'FAM2026',
    createdAt: new Date('2026-01-25'),
    endsAt: new Date('2026-12-02'),
    prize: 'R$ 300,00',
    status: 'active'
  },
  {
    id: '3',
    name: 'Liga Nacional - Brasileirão 2026',
    description: 'Bolão aberto! Participe do maior campeonato de clubes do Brasil. 20 times, 38 rodadas. Grande prêmio!',
    ownerId: '3',
    owner: mockUsers[2],
    members: [
      { id: '7', userId: '3', user: mockUsers[2], poolId: '3', points: 189, rank: 1, joinedAt: new Date('2026-02-01') },
      { id: '8', userId: '1', user: mockUsers[0], poolId: '3', points: 156, rank: 2, joinedAt: new Date('2026-02-02') },
      { id: '9', userId: '4', user: mockUsers[3], poolId: '3', points: 134, rank: 3, joinedAt: new Date('2026-02-02') },
      { id: '10', userId: '5', user: mockUsers[4], poolId: '3', points: 98, rank: 4, joinedAt: new Date('2026-02-03') }
    ],
    matches: matches.slice(0, 15),
    isPrivate: false,
    createdAt: new Date('2026-01-28'),
    endsAt: new Date('2026-12-02'),
    prize: 'R$ 1.000,00',
    status: 'active'
  },
  {
    id: '4',
    name: 'Bolão da Galera - Série A',
    description: 'Bolão do grupo de amigos. Chapecoense, Coritiba, Clube do Remo e Athletico-PR voltaram! Vai ser boa a temporada 2026.',
    ownerId: '4',
    owner: mockUsers[3],
    members: [
      { id: '11', userId: '4', user: mockUsers[3], poolId: '4', points: 312, rank: 1, joinedAt: new Date('2026-02-05') },
      { id: '12', userId: '2', user: mockUsers[1], poolId: '4', points: 289, rank: 2, joinedAt: new Date('2026-02-05') },
      { id: '13', userId: '3', user: mockUsers[2], poolId: '4', points: 245, rank: 3, joinedAt: new Date('2026-02-06') }
    ],
    matches: matches.slice(0, 8),
    isPrivate: true,
    code: 'GALERA26',
    createdAt: new Date('2026-02-01'),
    endsAt: new Date('2026-12-02'),
    prize: 'Churrasco na casa do campeão',
    status: 'active'
  }
];

export const leaderboard: LeaderboardEntry[] = [
  { user: mockUsers[1], points: 312, correctScores: 15, correctResults: 28, rank: 1 },
  { user: mockUsers[3], points: 278, correctScores: 12, correctResults: 26, rank: 2 },
  { user: mockUsers[0], points: 245, correctScores: 10, correctResults: 25, rank: 3 },
  { user: mockUsers[2], points: 189, correctScores: 8, correctResults: 19, rank: 4 },
  { user: mockUsers[4], points: 156, correctScores: 6, correctResults: 16, rank: 5 }
];

export const getPoolById = (id: string): Pool | undefined => {
  return mockPools.find(pool => pool.id === id);
};

export const getUserPools = (userId: string): Pool[] => {
  return mockPools.filter(pool =>
    pool.ownerId === userId || pool.members.some(member => member.userId === userId)
  );
};

export const getPublicPools = (): Pool[] => {
  return mockPools.filter(pool => !pool.isPrivate);
};
