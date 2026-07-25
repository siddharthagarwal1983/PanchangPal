/**
 * Onboarding completion (TDD Part 4 §3.4 gate, UX-2 deferred auth).
 *
 * `app/index.tsx` hardcoded `const ONBOARDED = true` with a comment saying the flag "is persisted in
 * the onboarding task". That task shipped the sign-in screens but never the flag, so the gate has
 * always resolved to `tabs` — SCR_AUTH_001 has never rendered from a cold launch, and
 * FLOW_ONBOARDING could not be written at all (B2 carried it as blocked for exactly this reason).
 * A constant standing in for state is the same shape of defect as a gate that cannot fail: the code
 * reads as though a decision is being made, and no decision is.
 *
 * Stored through the shared `KeyValueStore` seam, so it inherits the degrade-to-memory behaviour and
 * `getStorageBackend()` reporting rather than reimplementing them. When storage is unavailable the
 * flag reads false and onboarding shows again on the next launch — the honest failure direction:
 * showing sign-in twice is a small annoyance, whereas skipping it hides the app's only auth entry
 * point.
 */
import { createDeviceStore, type KeyValueStore } from './keyValueStore';

const ONBOARDED_KEY = 'onboarding:completed';

let store: KeyValueStore | undefined;

function getStore(): KeyValueStore {
  // Resolved on first use, never at import — an eager side effect in a module body is the defect
  // that took down the ritual screen and nine repositories.
  return (store ??= createDeviceStore());
}

/** Whether the user has completed (or deliberately skipped) onboarding. Never throws. */
export function isOnboarded(): boolean {
  try {
    return getStore().getString(ONBOARDED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark onboarding complete. Called when the user signs in OR chooses "Skip for now" — under
 * deferred auth (UX-2 / ADR-009) skipping is a legitimate completion, not an abandonment, so both
 * paths end the gate.
 */
export function setOnboarded(): void {
  try {
    getStore().set(ONBOARDED_KEY, 'true');
  } catch {
    // Storage unavailable: the user sees onboarding again next launch. Acceptable, and visible via
    // getStorageBackend().
  }
}

/** Test seam: inject a store and reset resolution. */
export function resetOnboardingForTests(nextStore?: KeyValueStore): void {
  store = nextStore;
}
