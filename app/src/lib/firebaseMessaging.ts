/**
 * Firebase Cloud Messaging — push notifications.
 * Requer Firebase configurado e VITE_FIREBASE_VAPID_KEY no .env.
 * Gera token para enviar notificações via Cloud Functions.
 */

import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { getFirebaseApp } from './firebase';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return (await Notification.requestPermission()) as NotificationPermission;
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission as NotificationPermission;
}

/**
 * Obtém o token FCM para o dispositivo. Salve em Firestore (users/{uid}/fcmToken)
 * para enviar notificações via Cloud Function.
 */
export async function getFCMToken(): Promise<string | null> {
  const app = getFirebaseApp();
  if (!app) return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey || vapidKey === 'undefined') {
    if (import.meta.env.DEV) console.warn('[FCM] VITE_FIREBASE_VAPID_KEY não configurado.');
    return null;
  }

  try {
    const messaging = getMessaging(app);
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[FCM] Erro ao obter token:', e);
    return null;
  }
}

/**
 * Escuta mensagens em foreground (app aberto).
 * Retorna função para cancelar a inscrição.
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
  const app = getFirebaseApp();
  if (!app) return () => {};

  try {
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, callback);
    return () => unsubscribe();
  } catch {
    return () => {};
  }
}

export function isMessagingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/** Salva o token FCM no Firestore (users/{uid}/fcmToken) para envio via Cloud Function */
export async function saveFCMTokenToFirestore(userId: string, token: string): Promise<boolean> {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    const { getFirebaseDb } = await import('./firebase');
    const db = getFirebaseDb();
    if (!db) return false;
    await setDoc(doc(db, 'users', userId), { fcmToken: token, fcmTokenUpdatedAt: new Date() }, { merge: true });
    return true;
  } catch {
    return false;
  }
}
