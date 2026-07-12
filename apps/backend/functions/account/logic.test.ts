import { describe, it, expect } from 'vitest';
import { resolveMerge, canDeleteAccount, executeAfter } from './logic';

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
