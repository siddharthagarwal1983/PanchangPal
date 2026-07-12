/**
 * Account-deletion rule tests (pure, no network). Asserts the F-3 gate mirrors the server:
 * a non-owner or a solo owner may delete straight away; an owner with other active members must
 * transfer ownership first (owner-with-members variant). Local (user_id-null) members count as
 * "others". Inactive members are ignored.
 */
import { evaluateDeletion, canRequestDeletion, otherActiveMemberCount } from '../account';
import type { Household, HouseholdMember } from '../household';

const member = (over: Partial<HouseholdMember> = {}): HouseholdMember => ({
  id: 'm', householdId: 'h', userId: null, displayName: 'A', role: 'other', depth: 'quick', isActive: true, ...over,
});

const household = (members: HouseholdMember[], ownerId = 'u1'): Household => ({
  id: 'h', name: 'Home', ownerId, tradition: 'generic', members,
});

describe('account deletion gate (F-3)', () => {
  it('allows deletion for a user with no household', () => {
    const gate = evaluateDeletion(null, 'u1');
    expect(gate).toEqual({ variant: 'standard', needsOwnershipTransfer: false, otherActiveMembers: 0 });
    expect(canRequestDeletion(null, 'u1')).toBe(true);
  });

  it('allows a solo owner (only their own membership) to delete', () => {
    const hh = household([member({ id: '1', userId: 'u1', role: 'anchor' })]);
    expect(canRequestDeletion(hh, 'u1')).toBe(true);
    expect(evaluateDeletion(hh, 'u1').variant).toBe('standard');
  });

  it('blocks an owner with other active members and reports the owner-with-members variant', () => {
    const hh = household([
      member({ id: '1', userId: 'u1', role: 'anchor' }),
      member({ id: '2', userId: 'u2', role: 'parent' }),
      member({ id: '3', userId: null, displayName: 'Nani', role: 'elder' }), // local member counts
    ]);
    const gate = evaluateDeletion(hh, 'u1');
    expect(gate.needsOwnershipTransfer).toBe(true);
    expect(gate.variant).toBe('owner-with-members');
    expect(gate.otherActiveMembers).toBe(2);
    expect(canRequestDeletion(hh, 'u1')).toBe(false);
  });

  it('does not gate a non-owner member', () => {
    const hh = household([
      member({ id: '1', userId: 'u1', role: 'anchor' }),
      member({ id: '2', userId: 'u2', role: 'parent' }),
    ]);
    expect(canRequestDeletion(hh, 'u2')).toBe(true);
  });

  it('ignores inactive members when counting others', () => {
    const hh = household([
      member({ id: '1', userId: 'u1', role: 'anchor' }),
      member({ id: '2', userId: 'u2', isActive: false }),
    ]);
    expect(otherActiveMemberCount(hh, 'u1')).toBe(0);
    expect(canRequestDeletion(hh, 'u1')).toBe(true);
  });
});
