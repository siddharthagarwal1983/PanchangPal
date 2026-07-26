/**
 * Secure storage for the Supabase auth session (OWASP Mobile M1 — Improper Credential Usage,
 * M9 — Insecure Data Storage).
 *
 * WHY THIS FILE EXISTS. `supabaseClient.ts` asked for `persistSession: true` and passed no
 * `storage` adapter. React Native has no `localStorage`, so auth-js falls back to an in-memory
 * store: the flag asked for persistence and got memory. Because the app is anon-first, the effect
 * was not a lost login but a lost IDENTITY — `restore()` returned null on every cold start and
 * `session.ts` minted a fresh anonymous uid, orphaning the previous user's profile, household,
 * streak, completions, personal dates and conversations. Silently, on every restart.
 *
 * Nothing caught it: FLOW_RETURNING asserts SEEDED content, which a brand-new anonymous user sees
 * identically, and FLOW_SESSION_PERSISTENCE covers the MMKV ritual session, which is device-local
 * and keyed independently of the uid. Same defect class as the mmkv v2 bug (PR #36) — a
 * persistence layer degrading to memory, invisible to every unit test.
 *
 * WHY NOT THE `KeyValueStore` SEAM. That seam is MMKV, which is unencrypted at rest. A refresh
 * token is a bearer credential: on a rooted or backed-up device an unencrypted store hands over an
 * account. SecureStore is Keychain (iOS) / Keystore-backed encrypted prefs (Android), which is what
 * OWASP M9 asks for. `expo-secure-store` was already a dependency and an app.config plugin — wired
 * to nothing — which is fair evidence this was the original intent.
 */
import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore warns above 2048 bytes per value, and a Supabase session (access JWT + refresh token
 * + user object) routinely exceeds it. Values are split across numbered chunk keys and a count key.
 * 1800 leaves headroom for the key suffix and multi-byte characters.
 */
const CHUNK_SIZE = 1800;

/**
 * iOS accessibility class. AFTER_FIRST_UNLOCK rather than the WHEN_UNLOCKED default because
 * `autoRefreshToken` can fire while the app is backgrounded and the device locked; with
 * WHEN_UNLOCKED that write fails and the refreshed session is silently dropped — reintroducing the
 * bug this file fixes, in a narrower window. AFTER_FIRST_UNLOCK still denies access before the
 * first post-boot unlock, so the credential is not readable from a cold, locked device.
 */
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

/** Supabase's storage contract (auth-js `SupportedStorage`). Async is supported and used here. */
export interface SessionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Which backend actually serves the auth session. Mirrors `getStorageBackend()` in keyValueStore. */
export type SessionStorageBackend = 'secure-store' | 'memory';

let activeBackend: SessionStorageBackend | null = null;

/**
 * The backend in use, or null before the first operation (resolution is lazy).
 *
 * Exists for the same reason `getStorageBackend()` does: the fallback below is silent from the
 * user's perspective, and "the session was never saved" and "SecureStore was unavailable, so
 * memory was used and lost" produce identical behaviour from outside.
 */
export function getSessionStorageBackend(): SessionStorageBackend | null {
  return activeBackend;
}

const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;

/**
 * Fall back to memory rather than throwing. A failed read must not take down app launch — the app
 * is anon-first, so the worst case degrades to today's behaviour (a new anonymous session) instead
 * of a crash on the splash screen.
 */
function degrade(operation: string, error: unknown): void {
  if (activeBackend !== 'memory') {
    console.warn(
      `[auth-storage] SecureStore unavailable during ${operation} — falling back to memory. ` +
        'The signed-in session will NOT survive an app restart, and an anonymous user will be ' +
        'issued a NEW id on next launch, orphaning their data. Investigate on a native build.',
      error,
    );
  }
  activeBackend = 'memory';
}

export function createMemorySessionStorage(): SessionStorage {
  const map = new Map<string, string>();
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => void map.set(key, value),
    removeItem: async (key) => void map.delete(key),
  };
}

export function createSecureSessionStorage(): SessionStorage {
  const memory = createMemorySessionStorage();

  return {
    async getItem(key) {
      if (activeBackend === 'memory') return memory.getItem(key);
      try {
        const rawCount = await SecureStore.getItemAsync(countKey(key), OPTIONS);
        if (rawCount === null) return null;

        const count = Number.parseInt(rawCount, 10);
        // A non-numeric or negative count means the record is corrupt. Treat it as absent rather
        // than reassembling garbage into something auth-js will try to parse as a session.
        if (!Number.isInteger(count) || count < 0) return null;

        const chunks: string[] = [];
        for (let i = 0; i < count; i += 1) {
          const part = await SecureStore.getItemAsync(chunkKey(key, i), OPTIONS);
          // A missing chunk means a torn write (killed mid-`setItem`). Half a session is not a
          // session; report absent so auth-js starts clean instead of failing to parse.
          if (part === null) return null;
          chunks.push(part);
        }
        return chunks.join('');
      } catch (error) {
        degrade('getItem', error);
        return memory.getItem(key);
      }
    },

    async setItem(key, value) {
      if (activeBackend === 'memory') return memory.setItem(key, value);
      try {
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE));
        }

        // Read the previous count BEFORE writing, so chunks beyond the new length can be removed.
        // Without this a shorter session leaves the tail of a longer one encrypted on disk —
        // stale credential material that no code path would ever clear.
        const previousRaw = await SecureStore.getItemAsync(countKey(key), OPTIONS);
        const previous = previousRaw === null ? 0 : Number.parseInt(previousRaw, 10);

        for (const [i, chunk] of chunks.entries()) {
          await SecureStore.setItemAsync(chunkKey(key, i), chunk, OPTIONS);
        }
        // Count is written LAST: until it lands the record reads as absent, so a write killed
        // halfway leaves no partially-readable session behind.
        await SecureStore.setItemAsync(countKey(key), String(chunks.length), OPTIONS);

        if (Number.isInteger(previous)) {
          for (let i = chunks.length; i < previous; i += 1) {
            await SecureStore.deleteItemAsync(chunkKey(key, i), OPTIONS);
          }
        }
        activeBackend = 'secure-store';
      } catch (error) {
        degrade('setItem', error);
        return memory.setItem(key, value);
      }
    },

    async removeItem(key) {
      if (activeBackend === 'memory') return memory.removeItem(key);
      try {
        const rawCount = await SecureStore.getItemAsync(countKey(key), OPTIONS);
        const count = rawCount === null ? 0 : Number.parseInt(rawCount, 10);
        // Delete the count first: the record reads as absent immediately, so a sign-out
        // interrupted partway can never leave a readable session behind.
        await SecureStore.deleteItemAsync(countKey(key), OPTIONS);
        if (Number.isInteger(count)) {
          for (let i = 0; i < count; i += 1) {
            await SecureStore.deleteItemAsync(chunkKey(key, i), OPTIONS);
          }
        }
      } catch (error) {
        degrade('removeItem', error);
        return memory.removeItem(key);
      }
    },
  };
}

/** Test seam: forget the resolved backend so a fresh resolution can be observed. */
export function resetSessionStorageBackendForTests(): void {
  activeBackend = null;
}
