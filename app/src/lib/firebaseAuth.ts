/**
 * Firebase Auth + Firestore — lógica de autenticação.
 * Usado pelo useAuth quando Firebase está configurado.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocsFromServer,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import type { User } from '@/types';

const USERS_COLLECTION = 'users';

function toAppUser(fbUser: FirebaseUser, profile: { name: string; avatar?: string; createdAt: Date }): User {
  return {
    id: fbUser.uid,
    name: profile.name || fbUser.email?.split('@')[0] || 'Usuário',
    email: fbUser.email || '',
    avatar: profile.avatar,
    points: 0,
    createdAt: profile.createdAt,
  };
}

export async function firebaseLogin(email: string, password: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  const database = getFirebaseDb();
  if (!auth || !database) return null;

  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
  let profile: { name?: string; avatar?: string; createdAt?: unknown } | null = null;
  try {
    const userDoc = await getDoc(doc(database, USERS_COLLECTION, cred.user.uid));
    profile = userDoc.data() ?? null;
  } catch {
    // Firestore falhou (regras, rede) — não bloqueia login; usa defaults
  }
  const createdAt = profile?.createdAt && typeof (profile.createdAt as { toDate?: () => Date })?.toDate === 'function'
    ? (profile.createdAt as { toDate: () => Date }).toDate()
    : new Date();
  return toAppUser(cred.user, {
    name: profile?.name ?? cred.user.email?.split('@')[0] ?? 'Usuário',
    avatar: profile?.avatar,
    createdAt,
  });
}

export async function firebaseRegister(
  name: string,
  email: string,
  password: string,
  avatarDataUrl?: string
): Promise<User | null> {
  const auth = getFirebaseAuth();
  const database = getFirebaseDb();
  if (!auth || !database) return null;

  const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
  const now = new Date();
  const userData = {
    name: name.trim(),
    avatar: avatarDataUrl?.trim() || null,
    createdAt: Timestamp.fromDate(now),
    email: cred.user.email ?? '',
  };
  try {
    await setDoc(doc(database, USERS_COLLECTION, cred.user.uid), userData);
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[Auth] firebaseRegister setDoc falhou:', e);
    try {
      await setDoc(doc(database, USERS_COLLECTION, cred.user.uid), userData, { merge: true });
    } catch {
      // Falhou novamente — usuário existe no Auth, perfil será criado no próximo login
    }
  }
  return toAppUser(cred.user, { name: name.trim(), avatar: avatarDataUrl, createdAt: now });
}

export async function firebaseResetPassword(email: string): Promise<'email_sent' | 'error' | 'user_not_found'> {
  const auth = getFirebaseAuth();
  if (!auth) return 'error';
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return 'email_sent';
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code ?? '';
    const msg = String(e instanceof Error ? e.message : e);
    if (import.meta.env.DEV) console.warn('[Auth] ResetPassword Firebase error:', code || msg, e);
    if (/auth\/user-not-found/i.test(code || msg)) return 'user_not_found';
    return 'error';
  }
}

export async function firebaseLogout(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export async function firebaseUpdateProfile(uid: string, updates: { name?: string; avatar?: string }): Promise<void> {
  const database = getFirebaseDb();
  if (!database) return;
  const ref = doc(database, USERS_COLLECTION, uid);
  const data: Record<string, unknown> = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.avatar !== undefined) data.avatar = updates.avatar;
  if (Object.keys(data).length > 0) await updateDoc(ref, data);
}

export async function firebaseGetUserProfile(uid: string): Promise<{ name: string; avatar?: string; createdAt: Date } | null> {
  const database = getFirebaseDb();
  if (!database) return null;
  const snap = await getDoc(doc(database, USERS_COLLECTION, uid));
  const d = snap.data();
  if (!d) return null;
  return {
    name: d.name ?? 'Usuário',
    avatar: d.avatar,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
  };
}

export async function firebaseGetAllUsers(): Promise<User[]> {
  const auth = getFirebaseAuth();
  const database = getFirebaseDb();
  if (!auth || !database) return [];

  const snapshot = await getDocsFromServer(collection(database, USERS_COLLECTION));
  const users: User[] = [];
  for (const docSnap of snapshot.docs) {
    const d = docSnap.data();
    users.push({
      id: docSnap.id,
      name: d.name ?? 'Usuário',
      email: d.email ?? '',
      avatar: d.avatar,
      points: 0,
      createdAt: d.createdAt?.toDate?.() ?? new Date(),
    });
  }
  return users;
}

export function firebaseSubscribeToAuth(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  const database = getFirebaseDb();
  if (!auth || !database) {
    callback(null);
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    let profile = await firebaseGetUserProfile(fbUser.uid);
    if (!profile && database) {
      try {
        await setDoc(
          doc(database, USERS_COLLECTION, fbUser.uid),
          {
            name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Usuário',
            avatar: fbUser.photoURL ?? null,
            email: fbUser.email ?? '',
            createdAt: Timestamp.fromDate(new Date()),
          },
          { merge: true }
        );
        profile = await firebaseGetUserProfile(fbUser.uid);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Auth] Criar perfil Firestore falhou:', e);
      }
    }
    if (profile) {
      callback(toAppUser(fbUser, profile));
    } else {
      callback(toAppUser(fbUser, { name: fbUser.email?.split('@')[0] ?? 'Usuário', createdAt: new Date() }));
    }
  });

  return unsubscribe;
}
