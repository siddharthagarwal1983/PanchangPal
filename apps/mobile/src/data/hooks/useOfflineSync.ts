/**
 * HOOK_useOfflineSync (TDD Part 4 §6.4) — the drain's triggers. Mounted once, at the root layout.
 *
 * §6.4 names three: connectivity regained, app foreground, and a periodic flush while active. All
 * three funnel into `drainOfflineQueue`, which is single-flight, so overlapping triggers cost one
 * drain rather than three.
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

    return () => {
      unsubscribeNet();
      appStateSub.remove();
      clearInterval(interval);
    };
    // `qc` is the provider's client and stable for the app's lifetime, so this subscribes once.
  }, [qc]);
}
