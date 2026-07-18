/**
 * NotificationAdapter — the client seam over Expo Push / expo-notifications (TDD §7.2, Provider
 * Adapter pattern). Keeps the notifications feature independent of any concrete SDK: permission,
 * token acquisition, the foreground handler, and tap-response routing all flow through this port.
 *
 * Like AudioAdapter, the concrete `ExpoNotificationAdapter` is a DEFERRED deliverable (wired when
 * `expo-notifications` is installed and the push project is provisioned). Until then the app uses
 * NullNotificationAdapter: permission reads `undetermined`, requests resolve to `denied`, and no
 * token is minted — so the opt-in flow degrades to a calm, honest state and never fabricates a
 * token or a granted permission. Scheduling remains server-side regardless (SVC_notify_scheduler).
 */
import type { PermissionStatus } from './types';

/** Payload delivered when the user taps a notification (data is opaque JSON; routed by domain). */
export interface NotificationResponse {
  data: unknown;
}

export interface NotificationAdapter {
  /** Current OS permission state. Never throws; returns 'undetermined' when unknown. */
  getPermissionStatus(): Promise<PermissionStatus>;
  /** Prompt the OS permission dialog (only after in-app priming — UX-4). Returns the outcome. */
  requestPermission(): Promise<PermissionStatus>;
  /** Acquire the Expo push token once permission is granted; null if unavailable/denied. */
  getExpoPushToken(): Promise<string | null>;
  /** Install the foreground presentation handler (slim in-app banner, not a system alert). */
  setForegroundHandler(handler: (data: unknown) => void): void;
  /** Subscribe to notification taps (background/quit). Returns an unsubscribe function. */
  addResponseListener(handler: (response: NotificationResponse) => void): () => void;
  /** The device platform for token registration. */
  getPlatform(): 'ios' | 'android';
}

/**
 * Default no-op implementation used until the concrete Expo adapter is wired in. Honest by
 * construction: no permission is ever reported as granted and no token is minted.
 */
export class NullNotificationAdapter implements NotificationAdapter {
  async getPermissionStatus(): Promise<PermissionStatus> {
    return 'undetermined';
  }

  async requestPermission(): Promise<PermissionStatus> {
    // No OS backend to prompt; report a non-blocking decline rather than a fabricated grant.
    return 'denied';
  }

  async getExpoPushToken(): Promise<string | null> {
    return null;
  }

  setForegroundHandler(_handler: (data: unknown) => void): void {
    // no-op
  }

  addResponseListener(_handler: (response: NotificationResponse) => void): () => void {
    return () => {
      // no-op unsubscribe
    };
  }

  getPlatform(): 'ios' | 'android' {
    return 'ios';
  }
}
