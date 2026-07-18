/**
 * MOD_notifications — pure domain logic (side-effect-free, unit-tested, no network/SDK):
 *  - mapping between the `user_profile.notif_prefs` JSON blob and the client NotifPrefs type,
 *    with safe fallbacks to documented defaults (a corrupt/partial blob never surfaces an
 *    invalid channel state or trusts unknown keys);
 *  - rules: quiet-hours validation, the soft re-ask gate (PDD A4 — after 2 completed loops),
 *    and notification-type → deep-link resolution for tap routing (TDD §7.2 / §3.3).
 */
import { NOTIF_CHANNELS, NOTIF_TYPES, type NotifChannel, type NotifType } from '@panchangpal/shared';
import {
  DEFAULT_NOTIF_PREFS,
  type NotifChannelPrefs,
  type NotifPrefs,
  type NotifPrefsPatch,
  type QuietHours,
} from './types';

const CHANNEL_SET = new Set<string>(NOTIF_CHANNELS);
const TYPE_SET = new Set<string>(NOTIF_TYPES);

/** Raw shape of the persisted blob (all fields untrusted). */
export interface NotifPrefsBlob {
  channels?: unknown;
  quiet_hours?: unknown;
}

function boolOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** "HH:MM" 24h wall time, 00:00–23:59. */
export function isValidHHMM(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return m !== null;
}

/** A quiet window is valid when both ends are HH:MM. Equal start/end = effectively no window. */
export function isValidQuietHours(value: unknown): value is QuietHours {
  if (!value || typeof value !== 'object') return false;
  const q = value as Record<string, unknown>;
  return isValidHHMM(q.start) && isValidHHMM(q.end) && q.start !== q.end;
}

function channelsFromBlob(value: unknown): NotifChannelPrefs {
  const src = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const out = {} as NotifChannelPrefs;
  for (const ch of NOTIF_CHANNELS) {
    out[ch] = boolOr(src[ch], DEFAULT_NOTIF_PREFS.channels[ch]);
  }
  return out;
}

/** blob → NotifPrefs, with safe fallbacks to documented defaults. Unknown keys are dropped. */
export function notifPrefsFromBlob(blob: NotifPrefsBlob | null | undefined): NotifPrefs {
  if (!blob || typeof blob !== 'object') return structuredNotifPrefs(DEFAULT_NOTIF_PREFS);
  return {
    channels: channelsFromBlob(blob.channels),
    quietHours: isValidQuietHours(blob.quiet_hours) ? { start: blob.quiet_hours.start, end: blob.quiet_hours.end } : null,
  };
}

/** Merge a patch onto current prefs (pure), validating quiet hours and ignoring unknown channels. */
export function applyNotifPatch(current: NotifPrefs, patch: NotifPrefsPatch): NotifPrefs {
  const channels: NotifChannelPrefs = { ...current.channels };
  if (patch.channels) {
    for (const [key, val] of Object.entries(patch.channels)) {
      if (CHANNEL_SET.has(key) && typeof val === 'boolean') channels[key as NotifChannel] = val;
    }
  }
  let quietHours = current.quietHours;
  if (patch.quietHours !== undefined) {
    quietHours = patch.quietHours === null ? null : isValidQuietHours(patch.quietHours) ? patch.quietHours : current.quietHours;
  }
  return { channels, quietHours };
}

/** NotifPrefs → persisted blob (snake_case), for the owner-only upsert of notif_prefs. */
export function notifPrefsToBlob(prefs: NotifPrefs): NotifPrefsBlob {
  return {
    channels: { ...prefs.channels },
    quiet_hours: prefs.quietHours ? { start: prefs.quietHours.start, end: prefs.quietHours.end } : null,
  };
}

/** Deep copy so callers never mutate the shared DEFAULT_NOTIF_PREFS constant. */
export function structuredNotifPrefs(p: NotifPrefs): NotifPrefs {
  return { channels: { ...p.channels }, quietHours: p.quietHours ? { ...p.quietHours } : null };
}

/** True if the given channel is currently enabled. */
export function isChannelEnabled(prefs: NotifPrefs, channel: NotifChannel): boolean {
  return prefs.channels[channel] === true;
}

/**
 * Soft re-ask gate (PDD A4 / TDD §7.2): after a `denied` outcome, offer an in-app re-ask only
 * once the user has completed ≥2 daily loops — never nag. `undetermined` is primeable up front;
 * `granted` never re-asks. Non-blocking either way.
 */
export function shouldOfferReask(status: 'granted' | 'denied' | 'undetermined', completedLoops: number): boolean {
  if (status === 'denied') return completedLoops >= 2;
  return false;
}

/** True when we should show the up-front priming card (permission never requested yet). */
export function shouldPrime(status: 'granted' | 'denied' | 'undetermined'): boolean {
  return status === 'undetermined';
}

/**
 * Resolve a notification's tap payload to an in-app route (TDD §3.3 deep-link table). Prefers an
 * explicit, validated `deep_link` (panchangpal://…); otherwise maps the notification `type`.
 * Returns null for anything unrecognized so the router can fall back to a safe default (Today).
 */
export function resolveNotificationRoute(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.deep_link === 'string') {
    const route = routeForDeepLink(d.deep_link);
    if (route) return route;
  }
  if (typeof d.type === 'string' && TYPE_SET.has(d.type)) return routeForNotifType(d.type as NotifType, d);
  return null;
}

/** Map a notification `type` to its route (valid back-stacks per the deep-link table). */
export function routeForNotifType(type: NotifType, data?: Record<string, unknown>): string {
  switch (type) {
    case 'morning':
    case 'evening':
    case 'streak':
    case 'winback':
      return '/(tabs)/today';
    case 'festival':
    case 'personal':
      return '/(tabs)/calendar';
    case 'household':
      return '/(tabs)/you/household';
    case 'household_invite': {
      const token = data && typeof data.token === 'string' ? data.token : null;
      return token ? `/(tabs)/you/invite?token=${encodeURIComponent(token)}` : '/(tabs)/you/household';
    }
    case 'subscription':
      // SCR_SUBSCRIPTION_001 lands in M8; route to the You hub as a safe interim back-stack.
      return '/(tabs)/you';
    default:
      return '/(tabs)/today';
  }
}

/** Map a panchangpal:// deep link to an expo-router path; null if unrecognized. */
export function routeForDeepLink(url: string): string | null {
  const m = /^panchangpal:\/\/([^?#]+)(?:[?#].*)?$/.exec(url.trim());
  if (!m) return null;
  const path = (m[1] ?? '').replace(/\/+$/, '');
  const [head, param] = path.split('/');
  switch (head) {
    case 'today':
      return '/(tabs)/today';
    case 'calendar':
      return '/(tabs)/calendar';
    case 'ask':
      return '/(tabs)/guru';
    case 'you':
      return '/(tabs)/you';
    case 'festival':
      return '/(tabs)/calendar';
    case 'personal-date':
      return '/(tabs)/calendar';
    case 'invite':
      return param ? `/(tabs)/you/invite?token=${encodeURIComponent(param)}` : '/(tabs)/you/household';
    case 'subscription':
      return '/(tabs)/you';
    default:
      return null;
  }
}

/** The safe default when a notification carries no resolvable route. */
export const DEFAULT_NOTIFICATION_ROUTE = '/(tabs)/today';
