/**
 * Persisted query cache (TDD Part 4 §6.1) — the READ half of offline-first, and the other thing
 * `queryClient.ts` promised "during the offline-queue task".
 *
 * Without it the drain covers writes while a cold start offline shows nothing at all: TanStack
 * Query's cache is in memory, so killing the app discards today's panchang, ritual text, checklist
 * and streak. §6.2 is `[MANDATORY]` that those are "fully usable" offline, which a mutation queue
 * alone cannot deliver.
 *
 * Built on `dehydrate`/`hydrate` from `@tanstack/react-query` rather than on
 * `persistQueryClient`. That helper lives in `@tanstack/query-persist-client-core`, which is NOT a
 * declared dependency of this app — only `createAsyncStoragePersister` is exported from what is
 * declared, and reaching into a package that merely happens to be in the pnpm store is the
 * undeclared-transitive-dependency defect this repo has already paid for twice (`@babel/runtime`,
 * `babel-preset-expo`): it resolves on one build path and fails on another. Adding the dependency
 * properly is a lockfile change; the ~40 lines below use only what is declared.
 *
 * Storage goes through the shared `KeyValueStore` seam, so this degrades to memory on a device
 * without the native module exactly as the ritual session store and the offline queue do.
 */
import { dehydrate, hydrate, type QueryClient } from '@tanstack/react-query';
import { createDeviceStore, type KeyValueStore } from './keyValueStore';

/**
 * Query key roots written to disk.
 *
 * Taken from §6.1's persisted set (today/panchang/calendar/ritual/streak/prefs) plus `checklist`,
 * which §6.2 lists among the things that must be fully usable offline.
 *
 * What is deliberately ABSENT matters more. §6.2 names Ask Guru, invites, auth and subscription as
 * network-only, so `entitlement` and `invite` stay in memory:
 *  - `entitlement` gates paid capability and is server-authoritative and household-grain. A stale
 *    copy read off disk would grant or deny premium from a snapshot the server has already
 *    changed, and the entitlement table denies client writes precisely so the device is never the
 *    authority on it.
 *  - `invite` is a short-lived token; persisting it writes a credential-shaped value to disk.
 * Ask Guru conversations are not persisted either — ADR-031's argument against user-content on
 * disk applies most strongly to what someone asked a spiritual assistant.
 */
export const PERSISTED_QUERY_ROOTS = [
  'today',
  'calendar',
  'ritual',
  'checklist',
  'streak',
  'preferences',
  'notif_prefs',
] as const;

/** Pure: whether a query belongs on disk. Exported so the allowlist is testable without a device. */
export function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  const root = queryKey[0];
  return typeof root === 'string' && (PERSISTED_QUERY_ROOTS as readonly string[]).includes(root);
}

const CACHE_KEY = 'query-cache:v1';

/** Matches the client's `gcTime`: a day-old panchang is still the right answer for that day. */
export const QUERY_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Coalesce writes; a burst of query settles should cost one serialization, not ten. */
const WRITE_THROTTLE_MS = 1_000;

interface PersistedCache {
  savedAt: number;
  buster: string;
  /** `dehydrate()`'s output. Opaque here; only TanStack Query interprets it. */
  state: unknown;
}

/**
 * Bump to discard every persisted cache. A restored entry is only safe if it matches the shape the
 * current build expects; changing a query's response shape without busting would hydrate the old
 * one into new code.
 */
const CACHE_BUSTER = 'v1';

/**
 * Restore a previously persisted cache into the client. Safe to call before any query mounts.
 *
 * Silently ignores a cache that is corrupt, from another build, or older than `maxAge` — each of
 * those must cost a refetch, never a launch.
 */
export function restoreQueryCache(
  queryClient: QueryClient,
  store: KeyValueStore,
  now: number = Date.now(),
): boolean {
  let raw: string | undefined;
  try {
    raw = store.getString(CACHE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  let parsed: PersistedCache;
  try {
    parsed = JSON.parse(raw) as PersistedCache;
  } catch {
    console.warn('[cache] The persisted query cache was unreadable and has been discarded.');
    try {
      store.delete(CACHE_KEY);
    } catch {
      /* nothing more to do; the buster will retire it */
    }
    return false;
  }

  if (parsed?.buster !== CACHE_BUSTER) return false;
  if (typeof parsed.savedAt !== 'number' || now - parsed.savedAt > QUERY_CACHE_MAX_AGE_MS) {
    return false;
  }

  hydrate(queryClient, parsed.state);
  return true;
}

/** Serialize the allowlisted, successful part of the cache. */
export function saveQueryCache(
  queryClient: QueryClient,
  store: KeyValueStore,
  now: number = Date.now(),
): void {
  const state = dehydrate(queryClient, {
    // Only successful data goes to disk. Persisting an error state would restore a failed screen
    // on a launch that might have perfectly good connectivity.
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' && shouldPersistQuery(query.queryKey),
    // The offline mutation queue is STORE_offlineQueue's job, and it is already durable. Letting
    // TanStack persist mutations too would give a completion two independent replay paths.
    shouldDehydrateMutation: () => false,
  });
  const payload: PersistedCache = { savedAt: now, buster: CACHE_BUSTER, state };
  try {
    store.set(CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[cache] Could not persist the query cache; offline reads may be empty.', error);
  }
}

/**
 * Restore, then keep the cache in sync. Returns an unsubscribe handle.
 *
 * Called from an effect, never at module scope — resolving device storage during module evaluation
 * is the eager-side-effect defect this repo has fixed four times.
 */
export function installQueryPersistence(
  queryClient: QueryClient,
  store: KeyValueStore = createDeviceStore(),
): () => void {
  restoreQueryCache(queryClient, store);

  let timer: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      saveQueryCache(queryClient, store);
    }, WRITE_THROTTLE_MS);
  });

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
    // Flush on teardown so the last settled queries are not lost to the throttle window.
    saveQueryCache(queryClient, store);
  };
}
