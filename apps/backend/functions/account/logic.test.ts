import { describe, it, expect } from 'vitest';
import { resolveMerge, canDeleteAccount, executeAfter, isSweepAuthorized } from './logic';

describe('SVC_account logic (F-1 merge, F-3 deletion)', () => {
  it('merge keeps the longer streak', () => {
    expect(
      resolveMerge({ anonStreak: 3, authStreak: 8, anonHouseholdId: null, authHouseholdId: null })
        .keptStreak,
    ).toBe(8);
  });

  it('merge prefers the auth household and flags divergence', () => {
    const r = resolveMerge({
      anonStreak: 1,
      authStreak: 1,
      anonHouseholdId: 'h-anon',
      authHouseholdId: 'h-auth',
    });
    expect(r.keptHouseholdId).toBe('h-auth');
    expect(r.conflicts).toContain('household_divergence');
  });

  it('merge takes the anon household when auth has none (no conflict)', () => {
    const r = resolveMerge({
      anonStreak: 1,
      authStreak: 0,
      anonHouseholdId: 'h-anon',
      authHouseholdId: null,
    });
    expect(r.keptHouseholdId).toBe('h-anon');
    expect(r.conflicts).toHaveLength(0);
  });

  it('owner with members cannot delete until transfer', () => {
    expect(canDeleteAccount(true, 2).allowed).toBe(false);
    expect(canDeleteAccount(true, 0).allowed).toBe(true);
    expect(canDeleteAccount(false, 5).allowed).toBe(true);
  });

  it('executeAfter adds the grace window', () => {
    expect(executeAfter('2026-07-12T00:00:00.000Z', 30)).toBe('2026-08-11T00:00:00.000Z');
  });
});

/**
 * Sweep authorization (F-3, added with the deletion executor 2026-07-27).
 *
 * Exhaustive rather than illustrative: this rule stands between an anonymous JWT — which anyone
 * can mint for free — and an endpoint that erases accounts. B6.2 found SVC_account trusting the
 * request body for identity, so the default assumption here is that the caller is hostile.
 */
describe('SVC_account sweep authorization', () => {
  const eq = (a: string, b: string) => a === b;

  it('refuses everyone when no secret is configured', () => {
    // The failure that matters. Treating "unset" as "not protected yet" is how an endpoint that
    // deletes accounts ships open to the internet.
    expect(isSweepAuthorized('', 'anything', eq)).toBe(false);
    expect(isSweepAuthorized('', '', eq)).toBe(false);
    expect(isSweepAuthorized('', null, eq)).toBe(false);
  });

  it('refuses a caller that presents no secret', () => {
    expect(isSweepAuthorized('s3cret', null, eq)).toBe(false);
    expect(isSweepAuthorized('s3cret', '', eq)).toBe(false);
  });

  it('refuses a wrong secret, including near misses', () => {
    expect(isSweepAuthorized('s3cret', 's3cres', eq)).toBe(false);
    expect(isSweepAuthorized('s3cret', 's3cret ', eq)).toBe(false);
    expect(isSweepAuthorized('s3cret', 'S3CRET', eq)).toBe(false);
    expect(isSweepAuthorized('s3cret', 's3cre', eq)).toBe(false);
  });

  it('accepts only an exact match', () => {
    expect(isSweepAuthorized('s3cret', 's3cret', eq)).toBe(true);
  });

  it('delegates the comparison, so it can be constant-time at the call site', () => {
    // The production call passes crypto.ts's timingSafeEqual. Asserting the delegation keeps a
    // future refactor from quietly substituting `===`, which leaks the secret one char at a time.
    const calls: [string, string][] = [];
    isSweepAuthorized('s3cret', 'guess1', (a, b) => {
      calls.push([a, b]);
      return false;
    });
    expect(calls).toEqual([['s3cret', 'guess1']]);
  });
});
