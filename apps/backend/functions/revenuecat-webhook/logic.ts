/**
 * SVC_revenuecat_webhook logic (TDD Part 2 §5.6 / ADR-005). Pure mapping from a
 * RevenueCat event to the subscription + entitlement rows at HOUSEHOLD grain (F-4).
 * Idempotent by the RC event id / rc_original_txn_id. Signature verification is in
 * ../_shared/crypto.ts. No Deno/DB here → Vitest-testable.
 */
import type { EntitlementKind, SubStatus } from '@panchangpal/shared';

export interface RevenueCatEvent {
  id: string;
  type: string; // INITIAL_PURCHASE | RENEWAL | CANCELLATION | EXPIRATION | ...
  app_user_id: string;
  original_transaction_id: string;
  product_id: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number | null;
  store?: string; // APP_STORE | PLAY_STORE
}

export interface SubscriptionUpsert {
  rc_app_user_id: string;
  rc_original_txn_id: string;
  kind: EntitlementKind;
  status: SubStatus;
  current_period_end: string | null;
  store: string | null;
}

const ACTIVE_TYPES = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']);
const GRACE_TYPES = new Set(['BILLING_ISSUE']);
const CANCELLED_TYPES = new Set(['CANCELLATION']);
const EXPIRED_TYPES = new Set(['EXPIRATION']);

export function statusForEvent(type: string): SubStatus {
  if (ACTIVE_TYPES.has(type)) return 'active';
  if (GRACE_TYPES.has(type)) return 'in_grace';
  if (CANCELLED_TYPES.has(type)) return 'cancelled';
  if (EXPIRED_TYPES.has(type)) return 'expired';
  return 'active';
}

export function kindForProduct(productId: string, entitlementIds: string[] = []): EntitlementKind {
  const hay = `${productId} ${entitlementIds.join(' ')}`.toLowerCase();
  return hay.includes('family') ? 'family' : 'individual';
}

export function mapEvent(evt: RevenueCatEvent): { subscription: SubscriptionUpsert; entitlementActive: boolean } {
  const status = statusForEvent(evt.type);
  return {
    subscription: {
      rc_app_user_id: evt.app_user_id,
      rc_original_txn_id: evt.original_transaction_id,
      kind: kindForProduct(evt.product_id, evt.entitlement_ids),
      status,
      current_period_end: evt.expiration_at_ms ? new Date(evt.expiration_at_ms).toISOString() : null,
      store: evt.store ?? null,
    },
    entitlementActive: status === 'active' || status === 'in_grace',
  };
}
