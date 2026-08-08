/**
 * The monetization funnel's event mapping (PDD §1 registry EVT_049–EVT_052, §11.2 schemas,
 * §11.3 KPI tree).
 *
 * The assertion that matters most is that `unavailable` emits NOTHING. Today every purchase returns
 * it, because `NullPaymentAdapter` stands in for an uninstalled payments SDK — so the tempting
 * mapping (`unavailable` → `fail`) would fire EVT_051 on every tap and permanently poison §11.3's
 * free→paid rate with failures that only ever meant "payments are unbuilt". A metric that is wrong
 * in a plausible direction is worse than one that is absent, because nobody goes looking for it.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  planSelectedEvent,
  purchaseResultEvent,
  purchaseThrewEvent,
  purchasesRestoredEvent,
  reportableResult,
  subscriptionViewedEvent,
} from '../analytics/subscriptionEvents';

describe('EVT_049 Subscription Viewed', () => {
  it('reports the screen with its SCR id', () => {
    expect(subscriptionViewedEvent('screen')).toEqual({
      eventId: 'EVT_049',
      props: { source: 'screen', screen_id: 'SCR_SUBSCRIPTION_001' },
    });
  });

  it('reports the contextual sheet with a null screen id rather than inventing one', () => {
    // The sheet is a composition at app/modal/paywall and the PDD gives it no SCR_*. `null` is a
    // recorded absence that survives sanitizeProps; `undefined` would be dropped entirely, losing
    // the fact that this surface has no screen id.
    expect(subscriptionViewedEvent('contextual')).toEqual({
      eventId: 'EVT_049',
      props: { source: 'contextual', screen_id: null },
    });
  });
});

describe('EVT_050 Plan Selected', () => {
  it.each(['individual', 'family'] as const)('carries the %s plan and its surface', (plan) => {
    expect(planSelectedEvent(plan, 'screen')).toEqual({
      eventId: 'EVT_050',
      props: { plan, source: 'screen' },
    });
  });
});

describe('EVT_051 Purchase Result — §11.2 result domain is success/fail/cancel', () => {
  it('maps a successful purchase', () => {
    expect(purchaseResultEvent('individual', 'success')).toEqual({
      eventId: 'EVT_051',
      props: { plan: 'individual', result: 'success', error_code: undefined },
    });
  });

  it('maps a user cancellation to `cancel`, not a failure', () => {
    // A cancellation is a decision, not a fault. Counting it as a failure would make the checkout
    // look broken in exactly the market the pricing test is meant to read.
    expect(purchaseResultEvent('individual', 'cancelled')?.props.result).toBe('cancel');
  });

  it('maps a store failure to `fail` and attaches the shared ERR_* code', () => {
    const event = purchaseResultEvent('family', 'failed');
    expect(event?.props.result).toBe('fail');
    // An ERR_* code, never a vendor message — a store SDK's error text is how free-text reaches an
    // analytics table (ADR-031), and §7.1 makes no-PII structural.
    expect(event?.props.error_code).toBe('ERR_PAYMENT_FAILED');
  });

  it('⛔ emits NOTHING when the purchase never reached a store', () => {
    expect(reportableResult('unavailable')).toBeNull();
    expect(purchaseResultEvent('individual', 'unavailable')).toBeNull();
    expect(purchasesRestoredEvent('unavailable')).toBeNull();
  });

  it('counts a thrown purchase as a failure, so the denominator keeps its worst cases', () => {
    expect(purchaseThrewEvent('family')).toEqual({
      eventId: 'EVT_051',
      props: { plan: 'family', result: 'fail', error_code: 'ERR_PAYMENT_FAILED' },
    });
  });
});

describe('EVT_052 Purchases Restored', () => {
  it('reports the outcome without guessing a plan', () => {
    const event = purchasesRestoredEvent('success');
    expect(event?.eventId).toBe('EVT_052');
    expect(event?.props).toEqual({ result: 'success' });
    // Deliberately no `plan`: a restore is not plan-specific and naming one would be a guess about
    // which entitlement came back.
    expect(event?.props.plan).toBeUndefined();
  });
});

/**
 * ⚠️ THIS READS SOURCE, AND THAT IS A WEAKER GUARANTEE THAN MOUNTING — stated rather than implied.
 *
 * EVT_049 is the ONLY event in this family that fires today, and it is §11.3's free→paid
 * denominator, so its call site is the one most worth guarding. But this repository has no
 * screen-level tests at all: the existing EVT_012 and EVT_019 call sites in `today/index.tsx` are
 * likewise unasserted, and building mounting infrastructure for expo-router + the theme provider +
 * five hooks to cover one `useEffect` is a larger change than the feature.
 *
 * So this follows the precedent set by the onboarding-gate guard, which greps its source for the
 * same reason: what it checks is that the call site EXISTS and that the old comment-only anchors are
 * gone. It cannot prove the effect runs once per mount — the empty dependency array is what does
 * that, and only a mounted test could confirm it. Worth revisiting if screen tests ever arrive.
 */
describe('both upgrade surfaces actually call the emitter', () => {
  const MOBILE_ROOT = path.resolve(__dirname, '../..', '..');
  const read = (rel: string) => readFileSync(path.join(MOBILE_ROOT, rel), 'utf8');
  const SCREEN = 'app/(tabs)/you/subscription.tsx';
  const SHEET = 'app/modal/paywall.tsx';

  it.each([
    [SCREEN, "subscriptionViewedEvent('screen')"],
    [SHEET, "subscriptionViewedEvent('contextual')"],
  ])('%s reports EVT_049 for its own surface', (file, call) => {
    expect(read(file)).toContain(call);
  });

  it.each([SCREEN, SHEET])('%s reports EVT_050 when a plan is chosen', (file) => {
    expect(read(file)).toContain('planSelectedEvent(');
  });

  it('the comment-only anchors are gone from both surfaces', () => {
    // Until 2026-08-08 the screen carried an EMPTY `useEffect` whose entire body was
    // `/* analytics: EVT_049 */`, and both surfaces had `/* EVT_050 (Plan Selected) */` inside
    // onSelect. A no-op effect existing only to hold a comment is the milestone's signature defect
    // in miniature — documented, wired, and inert. If one comes back, this fails.
    for (const file of [SCREEN, SHEET]) {
      const source = read(file);
      expect(source).not.toContain('/* analytics: EVT_049 */');
      expect(source).not.toContain('/* EVT_050 (Plan Selected) */');
    }
  });
});

describe('every emitted id is in the PDD §1 registry', () => {
  it('uses only EVT_049–EVT_052', () => {
    const ids = [
      subscriptionViewedEvent('screen').eventId,
      planSelectedEvent('individual', 'screen').eventId,
      purchaseResultEvent('individual', 'success')?.eventId,
      purchasesRestoredEvent('success')?.eventId,
      purchaseThrewEvent('individual').eventId,
    ];
    for (const id of ids) {
      expect(['EVT_049', 'EVT_050', 'EVT_051', 'EVT_052']).toContain(id);
    }
  });

  it('emits only primitive prop values', () => {
    // AnalyticsService drops objects and arrays at the boundary; anything non-primitive here would
    // silently vanish rather than fail, so assert the shape at the source.
    const events = [
      subscriptionViewedEvent('contextual'),
      planSelectedEvent('family', 'contextual'),
      purchaseResultEvent('family', 'failed'),
      purchasesRestoredEvent('cancelled'),
    ];
    for (const event of events) {
      for (const value of Object.values(event?.props ?? {})) {
        expect(['string', 'number', 'boolean', 'undefined']).toContain(
          value === null ? 'string' : typeof value,
        );
      }
    }
  });
});
