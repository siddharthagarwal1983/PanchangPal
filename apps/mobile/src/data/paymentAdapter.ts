/**
 * Composition root for the PaymentAdapter (Provider Adapter pattern, TDD §7.3). Returns the
 * app-wide adapter singleton. Today this is NullPaymentAdapter (the concrete
 * RevenueCatPaymentAdapter is a deferred deliverable, mirroring the Audio/Notification adapters);
 * swapping in the RevenueCat implementation is a one-line change here once
 * `react-native-purchases` + the RC public key land — no feature/hook code changes. Tests can
 * inject a fake via `setPaymentAdapter`.
 */
import { NullPaymentAdapter, type PaymentAdapter } from '../domain/subscription';

let adapter: PaymentAdapter | null = null;

export function getPaymentAdapter(): PaymentAdapter {
  if (!adapter) adapter = new NullPaymentAdapter();
  return adapter;
}

/** Test/DI seam — override the adapter (e.g. a fake in unit tests). */
export function setPaymentAdapter(next: PaymentAdapter | null): void {
  adapter = next;
}
