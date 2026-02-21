import type { Match } from '@/types';
import { teams } from './teams';

// Horários reais do Brasileirão Série A 2026 - CBF / Agência Brasil
type MatchConfig = { home: string; away: string; stadium: string; day: number; month: number; hour: number; minute: number };

const round1Config: MatchConfig[] = [
  { home: 'Atlético-MG', away: 'Palmeiras', stadium: 'Arena MRV', day: 28, month: 0, hour: 19, minute: 0 },
  { home: 'Internacional', away: 'Athletico-PR', stadium: 'Beira-Rio', day: 28, month: 0, hour: 19, minute: 0 },
  { home: 'Coritiba', away: 'Red Bull Bragantino', stadium: 'Couto Pereira', day: 28, month: 0, hour: 19, minute: 0 },
  { home: 'Vitória', away: 'Clube do Remo', stadium: 'Barradão', day: 28, month: 0, hour: 19, minute: 0 },
  { home: 'Fluminense', away: 'Grêmio', stadium: 'Maracanã', day: 28, month: 0, hour: 19, minute: 30 },
  { home: 'Mirassol', away: 'Vasco da Gama', stadium: 'José Maria de Campos Maia', day: 28, month: 0, hour: 20, minute: 0 },
  { home: 'Chapecoense', away: 'Santos', stadium: 'Arena Condá', day: 28, month: 0, hour: 20, minute: 0 },
  { home: 'São Paulo', away: 'Flamengo', stadium: 'Morumbi', day: 28, month: 0, hour: 21, minute: 30 },
  { home: 'Corinthians', away: 'Bahia', stadium: 'Neo Química Arena', day: 29, month: 0, hour: 20, minute: 30 },
  { home: 'Botafogo', away: 'Cruzeiro', stadium: 'Nilton Santos', day: 29, month: 0, hour: 21, minute: 30 },
];

const round2Config: MatchConfig[] = [
  { home: 'Flamengo', away: 'Internacional', stadium: 'Maracanã', day: 4, month: 1, hour: 19, minute: 0 },
  { home: 'Red Bull Bragantino', away: 'Atlético-MG', stadium: 'Nabi Abi Chedid', day: 4, month: 1, hour: 19, minute: 0 },
  { home: 'Santos', away: 'São Paulo', stadium: 'Vila Belmiro', day: 4, month: 1, hour: 20, minute: 0 },
  { home: 'Clube do Remo', away: 'Mirassol', stadium: 'Mangueirão', day: 4, month: 1, hour: 19, minute: 0 },
  { home: 'Palmeiras', away: 'Coritiba', stadium: 'Allianz Parque', day: 4, month: 1, hour: 21, minute: 30 },
  { home: 'Athletico-PR', away: 'Chapecoense', stadium: 'Arena da Baixada', day: 4, month: 1, hour: 19, minute: 0 },
  { home: 'Vasco da Gama', away: 'Vitória', stadium: 'São Januário', day: 5, month: 1, hour: 20, minute: 0 },
  { home: 'Bahia', away: 'Botafogo', stadium: 'Fonte Nova', day: 5, month: 1, hour: 19, minute: 0 },
  { home: 'Cruzeiro', away: 'Fluminense', stadium: 'Mineirão', day: 5, month: 1, hour: 21, minute: 30 },
  { home: 'Grêmio', away: 'Corinthians', stadium: 'Arena do Grêmio', day: 5, month: 1, hour: 21, minute: 30 },
];

const round3Config: MatchConfig[] = [
  { home: 'Mirassol', away: 'Cruzeiro', stadium: 'José Maria de Campos Maia', day: 11, month: 1, hour: 19, minute: 0 },
  { home: 'Chapecoense', away: 'Coritiba', stadium: 'Arena Condá', day: 11, month: 1, hour: 19, minute: 0 },
  { home: 'Atlético-MG', away: 'Clube do Remo', stadium: 'Arena MRV', day: 11, month: 1, hour: 20, minute: 0 },
  { home: 'Vasco da Gama', away: 'Bahia', stadium: 'São Januário', day: 11, month: 1, hour: 21, minute: 30 },
  { home: 'São Paulo', away: 'Grêmio', stadium: 'Morumbi', day: 11, month: 1, hour: 21, minute: 30 },
  { home: 'Flamengo', away: 'Palmeiras', stadium: 'Maracanã', day: 11, month: 1, hour: 21, minute: 30 },
  { home: 'Internacional', away: 'Santos', stadium: 'Beira-Rio', day: 11, month: 1, hour: 19, minute: 0 },
  { home: 'Red Bull Bragantino', away: 'Vitória', stadium: 'Nabi Abi Chedid', day: 11, month: 1, hour: 19, minute: 0 },
  { home: 'Botafogo', away: 'Athletico-PR', stadium: 'Nilton Santos', day: 12, month: 1, hour: 19, minute: 30 },
  { home: 'Fluminense', away: 'Corinthians', stadium: 'Maracanã', day: 12, month: 1, hour: 21, minute: 30 },
];

// Rodada 4 - 24, 25 e 26 de Fevereiro 2026 (CBF)
const round4Config: MatchConfig[] = [
  { home: 'Botafogo', away: 'Vitória', stadium: 'Nilton Santos', day: 24, month: 1, hour: 19, minute: 0 },
  { home: 'Bahia', away: 'Chapecoense', stadium: 'Fonte Nova', day: 24, month: 1, hour: 19, minute: 0 },
  { home: 'Flamengo', away: 'Mirassol', stadium: 'Maracanã', day: 24, month: 1, hour: 21, minute: 30 },
  { home: 'Clube do Remo', away: 'Internacional', stadium: 'Mangueirão', day: 25, month: 1, hour: 19, minute: 0 },
  { home: 'Red Bull Bragantino', away: 'Athletico-PR', stadium: 'Nabi Abi Chedid', day: 25, month: 1, hour: 19, minute: 0 },
  { home: 'Cruzeiro', away: 'Corinthians', stadium: 'Mineirão', day: 25, month: 1, hour: 20, minute: 0 },
  { home: 'Grêmio', away: 'Atlético-MG', stadium: 'Arena do Grêmio', day: 25, month: 1, hour: 21, minute: 30 },
  { home: 'Palmeiras', away: 'Fluminense', stadium: 'Allianz Parque', day: 25, month: 1, hour: 21, minute: 30 },
  { home: 'Santos', away: 'Vasco da Gama', stadium: 'Vila Belmiro', day: 26, month: 1, hour: 19, minute: 0 },
  { home: 'Coritiba', away: 'São Paulo', stadium: 'Couto Pereira', day: 26, month: 1, hour: 21, minute: 30 },
];

/** Total de rodadas no Brasileirão Série A */
export const TOTAL_ROUNDS = 38;


function buildMatch(config: MatchConfig, roundIndex: number, matchIndex: number): Match {
  const homeTeam = teams.find(t => t.name === config.home) || teams[0];
  const awayTeam = teams.find(t => t.name === config.away) || teams[1];
  const date = new Date(2026, config.month, config.day, config.hour, config.minute, 0, 0);

  return {
    id: `match-${roundIndex + 1}-${matchIndex + 1}`,
    homeTeam,
    awayTeam,
    date,
    stadium: config.stadium,
    round: roundIndex + 1,
    status: 'scheduled'
  };
}

export const generateMatches = (): Match[] => {
  const allConfigs = [round1Config, round2Config, round3Config, round4Config];
  const matches: Match[] = [];
  allConfigs.forEach((round, roundIndex) => {
    round.forEach((config, matchIndex) => {
      matches.push(buildMatch(config, roundIndex, matchIndex));
    });
  });
  return matches;
};

export const matches = generateMatches();

/** Rodada atual: primeiro jogo futuro, ou calculada quando todas as rodadas cadastradas já passaram */
export function getCurrentRound(currentTime: number = Date.now()): number {
  const sorted = [...matches].sort((a, b) => {
    const tA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
    const tB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
    return tA - tB;
  });
  const firstFuture = sorted.find(m => {
    const t = (m.date instanceof Date ? m.date : new Date(m.date)).getTime();
    return t > currentTime;
  });
  if (firstFuture) return firstFuture.round;

  const lastMatch = sorted[sorted.length - 1];
  if (!lastMatch) return 1;
  const lastDate = (lastMatch.date instanceof Date ? lastMatch.date : new Date(lastMatch.date)).getTime();
  const lastRound = lastMatch.round;
  const daysSince = (currentTime - lastDate) / (24 * 60 * 60 * 1000);
  const roundsAfter = Math.floor(daysSince / 7);
  return Math.min(lastRound + 1 + roundsAfter, TOTAL_ROUNDS);
}

/** Rodada atual (para compatibilidade com import estático) */
export const CURRENT_ROUND = getCurrentRound();

export const getMatchesByRound = (round: number): Match[] => {
  return matches.filter(match => match.round === round);
};

export const getMatchById = (id: string): Match | undefined => {
  return matches.find(m => m.id === id);
};

/** Jogos a partir da rodada atual que ainda não começaram */
export const getUpcomingMatches = (
  limit: number = 10,
  currentTime: number = Date.now()
): Match[] => {
  const currentRound = getCurrentRound(currentTime);
  return matches
    .filter(match => {
      if (match.status !== 'scheduled' || match.round < currentRound) return false;
      const matchDate = match.date instanceof Date ? match.date : new Date(match.date);
      return matchDate.getTime() > currentTime;
    })
    .sort((a, b) => {
      const dateA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
      const dateB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
      return dateA - dateB;
    })
    .slice(0, limit);
};

/** Jogos agrupados por rodada (a partir da rodada atual) */
export const getUpcomingMatchesByRound = (
  currentTime: number = Date.now()
): Map<number, Match[]> => {
  const currentRound = getCurrentRound(currentTime);
  const byRound = new Map<number, Match[]>();
  matches
    .filter(match => {
      if (match.status !== 'scheduled' || match.round < currentRound) return false;
      const matchDate = match.date instanceof Date ? match.date : new Date(match.date);
      return matchDate.getTime() > currentTime;
    })
    .sort((a, b) => {
      const dateA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
      const dateB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
      return dateA - dateB;
    })
    .forEach(match => {
      const list = byRound.get(match.round) ?? [];
      list.push(match);
      byRound.set(match.round, list);
    });
  return byRound;
};
