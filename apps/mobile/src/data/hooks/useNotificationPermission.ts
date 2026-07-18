/**
 * HOOK_useNotificationPermission (TDD Part 4 §7.2). Owns the OS permission lifecycle through the
 * NotificationAdapter seam and, on grant, registers the Expo push token (API_POST_NOTIF_TOKEN) and
 * nudges the server scheduler (API_POST_NOTIF_SCHEDULE). Permission is DEVICE state (not server
 * data), so it lives in local component state via TanStack Query with no network queryFn. The OS
 * dialog is only ever triggered by `requestPermission` — after in-app priming (UX-4); "Not now"
 * never calls it. Denial is non-blocking (ERR_NOTIF_DENIED); the daily loop keeps working.
 */
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationAdapter } from '../notificationAdapter';
import { getNotificationRepository } from '../notificationRepository';
import { NOTIF_PREFS_KEY } from './useNotificationPrefs';
import { DEFAULT_NOTIF_PREFS, type NotifPrefs, type PermissionStatus } from '../../domain/notifications';
import { useSessionStore } from '../../store/session';

const PERMISSION_KEY = ['notif_permission'] as const;

/** Read the current OS permission status (no network). */
export function useNotificationPermission() {
  return useQuery<PermissionStatus>({
    queryKey: PERMISSION_KEY,
    queryFn: () => getNotificationAdapter().getPermissionStatus(),
    staleTime: 0,
  });
}

/**
 * Request OS permission (after priming) and, on grant, register the token + hint the scheduler.
 * Returns the resulting PermissionStatus. Safe to call from a primary CTA only.
 */
export function useEnableNotifications() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);

  return useMutation<PermissionStatus, Error, void>({
    mutationFn: async () => {
      const adapter = getNotificationAdapter();
      const status = await adapter.requestPermission();
      if (status !== 'granted') return status;

      // Best-effort token registration + schedule hint; never blocks the grant outcome.
      if (userId) {
        try {
          const token = await adapter.getExpoPushToken();
          if (token) await getNotificationRepository().registerToken(userId, token, adapter.getPlatform());
          const prefs = (qc.getQueryData<NotifPrefs>(NOTIF_PREFS_KEY(userId)) ?? DEFAULT_NOTIF_PREFS) as NotifPrefs;
          await getNotificationRepository().requestSchedule(prefs);
        } catch {
          // Registration/scheduling failure is non-blocking; prefs remain server-authoritative.
        }
      }
      return status;
    },
    onSuccess: (status) => {
      qc.setQueryData<PermissionStatus>(PERMISSION_KEY, status);
    },
  });
}

/** Re-read permission from the OS (e.g. after returning from system Settings). */
export function useRefreshPermission() {
  const qc = useQueryClient();
  return useCallback(async () => {
    const status = await getNotificationAdapter().getPermissionStatus();
    qc.setQueryData<PermissionStatus>(PERMISSION_KEY, status);
    return status;
  }, [qc]);
}
