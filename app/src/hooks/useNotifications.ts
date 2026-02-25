import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  getNotificationPermission,
  getFCMToken,
  saveFCMTokenToFirestore,
  onForegroundMessage,
  isMessagingSupported,
  type NotificationPermission,
} from '@/lib/firebaseMessaging';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useNotifications() {
  const { user, useFirebase } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof window !== 'undefined' ? getNotificationPermission() : 'default'
  );
  const [isEnabling, setIsEnabling] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isMessagingSupported());
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (!useFirebase || !user || permission !== 'granted') return;
    const unsubscribe = onForegroundMessage((payload) => {
      const data = payload.data as Record<string, string> | undefined;
      const title = data?.title || payload.notification?.title || 'Bolão Brasileirão';
      const body = data?.body || payload.notification?.body || 'Nova notificação';
      toast(title, { description: body, duration: 5000 });
    });
    return unsubscribe;
  }, [useFirebase, user, permission]);

  const enableNotifications = useCallback(async () => {
    if (!isSupported || !useFirebase || !user) return false;
    setIsEnabling(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== 'granted') {
        toast.error('Notificações bloqueadas', {
          description: 'Ative as notificações nas configurações do navegador para receber lembretes.',
        });
        return false;
      }
      const token = await getFCMToken();
      if (token) {
        await saveFCMTokenToFirestore(user.id, token);
        toast.success('Notificações ativadas!', {
          description: 'Você receberá lembretes de jogos e atualizações.',
        });
        return true;
      }
      toast.error('Erro ao ativar', { description: 'Não foi possível configurar as notificações.' });
      return false;
    } catch (e) {
      toast.error('Erro', { description: e instanceof Error ? e.message : 'Falha ao ativar notificações.' });
      return false;
    } finally {
      setIsEnabling(false);
    }
  }, [isSupported, useFirebase, user]);

  return {
    permission,
    isEnabling,
    isSupported: isSupported && useFirebase,
    enableNotifications,
  };
}
