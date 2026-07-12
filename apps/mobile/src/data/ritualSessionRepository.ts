import { MMKV } from 'react-native-mmkv';
import type { RitualSession } from '../domain/ritual';
import type { RitualSessionStore } from '../domain/ritual';

interface KeyValueStore { getString(key: string): string | undefined; set(key: string, value: string): void; delete(key: string): void; }

/** Durable local repository for ritual sessions; independent of network/server state. */
export class RitualSessionRepository implements RitualSessionStore {
  constructor(private readonly storage: KeyValueStore = new MMKV(), private readonly prefix = 'ritual-session') {}

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
