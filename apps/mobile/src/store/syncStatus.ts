/**
 * STORE_syncStatus (TDD Part 4 §6.4). The non-blocking "couldn't sync — will retry" state.
 *
 * §6.4 is explicit that a failing drain must NEVER block the UI, and §8.2's degradation policy
 * agrees: neither ERR_OFFLINE nor ERR_SYNC_CONFLICT blocks the daily loop. So this is a passive
 * status other surfaces may read — it does not gate anything, and nothing awaits it.
 */
import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'retrying';

interface SyncStatusState {
  status: SyncStatus;
  /** Mutations still waiting to be acknowledged by the server. */
  pending: number;
  /** ERR_* from the last failed drain, or null. Never surfaced as an alert (§6.4). */
  lastError: string | null;
  lastSyncedAt: number | null;
  set: (patch: Partial<Omit<SyncStatusState, 'set'>>) => void;
}

export const useSyncStatusStore = create<SyncStatusState>((set) => ({
  status: 'idle',
  pending: 0,
  lastError: null,
  lastSyncedAt: null,
  set: (patch) => set(patch),
}));
