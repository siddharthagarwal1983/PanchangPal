/**
 * Composition root for the NotificationAdapter (Provider Adapter pattern, TDD §7.2). Returns the
 * app-wide adapter singleton. Today this is NullNotificationAdapter (the concrete
 * ExpoNotificationAdapter is a deferred deliverable, mirroring the AudioAdapter status); swapping
 * in the Expo implementation is a one-line change here — no feature/hook code changes. Tests can
 * inject a fake via `setNotificationAdapter`.
 */
import { NullNotificationAdapter, type NotificationAdapter } from '../domain/notifications';

let adapter: NotificationAdapter | null = null;

export function getNotificationAdapter(): NotificationAdapter {
  if (!adapter) adapter = new NullNotificationAdapter();
  return adapter;
}

/** Test/DI seam — override the adapter (e.g. a fake in unit tests). */
export function setNotificationAdapter(next: NotificationAdapter | null): void {
  adapter = next;
}
