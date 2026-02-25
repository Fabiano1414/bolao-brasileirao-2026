import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Pool, Prediction, User } from '@/types';
import { initialPools } from '@/data/pools';
import { useMatchesContext } from '@/context/MatchesContext';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  subscribePools as firestoreSubscribePools,
  subscribePredictions as firestoreSubscribePredictions,
  subscribeMatchResults as firestoreSubscribeMatchResults,
  fetchPoolsOnce as firestoreFetchPoolsOnce,
  fetchPredictionsOnce as firestoreFetchPredictionsOnce,
  fetchMatchResultsOnce as firestoreFetchMatchResultsOnce,
  createPoolInFirestore,
  updatePoolInFirestore,
  updatePoolMembersInFirestore,
  deletePoolInFirestore,
  savePredictionInFirestore,
  deletePredictionInFirestore,
  deletePredictionsByUserAndPool,
  setMatchResultInFirestore,
  setMatchResultsBatchInFirestore,
} from '@/lib/firestorePools';

const PREDICTIONS_STORAGE_KEY = 'bolao_predictions';
const MATCH_RESULTS_STORAGE_KEY = 'bolao_match_results';
const POOLS_STORAGE_KEY = 'bolao_pools';

/** Pontos: placar exato | resultado (vitória/empate) | errado */
export const POINTS_EXACT = 3;
export const POINTS_RESULT = 1;

type MatchResult = { homeScore: number; awayScore: number };

interface PoolsContextType {
  pools: Pool[];
  isLoading: boolean;
  createPool: (poolData: Partial<Pool>) => Promise<Pool>;
  updatePool: (poolId: string, userId: string, updates: Partial<Pick<Pool, 'name' | 'description' | 'prize' | 'isPrivate'>>) => boolean;
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
  adminDeletePool: (poolId: string) => boolean;
  adminUpdatePool: (poolId: string, updates: Partial<Pick<Pool, 'name' | 'description' | 'prize' | 'isPrivate' | 'code'>>) => boolean;
  adminUpdateMemberUser: (userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>) => void;
  adminDeleteUserData: (userId: string) => void;
  adminRemoveUserFromPool: (poolId: string, userId: string) => boolean;
  adminDeletePrediction: (predictionId: string) => boolean;
  adminGetAllPredictions: () => Prediction[];
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

/** Nomes de bolões legados/mock que não devem ser exibidos (apenas bolões criados pelo usuário) */
const LEGACY_MOCK_POOL_PATTERNS = [
  /brazilian\s+national\s+league/i,
  /liga\s+nacional(\s*[-–]\s*brasileir[aã]o)?/i,
  /liga\s+nacional\s+brasileira/i,
  /national\s+league\s+\d{4}/i,
  /brazilian\s+(serie|série)\s+a\s+\d{4}/i,
];

function isLegacyMockPool(pool: Pool): boolean {
  const name = (pool.name || '').trim();
  return LEGACY_MOCK_POOL_PATTERNS.some((pattern) => pattern.test(name));
}

function loadPoolsFromStorage(): Pool[] {
  try {
    const stored = localStorage.getItem(POOLS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored, reviveDate);
      const raw = Array.isArray(parsed) ? parsed : [];
      return raw.filter((p: Pool) => !isLegacyMockPool(p));
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

function getInitialPoolsLocal(): Pool[] {
  try {
    const loaded = loadPoolsFromStorage();
    if (Array.isArray(loaded) && loaded.length > 0) return loaded;
  } catch {
    // dados corrompidos — começa vazio
  }
  return initialPools;
}

export function PoolsProvider({ children }: { children: ReactNode }) {
  const { useFirebase, user } = useAuth();
  const { getUpcomingMatches, matches, getMatchById, isLoading: matchesLoading } = useMatchesContext();

  const [pools, setPools] = useState<Pool[]>(() =>
    isFirebaseConfigured() ? [] : getInitialPoolsLocal()
  );
  const [predictions, setPredictions] = useState<Prediction[]>(() =>
    isFirebaseConfigured() ? [] : loadPredictionsFromStorage()
  );
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult>>(() =>
    isFirebaseConfigured() ? {} : loadMatchResultsFromStorage()
  );
  const [isLoading, setIsLoading] = useState(false);
  const notifyOtherTabsRef = useRef<() => void>(() => {});

  // Firestore: real-time subscriptions — só quando usuário autenticado (regras exigem request.auth)
  useEffect(() => {
    if (!useFirebase || !user) {
      if (useFirebase && !user) {
        setPools([]);
        setPredictions([]);
        setMatchResults({});
      }
      return;
    }
    const addMatches = (pool: Pool) => ({ ...pool, matches: getUpcomingMatches(10) });
    const onPools = (pools: Pool[]) => setPools(pools.filter(p => !isLegacyMockPool(p)));
    const unsubPools = firestoreSubscribePools(addMatches, onPools);
    const unsubPreds = firestoreSubscribePredictions(setPredictions);
    const unsubResults = firestoreSubscribeMatchResults(setMatchResults);

    const syncFromFirestore = async () => {
      try {
        const [p, preds, results] = await Promise.all([
          firestoreFetchPoolsOnce(addMatches),
          firestoreFetchPredictionsOnce(),
          firestoreFetchMatchResultsOnce(),
        ]);
        setPools(p.filter((po) => !isLegacyMockPool(po)));
        setPredictions(preds);
        setMatchResults(results);
      } catch {
        // ignore
      }
    };
    const onVisible = () => void syncFromFirestore();
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(syncFromFirestore, 15_000);

    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel('bolao-brasileirao-sync')
        : null;
    const onChannelMessage = () => void syncFromFirestore();
    channel?.addEventListener('message', onChannelMessage);
    notifyOtherTabsRef.current = () => channel?.postMessage('sync');

    return () => {
      unsubPools();
      unsubPreds();
      unsubResults();
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
      channel?.removeEventListener('message', onChannelMessage);
      notifyOtherTabsRef.current = () => {};
    };
  }, [useFirebase, user, getUpcomingMatches]);

  useEffect(() => {
    if (useFirebase) return;
    savePredictionsToStorage(predictions);
  }, [useFirebase, predictions]);

  useEffect(() => {
    if (useFirebase) return;
    saveMatchResultsToStorage(matchResults);
  }, [useFirebase, matchResults]);

  useEffect(() => {
    if (useFirebase) return;
    savePoolsToStorage(pools);
  }, [useFirebase, pools]);

  // localStorage: sincronizar quando outra aba altera os dados
  useEffect(() => {
    if (useFirebase) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === POOLS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue, reviveDate);
          const raw = Array.isArray(parsed) ? parsed : [];
          setPools(raw.filter((p: Pool) => !isLegacyMockPool(p)));
        } catch {
          // ignore
        }
      } else if (e.key === PREDICTIONS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPredictions(
            Array.isArray(parsed)
              ? parsed.map((p: Prediction & { createdAt: string }) => ({
                  ...p,
                  createdAt: new Date(p.createdAt),
                }))
              : []
          );
        } catch {
          // ignore
        }
      } else if (e.key === MATCH_RESULTS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMatchResults(
            typeof parsed === 'object' && parsed !== null ? parsed : {}
          );
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [useFirebase]);

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
    const owner = poolData.owner;
    if (!owner || !poolData.ownerId) {
      throw new Error('É necessário estar logado para criar um bolão.');
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, useFirebase ? 200 : 800));
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
      predictionsPrivate: poolData.predictionsPrivate ?? true,
      code: poolData.isPrivate ? Math.random().toString(36).substring(2, 10).toUpperCase() : undefined,
      createdAt: new Date(),
      endsAt: poolData.endsAt || new Date('2026-12-02'),
      prize: poolData.prize,
      status: 'active'
    };

    if (useFirebase) {
      try {
        await createPoolInFirestore(newPool);
        setPools(prev => [newPool, ...prev]);
        notifyOtherTabsRef.current();
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Pools] createPool Firestore error:', e);
        throw e;
      }
    } else {
      setPools(prev => [newPool, ...prev]);
    }
    setIsLoading(false);
    return newPool;
  };

  const updatePool = (poolId: string, userId: string, updates: Partial<Pick<Pool, 'name' | 'description' | 'prize' | 'isPrivate'>>): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || pool.ownerId !== userId) return false;
    const base = { ...pool, ...updates };
    if (updates.isPrivate === true && !base.code) {
      Object.assign(base, { code: Math.random().toString(36).substring(2, 10).toUpperCase() });
    }
    if (updates.isPrivate === false) base.code = undefined;
    setPools(prev => prev.map(p => (p.id !== poolId ? p : base)));
    if (useFirebase) {
      const firestoreUpdates: Partial<Pick<Pool, 'name' | 'description' | 'prize' | 'isPrivate' | 'code'>> = {
        name: base.name,
        description: base.description,
        prize: base.prize,
        isPrivate: base.isPrivate,
        code: base.code,
      };
      updatePoolInFirestore(poolId, firestoreUpdates).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  };

  const joinPool = async (poolId: string, user: User, code?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, useFirebase ? 150 : 600));

    const pool = pools.find(p => p.id === poolId);
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
      const newMembers = [...pool.members, newMember];
      setPools(prev => prev.map(p =>
        p.id === poolId ? { ...p, members: newMembers } : p
      ));
      if (useFirebase) {
        try {
          await updatePoolMembersInFirestore(poolId, newMembers);
          notifyOtherTabsRef.current();
        } catch (e) {
          if (import.meta.env.DEV) console.warn('[Pools] joinPool Firestore:', e);
          setPools(prev => prev.map(p => (p.id === poolId ? { ...p, members: pool.members } : p)));
          setIsLoading(false);
          return false;
        }
      }
    }

    setIsLoading(false);
    return true;
  };

  const leavePool = (poolId: string, userId: string): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || pool.ownerId === userId) return false;

    const newMembers = pool.members.filter(m => m.userId !== userId);
    const sorted = [...newMembers].sort((a, b) => b.points - a.points);
    const updatedMembers = sorted.map((m, i) => ({ ...m, rank: i + 1 }));

    setPools(prev => prev.map(p =>
      p.id !== poolId ? p : { ...p, members: updatedMembers }
    ));
    setPredictions(prev => prev.filter(p => !(p.poolId === poolId && p.userId === userId)));

    if (useFirebase) {
      Promise.all([
        updatePoolMembersInFirestore(poolId, updatedMembers),
        deletePredictionsByUserAndPool(poolId, userId),
      ]).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  };

  const deletePool = (poolId: string, userId: string): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || pool.ownerId !== userId) return false;

    setPools(prev => prev.filter(p => p.id !== poolId));
    setPredictions(prev => prev.filter(p => p.poolId !== poolId));
    if (useFirebase) {
      deletePoolInFirestore(poolId).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  };

  const adminDeletePool = (poolId: string): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return false;
    setPools(prev => prev.filter(p => p.id !== poolId));
    setPredictions(prev => prev.filter(p => p.poolId !== poolId));
    if (useFirebase) {
      deletePoolInFirestore(poolId).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  };

  const adminUpdatePool = useCallback((poolId: string, updates: Partial<Pick<Pool, 'name' | 'description' | 'prize' | 'isPrivate' | 'code'>>): boolean => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return false;
    const base = { ...pool, ...updates };
    if (updates.isPrivate === true && !base.code) {
      base.code = Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    if (updates.isPrivate === false) base.code = undefined;
    setPools(prev => prev.map(p => (p.id !== poolId ? p : base)));
    if (useFirebase) {
      updatePoolInFirestore(poolId, base).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  }, [pools, useFirebase]);

  const adminUpdateMemberUser = useCallback((userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>) => {
    let updatedPools: Pool[] = [];
    setPools(prev => {
      updatedPools = prev.map(pool => ({
        ...pool,
        owner: pool.ownerId === userId ? { ...pool.owner, ...updates } : pool.owner,
        members: pool.members.map(m =>
          m.userId === userId ? { ...m, user: { ...m.user, ...updates } } : m
        )
      }));
      return updatedPools;
    });
    if (useFirebase) {
      updatedPools.forEach(pool => {
        if (pool.ownerId === userId) {
          updatePoolInFirestore(pool.id, { owner: pool.owner }).finally(() => notifyOtherTabsRef.current());
        }
        const hasMember = pool.members.some(m => m.userId === userId);
        if (hasMember) {
          updatePoolMembersInFirestore(pool.id, pool.members).finally(() => notifyOtherTabsRef.current());
        }
      });
    }
  }, [useFirebase]);

  const adminDeleteUserData = useCallback((userId: string) => {
    setPools(prev => {
      if (useFirebase) {
        const promises = prev.flatMap(pool => {
          if (pool.ownerId === userId) return [deletePoolInFirestore(pool.id)];
          if (pool.members.some(m => m.userId === userId)) {
            const newMembers = pool.members.filter(m => m.userId !== userId);
            const sorted = [...newMembers].sort((a, b) => b.points - a.points);
            return [
              updatePoolMembersInFirestore(pool.id, sorted.map((m, i) => ({ ...m, rank: i + 1 }))),
              deletePredictionsByUserAndPool(pool.id, userId),
            ];
          }
          return [];
        });
        Promise.all(promises).finally(() => notifyOtherTabsRef.current());
      }
      return prev
        .filter(p => p.ownerId !== userId)
        .map(pool => ({ ...pool, members: pool.members.filter(m => m.userId !== userId) }));
    });
    setPredictions(prev => prev.filter(p => p.userId !== userId));
  }, [useFirebase]);

  const adminRemoveUserFromPool = useCallback((poolId: string, userId: string) => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool || pool.ownerId === userId) return false;
    const newMembers = pool.members.filter(m => m.userId !== userId);
    const sorted = [...newMembers].sort((a, b) => b.points - a.points);
    const updatedMembers = sorted.map((m, i) => ({ ...m, rank: i + 1 }));
    setPools(prev => prev.map(p =>
      p.id !== poolId ? p : { ...p, members: updatedMembers }
    ));
    setPredictions(prev => prev.filter(p => !(p.poolId === poolId && p.userId === userId)));
    if (useFirebase) {
      Promise.all([
        updatePoolMembersInFirestore(poolId, updatedMembers),
        deletePredictionsByUserAndPool(poolId, userId),
      ]).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  }, [pools, useFirebase]);

  const adminDeletePrediction = useCallback((predictionId: string) => {
    const pred = predictions.find(p => p.id === predictionId);
    if (!pred) return false;
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
    if (useFirebase) {
      deletePredictionInFirestore(predictionId).finally(() => notifyOtherTabsRef.current());
    }
    return true;
  }, [predictions, useFirebase]);

  const adminGetAllPredictions = useCallback(() => predictions, [predictions]);

  const getPool = (id: string): Pool | undefined => {
    return pools.find(p => p.id === id);
  };

  const getUserPoolsList = (userId: string): Pool[] => {
    return pools.filter(pool =>
      pool.ownerId === userId || pool.members.some(m => m.userId === userId)
    );
  };

  const getPublicPoolsList = (): Pool[] => {
    return pools.filter(pool => !pool.isPrivate);
  };

  const BET_CLOSE_MINUTES = 5;
  const MS_PER_MINUTE = 60 * 1000;

  const savePrediction = useCallback((poolId: string, userId: string, matchId: string, homeScore: number, awayScore: number) => {
    const match = getMatchById(matchId);
    if (match) {
      const matchDate = match.date instanceof Date ? match.date : new Date(match.date);
      const cutoff = matchDate.getTime() - BET_CLOSE_MINUTES * MS_PER_MINUTE;
      if (Date.now() >= cutoff) return; // Regra: não aceita palpite após 5 min antes do jogo
    }
    const newPred: Prediction = {
      id: `pred-${poolId}-${matchId}-${userId}`,
      poolId,
      userId,
      matchId,
      homeScore,
      awayScore,
      createdAt: new Date()
    };
    setPredictions(prev => {
      const filtered = prev.filter(p => !(p.poolId === poolId && p.matchId === matchId && p.userId === userId));
      return [...filtered, newPred];
    });
    if (useFirebase) {
      savePredictionInFirestore(newPred).finally(() => notifyOtherTabsRef.current());
    }
  }, [getMatchById, useFirebase]);

  const getUserPrediction = useCallback((poolId: string, userId: string, matchId: string) => {
    const p = predictions.find(x => x.poolId === poolId && x.matchId === matchId && x.userId === userId);
    return p ? { homeScore: p.homeScore, awayScore: p.awayScore } : undefined;
  }, [predictions]);

  const setMatchResult = useCallback((matchId: string, homeScore: number, awayScore: number) => {
    setMatchResults(prev => ({ ...prev, [matchId]: { homeScore, awayScore } }));
    if (useFirebase) {
      setMatchResultInFirestore(matchId, homeScore, awayScore).finally(() => notifyOtherTabsRef.current());
    }
  }, [useFirebase]);

  const syncResultsFromApi = useCallback(async (): Promise<{ count: number }> => {
    const { fetchMatchResultsFromApi } = await import('@/lib/matchResultsApi');
    const results = await fetchMatchResultsFromApi(matches);
    if (results.length === 0) return { count: 0 };
    const newResults: Record<string, MatchResult> = {};
    results.forEach(r => {
      newResults[r.matchId] = { homeScore: r.homeScore, awayScore: r.awayScore };
    });
    setMatchResults(prev => ({ ...prev, ...newResults }));
    if (useFirebase) {
      try {
        await setMatchResultsBatchInFirestore(newResults);
        notifyOtherTabsRef.current();
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Pools] syncResultsFromApi Firestore:', e);
      }
    }
    return { count: results.length };
  }, [matches, useFirebase]);

  /** Sincronização automática de resultados: assim que jogos carregam e a cada 10 min.
   * Resultados da API → matchResults → recalculateAllPools atualiza os pontos. */
  useEffect(() => {
    let cancelled = false;
    const runSync = async () => {
      if (cancelled) return;
      try {
        await syncResultsFromApi();
      } catch {
        // Silencioso: em auto-sync não mostramos toast
      }
    };
    const t1 = setTimeout(runSync, matchesLoading ? 5000 : 1500); // 5s se carregando, 1.5s se já carregou
    const interval = setInterval(runSync, 10 * 60 * 1000); // A cada 10 min
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [syncResultsFromApi, matchesLoading]);

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
    updatePool,
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
    adminDeletePool,
    adminUpdatePool,
    adminUpdateMemberUser,
    adminDeleteUserData,
    adminRemoveUserFromPool,
    adminDeletePrediction,
    adminGetAllPredictions,
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
