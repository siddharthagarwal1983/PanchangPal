/**
 * HOOK_usePreferences + useUpdatePreferences (TDD Part 4 §5.2 / §4.2). Server-authoritative
 * preferences read (owner-only) plus an OPTIMISTIC update that (1) patches the Query cache,
 * (2) mirrors the display subset into STORE_prefs for instant theming/tradition UI, and
 * (3) enqueues the mutation in STORE_offlineQueue (drained by SVC_sync). On error it reverts
 * both the cache and the mirror. Server data is never copied into Zustand beyond the mirror.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { getProfileRepository } from '../profileRepository';
import { DEFAULT_PREFERENCES, type Preferences, type PreferencesPatch } from '../../domain/profile';
import { useSessionStore } from '../../store/session';
import { usePrefsStore } from '../../store/prefs';
import { useOfflineQueueStore } from '../../store/offlineQueue';

const KEY = (userId: string) => ['preferences', userId] as const;

export function usePreferences() {
  const userId = useSessionStore((s) => s.userId);
  return useQuery<Preferences>({
    queryKey: KEY(userId ?? 'anon'),
    queryFn: () => getProfileRepository().getPreferences(userId as string),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mirror the display subset (tradition/depth/appearance) plus the time zone into STORE_prefs.
 *
 * The zone is not a display value, but it is needed SYNCHRONOUSLY during render to derive which
 * day a screen is showing (ADR-026, issue #30), and a screen cannot await a query to decide
 * that. It is mirrored on the same path as the rest so it reverts with them on error.
 */
function mirror(p: Pick<Preferences, 'tradition' | 'depth' | 'appearance' | 'timezone'>) {
  usePrefsStore.getState().setPrefs({
    tradition: p.tradition,
    depth: p.depth,
    appearance: p.appearance,
    timezone: p.timezone,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const key = KEY(userId ?? 'anon');

  return useMutation({
    mutationFn: async (patch: PreferencesPatch) => {
      const client_id = randomUUID();
      enqueue({
        id: client_id,
        kind: 'preferences',
        payload: { patch, user_id: userId },
        client_id,
        local_ts: new Date().toISOString(),
        attempts: 0,
      });
      return getProfileRepository().updatePreferences(userId as string, patch);
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Preferences>(key) ?? { ...DEFAULT_PREFERENCES };
      const next: Preferences = { ...prev, ...patch };
      qc.setQueryData<Preferences>(key, next);
      const prevMirror = {
        tradition: prev.tradition,
        depth: prev.depth,
        appearance: prev.appearance,
        timezone: prev.timezone,
      };
      mirror(next);
      return { prev, prevMirror };
    },
    onError: (_e, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // revert cache
      if (ctx?.prevMirror) mirror(ctx.prevMirror); // revert STORE_prefs mirror
    },
    onSuccess: (server) => {
      qc.setQueryData<Preferences>(key, server);
      mirror(server);
    },
  });
}
