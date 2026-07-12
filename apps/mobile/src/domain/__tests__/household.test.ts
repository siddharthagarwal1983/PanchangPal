/**
 * Household domain tests (pure, no network). Asserts: row→domain mapping with SAFE fallbacks for
 * invalid enums; owner-first stable member ordering; initials; canManage/isSolo/activeMemberCount
 * rules; and that memberInputToRow writes only provided columns.
 */
import {
  rowToHousehold,
  rowToMember,
  memberInputToRow,
  sortMembers,
  memberInitials,
  canManage,
  isSolo,
  activeMemberCount,
  type Household,
  type HouseholdMember,
} from '../household';

const member = (over: Partial<HouseholdMember> = {}): HouseholdMember => ({
  id: 'm', householdId: 'h', userId: null, displayName: 'A', role: 'other', depth: 'quick', isActive: true, ...over,
});

describe('household mapping', () => {
  it('maps a household row with embedded members', () => {
    const hh = rowToHousehold({
      id: 'h1', name: 'Malhotra', owner_id: 'u1', tradition_code: 'north_indian',
      members: [{ id: 'm1', household_id: 'h1', user_id: 'u1', display_name: 'Ravi', role: 'anchor', depth: 'deep', is_active: true }],
    });
    expect(hh).toMatchObject({ id: 'h1', name: 'Malhotra', ownerId: 'u1', tradition: 'north_indian' });
    expect(hh!.members[0]).toMatchObject({ id: 'm1', userId: 'u1', displayName: 'Ravi', role: 'anchor', depth: 'deep' });
  });

  it('returns null for a missing/invalid household row', () => {
    expect(rowToHousehold(null)).toBeNull();
    expect(rowToHousehold({ name: 'no id' })).toBeNull();
  });

  it('falls back to documented defaults for invalid enum values (never fabricates)', () => {
    const m = rowToMember({ id: 'm', household_id: 'h', role: 'monarch', depth: 'epic', is_active: true });
    expect(m.role).toBe('other');
    expect(m.depth).toBe('quick');
  });

  it('treats a local (uninvited) member as user_id null and default-active', () => {
    const m = rowToMember({ id: 'm', household_id: 'h', display_name: 'Guest', role: 'youth', depth: 'quick' });
    expect(m.userId).toBeNull();
    expect(m.isActive).toBe(true);
  });

  it('writes only provided columns in memberInputToRow', () => {
    expect(memberInputToRow({ role: 'elder' })).toEqual({ role: 'elder' });
    expect(memberInputToRow({ displayName: 'Nani', depth: 'deep' })).toEqual({ display_name: 'Nani', depth: 'deep' });
  });
});

describe('household rules', () => {
  it('sorts active first, then anchor, then by name', () => {
    const sorted = sortMembers([
      member({ id: '1', displayName: 'Zara', role: 'other' }),
      member({ id: '2', displayName: 'Anil', role: 'anchor' }),
      member({ id: '3', displayName: 'Bina', role: 'other', isActive: false }),
    ]);
    expect(sorted.map((m) => m.id)).toEqual(['2', '1', '3']);
  });

  it('computes 1–2 letter initials', () => {
    expect(memberInitials('Ravi Malhotra')).toBe('RM');
    expect(memberInitials('Sunny')).toBe('SU');
    expect(memberInitials('   ')).toBe('?');
  });

  it('canManage only for the owner', () => {
    const hh: Household = { id: 'h', name: 'x', ownerId: 'u1', tradition: 'generic', members: [] };
    expect(canManage(hh, 'u1')).toBe(true);
    expect(canManage(hh, 'u2')).toBe(false);
    expect(canManage(null, 'u1')).toBe(false);
  });

  it('isSolo / activeMemberCount count only active members', () => {
    const hh: Household = {
      id: 'h', name: 'x', ownerId: 'u1', tradition: 'generic',
      members: [member({ id: '1', userId: 'u1', role: 'anchor' }), member({ id: '2', isActive: false })],
    };
    expect(activeMemberCount(hh)).toBe(1);
    expect(isSolo(hh)).toBe(true);
    expect(isSolo(null)).toBe(true);
  });
});
