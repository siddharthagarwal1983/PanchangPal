import { QueryClient } from '@tanstack/react-query';
import {
  PERSISTED_QUERY_ROOTS,
  QUERY_CACHE_MAX_AGE_MS,
  restoreQueryCache,
  saveQueryCache,
  shouldPersistQuery,
} from '../queryPersistence';
import type { KeyValueStore } from '../keyValueStore';

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
