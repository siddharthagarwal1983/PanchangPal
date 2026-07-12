/**
 * Navigation guards (TDD Part 4 §3.4). Pure decision functions so they're unit-testable and
 * screens stay logic-free. Realizes deferred + anonymous-first auth (UX-2 / ADR-009):
 * - Onboarding gate: unonboarded → onboarding; onboarded → tabs.
 * - Anonymous-OK: tabs render for anonymous users; only protected actions require auth.
 * - Entitlement: premium affordances gated; the daily loop is NEVER gated (P4).
 */
import type { SessionStatus } from '../store/session';

export type RootRoute = 'splash' | 'onboarding' | 'tabs';

export interface GateInput {
  status: SessionStatus;
  onboarded: boolean;
}

/** Where the splash gate should route once bootstrap resolves. */
export function resolveRootRoute({ status, onboarded }: GateInput): RootRoute {
  if (status === 'loading') return 'splash';
  if (!onboarded) return 'onboarding';
  return 'tabs'; // anonymous OR authenticated both land on tabs (deferred auth)
}

/** Whether a protected action (household, cross-device) must trigger sign-in first (UX-2). */
export function requiresAuth(status: SessionStatus): boolean {
  return status !== 'authenticated';
}

/** Whether a premium-gated affordance is unlocked (daily loop is never gated). */
export function isEntitled(entitlements: { is_active: boolean }[] | null): boolean {
  return Boolean(entitlements?.some((e) => e.is_active));
}
