/**
 * Where the activation-funnel events fire (PDD §3.0.1 / §11.4).
 *
 * These are source-level guards, the same instrument the onboarding gate uses, and for the same
 * reason: the invariant is about WHICH FILE emits an event, which leaves no runtime behaviour to
 * assert once the wrong file is doing it. A test that mounted the screen would happily pass with
 * the tracking in the wrong place.
 *
 * ⚠️ THE DANGEROUS DIRECTION IS THE POINT. `/(onboarding)/sign-in` is reached from FOUR places
 * and only one of them is onboarding: the You tab, the invite flow and the household screen all
 * push it for a signed-out user who onboarded weeks ago. Tracking EVT_003 there would feed
 * long-since-activated users into the TOP of the activation funnel — and §11.3 measures
 * activation as a RATE, so a bloated denominator drags it toward zero while looking exactly like
 * a conversion problem.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const APP = path.resolve(__dirname, '../../../app');
const read = (p: string): string => readFileSync(path.join(APP, p), 'utf8');

describe('EVT_003 Onboarding Started', () => {
  it('is emitted by the splash gate, which is the only place that knows the user is unonboarded', () => {
    const src = read('index.tsx');
    expect(src).toContain("track('EVT_003')");
    // Tied to the gate's decision, not merely present in the file.
    expect(src).toMatch(/route !== 'onboarding'[\s\S]{0,200}track\('EVT_003'\)/);
  });

  it('is NOT emitted from the sign-in screen, which is reached long after onboarding', () => {
    expect(read('(onboarding)/sign-in.tsx')).not.toContain('EVT_003');
  });

  it('is not emitted from the You tab, invite, or household — all of which push sign-in', () => {
    for (const f of ['(tabs)/you/index.tsx', '(tabs)/you/invite.tsx', '(tabs)/you/household.tsx']) {
      expect(read(f)).not.toContain('EVT_003');
    }
  });
});

describe('EVT_005 Tradition Selected', () => {
  it('fires only on an actual change, never on re-selecting the current value', () => {
    const src = read('(tabs)/you/settings.tsx');
    expect(src).toMatch(/tradition !== prefs\.tradition[\s\S]{0,120}track\('EVT_005'/);
  });

  it('carries `source`, because onboarding has no tradition step and every selection today is a later edit', () => {
    expect(read('(tabs)/you/settings.tsx')).toMatch(/track\('EVT_005',\s*\{[^}]*source:/);
  });
});
