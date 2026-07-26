/**
 * Sync orchestration (TDD Part 4 §6.4) — the drain half of offline-first. Reads STORE_offlineQueue,
 * pushes due batches to SVC_sync via SyncRepository, and retires what the server acknowledged.
 *
 * The decisions live in `domain/sync` (pure, tested); this file is the effects: single-flight,
 * the batch loop, and writing the result back to the store. Triggers are the caller's — see
 * `useOfflineSync`.
 */
import { randomUUID } from 'expo-crypto';
import {
  MAX_SYNC_ATTEMPTS,
  isExhausted,
  nextBatch,
  reconcileBatch,
  withFailedAttempt,
  type QueuedMutation,
  type SyncResponse,
} from '../domain/sync';
import { hydrateOfflineQueue, useOfflineQueueStore } from '../store/offlineQueue';
import { useSyncStatusStore } from '../store/syncStatus';
import { getSyncRepository } from './syncRepository';

export interface SyncDeps {
  push: (mutations: readonly QueuedMutation[], idempotencyKey: string) => Promise<SyncResponse>;
  now: () => number;
  random: () => number;
  newIdempotencyKey: () => string;
  /** Reconcile server truth into the query cache (§6.4). Streak is server-derived, never guessed. */
  onServerState?: (state: NonNullable<SyncResponse['server_state']>) => void;
}

export interface DrainResult {
  /** Mutations the server acknowledged (applied or conflict-resolved). */
  synced: number;
  /** Mutations still queued when the drain stopped. */
  remaining: number;
  /** ERR_* if the drain stopped on a failure. */
  error?: string;
}

function defaultDeps(): SyncDeps {
  return {
    push: (mutations, key) => getSyncRepository().push(mutations, key),
    now: () => Date.now(),
    random: Math.random,
    newIdempotencyKey: () => randomUUID(),
  };
}

/**
 * Bound on batches per drain. Without it a queue that the server acknowledges partially — every
 * batch returning some unacknowledged entries — would loop until the backoff caught up, holding
 * the drain open indefinitely. Ten batches is 250 mutations, far more than a real backlog.
 */
const MAX_BATCHES_PER_DRAIN = 10;

let inFlight: Promise<DrainResult> | null = null;

/**
 * Drain the queue. Single-flight: concurrent triggers (foreground and connectivity regained fire
 * together often enough) share one drain rather than sending the same mutations twice. Idempotency
 * makes a double-send harmless server-side, but it would still double the requests.
 */
export function drainOfflineQueue(overrides: Partial<SyncDeps> = {}): Promise<DrainResult> {
  if (inFlight) return inFlight;
  const deps = { ...defaultDeps(), ...overrides };
  inFlight = runDrain(deps).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function runDrain(deps: SyncDeps): Promise<DrainResult> {
  hydrateOfflineQueue();
  const store = useOfflineQueueStore.getState();
  const status = useSyncStatusStore.getState();

  if (store.queue.length === 0) {
    status.set({ status: 'idle', pending: 0, lastError: null });
    return { synced: 0, remaining: 0 };
  }

  status.set({ status: 'syncing', pending: store.queue.length });

  let synced = 0;
  let error: string | undefined;

  for (let i = 0; i < MAX_BATCHES_PER_DRAIN; i++) {
    const queue = useOfflineQueueStore.getState().queue;
    const batch = nextBatch(queue, deps.now());
    if (batch.length === 0) break; // nothing due — everything left is inside its backoff

    let response: SyncResponse;
    try {
      response = await deps.push(batch, deps.newIdempotencyKey());
    } catch (e) {
      // A whole-batch failure: offline, a 5xx, an expired token. Every entry gets an attempt and a
      // backoff, and the drain stops rather than marching through the rest of the queue against a
      // server that just refused one.
      error = e instanceof Error ? e.message : 'ERR_SYNC_CONFLICT';
      const now = deps.now();
      useOfflineQueueStore
        .getState()
        .replaceMany(batch.map((m) => withFailedAttempt(m, now, deps.random)));
      break;
    }

    const { dequeue, retry } = reconcileBatch(batch, response);
    if (dequeue.length > 0) useOfflineQueueStore.getState().dequeueMany(dequeue);
    if (retry.length > 0) {
      const now = deps.now();
      useOfflineQueueStore
        .getState()
        .replaceMany(retry.map((m) => withFailedAttempt(m, now, deps.random)));
    }
    synced += dequeue.length;

    if (response.server_state) deps.onServerState?.(response.server_state);

    // A batch where the server acknowledged nothing is not progress. Retrying it immediately would
    // spin; the backoff just applied will bring it back on a later trigger.
    if (dequeue.length === 0) break;
  }

  const remaining = useOfflineQueueStore.getState().queue;
  const stuck = remaining.some(isExhausted);
  useSyncStatusStore.getState().set({
    // `retrying` is the §6.4 "couldn't sync — will retry" state: something is left over and either
    // the last attempt failed or an entry has burned its attempt budget. It informs; it blocks
    // nothing.
    status: remaining.length === 0 ? 'idle' : error || stuck ? 'retrying' : 'idle',
    pending: remaining.length,
    lastError: error ?? null,
    lastSyncedAt: synced > 0 ? deps.now() : useSyncStatusStore.getState().lastSyncedAt,
  });

  if (stuck) {
    console.warn(
      `[sync] ${remaining.filter(isExhausted).length} pending mutation(s) have failed ` +
        `${MAX_SYNC_ATTEMPTS}+ times. They remain queued and will be retried — nothing is discarded.`,
    );
  }

  return { synced, remaining: remaining.length, error };
}

/** Test seam: release the single-flight latch between cases. */
export function resetSyncServiceForTests(): void {
  inFlight = null;
}
