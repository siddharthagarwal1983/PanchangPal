/**
 * MOD_subscription hooks (TDD Part 4 §7.3; openapi API_GET_SUB_PLANS / API_POST_SUB_VALIDATE /
 * API_POST_SUB_RESTORE). Plans / purchase / restore flow ONLY through the PaymentAdapter seam
 * (RevenueCat SDK), never a vendor import here and never an HTTP receipt call — RevenueCat +
 * SVC_revenuecat_webhook validate and grant entitlement server-side (F-4, household grain). On a
 * successful purchase/restore the client does NOT grant entitlement; it invalidates the entitlement
 * query so the webhook-driven grant (also pushed via Realtime, see useEntitlement) is reflected.
 *
 * Analytics: EVT_051 (purchase result) and EVT_052 (purchases restored) are emitted HERE rather than
 * at the call sites, because two surfaces open a purchase — SCR_SUBSCRIPTION_001 and the contextual
 * paywall — and §11.3 computes free→paid from EVT_051. A funnel that a third surface could join
 * without reporting is a funnel with a silent hole, so the seam that performs the purchase is the
 * one that reports it. EVT_049/EVT_050 stay at the surfaces: being *seen* and choosing a plan are
 * properties of a surface, not of this mutation.
 *
 * (Until 2026-08-08 these were comment-only anchors reading "the Analytics Adapter is a deferred
 * deliverable, so these are named call sites, not a fabricated analytics API". The adapter shipped
 * with B4.2; B8.3 made them real.)
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPaymentAdapter } from '../paymentAdapter';
import { getAnalyticsService } from '../analyticsAdapter';
import { ENTITLEMENT_KEY } from './useEntitlement';
import type { EntitlementKind, PlanOffering, PurchaseResult } from '../../domain/subscription';
import {
  purchaseResultEvent,
  purchaseThrewEvent,
  purchasesRestoredEvent,
} from '../../domain/analytics/subscriptionEvents';
import { useSessionStore } from '../../store/session';

/**
 * What a purchase needs: the store product to buy, and the plan KIND it represents.
 *
 * The kind is carried rather than derived because §11.2 defines EVT_051's `plan` as
 * individual/family, while `planId` is an opaque store product identifier — reporting the latter
 * would make the monetization metric unreadable and leak store SKUs into analytics.
 */
export interface PurchaseRequest {
  planId: string;
  plan: EntitlementKind;
}

export const PLANS_KEY = ['subscription', 'plans'] as const;

/**
 * Configure the PaymentAdapter for the current user once a session id is known (deferred to after
 * first paint, §8.3). No-op under NullPaymentAdapter; wires RevenueCat's appUserId under the real
 * adapter so entitlements bind to the right identity.
 */
export function useConfigurePayments(): void {
  const userId = useSessionStore((s) => s.userId);
  useEffect(() => {
    if (!userId) return;
    getPaymentAdapter().configure(userId);
  }, [userId]);
}

/** Store offerings (API_GET_SUB_PLANS). Empty array = "plans unavailable" (calm empty state). */
export function usePlans() {
  return useQuery<PlanOffering[]>({
    queryKey: PLANS_KEY,
    queryFn: () => getPaymentAdapter().getOfferings(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Begin a native purchase (API_POST_SUB_VALIDATE via the store SDK). Resolves the PurchaseResult;
 * the caller maps `failed`/`unavailable` → ERR_PAYMENT_FAILED and `success` → warm confirmation.
 * Entitlement is NEVER granted here — on success the entitlement cache is invalidated so the
 * server-authoritative grant (webhook + Realtime) shows through.
 */
export function usePurchase() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  return useMutation<PurchaseResult, unknown, PurchaseRequest>({
    mutationFn: ({ planId }) => getPaymentAdapter().purchase(planId),
    // EVT_051 Purchase Result. `onSuccess` covers every RESOLVED outcome — the adapter contract
    // resolves `cancelled`/`failed`/`unavailable` rather than rejecting — and `onError` covers a
    // vendor SDK that throws. `purchaseResultEvent` returns null for `unavailable`, so no event is
    // recorded while payments are unbuilt; see subscriptionEvents.ts for why that matters.
    onSuccess: (result, { plan }) => {
      const event = purchaseResultEvent(plan, result.outcome);
      if (event) getAnalyticsService().track(event.eventId, event.props);
      if (result.outcome === 'success') {
        void qc.invalidateQueries({ queryKey: ENTITLEMENT_KEY(userId ?? 'anon') });
      }
    },
    onError: (_err, { plan }) => {
      const event = purchaseThrewEvent(plan);
      getAnalyticsService().track(event.eventId, event.props);
    },
  });
}

/** Restore purchases (API_POST_SUB_RESTORE, EVT_052). Invalidates entitlement on success. */
export function useRestore() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  return useMutation<PurchaseResult, unknown, void>({
    mutationFn: () => getPaymentAdapter().restore(),
    onSuccess: (result) => {
      const event = purchasesRestoredEvent(result.outcome);
      if (event) getAnalyticsService().track(event.eventId, event.props);
      if (result.outcome === 'success') {
        void qc.invalidateQueries({ queryKey: ENTITLEMENT_KEY(userId ?? 'anon') });
      }
    },
  });
}
