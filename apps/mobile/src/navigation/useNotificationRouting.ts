/**
 * useNotificationRouting (TDD Part 4 §7.2 tap routing / §3.3 deep links). Mounts at the app root
 * and, through the NotificationAdapter seam, (1) installs the foreground handler and (2) routes
 * notification taps to a valid back-stack via the pure domain resolver. Fires EVT_041 (notif
 * opened) with the notification_type. With NullNotificationAdapter this is a no-op (no listener),
 * so the app builds and runs unchanged until the concrete Expo adapter is wired in.
 */
import { useEffect } from 'react';
import { router } from 'expo-router';
import { getNotificationAdapter } from '../data/notificationAdapter';
import {
  DEFAULT_NOTIFICATION_ROUTE,
  resolveNotificationRoute,
} from '../domain/notifications';

/** Extract a documented notification_type for analytics (best-effort; never throws). */
function notifType(data: unknown): string | undefined {
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).type === 'string') {
    return (data as Record<string, string>).type;
  }
  return undefined;
}

export function useNotificationRouting(onOpen?: (type: string | undefined) => void): void {
  useEffect(() => {
    const adapter = getNotificationAdapter();

    // Foreground: presentation is handled as a slim in-app banner elsewhere; here we only need
    // the handler installed so the OS doesn't show a system alert while the app is active.
    adapter.setForegroundHandler(() => {
      /* in-app banner is surfaced by the feature; no navigation on foreground receipt */
    });

    const unsubscribe = adapter.addResponseListener((response) => {
      const route = resolveNotificationRoute(response.data) ?? DEFAULT_NOTIFICATION_ROUTE;
      onOpen?.(notifType(response.data)); // EVT_041 (notification_type)
      router.push(route as never);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
