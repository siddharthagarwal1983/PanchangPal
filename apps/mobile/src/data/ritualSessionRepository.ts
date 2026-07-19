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

/** Which backend actually serves ritual sessions. */
export type StorageBackend = 'mmkv' | 'memory';

let activeBackend: StorageBackend | null = null;

/**
 * The backend in use, or null before any storage has been resolved (it is lazy).
 *
 * This exists because the fallback below is SILENT, and silence made a real question
 * unanswerable: after completing a ritual, force-stopping the app and reopening it showed the
 * intro again. "The session was never persisted" and "MMKV is unavailable, so memory was used
 * and lost" produce identical behaviour, and nothing distinguished them from outside. Degrading
 * quietly is still the right call for the user — a screen crash is worse — but the degradation
 * must be observable to whoever is debugging it.
 */
export function getStorageBackend(): StorageBackend | null {
  return activeBackend;
}

/**
 * MMKV is a native module: it does not exist in Expo Go, and construction throws there
 * ("react-native-mmkv is not supported in Expo Go"). It can also fail on a real device.
 * Degrade to memory rather than taking the screen down — but say so.
 */
function createDeviceStore(): KeyValueStore {
  try {
    const store = new MMKV();
    activeBackend = 'mmkv';
    return store;
  } catch (error) {
    activeBackend = 'memory';
    // Warn, not throw: the ritual still works, it just will not survive a restart. Visible in
    // Metro and in `adb logcat`, which is where this question gets asked.
    console.warn(
      '[ritual] Persistent storage unavailable — falling back to memory. Ritual sessions will NOT ' +
        'survive an app restart. Expected in Expo Go (no native modules); investigate on a native build.',
      error,
    );
    return createMemoryStore();
  }
}

/** Test seam: forget the resolved backend so a fresh resolution can be observed. */
export function resetStorageBackendForTests(): void {
  activeBackend = null;
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
