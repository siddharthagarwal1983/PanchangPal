/**
 * MOD_subscription — domain types (TDD Part 4 §7.3 / §3.4). The client-facing shape of the
 * server-authoritative, HOUSEHOLD-grain entitlement (F-4). Entitlements are written ONLY by the
 * RevenueCat webhook (SVC_revenuecat_webhook); the client reads them (household-member RLS) and
 * gates premium affordances on them. The daily practice loop is NEVER gated (PDD Principle P4).
 */
import type { EntitlementKind, SubStatus } from '@panchangpal/shared';

export type { EntitlementKind, SubStatus };

/** A single active/inactive entitlement row at household grain (openapi Entitlement schema). */
export interface Entitlement {
  kind: EntitlementKind;
  isActive: boolean;
  grantedAt: string | null;
  expiresAt: string | null;
  source: string;
}

/**
 * The premium capabilities gated in v1 (product decision 2026-07-18). The daily loop, and the
 * honest-decline behavior of Ask Guru, are never gated. The Individual plan unlocks all of these;
 * the Family plan (behind FF_FAMILY_PLAN) additionally shares them across household members.
 */
export const PREMIUM_CAPABILITIES = ['deep_dive_content', 'extended_ask_guru'] as const;
export type PremiumCapability = (typeof PREMIUM_CAPABILITIES)[number];

/** Result of a gate check for a capability (drives contextual, dismissible upgrade surfaces). */
export interface GateResult {
  /** True if the capability is unlocked by an active entitlement. */
  entitled: boolean;
  /** True while entitlements are still loading (fail-open UI: don't flash a paywall). */
  isLoading: boolean;
}
