/**
 * Tests for the auth-session secure store (OWASP M1/M9).
 *
 * These assert the properties that make the store safe to hold a bearer credential, not that a
 * Map round-trips a string: that a session larger than SecureStore's 2048-byte practical limit
 * survives intact, that a shrinking session leaves no stale ciphertext behind, that a torn write
 * reads as absent rather than as half a session, and that an unavailable SecureStore degrades
 * loudly instead of crashing app launch.
 *
 * The `mock` prefixes are required: jest forbids a mock factory from closing over any out-of-scope
 * variable that is not so named.
 */
const mockStore = new Map<string, string>();
let mockFail: Error | null = null;

jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
  getItemAsync: jest.fn(async (k: string) => {
    if (mockFail) throw mockFail;
    return mockStore.get(k) ?? null;
  }),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    if (mockFail) throw mockFail;
    mockStore.set(k, v);
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    if (mockFail) throw mockFail;
    mockStore.delete(k);
  }),
}));

import {
  createSecureSessionStorage,
  getSessionStorageBackend,
  resetSessionStorageBackendForTests,
} from '../secureSessionStorage';

const KEY = 'sb-abcdefgh-auth-token';

beforeEach(() => {
  mockStore.clear();
  mockFail = null;
  resetSessionStorageBackendForTests();
  jest.clearAllMocks();
});

describe('secureSessionStorage', () => {
  it('round-trips a session larger than the 2048-byte SecureStore limit', async () => {
    const storage = createSecureSessionStorage();
    // A realistic session: access JWT + refresh token + user object comfortably exceeds 2048.
    const session = JSON.stringify({
      access_token: 'a'.repeat(3000),
      refresh_token: 'r'.repeat(900),
    });
    expect(session.length).toBeGreaterThan(2048);

    await storage.setItem(KEY, session);
    await expect(storage.getItem(KEY)).resolves.toBe(session);
  });

  it('splits across multiple chunk keys rather than writing one oversized value', async () => {
    const storage = createSecureSessionStorage();
    await storage.setItem(KEY, 'x'.repeat(5000));

    // Nothing written may exceed the limit, or SecureStore drops it on Android.
    for (const [k, v] of mockStore) {
      expect(v.length).toBeLessThanOrEqual(2048);
      expect(k.startsWith(KEY)).toBe(true);
    }
    expect(mockStore.get(`${KEY}.n`)).toBe('3');
  });

  it('returns null when no session has been stored', async () => {
    const storage = createSecureSessionStorage();
    await expect(storage.getItem(KEY)).resolves.toBeNull();
  });

  it('deletes stale chunks when a shorter session replaces a longer one', async () => {
    const storage = createSecureSessionStorage();
    await storage.setItem(KEY, 'x'.repeat(5000)); // 3 chunks
    await storage.setItem(KEY, 'y'.repeat(100)); // 1 chunk

    // The tail of the previous session must not remain encrypted on disk — nothing would ever
    // clear it, and it is credential material.
    expect(mockStore.has(`${KEY}.1`)).toBe(false);
    expect(mockStore.has(`${KEY}.2`)).toBe(false);
    await expect(storage.getItem(KEY)).resolves.toBe('y'.repeat(100));
  });

  it('reads as absent when a chunk is missing (torn write)', async () => {
    const storage = createSecureSessionStorage();
    await storage.setItem(KEY, 'x'.repeat(5000));
    mockStore.delete(`${KEY}.1`); // simulate a process kill mid-write

    // Half a session is not a session. Returning the surviving fragment would hand auth-js
    // something it would try to parse as JSON.
    await expect(storage.getItem(KEY)).resolves.toBeNull();
  });

  it('reads as absent when the chunk count is corrupt', async () => {
    const storage = createSecureSessionStorage();
    mockStore.set(`${KEY}.n`, 'not-a-number');
    await expect(storage.getItem(KEY)).resolves.toBeNull();
  });

  it('removes every chunk on sign-out', async () => {
    const storage = createSecureSessionStorage();
    await storage.setItem(KEY, 'x'.repeat(5000));
    await storage.removeItem(KEY);

    expect(mockStore.size).toBe(0);
    await expect(storage.getItem(KEY)).resolves.toBeNull();
  });

  it('degrades to memory and reports it when SecureStore is unavailable', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const storage = createSecureSessionStorage();

    mockFail = new Error('Keystore unavailable');
    await storage.setItem(KEY, 'session');

    // Loud, because a silent degradation here reintroduces the exact bug this file fixes: the
    // session stops persisting and an anonymous user is issued a new id on next launch.
    expect(warn).toHaveBeenCalled();
    expect(getSessionStorageBackend()).toBe('memory');

    // And it must keep working — a failed keystore must not take down app launch.
    mockFail = null;
    await expect(storage.getItem(KEY)).resolves.toBe('session');
    warn.mockRestore();
  });

  it('reports the secure-store backend once a write succeeds', async () => {
    const storage = createSecureSessionStorage();
    expect(getSessionStorageBackend()).toBeNull(); // lazy: nothing resolved yet
    await storage.setItem(KEY, 'session');
    expect(getSessionStorageBackend()).toBe('secure-store');
  });
});
