/**
 * The monetization funnel (PDD §1 registry EVT_049–EVT_052; §11.3 KPI tree).
 *
 * EVT_051 is the consequential one here: §11.3 computes **free→paid (target 3–5%/6mo)** from it, and
 * MRD §13's open assumption — "$60–90/yr ARPU achievable" — is what the soft-launch pricing test
 * exists to validate. EVT_049 is the funnel's top, not its answer.
 *
 * Pure and derived, for the same reason `ritualEvents.ts` is: a screen that calls `track()` inline
 * double-fires the moment a re-render repeats a state, and a conversion rate computed from an
 * inflated denominator is worse than no rate at all. Keeping the mapping here also makes it testable
 * without mounting a paywall.
 *
 * Only registry ids appear here (§11.0: registry-bound), and `AnalyticsService` rejects anything
 * outside the taxonomy at runtime anyway.
 */
import type { EventId } from '@panchangpal/shared';
import type { EntitlementKind } from '../subscription/types';
import type { PurchaseOutcome } from '../subscription/PaymentAdapter';
import type { AnalyticsProps } from './AnalyticsService';

export interface SubscriptionAnalyticsEvent {
  eventId: EventId;
  props: AnalyticsProps;
}

/**
 * Where the upgrade offer was shown. The PDD gives SCR_SUBSCRIPTION_001 a screen id but defines no
 * `SCR_*` for the contextual sheet (it is a composition at `app/modal/paywall`), so the surface
 * cannot be expressed by `screen_id` alone.
 *
 * `contextual` is PDD vocabulary, not invented: §11.2 already uses `source` with a `contextual`
 * value for EVT_029. Reusing the same field and word keeps one concept named one way across two
 * funnels.
 */
export type UpgradeSurface = 'screen' | 'contextual';

/** §11.2's `result` domain for EVT_051 is (success/fail/cancel) — narrower than our outcomes. */
type ReportableResult = 'success' | 'fail' | 'cancel';

/**
 * Maps a PaymentAdapter outcome onto §11.2's vocabulary, or `null` when there is nothing to report.
 *
 * ⛔ `unavailable` DELIBERATELY EMITS NOTHING, AND THIS IS THE MOST CONSEQUENTIAL DECISION IN THE
 * FILE. `NullPaymentAdapter` returns `{outcome: 'unavailable'}` for every purchase today, because
 * `react-native-purchases` is not installed and no store products exist. Mapping that to `fail`
 * would be the easy choice and would quietly poison the one metric this instrumentation exists to
 * produce: §11.3's free→paid rate would carry a failure for every tap made before payments shipped,
 * and the number would look like a broken checkout rather than an unbuilt one.
 *
 * `unavailable` means the purchase never reached a store — there is no IAP result to report, and
 * EVT_051 is defined as "IAP success/failure/cancel". An event that did not happen is not a
 * failure. The same reasoning applies to restore.
 *
 * ⚠️ The consequence is worth stating plainly: **until the payments SDK lands, EVT_051 and EVT_052
 * never fire.** That is honest rather than convenient, and it is why §10.1 item 19 stays open.
 */
export function reportableResult(outcome: PurchaseOutcome): ReportableResult | null {
  switch (outcome) {
    case 'success':
      return 'success';
    case 'cancelled':
      return 'cancel';
    case 'failed':
      return 'fail';
    case 'unavailable':
      return null;
  }
}

/**
 * EVT_049 Subscription Viewed — "Upgrade sheet/screen shown" (AC-SUB-01: the surface appears, is
 * dismissible, and fires this).
 *
 * `screen_id` follows §11.1 ("screen-scoped events add `screen_id`") and the existing EVT_012 call
 * site. The contextual sheet has no `SCR_*`, so it reports `null` — a recorded absence, which
 * `sanitizeProps` keeps, rather than `undefined`, which it drops.
 */
export function subscriptionViewedEvent(surface: UpgradeSurface): SubscriptionAnalyticsEvent {
  return {
    eventId: 'EVT_049',
    props: {
      source: surface,
      screen_id: surface === 'screen' ? 'SCR_SUBSCRIPTION_001' : null,
    },
  };
}

/**
 * EVT_050 Plan Selected — "Individual/Family plan chosen".
 *
 * §11.2 lists no schema for EVT_050 (the table is explicitly "selected"), so `plan` reuses the
 * vocabulary §11.2 defines one row below for EVT_051 — same field name, same `individual`/`family`
 * domain, which is also `ENTITLEMENT_KINDS`. Reuse rather than invention, but flagged: if PDD ever
 * specifies EVT_050's schema, this is the line to reconcile.
 */
export function planSelectedEvent(
  plan: EntitlementKind,
  surface: UpgradeSurface,
): SubscriptionAnalyticsEvent {
  return { eventId: 'EVT_050', props: { plan, source: surface } };
}

/**
 * EVT_051 Purchase Result — §11.2: `plan` (individual/family), `result` (success/fail/cancel),
 * `error_code?`. Returns null when there is no store outcome to report (see `reportableResult`).
 *
 * `error_code` is attached only on a failure, and only as an `ERR_*` code from the shared registry —
 * never a vendor message. A store SDK's error text is exactly how free-text and account detail reach
 * an analytics table (ADR-031), and §7.1 makes no-PII structural rather than conventional.
 */
export function purchaseResultEvent(
  plan: EntitlementKind,
  outcome: PurchaseOutcome,
): SubscriptionAnalyticsEvent | null {
  const result = reportableResult(outcome);
  if (!result) return null;
  return {
    eventId: 'EVT_051',
    props: {
      plan,
      result,
      error_code: result === 'fail' ? 'ERR_PAYMENT_FAILED' : undefined,
    },
  };
}

/**
 * EVT_052 Purchases Restored — "Restore completed". No §11.2 schema; `result` reuses EVT_051's
 * vocabulary for the same reason `plan` does above. No `plan`: a restore is not plan-specific, and
 * reporting one would mean guessing which entitlement came back.
 */
export function purchasesRestoredEvent(
  outcome: PurchaseOutcome,
): SubscriptionAnalyticsEvent | null {
  const result = reportableResult(outcome);
  if (!result) return null;
  return { eventId: 'EVT_052', props: { result } };
}

/**
 * EVT_051 for a thrown purchase, as opposed to a resolved unsuccessful outcome. The adapter contract
 * resolves rather than rejects, but a vendor SDK that throws must still be counted as a failure —
 * otherwise the free→paid denominator silently loses its worst cases.
 */
export function purchaseThrewEvent(plan: EntitlementKind): SubscriptionAnalyticsEvent {
  return {
    eventId: 'EVT_051',
    props: { plan, result: 'fail', error_code: 'ERR_PAYMENT_FAILED' },
  };
}
