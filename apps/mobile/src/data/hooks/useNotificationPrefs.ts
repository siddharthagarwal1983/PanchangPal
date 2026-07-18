/**
 * HOOK_useNotificationPrefs + useUpdateNotificationPrefs (TDD Part 4 §7.2 / §4.1 / §4.2). Notif
 * prefs are part of the server-authoritative "preferences" concern; this reads the owner-only
 * notif_prefs and applies OPTIMISTIC per-channel/quiet-hours updates that (1) patch the Query
 * cache and (2) enqueue the mutation in STORE_offlineQueue (drained by SVC_sync). On error it
 * reverts the cache. Scheduling stays server-side — never scheduled on device.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { getNotificationRepository } from '../notificationRepository';
import {
  DEFAULT_NOTIF_PREFS,
  applyNotifPatch,
  structuredNotifPrefs,
  type NotifPrefs,
  type NotifPrefsPatch,
} from '../../domain/notifications';
import { useSessionStore } from '../../store/session';
import { useOfflineQueueStore } from '../../store/offlineQueue';

export const NOTIF_PREFS_KEY = (userId: string) => ['notif_prefs', userId] as const;

export function useNotificationPrefs() {
  const userId = useSessionStore((s) => s.userId);
  return useQuery<NotifPrefs>({
    queryKey: NOTIF_PREFS_KEY(userId ?? 'anon'),
    queryFn: () => getNotificationRepository().getPrefs(userId as string),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const key = NOTIF_PREFS_KEY(userId ?? 'anon');

  return useMutation({
    mutationFn: async (patch: NotifPrefsPatch) => {
      const client_id = randomUUID();
      enqueue({
        id: client_id,
        kind: 'notif_prefs',
        payload: { patch, user_id: userId },
        client_id,
        local_ts: new Date().toISOString(),
        attempts: 0,
      });
      return getNotificationRepository().updatePrefs(userId as string, patch);
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<NotifPrefs>(key) ?? structuredNotifPrefs(DEFAULT_NOTIF_PREFS);
      qc.setQueryData<NotifPrefs>(key, applyNotifPatch(prev, patch));
      return { prev };
    },
    onError: (_e, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // revert cache
    },
    onSuccess: (server) => {
      qc.setQueryData<NotifPrefs>(key, server);
    },
  });
}
