/**
 * MOD_notifications — domain types (TDD Part 4 §7.2 / §4.1). The client-facing shape of the
 * server-authoritative notification preferences (per-channel toggles + quiet hours), stored in
 * the `user_profile.notif_prefs` JSON column. Server stays the source of truth; scheduling is
 * server-side (SVC_notify_scheduler) — the client only registers a token + prefs. Device
 * permission state is NOT server data; it lives on the OS and is read through NotificationAdapter.
 */
import { NOTIF_CHANNELS, type NotifChannel } from '@panchangpal/shared';

/** Per-channel on/off map for the six documented channels (PDD §8.0). */
export type NotifChannelPrefs = Record<NotifChannel, boolean>;

/** Local wall-time quiet window "HH:MM"–"HH:MM" during which pushes are suppressed. */
export interface QuietHours {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

/** Client-facing notification preferences (server-authoritative subset of notif_prefs). */
export interface NotifPrefs {
  channels: NotifChannelPrefs;
  /** null = no quiet hours configured. */
  quietHours: QuietHours | null;
}

/** A partial update; only provided keys are written (PATCH semantics). */
export interface NotifPrefsPatch {
  /** Toggle a subset of channels; unlisted channels are unchanged. */
  channels?: Partial<NotifChannelPrefs>;
  /** Set or clear (null) the quiet-hours window. */
  quietHours?: QuietHours | null;
}

/**
 * OS notification permission state (read via NotificationAdapter; never server data).
 * `undetermined` = never asked (primeable); `denied` = declined (non-blocking, soft re-ask).
 */
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * Documented calm defaults (product principle: never notification spam). The daily practice
 * loop and the dates people care about are on; growth/lifecycle (marketing) are OFF by default
 * and strictly opt-in. Used when no notif_prefs exist yet (fresh profile).
 */
export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  channels: {
    daily: true,
    festival: true,
    personal: true,
    household: true,
    growth: false,
    lifecycle: false,
  },
  quietHours: null,
};

/** The documented channel order for rendering the settings list (mirrors NOTIF_CHANNELS). */
export const NOTIF_CHANNEL_ORDER: readonly NotifChannel[] = NOTIF_CHANNELS;
