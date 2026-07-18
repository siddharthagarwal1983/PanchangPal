/**
 * PaymentAdapter — the client seam over RevenueCat / react-native-purchases (TDD §7.3, Provider
 * Adapter pattern). Keeps the subscription feature independent of the store SDK: offerings,
 * purchase, and restore flow through this port. NO receipt logic on device — RevenueCat +
 * SVC_revenuecat_webhook are the source of truth; the client never grants entitlement locally.
 *
 * Like AudioAdapter/NotificationAdapter, the concrete `RevenueCatPaymentAdapter` is a DEFERRED
 * deliverable (wired when `react-native-purchases` is installed and the RC public key is set).
 * Until then NullPaymentAdapter reports no offerings and returns an honest "unavailable" purchase
 * outcome — it never fabricates a successful purchase or entitlement. Entitlement READS work today
 * against Postgres, so gating is real even before the SDK is wired.
 */
import type { EntitlementKind } from '@panchangpal/shared';

/** A purchasable plan/offering as surfaced to the UI (prices come from the store, never hardcoded). */
export interface PlanOffering {
  id: string;
  kind: EntitlementKind;
  priceLabel: string; // store-localized price string
  period: string; // e.g. 'month' | 'year'
  bestValue?: boolean;
}

export type PurchaseOutcome = 'success' | 'cancelled' | 'failed' | 'unavailable';

export interface PurchaseResult {
  outcome: PurchaseOutcome;
  /** Present on success — passed to API_POST_SUB_VALIDATE for server reconciliation. */
  receiptToken?: string;
}

export interface PaymentAdapter {
  /** Configure the SDK for the current user (deferred until after first paint, §8.3). */
  configure(appUserId: string): void;
  /** Fetch store offerings (API_GET_SUB_PLANS). Empty when unavailable. */
  getOfferings(): Promise<PlanOffering[]>;
  /** Begin a native purchase; resolves the outcome. Never grants entitlement on device. */
  purchase(planId: string): Promise<PurchaseResult>;
  /** Restore purchases (API_POST_SUB_RESTORE). */
  restore(): Promise<PurchaseResult>;
  /** The store this device transacts with. */
  getStore(): 'app_store' | 'play';
}

/** Default no-op implementation used until the concrete RevenueCat adapter is wired in. */
export class NullPaymentAdapter implements PaymentAdapter {
  configure(_appUserId: string): void {
    // no-op
  }

  async getOfferings(): Promise<PlanOffering[]> {
    return [];
  }

  async purchase(_planId: string): Promise<PurchaseResult> {
    // No store backend; report unavailable rather than a fabricated success.
    return { outcome: 'unavailable' };
  }

  async restore(): Promise<PurchaseResult> {
    return { outcome: 'unavailable' };
  }

  getStore(): 'app_store' | 'play' {
    return 'app_store';
  }
}
