/**
 * HOOK_usePreferences + useUpdatePreferences (TDD Part 4 §5.2 / §4.2). Server-authoritative
 * preferences read (owner-only) plus an OPTIMISTIC update that (1) patches the Query cache and
 * (2) mirrors the display subset into STORE_prefs for instant theming/tradition UI. On error it
 * reverts both the cache and the mirror. Server data is never copied into Zustand beyond the mirror.
 *
 * This used to also enqueue into STORE_offlineQueue "drained by SVC_sync". It was not: SVC_sync
 * switches on the three kinds TDD Part 2 §6.6 defines conflict rules for, and `preferences` fell
 * through to its `default:` branch — logged as `sync_unknown_kind` and returned in neither
 * `applied` nor `conflicts`. The entry could therefore never be acknowledged or retired, so it
 * bought the user nothing (the optimistic patch still reverts on a failed write) while a row
 * accumulated in durable storage forever.
 *
 * Making an offline preference change genuinely durable needs an approved §6.6 conflict rule and a
 * server branch to match. Both are owed; inventing either here would be inventing business rules.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileRepository } from '../profileRepository';
import { DEFAULT_PREFERENCES, type Preferences, type PreferencesPatch } from '../../domain/profile';
import { useSessionStore } from '../../store/session';
import { usePrefsStore } from '../../store/prefs';

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
  const key = KEY(userId ?? 'anon');

  return useMutation({
    mutationFn: async (patch: PreferencesPatch) => {
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
