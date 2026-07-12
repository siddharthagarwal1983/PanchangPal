/**
 * Pure mapping between the `user_profile` row (API/DB shape) and the client `Preferences`
 * type. Kept side-effect-free and unit-tested (no network). Unknown/invalid enum values
 * fall back to the DOCUMENTED defaults rather than being fabricated or trusted blindly —
 * a corrupt row must never surface an invalid tradition/depth/appearance to the UI.
 */
import {
  APPEARANCE_MODES,
  CONTENT_DEPTHS,
  TRADITION_CODES,
  type AppearanceMode,
  type ContentDepth,
  type TraditionCode,
} from '@panchangpal/shared';
import { DEFAULT_PREFERENCES, type Preferences, type PreferencesPatch } from './types';

/** Raw shape of the `user_profile` row this feature reads (subset of columns). */
export interface UserProfileRow {
  tradition_code?: unknown;
  content_depth?: unknown;
  appearance?: unknown;
  ritual_time?: unknown;
  timezone?: unknown;
  city?: unknown;
}

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** row → Preferences, with safe fallbacks to documented defaults. */
export function rowToPreferences(row: UserProfileRow | null | undefined): Preferences {
  if (!row) return { ...DEFAULT_PREFERENCES };
  return {
    tradition: oneOf<TraditionCode>(TRADITION_CODES, row.tradition_code, DEFAULT_PREFERENCES.tradition),
    depth: oneOf<ContentDepth>(CONTENT_DEPTHS, row.content_depth, DEFAULT_PREFERENCES.depth),
    appearance: oneOf<AppearanceMode>(APPEARANCE_MODES, row.appearance, DEFAULT_PREFERENCES.appearance),
    ritualTime: nullableString(row.ritual_time),
    timezone: nullableString(row.timezone),
    city: nullableString(row.city),
  };
}

/** PreferencesPatch → column patch (only provided keys), for an owner-only upsert. */
export function preferencesPatchToRow(patch: PreferencesPatch): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.tradition !== undefined) row.tradition_code = patch.tradition;
  if (patch.depth !== undefined) row.content_depth = patch.depth;
  if (patch.appearance !== undefined) row.appearance = patch.appearance;
  if (patch.ritualTime !== undefined) row.ritual_time = patch.ritualTime;
  if (patch.timezone !== undefined) row.timezone = patch.timezone;
  if (patch.city !== undefined) row.city = patch.city;
  return row;
}
