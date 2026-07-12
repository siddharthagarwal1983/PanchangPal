import { describe, it, expect } from 'vitest';
import { mapEvent, statusForEvent, kindForProduct, type RevenueCatEvent } from './logic';
import { verifyHmac, hmacSha256Hex } from '../_shared/crypto';

const evt = (over: Partial<RevenueCatEvent> = {}): RevenueCatEvent => ({
  id: 'evt_1',
  type: 'INITIAL_PURCHASE',
  app_user_id: 'rc_user',
  original_transaction_id: 'txn_1',
  product_id: 'pp_family_monthly',
  entitlement_ids: ['family'],
  expiration_at_ms: Date.UTC(2026, 7, 12),
  store: 'APP_STORE',
  ...over,
});

describe('revenuecat-webhook logic (TDD Part 2 §5.6, F-4)', () => {
  it('maps event types to subscription status', () => {
    expect(statusForEvent('RENEWAL')).toBe('active');
    expect(statusForEvent('BILLING_ISSUE')).toBe('in_grace');
    expect(statusForEvent('CANCELLATION')).toBe('cancelled');
    expect(statusForEvent('EXPIRATION')).toBe('expired');
  });

  it('detects family vs individual from product/entitlement', () => {
    expect(kindForProduct('pp_family_monthly', ['family'])).toBe('family');
    expect(kindForProduct('pp_individual_monthly', ['premium'])).toBe('individual');
  });

  it('maps a purchase to an active household-grain subscription', () => {
    const { subscription, entitlementActive } = mapEvent(evt());
    expect(subscription.kind).toBe('family');
    expect(subscription.status).toBe('active');
    expect(subscription.rc_original_txn_id).toBe('txn_1');
    expect(entitlementActive).toBe(true);
  });

  it('expiration deactivates the entitlement', () => {
    expect(mapEvent(evt({ type: 'EXPIRATION' })).entitlementActive).toBe(false);
  });

  it('HMAC verification accepts a correct signature and rejects a bad one', async () => {
    const secret = 'whsec_test';
    const payload = JSON.stringify({ event: evt() });
    const sig = await hmacSha256Hex(secret, payload);
    expect(await verifyHmac(secret, payload, sig)).toBe(true);
    expect(await verifyHmac(secret, payload, 'deadbeef')).toBe(false);
  });
});
