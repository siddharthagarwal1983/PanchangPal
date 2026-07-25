/**
 * Graceful degradation (TDD Part 5 §8.2, PDD §12).
 *
 * §8.2's requirement — "each `ERR_*` has a defined calm behavior" — was a claim in a document until
 * this table existed. These tests make it a property of the code: a new ERR_* cannot enter the
 * shared taxonomy without someone deciding how the app degrades for it, and the copy referenced
 * here must exist in the i18n bundle rather than resolving to a missing key at the worst moment.
 */
import {
  ALL_ERROR_CODES,
  AWAITING_APPROVED_COPY,
  DEGRADATION_POLICIES,
  degradationFor,
} from '../errors/degradation';
import { enUS } from '../../i18n/en-US';

/** Resolve a dotted i18n key against the bundle, or undefined if it does not exist. */
function copyAt(key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown> | undefined)?.[part],
      enUS as unknown,
    );
}

describe('every ERR_* has a defined degradation policy (§8.2)', () => {
  it('covers the taxonomy exhaustively — no code left undecided', () => {
    const covered = Object.keys(DEGRADATION_POLICIES).sort();
    expect(covered).toEqual([...ALL_ERROR_CODES].sort());
  });

  it.each([...ALL_ERROR_CODES])('%s resolves to a policy whose copy key exists', (code) => {
    const policy = degradationFor(code);
    expect(policy.code).toBe(code);
    // A missing key would render as the raw key, or blank, in the exact moment a user is already
    // having a bad time.
    expect(typeof copyAt(policy.copyKey)).toBe('string');
  });

  it('maps every policy to a real PDD §12 condition row', () => {
    for (const policy of Object.values(DEGRADATION_POLICIES)) {
      expect(policy.pddCondition).toBeGreaterThanOrEqual(1);
      expect(policy.pddCondition).toBeLessThanOrEqual(23);
    }
  });
});

describe('the invariants §8.2 actually cares about', () => {
  it('NO failure blocks the daily loop', () => {
    // P4 and §8.2 both hold this line: a backend failure must never stop someone completing their
    // ritual. The ritual runs from local storage and the completion queues, so there is no
    // legitimate reason for any code here to be true — if one ever is, it is a design regression,
    // not a copy change.
    const blocking = Object.values(DEGRADATION_POLICIES).filter((p) => p.blocksDailyLoop);
    expect(blocking.map((p) => p.code)).toEqual([]);
  });

  it('the honest-decline codes do NOT offer a retry', () => {
    // §12 #12: a decline is the CORRECT outcome when retrieval has no verified answer, not a
    // transient failure. Offering "try again" would invite the user to retry their way into a
    // fabricated answer, which is the exact trust failure the AI principles forbid.
    expect(degradationFor('ERR_RAG_LOW_CONFIDENCE').retry).toBe(false);
    expect(degradationFor('ERR_RAG_EMPTY').retry).toBe(false);
  });

  it('the AI failure codes DO offer a retry, and never fabricate', () => {
    // §12 #10/#11: genuinely transient, so retry is right — and the copy is the approved calm
    // string rather than anything resembling a partial answer.
    expect(degradationFor('ERR_AI_TIMEOUT').retry).toBe(true);
    expect(degradationFor('ERR_AI_ERROR').retry).toBe(true);
    expect(copyAt(degradationFor('ERR_AI_TIMEOUT').copyKey)).toBe(
      "I'm having trouble right now — please try again.",
    );
  });

  it('offline and sync failures QUEUE rather than lose the action', () => {
    // §12 #1/#20/#22 — the offline queue is the mitigation the whole offline-first design rests on.
    for (const code of ['ERR_OFFLINE', 'ERR_SYNC_CONFLICT', 'ERR_NETWORK_TIMEOUT'] as const) {
      expect(degradationFor(code).queues).toBe(true);
    }
  });

  it('location failures redirect to manual entry instead of showing an error', () => {
    // §12 #8/#9: "never a dead end" — the user gets the city picker, not an apology.
    expect(degradationFor('ERR_LOCATION_DENIED').surface).toBe('redirect');
    expect(degradationFor('ERR_GPS_DISABLED').surface).toBe('redirect');
  });

  it('only genuinely uncaught failures take the whole screen', () => {
    // §12 #17 and AC-HOME-04: an isolated failure must stay isolated. If a second code ever claims
    // the global surface, something has stopped degrading at card level.
    const global = Object.values(DEGRADATION_POLICIES).filter((p) => p.surface === 'global');
    expect(global.map((p) => p.code)).toEqual(['ERR_UNKNOWN']);
  });

  it('panchang degrades at card level while ADR-033 is unresolved', () => {
    expect(degradationFor('ERR_PANCHANG_UNAVAILABLE').surface).toBe('card');
    expect(degradationFor('ERR_PANCHANG_UNAVAILABLE').blocksDailyLoop).toBe(false);
  });
});

describe('approved copy (PDD §13.5)', () => {
  it.each([
    ['ERR_OFFLINE', "You're offline. Today's panchang and ritual still work — we'll sync when you're back."],
    ['ERR_LOCATION_DENIED', 'No problem — search for your city so your panchang is accurate.'],
    ['ERR_GPS_DISABLED', "Location's off on your device. Enter your city instead."],
    ['ERR_PAYMENT_FAILED', "That payment didn't go through. Try again or use another method."],
    ['ERR_INVITE_EXPIRED', 'This invite has expired — ask {inviter} for a new one.'],
    ['ERR_UNKNOWN', 'Something went wrong on our end. Please try again.'],
  ] as const)('%s uses the §13.5 string verbatim', (code, expected) => {
    // Verbatim, because this is approved product copy. A developer paraphrase here is a silent
    // product change — the calm, specific tone is the trust surface, not decoration.
    expect(copyAt(degradationFor(code).copyKey)).toBe(expected);
  });

  it('records exactly which codes are still awaiting approved copy', () => {
    // Pinned so the list cannot grow silently. Shrinking it means PDD §13.5 gained copy, which is
    // a deliberate act; growing it means a new code shipped without any, which should fail here.
    const fallbacks = Object.values(DEGRADATION_POLICIES)
      .filter((p) => p.copyKey === 'errors.unknown' && p.code !== 'ERR_UNKNOWN')
      .map((p) => p.code)
      .sort();
    expect(fallbacks).toEqual([...AWAITING_APPROVED_COPY].sort());
  });
});
