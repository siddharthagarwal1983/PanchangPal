/**
 * HOOK_usePreferences + useUpdatePreferences (TDD Part 4 §5.2 / §4.2). Server-authoritative
 * preferences read (owner-only) plus an OPTIMISTIC update that (1) patches the Query cache and
 * (2) mirrors the display subset into STORE_prefs for instant theming/tradition UI. On error it
 * reverts both the cache and the mirror. Server data is never copied into Zustand beyond the mirror.
 *
 * IT ALSO ENQUEUES INTO STORE_offlineQueue AGAIN (2026-08-01), and this time the server can
 * retire the entry. The kind was removed during the offline-sync work for a good reason — SVC_sync
 * switched on three kinds and `preferences` fell through to `default:`, logged as
 * `sync_unknown_kind` and returned in neither `applied` nor `conflicts`, so nothing could ever
 * acknowledge it. What changed is that the two missing pieces now exist: `resolvePreferences` in
 * `sync/logic.ts` and a `case 'preferences'` branch upserting the caller's row behind a column
 * allowlist. ⚠️ The §6.6 rule is still UNRATIFIED — it adopts `personal_date`'s last-writer-wins
 * as the nearest ratified precedent, and the TDD owes a ruling.
 *
 * WHY IT HAD TO COME BACK. With no durable path, an app kill inside the request window silently
 * reverted the setting. `FLOW_AUTH_SESSION_PERSISTENCE` reads the tradition back as its proof of
 * identity, so that loss presented as IDENTITY LOSS and was misattributed three times — twice to a
 * launch race, once to a Sentry regression. A lost write and a lost identity look identical on
 * that screen.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { getProfileRepository } from '../profileRepository';
import {
  DEFAULT_PREFERENCES,
  preferencesPatchToRow,
  type Preferences,
  type PreferencesPatch,
} from '../../domain/profile';
import { useOfflineQueueStore } from '../../store/offlineQueue';
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
  const enqueue = useOfflineQueueStore((s) => s.enqueue);
  const key = KEY(userId ?? 'anon');

  return useMutation({
    mutationFn: async (patch: PreferencesPatch) => {
      // DURABLY QUEUE BEFORE THE DIRECT WRITE (§6.3). Until 2026-08-01 this hook went straight to
      // the server with nothing behind it, so an app kill inside the request window silently
      // reverted the setting — and because `FLOW_AUTH_SESSION_PERSISTENCE` reads the tradition
      // back as its proof of identity, that loss was misread as identity loss three times.
      //
      // The payload is the ROW form, not the domain patch: the server upserts columns behind an
      // allowlist and should not carry the mobile domain's naming. `user_id` is stamped so the
      // drain can refuse to apply this under a different identity (`isSendableBy`).
      const client_id = randomUUID();
      enqueue({
        id: client_id,
        kind: 'preferences',
        payload: preferencesPatchToRow(patch),
        client_id,
        local_ts: new Date().toISOString(),
        attempts: 0,
        user_id: userId ?? undefined,
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
      // DO NOT REVERT WHAT IS STILL DURABLY QUEUED — the same rule `useChecklist` applies, and
      // for the same reason: the entry is enqueued BEFORE the direct write is attempted, so
      // offline the write always fails while the change is intact and will be delivered by the
      // drain. Reverting there told the user their setting was lost when it was not.
      //
      // Keyed on the queue rather than on the error, so no vendor's network message has to be
      // string-matched. Once the drain retires the entry, server truth corrects the display.
      // Matched on kind + identity rather than on this call's client_id, which is minted inside
      // `mutationFn` and so is not reachable from here (onMutate runs first). Any pending
      // preference mutation for this user means the change still has a delivery path, which is
      // the question being asked.
      const stillQueued = useOfflineQueueStore
        .getState()
        .queue.some((m) => m.kind === 'preferences' && (!m.user_id || m.user_id === userId));
      if (stillQueued) return;
      if (ctx?.prev) qc.setQueryData(key, ctx.prev); // revert cache
      if (ctx?.prevMirror) mirror(ctx.prevMirror); // revert STORE_prefs mirror
    },
    onSuccess: (server) => {
      qc.setQueryData<Preferences>(key, server);
      mirror(server);
    },
  });
}
