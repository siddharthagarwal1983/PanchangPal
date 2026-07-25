/**
 * Graceful degradation policy per ERR_* (TDD Part 5 §8.2, PDD §12).
 *
 * §8.2 requires that "each `ERR_*` has a defined calm behavior". PDD §12 defines those behaviours in
 * prose, across 23 numbered conditions; until now nothing in the app encoded them, so "we degrade
 * gracefully" was a claim in a document rather than a property of the code. This module is that
 * table, expressed as data, with an exhaustive test over the shared `ERROR_CODES`.
 *
 * WHAT THIS MODULE DOES NOT DO: invent copy. PDD §13.5 approves user-facing strings for nine codes;
 * those are used verbatim. The rest carry `copyKey: 'errors.unknown'` and are listed in
 * `AWAITING_APPROVED_COPY` below — an honest gap that PDD owns, not one this file quietly fills.
 * Inventing calm-sounding copy would be inventing UX (CLAUDE.md), and it would also hide the gap.
 */
import { ERROR_CODES, type ErrorCode } from '@panchangpal/shared';

/** Where the failure is shown. §12's recurring rule: isolate, never take the whole screen down. */
export type DegradationSurface =
  /** App-level ErrorBoundary — only for genuinely uncaught failures (§12 #23). */
  | 'global'
  /** One card fails, the rest of the screen stays usable (§12 #17, AC-HOME-04). */
  | 'card'
  /** Inline message next to the control that failed (§12 #21). */
  | 'inline'
  /** A calm banner — connectivity and similarly ambient conditions (§12 #1). */
  | 'banner'
  /** Redirect to an alternative path rather than showing an error at all (§12 #8, #9). */
  | 'redirect';

export interface DegradationPolicy {
  code: ErrorCode;
  surface: DegradationSurface;
  /** Whether the user is offered a retry. §12 never dead-ends, but retry is not always the exit. */
  retry: boolean;
  /**
   * Whether the DAILY LOOP still works. This is the load-bearing one: P4 and §8.2 both require the
   * daily ritual to keep working through every backend failure, so `true` here is a defect unless
   * the condition is literally the loop's own storage failing.
   */
  blocksDailyLoop: boolean;
  /** Whether the action is queued for `SVC_sync` rather than lost (§12 #1, #20, #22). */
  queues: boolean;
  /** i18n key for the user-facing message. */
  copyKey: string;
  /** The §12 row this encodes, so the policy can be checked against its source. */
  pddCondition: number;
}

/**
 * Codes PDD §13.5 has not yet approved copy for. They fall back to the approved ERR_UNKNOWN string,
 * which is calm and honest but less specific than §12's handling deserves. Listed rather than
 * papered over: this is a documentation deliverable, and the test below pins the list so it cannot
 * grow silently.
 */
export const AWAITING_APPROVED_COPY: readonly ErrorCode[] = [
  'ERR_AUTH_EXPIRED',
  'ERR_AUTH_FAILED',
  'ERR_AUTH_MERGE_CONFLICT',
  'ERR_CALENDAR_ERROR',
  'ERR_FESTIVAL_CONFLICT',
  'ERR_NETWORK_TIMEOUT',
  'ERR_NOTIF_DENIED',
  'ERR_POOR_NETWORK',
  'ERR_RAG_EMPTY',
  'ERR_SUBSCRIPTION_INVALID',
  'ERR_SYNC_CONFLICT',
] as const;

/**
 * The policy table. One entry per ERR_* in `packages/shared`; the test asserts exhaustiveness, so a
 * new code cannot be added to the taxonomy without deciding how the app degrades for it.
 */
export const DEGRADATION_POLICIES: Readonly<Record<ErrorCode, DegradationPolicy>> = {
  // §12 #1 — the core case. Daily loop runs from cache; network-only features say so; writes queue.
  ERR_OFFLINE: {
    code: 'ERR_OFFLINE',
    surface: 'banner',
    retry: false,
    blocksDailyLoop: false,
    queues: true,
    copyKey: 'errors.offline',
    pddCondition: 1,
  },
  // §12 #3 — cached-first render, bounded spinners, then a retry affordance.
  ERR_POOR_NETWORK: {
    code: 'ERR_POOR_NETWORK',
    surface: 'banner',
    retry: true,
    blocksDailyLoop: false,
    queues: true,
    copyKey: 'errors.unknown',
    pddCondition: 3,
  },
  ERR_NETWORK_TIMEOUT: {
    code: 'ERR_NETWORK_TIMEOUT',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: true,
    copyKey: 'errors.unknown',
    pddCondition: 3,
  },
  // §12 #4 — cached Today stays readable; only account/household actions re-auth.
  ERR_AUTH_EXPIRED: {
    code: 'ERR_AUTH_EXPIRED',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 4,
  },
  // §12 #21 — inline error + rate-limited resend; never a dead end.
  ERR_AUTH_FAILED: {
    code: 'ERR_AUTH_FAILED',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 21,
  },
  // §12 #18 — union/longer streak, and TELL the user what was kept. Never silently drop.
  ERR_AUTH_MERGE_CONFLICT: {
    code: 'ERR_AUTH_MERGE_CONFLICT',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 18,
  },
  // §12 #5 — clear reason + retry; the app stays fully functional on the free tier.
  ERR_PAYMENT_FAILED: {
    code: 'ERR_PAYMENT_FAILED',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.paymentFailed',
    pddCondition: 5,
  },
  // §12 #6 — "we'll restore automatically" + Restore Purchases; store is the source of truth.
  ERR_SUBSCRIPTION_INVALID: {
    code: 'ERR_SUBSCRIPTION_INVALID',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 6,
  },
  // §12 #7 — non-blocking; the app is fully usable without notifications.
  ERR_NOTIF_DENIED: {
    code: 'ERR_NOTIF_DENIED',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 7,
  },
  // §12 #8/#9 — never an error state: go straight to manual city entry.
  ERR_LOCATION_DENIED: {
    code: 'ERR_LOCATION_DENIED',
    surface: 'redirect',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.locationDenied',
    pddCondition: 8,
  },
  ERR_GPS_DISABLED: {
    code: 'ERR_GPS_DISABLED',
    surface: 'redirect',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.gpsDisabled',
    pddCondition: 9,
  },
  // §12 #10/#11 — calm retry, and NEVER a fabricated or partial answer.
  ERR_AI_TIMEOUT: {
    code: 'ERR_AI_TIMEOUT',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.aiTrouble',
    pddCondition: 10,
  },
  ERR_AI_ERROR: {
    code: 'ERR_AI_ERROR',
    surface: 'inline',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.aiTrouble',
    pddCondition: 11,
  },
  // §12 #12 — an honest decline is the CORRECT outcome, not a failure to retry away.
  ERR_RAG_LOW_CONFIDENCE: {
    code: 'ERR_RAG_LOW_CONFIDENCE',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.ragLowConfidence',
    pddCondition: 12,
  },
  ERR_RAG_EMPTY: {
    code: 'ERR_RAG_EMPTY',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 12,
  },
  // §12 #13 — the failed month errors; other months stay usable.
  ERR_CALENDAR_ERROR: {
    code: 'ERR_CALENDAR_ERROR',
    surface: 'card',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 13,
  },
  // §12 #14 — show the user's tradition as primary, note variants. Never silently pick.
  ERR_FESTIVAL_CONFLICT: {
    code: 'ERR_FESTIVAL_CONFLICT',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 14,
  },
  // §12 #15 — surface BOTH candidate dates; never silently guess.
  ERR_TITHI_AMBIGUOUS: {
    code: 'ERR_TITHI_AMBIGUOUS',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.tithiAmbiguous',
    pddCondition: 15,
  },
  // §12 #16 — fall back to the written guidance; the ritual remains completable.
  ERR_AUDIO_UNAVAILABLE: {
    code: 'ERR_AUDIO_UNAVAILABLE',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'ritual.audioUnavailable',
    pddCondition: 16,
  },
  // §12 #17 — card-level, isolated: the rest of Today stays usable (AC-HOME-04).
  ERR_PANCHANG_UNAVAILABLE: {
    code: 'ERR_PANCHANG_UNAVAILABLE',
    surface: 'card',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'today.panchangUnavailable',
    pddCondition: 17,
  },
  // §12 #19 — graceful re-request path.
  ERR_INVITE_EXPIRED: {
    code: 'ERR_INVITE_EXPIRED',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.inviteExpired',
    pddCondition: 19,
  },
  // §12 #20 — daily completion is client-authoritative for the day; inform only if meaningful.
  ERR_SYNC_CONFLICT: {
    code: 'ERR_SYNC_CONFLICT',
    surface: 'inline',
    retry: false,
    blocksDailyLoop: false,
    queues: true,
    copyKey: 'errors.unknown',
    pddCondition: 20,
  },
  // §12 #23 — the global boundary. Calm, with retry, never a raw crash screen.
  ERR_UNKNOWN: {
    code: 'ERR_UNKNOWN',
    surface: 'global',
    retry: true,
    blocksDailyLoop: false,
    queues: false,
    copyKey: 'errors.unknown',
    pddCondition: 23,
  },
};

/** The policy for a code. Never throws: an unmapped code degrades as ERR_UNKNOWN would. */
export function degradationFor(code: ErrorCode): DegradationPolicy {
  return DEGRADATION_POLICIES[code] ?? DEGRADATION_POLICIES.ERR_UNKNOWN;
}

/** Every code in the shared taxonomy, for the exhaustiveness test. */
export const ALL_ERROR_CODES: readonly ErrorCode[] = ERROR_CODES;
