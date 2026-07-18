/**
 * MOD_subscription hooks (TDD Part 4 §7.3; openapi API_GET_SUB_PLANS / API_POST_SUB_VALIDATE /
 * API_POST_SUB_RESTORE). Plans / purchase / restore flow ONLY through the PaymentAdapter seam
 * (RevenueCat SDK), never a vendor import here and never an HTTP receipt call — RevenueCat +
 * SVC_revenuecat_webhook validate and grant entitlement server-side (F-4, household grain). On a
 * successful purchase/restore the client does NOT grant entitlement; it invalidates the entitlement
 * query so the webhook-driven grant (also pushed via Realtime, see useEntitlement) is reflected.
 *
 * Analytics anchors: EVT_049 (screen viewed — fired by the screen), EVT_050 (plan selected),
 * EVT_051 (purchase result), EVT_052 (purchases restored). The Analytics Adapter is a deferred
 * deliverable across slices, so these are named call sites, not a fabricated analytics API.
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPaymentAdapter } from '../paymentAdapter';
import { ENTITLEMENT_KEY } from './useEntitlement';
import type { PlanOffering, PurchaseResult } from '../../domain/subscription';
import { useSessionStore } from '../../store/session';

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
  return useMutation<PurchaseResult, unknown, string>({
    mutationFn: (planId: string) => getPaymentAdapter().purchase(planId), // EVT_051 (result)
    onSuccess: (result) => {
      if (result.outcome === 'success') {
        void qc.invalidateQueries({ queryKey: ENTITLEMENT_KEY(userId ?? 'anon') });
      }
    },
  });
}

/** Restore purchases (API_POST_SUB_RESTORE, EVT_052). Invalidates entitlement on success. */
export function useRestore() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  return useMutation<PurchaseResult, unknown, void>({
    mutationFn: () => getPaymentAdapter().restore(), // EVT_052 (restored)
    onSuccess: (result) => {
      if (result.outcome === 'success') {
        void qc.invalidateQueries({ queryKey: ENTITLEMENT_KEY(userId ?? 'anon') });
      }
    },
  });
}
