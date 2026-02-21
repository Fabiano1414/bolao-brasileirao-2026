export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  rank?: number;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  /** Nome curto para exibir nos cards (evita quebra em 2 linhas) */
  displayName?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  stadium: string;
  round: number;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
}

export interface Prediction {
  id: string;
  poolId: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
  createdAt: Date;
}

export interface Pool {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  owner: User;
  members: PoolMember[];
  matches: Match[];
  isPrivate: boolean;
  code?: string;
  createdAt: Date;
  endsAt: Date;
  prize?: string;
  status: 'active' | 'finished' | 'cancelled';
}

export interface PoolMember {
  id: string;
  userId: string;
  user: User;
  poolId: string;
  points: number;
  rank: number;
  joinedAt: Date;
}

export interface LeaderboardEntry {
  user: User;
  points: number;
  correctScores: number;
  correctResults: number;
  rank: number;
}
