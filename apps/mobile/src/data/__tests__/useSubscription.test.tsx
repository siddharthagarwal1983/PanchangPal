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
import { usePlans, usePurchase, useRestore } from '../hooks/useSubscription';
import type { PaymentAdapter, PlanOffering, PurchaseResult } from '../../domain/subscription';

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
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
    const { result } = renderHook(() => usePlans(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].id).toBe('individual_monthly');
  });

  it('surfaces an empty list when no offerings are available', async () => {
    setPaymentAdapter(new FakeAdapter([]));
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => usePlans(), { wrapper: Wrapper });
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
    const { result } = renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate('family_yearly');
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
    const { result } = renderHook(() => usePurchase(), { wrapper: Wrapper });

    result.current.mutate('individual_monthly');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.outcome).toBe('failed');
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe('useRestore', () => {
  it('restores via the adapter and invalidates entitlement on success', async () => {
    const adapter = new FakeAdapter();
    setPaymentAdapter(adapter);
    const { qc, Wrapper } = wrapper();
    const invalidate = jest.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useRestore(), { wrapper: Wrapper });

    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(adapter.restored).toBe(true);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['entitlement', 'anon'] });
  });
});
