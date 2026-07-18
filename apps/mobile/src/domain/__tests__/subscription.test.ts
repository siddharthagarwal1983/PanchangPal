/**
 * MOD_subscription domain tests (pure; no network/SDK). Assert: entitlement mapping is strict
 * about `is_active` (never fabricates an active grant from a truthy non-boolean), enum/string
 * fallbacks are safe, and the gating rules (isEntitled / hasFamily / activeKind / capability
 * unlock) behave at household grain. Client never writes entitlements — this only derives.
 */
import {
  activeKind,
  hasFamily,
  isCapabilityUnlocked,
  isEntitled,
  rowToEntitlement,
  rowsToEntitlements,
} from '../../domain/subscription/entitlement';
import { PREMIUM_CAPABILITIES } from '../../domain/subscription';

describe('rowToEntitlement', () => {
  it('maps a valid active row', () => {
    expect(
      rowToEntitlement({ kind: 'family', is_active: true, granted_at: '2026-07-01T00:00:00Z', expires_at: null, source: 'revenuecat' }),
    ).toEqual({ kind: 'family', isActive: true, grantedAt: '2026-07-01T00:00:00Z', expiresAt: null, source: 'revenuecat' });
  });

  it('treats only a real boolean true as active (no coercion)', () => {
    expect(rowToEntitlement({ is_active: 'true' as never }).isActive).toBe(false);
    expect(rowToEntitlement({ is_active: 1 as never }).isActive).toBe(false);
    expect(rowToEntitlement({ is_active: true }).isActive).toBe(true);
  });

  it('falls back to documented defaults for unknown/absent fields', () => {
    const e = rowToEntitlement({ kind: 'bogus' as never });
    expect(e.kind).toBe('individual');
    expect(e.source).toBe('revenuecat');
    expect(e.grantedAt).toBeNull();
  });
});

describe('gating rules', () => {
  const active = { kind: 'individual' as const, isActive: true, grantedAt: null, expiresAt: null, source: 'revenuecat' };
  const inactive = { ...active, isActive: false };
  const family = { ...active, kind: 'family' as const };

  it('isEntitled is true iff any entitlement is active', () => {
    expect(isEntitled([active])).toBe(true);
    expect(isEntitled([inactive])).toBe(false);
    expect(isEntitled([])).toBe(false);
    expect(isEntitled(null)).toBe(false);
  });

  it('hasFamily requires an ACTIVE family entitlement', () => {
    expect(hasFamily([family])).toBe(true);
    expect(hasFamily([{ ...family, isActive: false }])).toBe(false);
    expect(hasFamily([active])).toBe(false);
  });

  it('activeKind returns family > individual > null', () => {
    expect(activeKind([active, family])).toBe('family');
    expect(activeKind([active])).toBe('individual');
    expect(activeKind([inactive])).toBeNull();
  });

  it('every v1 capability is unlocked by any active entitlement, locked otherwise', () => {
    for (const cap of PREMIUM_CAPABILITIES) {
      expect(isCapabilityUnlocked([active], cap)).toBe(true);
      expect(isCapabilityUnlocked([inactive], cap)).toBe(false);
      expect(isCapabilityUnlocked([], cap)).toBe(false);
    }
  });

  it('rowsToEntitlements is null-safe', () => {
    expect(rowsToEntitlements(null)).toEqual([]);
    expect(rowsToEntitlements([{ is_active: true }]).length).toBe(1);
  });
});
