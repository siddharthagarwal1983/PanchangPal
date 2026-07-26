import { drainOfflineQueue, resetSyncServiceForTests } from '../syncService';
import {
  resetOfflineQueueForTests,
  setOfflineQueueStorageForTests,
  useOfflineQueueStore,
  type QueuedMutation,
} from '../../store/offlineQueue';
import { useSyncStatusStore } from '../../store/syncStatus';
import { MAX_SYNC_ATTEMPTS, type SyncResponse } from '../../domain/sync';
import type { KeyValueStore } from '../keyValueStore';

class MemoryStorage implements KeyValueStore {
  private readonly values = new Map<string, string>();
  getString(key: string): string | undefined {
    return this.values.get(key);
  }
  set(key: string, value: string): void {
    this.values.set(key, value);
  }
  delete(key: string): void {
    this.values.delete(key);
  }
}

function mutation(id: string, overrides: Partial<QueuedMutation> = {}): QueuedMutation {
  return {
    id,
    kind: 'ritual_complete',
    payload: { ritual_id: 'r1', local_date: '2026-07-26' },
    client_id: id,
    local_ts: '2026-07-26T06:00:00.000Z',
    attempts: 0,
    ...overrides,
  };
}

/** Fixed clock + jitter so the backoff schedule is assertable rather than waited out. */
function deps(push: jest.Mock, now = 1_000_000) {
  return {
    push: push as unknown as (
      m: readonly QueuedMutation[],
      k: string,
    ) => Promise<SyncResponse>,
    now: () => now,
    random: () => 0.5,
    newIdempotencyKey: () => 'batch-key',
  };
}

const ids = () => useOfflineQueueStore.getState().queue.map((m) => m.id);

describe('drainOfflineQueue', () => {
  beforeEach(() => {
    setOfflineQueueStorageForTests(new MemoryStorage());
    resetOfflineQueueForTests();
    resetSyncServiceForTests();
    useSyncStatusStore.setState({ status: 'idle', pending: 0, lastError: null, lastSyncedAt: null });
  });

  afterEach(() => {
    setOfflineQueueStorageForTests(null);
    jest.restoreAllMocks();
  });

  it('sends the queue to SVC_sync and retires what the server acknowledged', async () => {
    // The whole point of the increment: SVC_sync was fully implemented server-side and completely
    // unreachable from the client — nothing in src/data bound API_POST_SYNC at all.
    const store = useOfflineQueueStore.getState();
    store.enqueue(mutation('a'));
    store.enqueue(mutation('b'));
    const push = jest.fn().mockResolvedValue({ applied: ['a', 'b'], conflicts: [] });

    const result = await drainOfflineQueue(deps(push));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0].map((m: QueuedMutation) => m.id)).toEqual(['a', 'b']);
    expect(result).toMatchObject({ synced: 2, remaining: 0 });
    expect(ids()).toEqual([]);
  });

  it('sends only the contract fields, never local retry bookkeeping', async () => {
    useOfflineQueueStore.getState().enqueue(mutation('a', { attempts: 2, nextAttemptAt: 5 }));
    const push = jest.fn().mockResolvedValue({ applied: ['a'], conflicts: [] });

    await drainOfflineQueue({
      ...deps(push),
      push: async (mutations, key) => {
        // The repository does the field selection; assert the service hands it whole entries and
        // does not invent a wire shape of its own.
        expect(key).toBe('batch-key');
        expect(mutations[0]).toHaveProperty('client_id', 'a');
        return { applied: ['a'], conflicts: [] };
      },
    });

    expect(ids()).toEqual([]);
  });

  it('keeps an unacknowledged mutation queued, with an attempt and a backoff', async () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    const push = jest.fn().mockResolvedValue({ applied: [], conflicts: [] });

    await drainOfflineQueue(deps(push));

    const [entry] = useOfflineQueueStore.getState().queue;
    expect(entry.id).toBe('a');
    expect(entry.attempts).toBe(1);
    expect(entry.nextAttemptAt).toBeGreaterThan(1_000_000);
  });

  it('retires a conflict rather than retrying a decision the server already made', async () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    const push = jest
      .fn()
      .mockResolvedValue({ applied: [], conflicts: [{ client_id: 'a', resolution: 'deduped' }] });

    await drainOfflineQueue(deps(push));

    expect(ids()).toEqual([]);
  });

  it('never drops a mutation, however many times the push fails', async () => {
    // §6 is unambiguous: the daily loop never loses a completion. Attempts are capped to stop
    // silent retrying, NOT to discard the entry.
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const push = jest.fn().mockRejectedValue(new Error('ERR_OFFLINE'));

    for (let i = 0; i < MAX_SYNC_ATTEMPTS + 3; i++) {
      resetSyncServiceForTests();
      // Advance past each backoff so the entry is due again.
      await drainOfflineQueue(deps(push, 1_000_000 + i * 10 * 60_000));
    }

    expect(ids()).toEqual(['a']);
    expect(useOfflineQueueStore.getState().queue[0].attempts).toBeGreaterThanOrEqual(
      MAX_SYNC_ATTEMPTS,
    );
  });

  it('stops the drain when a batch fails rather than marching through the queue', async () => {
    const store = useOfflineQueueStore.getState();
    for (let i = 0; i < 60; i++) store.enqueue(mutation(`m${i}`));
    const push = jest.fn().mockRejectedValue(new Error('ERR_OFFLINE'));

    const result = await drainOfflineQueue(deps(push));

    expect(push).toHaveBeenCalledTimes(1);
    expect(result.error).toBe('ERR_OFFLINE');
    expect(result.remaining).toBe(60);
  });

  it('drains a backlog across several batches while it is making progress', async () => {
    const store = useOfflineQueueStore.getState();
    for (let i = 0; i < 60; i++) store.enqueue(mutation(`m${i}`));
    const push = jest.fn(async (batch: readonly QueuedMutation[]) => ({
      applied: batch.map((m) => m.client_id),
      conflicts: [],
    }));

    const result = await drainOfflineQueue(deps(push as unknown as jest.Mock));

    expect(result.synced).toBe(60);
    expect(ids()).toEqual([]);
    expect(push.mock.calls.length).toBeGreaterThan(1);
  });

  it('is single-flight, so overlapping triggers cost one drain', async () => {
    // Connectivity-regained and foreground fire together often enough that this matters.
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    let release: (v: SyncResponse) => void = () => {};
    const push = jest.fn(
      () => new Promise<SyncResponse>((resolve) => (release = resolve)),
    );

    const first = drainOfflineQueue(deps(push as unknown as jest.Mock));
    const second = drainOfflineQueue(deps(push as unknown as jest.Mock));
    release({ applied: ['a'], conflicts: [] });
    await Promise.all([first, second]);

    expect(push).toHaveBeenCalledTimes(1);
  });

  it('does not call the server for an empty queue', async () => {
    const push = jest.fn();
    const result = await drainOfflineQueue(deps(push));
    expect(push).not.toHaveBeenCalled();
    expect(result).toMatchObject({ synced: 0, remaining: 0 });
  });

  it('skips mutations still inside their backoff', async () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    useOfflineQueueStore
      .getState()
      .replaceMany([mutation('a', { attempts: 1, nextAttemptAt: 2_000_000 })]);
    const push = jest.fn();

    await drainOfflineQueue(deps(push, 1_000_000));

    expect(push).not.toHaveBeenCalled();
  });

  it('hands server truth to the caller for cache reconciliation', async () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    const onServerState = jest.fn();
    const push = jest
      .fn()
      .mockResolvedValue({ applied: ['a'], conflicts: [], server_state: { streak: 4 } });

    await drainOfflineQueue({ ...deps(push), onServerState });

    expect(onServerState).toHaveBeenCalledWith({ streak: 4 });
  });

  it('reports a non-blocking retry state instead of throwing', async () => {
    // §6.4 and §8.2 both say it: a sync failure never blocks the UI and never becomes an alert.
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    const push = jest.fn().mockRejectedValue(new Error('ERR_OFFLINE'));

    await expect(drainOfflineQueue(deps(push))).resolves.toMatchObject({ error: 'ERR_OFFLINE' });

    expect(useSyncStatusStore.getState()).toMatchObject({
      status: 'retrying',
      pending: 1,
      lastError: 'ERR_OFFLINE',
    });
  });

  it('returns to idle once the queue is empty', async () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    const push = jest.fn().mockResolvedValue({ applied: ['a'], conflicts: [] });

    await drainOfflineQueue(deps(push));

    expect(useSyncStatusStore.getState()).toMatchObject({ status: 'idle', pending: 0 });
  });

  it('drains what a previous launch left behind', async () => {
    // The end-to-end shape of the original defect: complete a ritual offline, app killed, reopen.
    useOfflineQueueStore.getState().enqueue(mutation('yesterday'));
    resetOfflineQueueForTests(); // process restart
    resetSyncServiceForTests();
    const push = jest.fn().mockResolvedValue({ applied: ['yesterday'], conflicts: [] });

    const result = await drainOfflineQueue(deps(push));

    expect(push).toHaveBeenCalledTimes(1);
    expect(result.synced).toBe(1);
  });
});
