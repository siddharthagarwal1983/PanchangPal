import { QueryClient } from '@tanstack/react-query';
import {
  PERSISTED_QUERY_ROOTS,
  QUERY_CACHE_MAX_AGE_MS,
  installQueryPersistence,
  reapplyPendingMutations,
  restoreQueryCache,
  saveQueryCache,
  shouldPersistQuery,
} from '../queryPersistence';
import type { KeyValueStore } from '../keyValueStore';
import type { QueuedMutation } from '../../domain/sync';
import {
  resetOfflineQueueForTests,
  setOfflineQueueStorageForTests,
} from '../../store/offlineQueue';

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

// Every client built here is torn down after the test: a live QueryClient holds gc timers, which
// keep the jest worker alive past the run.
const clients: QueryClient[] = [];

function newClient(): QueryClient {
  const qc = new QueryClient();
  clients.push(qc);
  return qc;
}

function clientWith(entries: [readonly unknown[], unknown][]): QueryClient {
  const qc = newClient();
  for (const [key, data] of entries) qc.setQueryData(key as unknown[], data);
  return qc;
}

afterEach(() => {
  for (const qc of clients.splice(0)) qc.clear();
});

describe('shouldPersistQuery', () => {
  it('persists the daily loop, which §6.2 requires to work offline', () => {
    for (const root of PERSISTED_QUERY_ROOTS) {
      expect(shouldPersistQuery([root, '2026-07-26'])).toBe(true);
    }
  });

  it('never persists entitlement — the device is not the authority on paid access', () => {
    // A stale copy off disk would grant or deny premium from a snapshot the server has already
    // changed. The entitlement table denies client writes for the same reason.
    expect(shouldPersistQuery(['entitlement', 'anon'])).toBe(false);
  });

  it('never persists an invite token', () => {
    expect(shouldPersistQuery(['invite', 'tok_123'])).toBe(false);
  });

  it('ignores a non-string key root rather than guessing', () => {
    expect(shouldPersistQuery([{ scope: 'today' }])).toBe(false);
    expect(shouldPersistQuery([])).toBe(false);
  });
});

describe('query cache persistence', () => {
  it('survives a cold start, so an offline launch is not empty', () => {
    // The gap this closes: the queue made writes durable while reads stayed in memory, so killing
    // the app offline discarded today's panchang, ritual, checklist and streak entirely.
    const disk = new MemoryStorage();
    saveQueryCache(clientWith([[['today', '2026-07-26'], { tithi: 'cached' }]]), disk);

    const restored = newClient();
    expect(restoreQueryCache(restored, disk)).toBe(true);
    expect(restored.getQueryData(['today', '2026-07-26'])).toEqual({ tithi: 'cached' });
  });

  it('leaves network-only data behind', () => {
    const disk = new MemoryStorage();
    saveQueryCache(
      clientWith([
        [['today', '2026-07-26'], { tithi: 'cached' }],
        [['entitlement', 'anon'], { active: true }],
      ]),
      disk,
    );

    const restored = newClient();
    restoreQueryCache(restored, disk);
    expect(restored.getQueryData(['today', '2026-07-26'])).toBeDefined();
    expect(restored.getQueryData(['entitlement', 'anon'])).toBeUndefined();
  });

  it('discards a cache older than a day', () => {
    const disk = new MemoryStorage();
    const savedAt = 1_000_000;
    saveQueryCache(clientWith([[['today', '2026-07-26'], { tithi: 'stale' }]]), disk, savedAt);

    const restored = newClient();
    const wellPast = savedAt + QUERY_CACHE_MAX_AGE_MS + 1;
    expect(restoreQueryCache(restored, disk, wellPast)).toBe(false);
    expect(restored.getQueryData(['today', '2026-07-26'])).toBeUndefined();
  });

  it('discards a cache written by a different build', () => {
    const disk = new MemoryStorage();
    disk.set(
      'query-cache:v1',
      JSON.stringify({ savedAt: Date.now(), buster: 'v0-old', state: { queries: [] } }),
    );
    expect(restoreQueryCache(newClient(), disk)).toBe(false);
  });

  it('discards an unreadable cache rather than failing the launch', () => {
    const disk = new MemoryStorage();
    disk.set('query-cache:v1', '{ not json');
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => restoreQueryCache(newClient(), disk)).not.toThrow();
    expect(restoreQueryCache(newClient(), disk)).toBe(false);
    jest.restoreAllMocks();
  });

  it('restores nothing when no cache has been written', () => {
    expect(restoreQueryCache(newClient(), new MemoryStorage())).toBe(false);
  });

  it('keeps working when storage throws', () => {
    const broken: KeyValueStore = {
      getString: () => {
        throw new Error('unavailable');
      },
      set: () => {
        throw new Error('unavailable');
      },
      delete: () => {},
    };
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => saveQueryCache(clientWith([[['today'], {}]]), broken)).not.toThrow();
    expect(restoreQueryCache(newClient(), broken)).toBe(false);
    jest.restoreAllMocks();
  });

  it('does not persist mutations, which STORE_offlineQueue already owns durably', () => {
    // Two independent replay paths for one completion is how a ritual gets recorded twice.
    const disk = new MemoryStorage();
    saveQueryCache(clientWith([[['today'], {}]]), disk);
    const raw = JSON.parse(disk.getString('query-cache:v1') as string);
    expect(raw.state.mutations).toEqual([]);
  });
});

/**
 * The launch blocker `FLOW_OFFLINE_SYNC` catches at ~50%: a completion made offline is still shown
 * after the process is killed.
 *
 * These assert the SEAM, not the pure rule — `pendingProjection.test.ts` covers the rule. What is
 * proven here is that a cache restored WITHOUT the completion (because the write throttle lost the
 * race to the kill, which is the real-device case) is corrected from the durable queue.
 */
describe('reapplyPendingMutations', () => {
  const localDate = '2026-07-28';
  const serverTruth = [
    { id: 'item-1', label: 'Light the lamp', complete: false },
    { id: 'item-2', label: 'Offer water', complete: false },
  ];

  function pendingChecklist(itemId: string, day = localDate): QueuedMutation {
    return {
      id: `m-${itemId}`,
      kind: 'checklist',
      payload: { item_id: itemId, local_date: day },
      client_id: `m-${itemId}`,
      local_ts: '2026-07-28T07:30:00.000Z',
      attempts: 0,
    };
  }

  it('shows a completion the throttled snapshot never captured', () => {
    // The exact failure: disk holds the UNCHECKED server state, the queue holds the completion.
    const qc = clientWith([[['checklist', localDate], serverTruth]]);

    reapplyPendingMutations(qc, [pendingChecklist('item-1')]);

    expect(qc.getQueryData(['checklist', localDate])).toEqual([
      { id: 'item-1', label: 'Light the lamp', complete: true },
      { id: 'item-2', label: 'Offer water', complete: false },
    ]);
  });

  it('does not invent a cache entry for a checklist that has never loaded', () => {
    // Seeding one would render a completion against rows the screen cannot name.
    const qc = newClient();
    reapplyPendingMutations(qc, [pendingChecklist('item-1')]);
    expect(qc.getQueryData(['checklist', localDate])).toBeUndefined();
  });

  it('leaves another day’s cached list untouched', () => {
    const qc = clientWith([[['checklist', localDate], serverTruth]]);
    reapplyPendingMutations(qc, [pendingChecklist('item-1', '2026-07-27')]);
    expect(qc.getQueryData(['checklist', localDate])).toEqual(serverTruth);
  });

  it('is idempotent, so a second launch does not churn subscribers', () => {
    const qc = clientWith([[['checklist', localDate], serverTruth]]);
    reapplyPendingMutations(qc, [pendingChecklist('item-1')]);
    const first = qc.getQueryData(['checklist', localDate]);
    reapplyPendingMutations(qc, [pendingChecklist('item-1')]);
    expect(qc.getQueryData(['checklist', localDate])).toBe(first);
  });

  /**
   * The WIRING, which is the part a regression would actually remove. The test above proves the
   * projection; this one proves `installQueryPersistence` performs it, by reconstructing the real
   * device situation: a snapshot on disk taken BEFORE the tap (the throttle lost the race to the
   * kill) and a queue on disk written synchronously during it.
   *
   * Delete the `reapplyPendingMutations` call from `installQueryPersistence` and this fails.
   */
  it('corrects the restored cache from the durable queue on launch', () => {
    const disk = new MemoryStorage();
    saveQueryCache(clientWith([[['checklist', localDate], serverTruth]]), disk);

    const queueDisk = new MemoryStorage();
    queueDisk.set('offline-queue:v1', JSON.stringify([pendingChecklist('item-1')]));
    setOfflineQueueStorageForTests(queueDisk);
    resetOfflineQueueForTests();

    const relaunched = newClient();
    const uninstall = installQueryPersistence(relaunched, disk);

    expect(relaunched.getQueryData(['checklist', localDate])).toEqual([
      { id: 'item-1', label: 'Light the lamp', complete: true },
      { id: 'item-2', label: 'Offer water', complete: false },
    ]);

    uninstall();
    setOfflineQueueStorageForTests(null);
    resetOfflineQueueForTests();
  });
});
