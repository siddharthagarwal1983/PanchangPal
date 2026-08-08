/**
 * MOD_subscription hook tests. Inject a fake PaymentAdapter via the composition-root seam
 * (setPaymentAdapter) and assert the hooks delegate plans/purchase/restore to the adapter and
 * never grant entitlement themselves. Purchase forwards the selected plan id; a successful
 * purchase/restore invalidates the entitlement query so the server-authoritative grant (webhook +
 * Realtime) shows through. No network, no vendor SDK.
 */
import { type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setPaymentAdapter } from '../paymentAdapter';
import { setAnalyticsService } from '../analyticsAdapter';
import { usePlans, usePurchase, useRestore } from '../hooks/useSubscription';
import type { PaymentAdapter, PlanOffering, PurchaseResult } from '../../domain/subscription';
import type { AnalyticsProps, AnalyticsService } from '../../domain/analytics/AnalyticsService';
import type { EventId } from '@panchangpal/shared';

/** Records what reached the analytics port, so the CALL SITE is asserted and not just the mapping. */
class RecordingAnalytics implements AnalyticsService {
  events: { eventId: EventId; props?: AnalyticsProps }[] = [];
  track(eventId: EventId, props?: AnalyticsProps): void {
    this.events.push({ eventId, props });
  }
  async flush(): Promise<void> {}
  setHouseholdId(): void {}
  idsOf(): EventId[] {
    return this.events.map((e) => e.eventId);
  }
}

const OFFERINGS: PlanOffering[] = [
  { id: 'individual_monthly', kind: 'individual', priceLabel: '$4.99', period: 'month' },
  { id: 'family_yearly', kind: 'family', priceLabel: '$39.99', period: 'year', bestValue: true },
];

class FakeAdapter implements PaymentAdapter {
  purchasedWith: string | null = null;
  restored = false;
  constructor(
    private readonly offerings: PlanOffering[] = OFFERINGS,
    private readonly purchaseResult: PurchaseResult = { outcome: 'success', receiptToken: 'rc_tok' },
    private readonly restoreResult: PurchaseResult = { outcome: 'success' },
  ) {}
  configure(): void {}
  async getOfferings(): Promise<PlanOffering[]> {
    return this.offerings;
  }
  async purchase(planId: string): Promise<PurchaseResult> {
    this.purchasedWith = planId;
    return this.purchaseResult;
  }
  async restore(): Promise<PurchaseResult> {
    this.restored = true;
    return this.restoreResult;
  }
  getStore(): 'app_store' | 'play' {
    return 'app_store';
  }
}

function wrapper() {
  // `gcTime: Infinity` is TEARDOWN, not tuning — see useChecklist.test.tsx for the full note.
  // TanStack schedules a 5-minute garbage-collection `setTimeout` per cached query/mutation when
  // its last observer detaches, which keeps the jest worker's event loop alive.
  // Pinned by queryClientGcTime.test.ts.
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, Wrapper };
}

afterEach(() => setPaymentAdapter(null));

describe('usePlans', () => {
  it('returns store offerings from the adapter (empty = unavailable)', async () => {
    setPaymentAdapter(new FakeAdapter());
    const { Wrapper } = wrapper();
    const { result } = await renderHook(() => usePlans(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].id).toBe('individual_monthly');
  });

  it('surfaces an empty list when no offerings are available', async () => {
    setPaymentAdapter(new FakeAdapter([]));
    const { Wrapper } = wrapper();
    const { result } = await renderHook(() => usePlans(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('usePurchase', () => {
  it('forwards the selected plan id to the adapter and resolves the outcome', async () => {
    const adapter = new FakeAdapter();
    setPaymentAdapter(adapter);
    const { qc, Wrapper } = wrapper();
    const invalidate = jest.spyOn(qc, 'invalidateQueries');
    const { result } = await renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate({ planId: 'family_yearly', plan: 'family' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(adapter.purchasedWith).toBe('family_yearly');
    expect(result.current.data?.outcome).toBe('success');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['entitlement', 'anon'] });
  });

  it('does not invalidate entitlement on a failed purchase (no client-side grant)', async () => {
    const adapter = new FakeAdapter(OFFERINGS, { outcome: 'failed' });
    setPaymentAdapter(adapter);
    const { qc, Wrapper } = wrapper();
    const invalidate = jest.spyOn(qc, 'invalidateQueries');
    const { result } = await renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate({ planId: 'individual_monthly', plan: 'individual' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.outcome).toBe('failed');
    expect(invalidate).not.toHaveBeenCalled();
  });
});

/**
 * The seam emits EVT_051/EVT_052, not the screens — two surfaces open a purchase and §11.3 computes
 * free→paid from EVT_051, so a funnel a third surface could join without reporting would have a
 * silent hole. These assert the CALL SITE fires, which the pure mapping tests cannot: a correct
 * mapping that nothing invokes produces no metric at all.
 */
describe('the purchase seam reports the funnel', () => {
  it('emits EVT_051 with the plan kind, not the store product id', async () => {
    const analytics = new RecordingAnalytics();
    setAnalyticsService(analytics);
    setPaymentAdapter(new FakeAdapter());
    const { Wrapper } = wrapper();
    const { result } = await renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate({ planId: 'family_yearly', plan: 'family' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analytics.events).toContainEqual({
      eventId: 'EVT_051',
      props: { plan: 'family', result: 'success', error_code: undefined },
    });
    // The opaque SKU must not reach analytics — it would make the metric unreadable and leak
    // store product naming.
    expect(JSON.stringify(analytics.events)).not.toContain('family_yearly');
  });

  it('emits EVT_052 on restore', async () => {
    const analytics = new RecordingAnalytics();
    setAnalyticsService(analytics);
    setPaymentAdapter(new FakeAdapter());
    const { Wrapper } = wrapper();
    const { result } = await renderHook(() => useRestore(), { wrapper: Wrapper });

    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analytics.idsOf()).toContain('EVT_052');
  });

  it('⛔ emits NOTHING while payments are unbuilt (NullPaymentAdapter returns `unavailable`)', async () => {
    // The state the app is in TODAY. Mapping `unavailable` to a failure would fire EVT_051 on every
    // tap and poison §11.3's free→paid rate with failures that only meant "payments are unbuilt".
    const analytics = new RecordingAnalytics();
    setAnalyticsService(analytics);
    setPaymentAdapter(new FakeAdapter(OFFERINGS, { outcome: 'unavailable' }));
    const { Wrapper } = wrapper();
    const { result } = await renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate({ planId: 'individual_monthly', plan: 'individual' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.outcome).toBe('unavailable');
    expect(analytics.idsOf()).not.toContain('EVT_051');
  });

  it('counts a THROWN purchase as a failure rather than losing it', async () => {
    const analytics = new RecordingAnalytics();
    setAnalyticsService(analytics);
    const throwing = new FakeAdapter();
    throwing.purchase = async () => {
      throw new Error('store exploded');
    };
    setPaymentAdapter(throwing);
    const { Wrapper } = wrapper();
    const { result } = await renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate({ planId: 'individual_monthly', plan: 'individual' });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(analytics.events).toContainEqual({
      eventId: 'EVT_051',
      props: { plan: 'individual', result: 'fail', error_code: 'ERR_PAYMENT_FAILED' },
    });
    // The vendor's message must never travel with it (ADR-031 / §7.1).
    expect(JSON.stringify(analytics.events)).not.toContain('store exploded');
  });
});

describe('useRestore', () => {
  it('restores via the adapter and invalidates entitlement on success', async () => {
    const adapter = new FakeAdapter();
    setPaymentAdapter(adapter);
    const { qc, Wrapper } = wrapper();
    const invalidate = jest.spyOn(qc, 'invalidateQueries');
    const { result } = await renderHook(() => useRestore(), { wrapper: Wrapper });

    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(adapter.restored).toBe(true);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['entitlement', 'anon'] });
  });
});
