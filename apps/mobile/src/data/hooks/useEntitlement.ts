/**
 * HOOK_useEntitlement + usePremiumGate (TDD Part 4 §7.3 / §3.4). Household-grain entitlement read
 * (server-authoritative, F-4) with a Realtime seam so a webhook-driven grant/revoke propagates
 * without a manual refresh. Gating is contextual: the daily loop is NEVER gated (P4), and
 * `usePremiumGate` fails OPEN while loading so a paywall never flashes over cached content.
 */
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSubscriptionRepository } from '../subscriptionRepository';
import {
  isCapabilityUnlocked,
  type Entitlement,
  type GateResult,
  type PremiumCapability,
} from '../../domain/subscription';
import { useSessionStore } from '../../store/session';

export const ENTITLEMENT_KEY = (userId: string) => ['entitlement', userId] as const;

export function useEntitlement() {
  const qc = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const key = ENTITLEMENT_KEY(userId ?? 'anon');

  const query = useQuery<Entitlement[]>({
    queryKey: key,
    queryFn: () => getSubscriptionRepository().getEntitlements(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Realtime: a webhook grant/revoke invalidates the cache (F-4 propagation, TDD §5.4).
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = getSubscriptionRepository().subscribeEntitlements(() => {
      void qc.invalidateQueries({ queryKey: key });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return query;
}

/**
 * Gate a premium capability. Returns `{ entitled, isLoading }`. Callers show the affordance when
 * `entitled`, and a contextual, dismissible upgrade surface otherwise — never a hard block on the
 * daily loop. Fails open while loading (entitled=false only once we actually know).
 */
export function usePremiumGate(capability: PremiumCapability): GateResult {
  const { data, isLoading } = useEntitlement();
  return { entitled: isCapabilityUnlocked(data, capability), isLoading };
}
