import { MMKV } from 'react-native-mmkv';
import type {
  RitualSession,
  RitualSessionStore,
} from '../domain/ritual';

interface KeyValueStore { getString(key: string): string | undefined; set(key: string, value: string): void; delete(key: string): void; }

/**
 * In-memory fallback. Loses sessions when the process restarts, which costs a user the
 * ability to resume a ritual after closing the app — strictly better than the alternative,
 * which was the whole screen crashing.
 */
function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getString: (key) => map.get(key),
    set: (key, value) => void map.set(key, value),
    delete: (key) => void map.delete(key),
  };
}

/**
 * MMKV is a native module: it does not exist in Expo Go, and construction throws there
 * ("react-native-mmkv is not supported in Expo Go"). It can also fail on a real device.
 * Degrade to memory rather than taking the screen down.
 */
function createDeviceStore(): KeyValueStore {
  try {
    return new MMKV();
  } catch {
    return createMemoryStore();
  }
}

/** Durable local repository for ritual sessions; independent of network/server state. */
export class RitualSessionRepository implements RitualSessionStore {
  private _storage?: KeyValueStore;
  private readonly prefix: string;

  // Storage resolves on FIRST USE, never at construction. `new MMKV()` as a default
  // parameter ran the moment the repository was built — synchronously, inside the ritual
  // screen's effect — so it threw past the promise's .catch() and reached the app-level
  // ErrorBoundary as a render error. Same shape as the getSupabase() default-parameter
  // defect fixed across the data layer.
  constructor(storage?: KeyValueStore, prefix = 'ritual-session') {
    this._storage = storage;
    this.prefix = prefix;
  }

  private get storage(): KeyValueStore {
    return (this._storage ??= createDeviceStore());
  }

  async load(ritualId: string, localDate: string): Promise<RitualSession | null> {
    const raw = this.storage.getString(this.key(ritualId, localDate));
    if (!raw) return null;
    try { return JSON.parse(raw) as RitualSession; } catch { return null; }
  }

  async save(session: RitualSession): Promise<void> { this.storage.set(this.key(session.ritualId, session.localDate), JSON.stringify(session)); }
  async clear(ritualId: string, localDate: string): Promise<void> { this.storage.delete(this.key(ritualId, localDate)); }
  private key(ritualId: string, localDate: string): string { return `${this.prefix}:${ritualId}:${localDate}`; }
}

let defaultRepository: RitualSessionRepository | null = null;

/** Created lazily so repository tests can use an injected in-memory store without a native module. */
export function getRitualSessionRepository(): RitualSessionRepository {
  if (!defaultRepository) defaultRepository = new RitualSessionRepository();
  return defaultRepository;
}
