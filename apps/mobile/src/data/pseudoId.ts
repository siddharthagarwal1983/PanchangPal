/**
 * The analytics pseudonymous identity (`user_pseudo_id`, PDD §11.1 / ADR-031).
 *
 * DERIVATION, decided 2026-07-25: a random UUID minted on first use and persisted locally. It is
 * NOT derived from the Supabase auth uid, an email, or any other identity — nothing links an event
 * row back to a user row without physical access to the device, which is the strongest reading of
 * ADR-031's "pseudonymous, never PII". No document specified a derivation; this one is recorded in
 * DECISIONS.md rather than left implicit in code.
 *
 * The cost is accepted knowingly: a reinstall mints a new id, so a returning user looks new to
 * retention and activation metrics, and one person on two devices counts twice. The North Star
 * (Weekly Household Ritual Completions) is computed by grouping EVT_017 on `household_id`, so the
 * headline metric is unaffected by either.
 *
 * If storage has degraded to memory (Expo Go, or a native module failure), the id is regenerated
 * per launch. Analytics is the right place to absorb that: it makes device counts noisier, and it
 * is strictly better than blocking events or inventing a stable id from the user's identity.
 */
import * as Crypto from 'expo-crypto';
import { createDeviceStore, type KeyValueStore } from './keyValueStore';

const PSEUDO_ID_KEY = 'analytics:user_pseudo_id';

let store: KeyValueStore | undefined;
let cached: string | null = null;

function getStore(): KeyValueStore {
  return (store ??= createDeviceStore());
}

/**
 * The device's pseudonymous id, minting and persisting one on first use.
 *
 * Resolved lazily and cached in memory: this runs on the event path, and a storage read per event
 * is waste. Storage itself resolves on first use rather than at import — an eager side effect in a
 * module body is the defect shape that took down the ritual screen and nine repositories.
 */
export function getUserPseudoId(): string {
  if (cached) return cached;

  const existing = getStore().getString(PSEUDO_ID_KEY);
  if (existing) {
    cached = existing;
    return existing;
  }

  const minted = Crypto.randomUUID();
  try {
    getStore().set(PSEUDO_ID_KEY, minted);
  } catch {
    // A write failure means this id lasts only for the process. Analytics stays lossy rather than
    // fatal; nothing else in the app depends on this value.
  }
  cached = minted;
  return minted;
}

/** Test seam: forget the resolved id and store. */
export function resetPseudoIdForTests(nextStore?: KeyValueStore): void {
  store = nextStore;
  cached = null;
}
