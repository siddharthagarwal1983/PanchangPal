/**
 * HOOK_useNotificationPrefs + useUpdateNotificationPrefs (TDD Part 4 §7.2 / §4.1 / §4.2). Notif
 * prefs are part of the server-authoritative "preferences" concern; this reads the owner-only
 * notif_prefs and applies OPTIMISTIC per-channel/quiet-hours updates that patch the Query cache
 * and revert it on error. Scheduling stays server-side — never scheduled on device.
 *
 * The STORE_offlineQueue enqueue that used to sit here is gone for the reason documented in
 * `usePreferences`: SVC_sync has no `notif_prefs` branch and no §6.6 conflict rule, so the entry
 * was returned in neither `applied` nor `conflicts` and nothing could ever retire it.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationRepository } from '../notificationRepository';
import {
  DEFAULT_NOTIF_PREFS,
  applyNotifPatch,
  structuredNotifPrefs,
  type NotifPrefs,
  type NotifPrefsPatch,
} from '../../domain/notifications';
import { useSessionStore } from '../../store/session';

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
  const key = NOTIF_PREFS_KEY(userId ?? 'anon');

  return useMutation({
    mutationFn: async (patch: NotifPrefsPatch) => {
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
