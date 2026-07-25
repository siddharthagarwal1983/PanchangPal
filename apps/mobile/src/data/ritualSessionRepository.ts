import type {
  RitualSession,
  RitualSessionStore,
} from '../domain/ritual';
import { createDeviceStore, type KeyValueStore } from './keyValueStore';

// The storage seam itself moved to ./keyValueStore when the analytics pseudonymous id needed the
// same degrade-to-memory behaviour. Re-exported here because this module was its only home for two
// milestones and callers (and tests) still reach for it through the repository.
export {
  getStorageBackend,
  resetStorageBackendForTests,
  type KeyValueStore,
  type StorageBackend,
} from './keyValueStore';

/** Durable local repository for ritual sessions; independent of network/server state. */
export class RitualSessionRepository implements RitualSessionStore {
  private _storage?: KeyValueStore;
  private readonly prefix: string;

  // Storage resolves on FIRST USE, never at construction. Constructing MMKV as a default
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
