/**
 * STORE_offlineQueue (TDD Part 4 §4.2/§6.3). The durable list of pending mutations: written
 * through the shared `KeyValueStore` seam so it survives app kill, drained via API_POST_SYNC
 * (SVC_sync) by `syncService`, idempotent per entry via `client_id` (§6.3).
 *
 * The header above used to describe this as MMKV-persisted while the store was a plain in-memory
 * zustand slice — the queue was never written to disk, never drained and never dequeued, so an
 * offline completion was lost on app kill and a successful one leaked forever. The persistence is
 * real now; the drain lives in `src/data/syncService.ts`.
 *
 * Storage resolves on FIRST USE, never at module scope. `createDeviceStore()` at import time is
 * the default-parameter defect this repo has now fixed four times (getSupabase across nine
 * repositories, `new MMKV()` in the ritual session store): it throws during module evaluation of
 * whichever route imported it first, and expo-router reports "Page could not be found" instead of
 * a calm error state.
 */
import { create } from 'zustand';
import { createDeviceStore, type KeyValueStore } from '../data/keyValueStore';
import type { QueuedMutation } from '../domain/sync';

// The queue's shape lives in the domain (`src/domain/sync`) so the store, the drain rules and the
// sync repository can share it without one owning the others. Re-exported because four hooks have
// imported it from here since M2.
export type { MutationKind, QueuedMutation } from '../domain/sync';

const STORAGE_KEY = 'offline-queue:v1';

let storage: KeyValueStore | null = null;

function getStorage(): KeyValueStore {
  return (storage ??= createDeviceStore());
}

/** Test seam: swap in an in-memory store and forget anything already resolved. */
export function setOfflineQueueStorageForTests(store: KeyValueStore | null): void {
  storage = store;
}

function persist(queue: readonly QueuedMutation[]): void {
  try {
    getStorage().set(STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    // A write failure must not take down the action the user just performed. The mutation still
    // applied optimistically and still sits in the in-memory queue, so this costs durability
    // across a restart, not the action itself.
    console.warn('[sync] Could not persist the offline queue; pending writes may not survive a restart.', error);
  }
}

function readPersisted(): QueuedMutation[] {
  let raw: string | undefined;
  try {
    raw = getStorage().getString(STORAGE_KEY);
  } catch (error) {
    console.warn('[sync] Could not read the persisted offline queue.', error);
    return [];
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // Anything that is not an array of entries with an id is not a queue this version wrote.
    // Discarding beats crashing the app on every launch, which is what a throw here would do.
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((m): m is QueuedMutation => Boolean(m) && typeof m.id === 'string');
  } catch {
    console.warn('[sync] The persisted offline queue was unreadable and has been discarded.');
    return [];
  }
}

interface OfflineQueueState {
  queue: QueuedMutation[];
  /** Whether the persisted queue has been read back yet (see `hydrateOfflineQueue`). */
  hydrated: boolean;
  enqueue: (m: QueuedMutation) => void;
  dequeue: (id: string) => void;
  /** Retire everything the server acknowledged in one write (§6.4 reconciliation). */
  dequeueMany: (ids: readonly string[]) => void;
  /** Replace entries by id — used to fold a failed attempt's backoff back into the queue. */
  replaceMany: (updated: readonly QueuedMutation[]) => void;
  clear: () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>((set) => ({
  queue: [],
  hydrated: false,
  enqueue: (m) => {
    // Hydrate BEFORE writing. Every mutating action persists the whole queue, so a write against
    // an un-hydrated (empty) store would overwrite the previous launch's pending mutations with
    // just this one — losing exactly the offline completions this store exists to protect. Caught
    // by `keeps a restored mutation ahead of one enqueued this session`, which failed on the first
    // run for this reason. Hydration is idempotent, so the guard costs a boolean check.
    hydrateOfflineQueue();
    set((s) => {
      const queue = [...s.queue, m];
      persist(queue);
      return { queue };
    });
  },
  dequeue: (id) => {
    hydrateOfflineQueue();
    set((s) => {
      const queue = s.queue.filter((m) => m.id !== id);
      persist(queue);
      return { queue };
    });
  },
  dequeueMany: (ids) => {
    hydrateOfflineQueue();
    set((s) => {
      const remove = new Set(ids);
      const queue = s.queue.filter((m) => !remove.has(m.id));
      persist(queue);
      return { queue };
    });
  },
  replaceMany: (updated) => {
    hydrateOfflineQueue();
    set((s) => {
      const byId = new Map(updated.map((m) => [m.id, m]));
      const queue = s.queue.map((m) => byId.get(m.id) ?? m);
      persist(queue);
      return { queue };
    });
  },
  // `clear` deliberately does NOT hydrate first: it means "discard everything", and reading the
  // disk back in only to erase it is wasted work.
  clear: () =>
    set(() => {
      persist([]);
      return { queue: [], hydrated: true };
    }),
}));

/**
 * Read the persisted queue back into the store. Called once at startup by the sync service.
 *
 * Persisted entries are placed BEFORE anything enqueued during this session, preserving causal
 * order: a completion recorded yesterday offline must reach the server ahead of today's.
 * Idempotent — a second call is a no-op, so remounting the orchestration hook cannot duplicate
 * pending mutations.
 */
export function hydrateOfflineQueue(): void {
  if (useOfflineQueueStore.getState().hydrated) return;
  const persisted = readPersisted();
  useOfflineQueueStore.setState((s) => {
    const known = new Set(s.queue.map((m) => m.id));
    return { queue: [...persisted.filter((m) => !known.has(m.id)), ...s.queue], hydrated: true };
  });
}

/** Test seam: forget hydration so a fresh read can be observed. */
export function resetOfflineQueueForTests(): void {
  useOfflineQueueStore.setState({ queue: [], hydrated: false });
}
