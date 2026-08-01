/**
 * HOOK_useOfflineSync (TDD Part 4 §6.4) — the drain's triggers. Mounted once, at the root layout.
 *
 * §6.4 names three: connectivity regained, app foreground, and a periodic flush while active. A
 * fourth — the identity becoming known — was added on 2026-08-01 and is documented at its call
 * site; it is not a new policy but a cold-start gap the other three leave open. All funnel into
 * `drainOfflineQueue`, which is single-flight, so overlapping triggers cost one drain rather than
 * four.
 *
 * Nothing here blocks render or navigation: a drain is fire-and-forget and its failures land in
 * STORE_syncStatus, never in an alert (§6.4, and §8.2's policy that no sync failure blocks the
 * daily loop).
 */
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { drainOfflineQueue } from '../syncService';
import { hydrateOfflineQueue } from '../../store/offlineQueue';
import { useSessionStore } from '../../store/session';

/** Periodic flush while the app is in the foreground. */
export const SYNC_FLUSH_INTERVAL_MS = 60_000;

export function useOfflineSync(): void {
  // Stable for the provider's lifetime, so the effect below subscribes once.
  const qc = useQueryClient();

  useEffect(() => {
    const drain = () => {
      void drainOfflineQueue({
        onServerState: (state) => {
          // Server truth overwrites the optimistic cache (§6.4). Invalidating rather than writing
          // a key directly: the streak's cache key is scoped by local date, and a drain — which
          // may be running after a day boundary, or for a mutation recorded on a different day —
          // is not the place to guess which day's entry to overwrite. A refetch asks the server,
          // which is the authority for both.
          if (state.streak !== undefined) void qc.invalidateQueries({ queryKey: ['streak'] });
          void qc.invalidateQueries({ queryKey: ['checklist'] });
          // `preferences` became a syncable kind on 2026-08-01, and adding the WRITE path without
          // this left the read half stale: the drain upserted the row server-side while the screen
          // kept showing whatever it fetched at launch. On a cold start that is the pre-change
          // value, so a preference made offline appeared lost even though it had just been
          // delivered — which is the same "durable but never rendered" shape as the offline
          // completion, arrived at from the opposite direction.
          void qc.invalidateQueries({ queryKey: ['preferences'] });
        },
      });
    };

    // Read the persisted queue back before anything can enqueue on top of it, so mutations from a
    // previous launch keep their place at the front (§6.3 durability across app kill).
    hydrateOfflineQueue();
    drain();

    // Trigger 1 — connectivity regained. Only the false→true edge: NetInfo emits on every change,
    // and draining on a disconnect event would just queue an attempt against a radio that is down.
    let wasConnected: boolean | null = null;
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      const connected = state.isConnected !== false;
      if (connected && wasConnected === false) drain();
      wasConnected = connected;
    });

    // Trigger 2 — foreground. The common case for a queue built offline: the user reopens the app
    // somewhere with signal.
    let previousAppState = AppState.currentState;
    const appStateSub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (previousAppState.match(/inactive|background/) && next === 'active') drain();
      previousAppState = next;
    });

    // Trigger 3 — periodic flush while active. Covers the case neither edge catches: the app stays
    // open while connectivity recovers without NetInfo reporting a transition, and it is what
    // brings a backed-off mutation round again.
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') drain();
    }, SYNC_FLUSH_INTERVAL_MS);

    // Trigger 4 — the identity became known.
    //
    // Not in §6.4's list, and it is not a fourth policy: it closes a gap the other three leave on
    // a COLD START. Session restore is asynchronous, so the mount drain above can run while
    // `userId` is still null — the request has no usable token and every entry takes a failed
    // attempt and a backoff. Without this the queue then waits on the periodic flush, so a
    // mutation made before the last kill can sit undelivered for up to SYNC_FLUSH_INTERVAL_MS on
    // the launch that should have flushed it. It also releases anything `isSendableBy` held while
    // the current identity was unknown.
    let previousUserId = useSessionStore.getState().userId;
    const unsubscribeSession = useSessionStore.subscribe((state) => {
      if (state.userId && state.userId !== previousUserId) drain();
      previousUserId = state.userId;
    });

    return () => {
      unsubscribeNet();
      appStateSub.remove();
      clearInterval(interval);
      unsubscribeSession();
    };
    // `qc` is the provider's client and stable for the app's lifetime, so this subscribes once.
  }, [qc]);
}
