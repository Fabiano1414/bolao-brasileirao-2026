/**
 * Firebase — Auth + Firestore.
 * Configure as variáveis em .env e o app usa Firebase.
 * Sem config, usa autenticação local (localStorage).
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const FIREBASE_DISABLED_KEY = 'bolao_disable_firebase';

export function isFirebaseConfigured(): boolean {
  if (typeof localStorage !== 'undefined' && localStorage.getItem(FIREBASE_DISABLED_KEY) === '1') {
    return false;
  }
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'undefined' &&
    firebaseConfig.projectId
  );
}

/** Desativa Firebase e usa só localStorage. Chama reload após. */
export function disableFirebaseAndReload(): void {
  localStorage.setItem(FIREBASE_DISABLED_KEY, '1');
  window.location.reload();
}

/** Reativa Firebase (remove override). */
export function enableFirebaseAndReload(): void {
  localStorage.removeItem(FIREBASE_DISABLED_KEY);
  window.location.reload();
}

/** Verifica se o usuário desativou o Firebase manualmente. */
export function isFirebaseManuallyDisabled(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(FIREBASE_DISABLED_KEY) === '1';
}

/** Log em dev: qual projeto Firebase está configurado (evita confusão de projectId) */
if (import.meta.env.DEV && firebaseConfig.apiKey && firebaseConfig.projectId) {
  console.info('[Firebase] Projeto configurado:', firebaseConfig.projectId);
}

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    auth = getAuth(firebaseApp);
    if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    }
  }
  return auth;
}

export function getFirebaseDb() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) {
    db = getFirestore(firebaseApp);
    if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
  }
  return db;
}
