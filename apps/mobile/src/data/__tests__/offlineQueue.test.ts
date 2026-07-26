import {
  hydrateOfflineQueue,
  resetOfflineQueueForTests,
  setOfflineQueueStorageForTests,
  useOfflineQueueStore,
  type QueuedMutation,
} from '../../store/offlineQueue';
import type { KeyValueStore } from '../keyValueStore';

/** Stands in for the device store; the same instance across a "restart" is the disk. */
class MemoryStorage implements KeyValueStore {
  readonly values = new Map<string, string>();
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

describe('STORE_offlineQueue persistence', () => {
  let disk: MemoryStorage;

  beforeEach(() => {
    disk = new MemoryStorage();
    setOfflineQueueStorageForTests(disk);
    resetOfflineQueueForTests();
  });

  afterEach(() => setOfflineQueueStorageForTests(null));

  it('survives an app kill — the defect this store shipped with for eight milestones', () => {
    // The queue was a plain in-memory zustand slice beneath a header claiming MMKV persistence.
    // An offline completion was therefore lost the moment the OS reclaimed the process, which is
    // precisely the case §6.3 says must never lose a completion.
    useOfflineQueueStore.getState().enqueue(mutation('a'));

    // Restart: the store forgets everything, the disk does not.
    resetOfflineQueueForTests();
    expect(useOfflineQueueStore.getState().queue).toHaveLength(0);

    hydrateOfflineQueue();
    expect(useOfflineQueueStore.getState().queue.map((m) => m.id)).toEqual(['a']);
  });

  it('keeps a restored mutation ahead of one enqueued this session', () => {
    // Causal order: yesterday's offline completion must reach the server before today's.
    useOfflineQueueStore.getState().enqueue(mutation('yesterday'));
    resetOfflineQueueForTests();

    useOfflineQueueStore.getState().enqueue(mutation('today'));
    hydrateOfflineQueue();

    expect(useOfflineQueueStore.getState().queue.map((m) => m.id)).toEqual(['yesterday', 'today']);
  });

  it('hydrates at most once, so remounting cannot duplicate pending mutations', () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    resetOfflineQueueForTests();

    hydrateOfflineQueue();
    hydrateOfflineQueue();
    hydrateOfflineQueue();

    expect(useOfflineQueueStore.getState().queue).toHaveLength(1);
  });

  it('persists removals, so a synced mutation does not come back after a restart', () => {
    // The leak half of the original defect: nothing ever dequeued, so a mutation that had already
    // been applied online would be replayed on every future drain.
    const store = useOfflineQueueStore.getState();
    store.enqueue(mutation('a'));
    store.enqueue(mutation('b'));
    useOfflineQueueStore.getState().dequeueMany(['a']);

    resetOfflineQueueForTests();
    hydrateOfflineQueue();
    expect(useOfflineQueueStore.getState().queue.map((m) => m.id)).toEqual(['b']);
  });

  it('persists retry bookkeeping so backoff is not reset by a restart', () => {
    useOfflineQueueStore.getState().enqueue(mutation('a'));
    useOfflineQueueStore
      .getState()
      .replaceMany([mutation('a', { attempts: 3, nextAttemptAt: 90_000 })]);

    resetOfflineQueueForTests();
    hydrateOfflineQueue();
    expect(useOfflineQueueStore.getState().queue[0]).toMatchObject({
      attempts: 3,
      nextAttemptAt: 90_000,
    });
  });

  it('discards an unreadable payload rather than crashing every launch', () => {
    disk.set('offline-queue:v1', '{ not json');
    expect(() => hydrateOfflineQueue()).not.toThrow();
    expect(useOfflineQueueStore.getState().queue).toEqual([]);
  });

  it('ignores entries that are not queue mutations', () => {
    disk.set('offline-queue:v1', JSON.stringify([{ nope: true }, mutation('good')]));
    hydrateOfflineQueue();
    expect(useOfflineQueueStore.getState().queue.map((m) => m.id)).toEqual(['good']);
  });

  it('keeps working when storage itself fails', () => {
    // A failed write costs durability across a restart, never the action the user just performed.
    setOfflineQueueStorageForTests({
      getString: () => {
        throw new Error('storage unavailable');
      },
      set: () => {
        throw new Error('storage unavailable');
      },
      delete: () => {},
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => useOfflineQueueStore.getState().enqueue(mutation('a'))).not.toThrow();
    expect(useOfflineQueueStore.getState().queue.map((m) => m.id)).toEqual(['a']);
    expect(() => hydrateOfflineQueue()).not.toThrow();

    jest.restoreAllMocks();
  });
});
