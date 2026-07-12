/**
 * Navigation guard tests (TDD Part 4 §3.4). Pure functions → fast unit tests. Asserts the
 * deferred + anonymous-first routing (UX-2 / ADR-009): anon users reach tabs; onboarding
 * gates only the unonboarded; protected actions require auth; daily loop is never gated.
 */
import { resolveRootRoute, requiresAuth, isEntitled } from '../guards';

describe('resolveRootRoute (onboarding + deferred-auth gate)', () => {
  it('stays on splash while loading', () => {
    expect(resolveRootRoute({ status: 'loading', onboarded: true })).toBe('splash');
  });
  it('routes unonboarded users to onboarding', () => {
    expect(resolveRootRoute({ status: 'anonymous', onboarded: false })).toBe('onboarding');
  });
  it('routes anonymous onboarded users straight to tabs (deferred auth)', () => {
    expect(resolveRootRoute({ status: 'anonymous', onboarded: true })).toBe('tabs');
  });
  it('routes authenticated users to tabs', () => {
    expect(resolveRootRoute({ status: 'authenticated', onboarded: true })).toBe('tabs');
  });
});

describe('requiresAuth (protected actions, UX-2)', () => {
  it('requires auth for anonymous/signed-out', () => {
    expect(requiresAuth('anonymous')).toBe(true);
    expect(requiresAuth('signed_out')).toBe(true);
  });
  it('does not require auth once authenticated', () => {
    expect(requiresAuth('authenticated')).toBe(false);
  });
});

describe('isEntitled (premium gating; daily loop never gated)', () => {
  it('true only when an active entitlement exists', () => {
    expect(isEntitled(null)).toBe(false);
    expect(isEntitled([{ is_active: false }])).toBe(false);
    expect(isEntitled([{ is_active: true }])).toBe(true);
  });
});
