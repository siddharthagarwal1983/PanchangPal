/**
 * The onboarding gate (TDD Part 4 §3.4, UX-2).
 *
 * Regression guard for a defect that survived two milestones: `app/index.tsx` carried
 * `const ONBOARDED = true` with a comment claiming the flag was persisted elsewhere. It was not, so
 * the gate always resolved to `tabs`, SCR_AUTH_001 never rendered from a cold launch, and B2 had to
 * record FLOW_ONBOARDING as unwritable. A constant standing in for state reads like a decision and
 * makes none — the same shape as a gate that cannot fail.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createMemoryStore } from '../keyValueStore';
import { isOnboarded, resetOnboardingForTests, setOnboarded } from '../onboardingRepository';
import { resolveRootRoute } from '../../navigation/guards';

describe('onboarding completion flag', () => {
  beforeEach(() => resetOnboardingForTests(createMemoryStore()));
  afterEach(() => resetOnboardingForTests());

  it('is false on a fresh install — the user has not been through the gate', () => {
    expect(isOnboarded()).toBe(false);
  });

  it('is true once set, and stays true across a fresh resolution', () => {
    const store = createMemoryStore();
    resetOnboardingForTests(store);
    setOnboarded();
    expect(isOnboarded()).toBe(true);

    resetOnboardingForTests(store); // same storage, new process
    expect(isOnboarded()).toBe(true);
  });

  it('reads false when storage throws, rather than skipping onboarding', () => {
    // The honest failure direction: showing sign-in twice is a small annoyance; silently skipping
    // it hides the app's only auth entry point.
    resetOnboardingForTests({
      getString: () => {
        throw new Error('storage unavailable');
      },
      set: () => undefined,
      delete: () => undefined,
    });
    expect(isOnboarded()).toBe(false);
  });

  it('does not throw when a write fails', () => {
    resetOnboardingForTests({
      getString: () => undefined,
      set: () => {
        throw new Error('storage unavailable');
      },
      delete: () => undefined,
    });
    expect(() => setOnboarded()).not.toThrow();
  });
});

describe('the gate actually gates', () => {
  it('routes a first-launch user to onboarding, and a returning one to tabs', () => {
    expect(resolveRootRoute({ status: 'anonymous', onboarded: false })).toBe('onboarding');
    expect(resolveRootRoute({ status: 'anonymous', onboarded: true })).toBe('tabs');
    expect(resolveRootRoute({ status: 'authenticated', onboarded: false })).toBe('onboarding');
  });

  it('splash no longer hardcodes the flag', () => {
    // Reading the source is deliberate. The unit under test is a CONSTANT — there is no runtime
    // behaviour to assert once it is inlined, which is precisely why the original defect was
    // invisible to every existing test for two milestones.
    const splash = readFileSync(
      path.resolve(__dirname, '../../../app/index.tsx'),
      'utf8',
    );
    // Anchored to the start of a line so the comment in that file — which quotes the old
    // constant to explain what changed — does not trip the guard. The first draft of this
    // assertion did exactly that, which is a fair demonstration that it is looking.
    expect(splash).not.toMatch(/^\s*const\s+ONBOARDED\s*=\s*true/m);
    expect(splash).toContain('isOnboarded');
  });
});
