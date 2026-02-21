/**
 * Context que combina jogos estáticos (rodadas 1-4) com calendário da API TheSportsDB.
 * Rodadas 5+ vêm da API; falha na API usa apenas dados estáticos.
 * Cache em localStorage para carregamento imediato e atualização em segundo plano.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Match } from '@/types';
import { generateMatches, getCurrentRound as getStaticCurrentRound, TOTAL_ROUNDS } from '@/data/matches';
import { fetchMatchesFromApi } from '@/lib/matchesApi';

const MATCHES_STORAGE_KEY = 'bolao_matches';

type MatchesContextType = {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  refreshMatches: () => Promise<void>;
  getCurrentRound: (currentTime?: number) => number;
  getUpcomingMatches: (limit?: number, currentTime?: number) => Match[];
  getUpcomingMatchesByRound: (currentTime?: number) => Map<number, Match[]>;
  getMatchesByRound: (round: number) => Match[];
  getMatchById: (id: string) => Match | undefined;
};

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

function reviveMatch(key: string, value: unknown): unknown {
  if (typeof value === 'string' && key === 'date') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d;
  }
  return value;
}

function loadMatchesFromStorage(): Match[] | null {
  try {
    const stored = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored, reviveMatch);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as Match[];
  } catch {
    return null;
  }
}

function saveMatchesToStorage(matches: Match[]) {
  try {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
  } catch {
    // ignore
  }
}

/** Mescla jogos estáticos com os da API: por rodada, prefere API se existir */
function mergeMatches(staticMatches: Match[], apiMatches: Match[]): Match[] {
  const apiRounds = new Set(apiMatches.map((m) => m.round));
  const result: Match[] = [];

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    const roundMatches = apiRounds.has(round)
      ? apiMatches.filter((m) => m.round === round)
      : staticMatches.filter((m) => m.round === round);
    result.push(...roundMatches);
  }

  return result.sort((a, b) => {
    const tA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
    const tB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
    return tA - tB;
  });
}

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(() => {
    const cached = loadMatchesFromStorage();
    return cached ?? generateMatches();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMatches = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    const cached = loadMatchesFromStorage();
    if (cached && cached.length > 0) {
      setMatches(cached);
    }

    const staticMatches = generateMatches();
    try {
      const apiMatches = await fetchMatchesFromApi();
      const merged =
        apiMatches.length > 0 ? mergeMatches(staticMatches, apiMatches) : staticMatches;
      setMatches(merged);
      saveMatchesToStorage(merged);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao buscar jogos');
      setMatches(cached && cached.length > 0 ? cached : staticMatches);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  const getCurrentRound = useCallback(
    (currentTime: number = Date.now()) => {
      if (matches.length === 0) return getStaticCurrentRound(currentTime);
      const sorted = [...matches].sort((a, b) => {
        const tA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
        const tB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
        return tA - tB;
      });
      const firstFuture = sorted.find((m) => {
        const t = (m.date instanceof Date ? m.date : new Date(m.date)).getTime();
        return t > currentTime;
      });
      if (firstFuture) return firstFuture.round;
      const lastMatch = sorted[sorted.length - 1];
      if (!lastMatch) return 1;
      const lastDate = (lastMatch.date instanceof Date ? lastMatch.date : new Date(lastMatch.date)).getTime();
      const lastRound = lastMatch.round;
      const MS_PER_DAY = 24 * 60 * 60 * 1000;
      const daysSince = (currentTime - lastDate) / MS_PER_DAY;
      const roundsAfter = Math.floor(daysSince / 7);
      return Math.min(lastRound + 1 + roundsAfter, TOTAL_ROUNDS);
    },
    [matches]
  );

  const getUpcomingMatches = useCallback(
    (limit = 10, currentTime = Date.now()) => {
      const currentRound = getCurrentRound(currentTime);
      return matches
        .filter((match) => {
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
    },
    [matches, getCurrentRound]
  );

  const getUpcomingMatchesByRound = useCallback(
    (currentTime = Date.now()) => {
      const currentRound = getCurrentRound(currentTime);
      const byRound = new Map<number, Match[]>();
      matches
        .filter((match) => {
          if (match.status !== 'scheduled' || match.round < currentRound) return false;
          const matchDate = match.date instanceof Date ? match.date : new Date(match.date);
          return matchDate.getTime() > currentTime;
        })
        .sort((a, b) => {
          const dateA = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
          const dateB = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
          return dateA - dateB;
        })
        .forEach((match) => {
          const list = byRound.get(match.round) ?? [];
          list.push(match);
          byRound.set(match.round, list);
        });
      return byRound;
    },
    [matches, getCurrentRound]
  );

  const getMatchesByRound = useCallback(
    (round: number) => matches.filter((m) => m.round === round),
    [matches]
  );

  const getMatchById = useCallback(
    (id: string) => matches.find((m) => m.id === id),
    [matches]
  );

  const value = useMemo(
    () => ({
      matches,
      isLoading,
      error,
      refreshMatches,
      getCurrentRound,
      getUpcomingMatches,
      getUpcomingMatchesByRound,
      getMatchesByRound,
      getMatchById,
    }),
    [
      matches,
      isLoading,
      error,
      refreshMatches,
      getCurrentRound,
      getUpcomingMatches,
      getUpcomingMatchesByRound,
      getMatchesByRound,
      getMatchById,
    ]
  );

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
}

export function useMatchesContext() {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatchesContext must be used within a MatchesProvider');
  }
  return context;
}
