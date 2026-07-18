/**
 * MOD_subscription — pure entitlement logic (side-effect-free, unit-tested, no network/SDK):
 *  - mapping the `entitlement` row → the client Entitlement type, with safe fallbacks (a corrupt
 *    row never fabricates an ACTIVE entitlement — is_active must be a real boolean `true`);
 *  - gating rules: isEntitled / activeKind / hasFamily and per-capability unlock checks.
 * Client never writes entitlements (service-only webhook); this only reads/derives.
 */
import { ENTITLEMENT_KINDS, type EntitlementKind } from '@panchangpal/shared';
import type { Entitlement, PremiumCapability } from './types';

/** Raw shape of the `entitlement` row this feature reads (household-member RLS). */
export interface EntitlementRow {
  kind?: unknown;
  is_active?: unknown;
  granted_at?: unknown;
  expires_at?: unknown;
  source?: unknown;
}

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** row → Entitlement. `isActive` is strict: only a real boolean true counts (never coerced). */
export function rowToEntitlement(row: EntitlementRow): Entitlement {
  return {
    kind: oneOf<EntitlementKind>(ENTITLEMENT_KINDS, row.kind, 'individual'),
    isActive: row.is_active === true,
    grantedAt: nullableString(row.granted_at),
    expiresAt: nullableString(row.expires_at),
    source: nullableString(row.source) ?? 'revenuecat',
  };
}

/** Map a list of rows to entitlements (safe on null/undefined). */
export function rowsToEntitlements(rows: EntitlementRow[] | null | undefined): Entitlement[] {
  return Array.isArray(rows) ? rows.map(rowToEntitlement) : [];
}

/** True if ANY entitlement is active (premium unlocked). Mirrors guards.isEntitled at domain grain. */
export function isEntitled(entitlements: Entitlement[] | null | undefined): boolean {
  return Boolean(entitlements?.some((e) => e.isActive));
}

/** True if an ACTIVE family entitlement exists (shares premium across household members, F-4). */
export function hasFamily(entitlements: Entitlement[] | null | undefined): boolean {
  return Boolean(entitlements?.some((e) => e.isActive && e.kind === 'family'));
}

/** The strongest active entitlement kind (family > individual), or null if none is active. */
export function activeKind(entitlements: Entitlement[] | null | undefined): EntitlementKind | null {
  if (hasFamily(entitlements)) return 'family';
  if (isEntitled(entitlements)) return 'individual';
  return null;
}

/**
 * Whether a specific premium capability is unlocked. In v1 both gated capabilities
 * (deep_dive_content, extended_ask_guru) are unlocked by ANY active entitlement; the function is
 * capability-aware so future capabilities can require a stronger grant (e.g. family-only) without
 * changing call sites.
 */
export function isCapabilityUnlocked(
  entitlements: Entitlement[] | null | undefined,
  _capability: PremiumCapability,
): boolean {
  return isEntitled(entitlements);
}

/**
 * Offerings the user may see, given FF_FAMILY_PLAN (ADR-021). The Family plan is an OFFERING gate,
 * not an in-app capability gate: while the flag is off the Family plan is simply not purchasable,
 * and Individual stays the default. An already-granted family entitlement is unaffected — this
 * filters what the store shows, never what an existing subscriber is entitled to.
 */
export function visibleOfferings<T extends { kind: EntitlementKind }>(
  offerings: readonly T[] | null | undefined,
  familyPlanEnabled: boolean,
): T[] {
  if (!Array.isArray(offerings)) return [];
  return familyPlanEnabled ? [...offerings] : offerings.filter((o) => o.kind !== 'family');
}
