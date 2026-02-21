import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Pool, Prediction, User } from '@/types';
import { mockPools, getPoolById } from '@/data/pools';
import { useMatchesContext } from '@/context/MatchesContext';

const PREDICTIONS_STORAGE_KEY = 'bolao_predictions';
const MATCH_RESULTS_STORAGE_KEY = 'bolao_match_results';
const POOLS_STORAGE_KEY = 'bolao_pools';

/** Pontos: placar exato | resultado (vitória/empate) | errado */
export const POINTS_EXACT = 5;
export const POINTS_RESULT = 3;

type MatchResult = { homeScore: number; awayScore: number };

interface PoolsContextType {
  pools: Pool[];
  isLoading: boolean;
  createPool: (poolData: Partial<Pool>) => Promise<Pool>;
  joinPool: (poolId: string, user: User, code?: string) => Promise<boolean>;
  leavePool: (poolId: string, userId: string) => boolean;
  deletePool: (poolId: string, userId: string) => boolean;
  getPool: (id: string) => Pool | undefined;
  getUserPoolsList: (userId: string) => Pool[];
  getPublicPoolsList: () => Pool[];
  savePrediction: (poolId: string, userId: string, matchId: string, homeScore: number, awayScore: number) => void;
  getUserPrediction: (poolId: string, userId: string, matchId: string) => { homeScore: number; awayScore: number } | undefined;
  matchResults: Record<string, MatchResult>;
  setMatchResult: (matchId: string, homeScore: number, awayScore: number) => void;
  getMatchResult: (matchId: string) => MatchResult | undefined;
  syncResultsFromApi: () => Promise<{ count: number }>;
  getPredictionPoints: (poolId: string, userId: string, matchId: string) => number | undefined;
  getGlobalLeaderboard: (limit?: number) => Array<{
    user: User;
    points: number;
    exactScores: number;
    correctResults: number;
    poolName: string;
    rank: number;
  }>;
  getUserPredictionHistory: (userId: string) => Array<{
    homeTeam: string;
    awayTeam: string;
    round: number;
    prediction: { homeScore: number; awayScore: number };
    result: { homeScore: number; awayScore: number };
    points: number;
    poolName: string;
  }>;
}

const PoolsContext = createContext<PoolsContextType | undefined>(undefined);

function loadPredictionsFromStorage(): Prediction[] {
  try {
    const stored = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map((p: Prediction & { createdAt: string }) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      })) : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function savePredictionsToStorage(predictions: Prediction[]) {
  localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
}

function loadMatchResultsFromStorage(): Record<string, MatchResult> {
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

function saveMatchResultsToStorage(results: Record<string, MatchResult>) {
  localStorage.setItem(MATCH_RESULTS_STORAGE_KEY, JSON.stringify(results));
}

function reviveDate(key: string, value: unknown): unknown {
  if (typeof value === 'string' && (key === 'createdAt' || key === 'endsAt' || key === 'joinedAt' || key === 'date')) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return value;
}

function loadPoolsFromStorage(): Pool[] {
  try {
    const stored = localStorage.getItem(POOLS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored, reviveDate);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function savePoolsToStorage(pools: Pool[]) {
  localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(pools));
}

function calculatePointsForPrediction(
  pred: { homeScore: number; awayScore: number },
  result: MatchResult
): number {
  if (pred.homeScore === result.homeScore && pred.awayScore === result.awayScore) return POINTS_EXACT;
  const predSign = Math.sign(pred.homeScore - pred.awayScore);
  const resultSign = Math.sign(result.homeScore - result.awayScore);
  return predSign === resultSign ? POINTS_RESULT : 0;
}

export function PoolsProvider({ children }: { children: ReactNode }) {
  const { getUpcomingMatches, matches, getMatchById } = useMatchesContext();
  const [pools, setPools] = useState<Pool[]>(() => {
    try {
      const loaded = loadPoolsFromStorage();
      if (Array.isArray(loaded) && loaded.length > 0) return loaded;
    } catch {
      // dados corrompidos - usa mock
    }
    return mockPools;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>(loadPredictionsFromStorage);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>(loadMatchResultsFromStorage);

  useEffect(() => {
    savePredictionsToStorage(predictions);
  }, [predictions]);

  useEffect(() => {
    saveMatchResultsToStorage(matchResults);
  }, [matchResults]);

  useEffect(() => {
    savePoolsToStorage(pools);
  }, [pools]);

  const getMatchResult = useCallback((matchId: string) => matchResults[matchId], [matchResults]);

  /** Resultado efetivo: matchResults ou scores embutidos no Match (API) */
  const getEffectiveMatchResult = useCallback(
    (matchId: string): MatchResult | undefined => {
      const stored = matchResults[matchId];
      if (stored) return stored;
      const m = getMatchById(matchId);
      if (m?.homeScore != null && m?.awayScore != null) {
        return { homeScore: m.homeScore, awayScore: m.awayScore };
      }
      return undefined;
    },
    [matchResults, getMatchById]
  );

  const recalculateAllPools = useCallback(() => {
    setPools(prev => prev.map(pool => {
      const memberPoints: Record<string, number> = {};
      predictions
        .filter(p => p.poolId === pool.id)
        .forEach(pred => {
          const result = getEffectiveMatchResult(pred.matchId);
          if (result) {
            const pts = calculatePointsForPrediction(pred, result);
            memberPoints[pred.userId] = (memberPoints[pred.userId] ?? 0) + pts;
          }
        });
      const updatedMembers = pool.members.map(m => ({
        ...m,
        points: memberPoints[m.userId] ?? 0
      }));
      const sorted = [...updatedMembers].sort((a, b) => b.points - a.points);
      return {
        ...pool,
        members: sorted.map((m, i) => ({ ...m, rank: i + 1 }))
      };
    }));
  }, [predictions, getEffectiveMatchResult]);

  useEffect(() => {
    recalculateAllPools();
  }, [recalculateAllPools]);

  const createPool = async (poolData: Partial<Pool>): Promise<Pool> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const owner = poolData.owner || mockPools[0].owner;
    const poolId = Date.now().toString();
    const newPool: Pool = {
      id: poolId,
      name: poolData.name || 'Novo Bolão',
      description: poolData.description || '',
      ownerId: poolData.ownerId || owner.id,
      owner,
      members: poolData.members ?? [{
        id: `member-${poolId}`,
        userId: owner.id,
        user: owner,
        poolId,
        points: 0,
        rank: 1,
        joinedAt: new Date()
      }],
      matches: poolData.matches ?? getUpcomingMatches(10),
      isPrivate: poolData.isPrivate ?? true,
      code: poolData.isPrivate ? Math.random().toString(36).substring(2, 10).toUpperCase() : undefined,
      createdAt: new Date(),
      endsAt: poolData.endsAt || new Date('2026-12-02'),
      prize: poolData.prize,
      status: 'active'
    };

    setPools(prev => [newPool, ...prev]);
    setIsLoading(false);
    return newPool;
  };

  const joinPool = async (poolId: string, user: User, code?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const pool = pools.find(p => p.id === poolId) ?? getPoolById(poolId);
    if (!pool) {
      setIsLoading(false);
      return false;
    }

    if (pool.isPrivate && pool.code !== code) {
      setIsLoading(false);
      return false;
    }

    const alreadyMember = pool.members.some(m => m.userId === user.id);
    if (!alreadyMember) {
      const newMember = {
        id: `member-${poolId}-${user.id}`,
        userId: user.id,
        user,
        poolId,
        points: 0,
        rank: pool.members.length + 1,
        joinedAt: new Date()
      };
      setPools(prev => prev.map(p =>
        p.id === poolId
          ? { ...p, members: [...p.members, newMember] }
          : p
      ));
    }

    setIsLoading(false);
    return true;
  };

  const leavePool = (poolId: string, userId: string): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || pool.ownerId === userId) return false;

    setPools(prev => prev.map(p => {
      if (p.id !== poolId) return p;
      const newMembers = p.members.filter(m => m.userId !== userId);
      const sorted = [...newMembers].sort((a, b) => b.points - a.points);
      return {
        ...p,
        members: sorted.map((m, i) => ({ ...m, rank: i + 1 }))
      };
    }));

    setPredictions(prev => prev.filter(p => !(p.poolId === poolId && p.userId === userId)));
    return true;
  };

  const deletePool = (poolId: string, userId: string): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || pool.ownerId !== userId) return false;

    setPools(prev => prev.filter(p => p.id !== poolId));
    setPredictions(prev => prev.filter(p => p.poolId !== poolId));
    return true;
  };

  const getPool = (id: string): Pool | undefined => {
    return pools.find(p => p.id === id) ?? getPoolById(id);
  };

  const getUserPoolsList = (userId: string): Pool[] => {
    return pools.filter(pool =>
      pool.ownerId === userId || pool.members.some(m => m.userId === userId)
    );
  };

  const getPublicPoolsList = (): Pool[] => {
    return pools.filter(pool => !pool.isPrivate);
  };

  const savePrediction = useCallback((poolId: string, userId: string, matchId: string, homeScore: number, awayScore: number) => {
    setPredictions(prev => {
      const filtered = prev.filter(p => !(p.poolId === poolId && p.matchId === matchId && p.userId === userId));
      return [...filtered, {
        id: `pred-${poolId}-${matchId}-${userId}`,
        poolId,
        userId,
        matchId,
        homeScore,
        awayScore,
        createdAt: new Date()
      }];
    });
  }, []);

  const getUserPrediction = useCallback((poolId: string, userId: string, matchId: string) => {
    const p = predictions.find(x => x.poolId === poolId && x.matchId === matchId && x.userId === userId);
    return p ? { homeScore: p.homeScore, awayScore: p.awayScore } : undefined;
  }, [predictions]);

  const setMatchResult = useCallback((matchId: string, homeScore: number, awayScore: number) => {
    setMatchResults(prev => ({ ...prev, [matchId]: { homeScore, awayScore } }));
  }, []);

  const syncResultsFromApi = useCallback(async (): Promise<{ count: number }> => {
    try {
      const { fetchMatchResultsFromApi } = await import('@/lib/matchResultsApi');
      const results = await fetchMatchResultsFromApi(matches);
      if (results.length === 0) return { count: 0 };
      setMatchResults(prev => {
        const next = { ...prev };
        results.forEach(r => {
          next[r.matchId] = { homeScore: r.homeScore, awayScore: r.awayScore };
        });
        return next;
      });
      return { count: results.length };
    } catch {
      return { count: 0 };
    }
  }, [matches]);

  const getPredictionPoints = useCallback(
    (poolId: string, userId: string, matchId: string) => {
      const pred = predictions.find(p => p.poolId === poolId && p.userId === userId && p.matchId === matchId);
      const result = getEffectiveMatchResult(matchId);
      if (!pred || !result) return undefined;
      return calculatePointsForPrediction(pred, result);
    },
    [predictions, getEffectiveMatchResult]
  );

  const getGlobalLeaderboard = useCallback((limit = 10) => {
    const userBest = new Map<string, { member: (typeof pools)[0]['members'][0]; poolName: string }>();
    pools.forEach(pool => {
      pool.members.forEach(member => {
        const current = userBest.get(member.userId);
        if (!current || member.points > current.member.points) {
          userBest.set(member.userId, { member, poolName: pool.name });
        }
      });
    });

    const withStats = Array.from(userBest.values()).map(({ member, poolName }) => {
      let exactScores = 0;
      let correctResults = 0;
      predictions
        .filter(p => p.userId === member.userId && p.poolId === member.poolId)
        .forEach(pred => {
          const result = getEffectiveMatchResult(pred.matchId);
          if (result) {
            const pts = calculatePointsForPrediction(pred, result);
            if (pts >= POINTS_EXACT) exactScores++;
            if (pts >= POINTS_RESULT) correctResults++;
          }
        });
      return {
        user: member.user,
        points: member.points,
        exactScores,
        correctResults,
        poolName,
        rank: 0
      };
    });

    return withStats
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [pools, predictions, getEffectiveMatchResult]);

  const getUserPredictionHistory = useCallback(
    (userId: string) => {
      const history: Array<{
        homeTeam: string;
        awayTeam: string;
        round: number;
        prediction: { homeScore: number; awayScore: number };
        result: { homeScore: number; awayScore: number };
        points: number;
        poolName: string;
      }> = [];
      const userPreds = predictions.filter(p => p.userId === userId);
      for (const pred of userPreds) {
        const result = getEffectiveMatchResult(pred.matchId);
        if (!result) continue;
        const match = getMatchById(pred.matchId);
        const pool = pools.find(p => p.id === pred.poolId);
        if (!match || !pool) continue;
        const pts = calculatePointsForPrediction(pred, result);
        history.push({
          homeTeam: match.homeTeam.displayName ?? match.homeTeam.name,
          awayTeam: match.awayTeam.displayName ?? match.awayTeam.name,
          round: match.round,
          prediction: { homeScore: pred.homeScore, awayScore: pred.awayScore },
          result,
          points: pts,
          poolName: pool.name,
        });
      }
      return history.sort((a, b) => b.round - a.round);
    },
    [predictions, getEffectiveMatchResult, getMatchById, pools]
  );

  const value: PoolsContextType = {
    pools,
    isLoading,
    createPool,
    joinPool,
    leavePool,
    deletePool,
    getPool,
    getUserPoolsList,
    getPublicPoolsList,
    savePrediction,
    getUserPrediction,
    matchResults,
    setMatchResult,
    getMatchResult,
    syncResultsFromApi,
    getPredictionPoints,
    getGlobalLeaderboard,
    getUserPredictionHistory
  };

  return (
    <PoolsContext.Provider value={value}>
      {children}
    </PoolsContext.Provider>
  );
}

export function usePoolsContext() {
  const context = useContext(PoolsContext);
  if (context === undefined) {
    throw new Error('usePoolsContext must be used within a PoolsProvider');
  }
  return context;
}
