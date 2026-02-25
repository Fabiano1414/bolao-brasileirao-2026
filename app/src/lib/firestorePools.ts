/**
 * Firestore — bolões, palpites e resultados compartilhados entre todos os usuários.
 * Usado quando Firebase está configurado.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { Pool, PoolMember, Prediction, User } from '@/types';

const POOLS_COLLECTION = 'pools';
const PREDICTIONS_COLLECTION = 'predictions';
const MATCH_RESULTS_DOC = 'config/matchResults';

type MatchResult = { homeScore: number; awayScore: number };
function toFirestorePool(pool: Pool): Record<string, unknown> {
  return {
    name: pool.name,
    description: pool.description,
    ownerId: pool.ownerId,
    owner: { id: pool.owner.id, name: pool.owner.name, email: pool.owner.email, avatar: pool.owner.avatar },
    members: pool.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      user: { id: m.user.id, name: m.user.name, email: m.user.email, avatar: m.user.avatar },
      poolId: m.poolId,
      points: m.points,
      rank: m.rank,
      joinedAt: m.joinedAt,
    })),
    isPrivate: pool.isPrivate,
    predictionsPrivate: pool.predictionsPrivate,
    code: pool.code,
    createdAt: pool.createdAt instanceof Date ? Timestamp.fromDate(pool.createdAt) : pool.createdAt,
    endsAt: pool.endsAt instanceof Date ? Timestamp.fromDate(pool.endsAt) : pool.endsAt,
    prize: pool.prize,
    status: pool.status,
  };
}

function fromFirestorePool(id: string, data: Record<string, unknown>): Pool {
  const toDate = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v ? (v as { toDate: () => Date }).toDate() : new Date(v as string);
  const owner = data.owner as Record<string, unknown>;
  const members = (data.members as Record<string, unknown>[]) ?? [];
  return {
    id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    ownerId: (data.ownerId as string) ?? '',
    owner: owner
      ? {
          id: (owner.id as string) ?? '',
          name: (owner.name as string) ?? 'Usuário',
          email: (owner.email as string) ?? '',
          avatar: owner.avatar as string | undefined,
          points: 0,
          createdAt: new Date(),
        }
      : ({ id: '', name: 'Usuário', email: '', points: 0, createdAt: new Date() } as User),
    members: members.map((m) => ({
      id: (m.id as string) ?? '',
      userId: (m.userId as string) ?? '',
      user: {
        id: ((m.user as Record<string, unknown>)?.id as string) ?? '',
        name: ((m.user as Record<string, unknown>)?.name as string) ?? 'Usuário',
        email: ((m.user as Record<string, unknown>)?.email as string) ?? '',
        avatar: (m.user as Record<string, unknown>)?.avatar as string | undefined,
        points: (m.points as number) ?? 0,
        rank: (m.rank as number) ?? 0,
        createdAt: new Date(),
      } as User,
      poolId: (m.poolId as string) ?? '',
      points: (m.points as number) ?? 0,
      rank: (m.rank as number) ?? 0,
      joinedAt: toDate(m.joinedAt),
    })) as PoolMember[],
    matches: [],
    isPrivate: (data.isPrivate as boolean) ?? true,
    predictionsPrivate: (data.predictionsPrivate as boolean) ?? true,
    code: data.code as string | undefined,
    createdAt: toDate(data.createdAt),
    endsAt: toDate(data.endsAt),
    prize: data.prize as string | undefined,
    status: (data.status as Pool['status']) ?? 'active',
  };
}

function fromFirestorePrediction(id: string, data: Record<string, unknown>): Prediction {
  const toDate = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v ? (v as { toDate: () => Date }).toDate() : new Date();
  return {
    id,
    poolId: (data.poolId as string) ?? '',
    userId: (data.userId as string) ?? '',
    matchId: (data.matchId as string) ?? '',
    homeScore: (data.homeScore as number) ?? 0,
    awayScore: (data.awayScore as number) ?? 0,
    createdAt: toDate(data.createdAt),
  };
}

function onSnapshotError(collection: string) {
  return (err: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(`[Firestore] Erro em ${collection}:`, err);
    }
  };
}

export function subscribePools(
  addMatches: (pool: Pool) => Pool,
  onPools: (pools: Pool[]) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  return onSnapshot(
    collection(db, POOLS_COLLECTION),
    (snapshot) => {
      const pools: Pool[] = snapshot.docs.map((d) => addMatches(fromFirestorePool(d.id, d.data())));
      onPools(pools);
    },
    onSnapshotError('pools')
  );
}

export function subscribePredictions(onPredictions: (predictions: Prediction[]) => void): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  return onSnapshot(
    collection(db, PREDICTIONS_COLLECTION),
    (snapshot) => {
      const predictions = snapshot.docs.map((d) => fromFirestorePrediction(d.id, d.data()));
      onPredictions(predictions);
    },
    onSnapshotError('predictions')
  );
}

export function subscribeMatchResults(onResults: (results: Record<string, MatchResult>) => void): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  return onSnapshot(
    doc(db, MATCH_RESULTS_DOC),
    (snapshot) => {
      const data = snapshot.data();
      const results = (data?.results as Record<string, { homeScore: number; awayScore: number }>) ?? {};
      onResults(results);
    },
    onSnapshotError('matchResults')
  );
}

export async function createPoolInFirestore(pool: Pool): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore não disponível');
  const data = toFirestorePool(pool);
  await setDoc(doc(db, POOLS_COLLECTION, pool.id), data);
}

export async function updatePoolInFirestore(
  poolId: string,
  updates: Partial<Pick<Pool, 'name' | 'description' | 'prize' | 'isPrivate' | 'code' | 'owner'>>
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, POOLS_COLLECTION, poolId);
  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.prize !== undefined) data.prize = updates.prize;
  if (updates.isPrivate !== undefined) data.isPrivate = updates.isPrivate;
  if (updates.code !== undefined) data.code = updates.code;
  if (updates.isPrivate === false) data.code = null;
  if (updates.owner != null) {
    data.owner = { id: updates.owner.id, name: updates.owner.name, email: updates.owner.email, avatar: updates.owner.avatar };
  }
  if (Object.keys(data).length === 0) return;
  await updateDoc(ref, data);
}

export async function updatePoolMembersInFirestore(poolId: string, members: PoolMember[]): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, POOLS_COLLECTION, poolId), {
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      user: { id: m.user.id, name: m.user.name, email: m.user.email, avatar: m.user.avatar },
      poolId: m.poolId,
      points: m.points,
      rank: m.rank,
      joinedAt: m.joinedAt,
    })),
  });
}

export async function deletePoolInFirestore(poolId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const predSnap = await getDocs(
    query(collection(db, PREDICTIONS_COLLECTION), where('poolId', '==', poolId))
  );
  const batch = writeBatch(db);
  predSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, POOLS_COLLECTION, poolId));
  await batch.commit();
}

export async function savePredictionInFirestore(pred: Prediction): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, PREDICTIONS_COLLECTION, pred.id), {
    poolId: pred.poolId,
    userId: pred.userId,
    matchId: pred.matchId,
    homeScore: pred.homeScore,
    awayScore: pred.awayScore,
    createdAt: pred.createdAt instanceof Date ? Timestamp.fromDate(pred.createdAt) : pred.createdAt,
  });
}

export async function deletePredictionInFirestore(predictionId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  await deleteDoc(doc(db, PREDICTIONS_COLLECTION, predictionId));
}

export async function deletePredictionsByUserAndPool(poolId: string, userId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const snap = await getDocs(
    query(
      collection(db, PREDICTIONS_COLLECTION),
      where('poolId', '==', poolId),
      where('userId', '==', userId)
    )
  );
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function setMatchResultInFirestore(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, MATCH_RESULTS_DOC);
  const snap = await getDoc(ref);
  const current = (snap.data()?.results as Record<string, MatchResult>) ?? {};
  await setDoc(ref, { results: { ...current, [matchId]: { homeScore, awayScore } } }, { merge: true });
}

export async function setMatchResultsBatchInFirestore(results: Record<string, MatchResult>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const ref = doc(db, MATCH_RESULTS_DOC);
  const snap = await getDoc(ref);
  const current = (snap.data()?.results as Record<string, MatchResult>) ?? {};
  await setDoc(ref, { results: { ...current, ...results } }, { merge: true });
}
