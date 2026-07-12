/**
 * Guru conversation history (SCR_GURU_HISTORY_001; TDD Part 4 §7.1, owner-only, no cross-session
 * memory). A trust-safe LOCAL record of the user's own past questions + the server's outcome
 * (grounded/declined/refused/error) — never a fabricated answer. Persistence is an injected
 * key-value seam (MMKV in the app; in-memory in tests). The authoritative store is the server
 * (TBL_CONVERSATION/MESSAGE); this is the offline-readable cache.
 */
import type { GuruOutcome } from './types';

export interface ConversationSummary {
  id: string;
  question: string;
  outcome: GuruOutcome;
  createdAt: string; // ISO-8601
}

/** Minimal persistence port (get/set a JSON string). Defaults to in-memory; app wires MMKV. */
export interface HistoryStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
}

class InMemoryStorage implements HistoryStorage {
  #m = new Map<string, string>();
  getString(k: string) { return this.#m.get(k); }
  set(k: string, v: string) { this.#m.set(k, v); }
}

export interface GuruHistoryRepository {
  list(): ConversationSummary[];
  record(entry: ConversationSummary): void;
  clear(): void;
}

const KEY = 'guru.history.v1';
const MAX = 100;

export class LocalGuruHistoryRepository implements GuruHistoryRepository {
  constructor(private storage: HistoryStorage = new InMemoryStorage()) {}

  list(): ConversationSummary[] {
    const raw = this.storage.getString(KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as ConversationSummary[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  record(entry: ConversationSummary): void {
    const next = [entry, ...this.list().filter((e) => e.id !== entry.id)].slice(0, MAX);
    this.storage.set(KEY, JSON.stringify(next));
  }

  clear(): void {
    this.storage.set(KEY, '[]');
  }
}

/** App-wide instance. Swap the storage for MMKV at app init (persist across launches). */
export const guruHistoryRepository = new LocalGuruHistoryRepository();
