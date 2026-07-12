/**
 * Notification scheduler pure logic (ADR-020). Engine-INDEPENDENT: quiet hours,
 * frequency caps, completion suppression. Sunrise/tithi TIMING is the engine's job
 * (PanchangEngine interface) and is not decided here. Vitest-testable.
 */
export interface DueNotification {
  user_id: string;
  notif_type: string;
  channel: string;
  /** Target send time in the user's local wall-clock minutes-from-midnight. */
  localMinutes: number;
  /** Whether this notification's timing needs the panchang engine (sunrise/tithi). */
  requiresEngine: boolean;
  /** User quiet-hours window [startMin, endMin) in local minutes; may wrap past midnight. */
  quietStartMin: number;
  quietEndMin: number;
  /** Notifications already sent to this user in the current cap window. */
  sentInWindow: number;
  /** Per-window cap for this channel. */
  cap: number;
  /** Whether the user already completed today's ritual (suppress morning nudges). */
  completedToday: boolean;
}

/** True if the notification's local time is OUTSIDE quiet hours (i.e. OK to send). */
export function applyQuietHours(n: DueNotification): boolean {
  const { localMinutes: t, quietStartMin: s, quietEndMin: e } = n;
  if (s === e) return true; // no quiet hours configured
  const inQuiet = s < e ? t >= s && t < e : t >= s || t < e; // wrap past midnight
  return !inQuiet;
}

/** True if under the per-window frequency cap. */
export function withinFrequencyCap(n: DueNotification): boolean {
  return n.sentInWindow < n.cap;
}

/** Completion suppression: don't send a morning ritual nudge if already completed today. */
export function suppressIfCompleted(n: DueNotification): boolean {
  if (n.notif_type === 'morning' && n.completedToday) return false;
  return true;
}
