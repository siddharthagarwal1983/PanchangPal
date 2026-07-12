/**
 * MOD_you — preferences domain types (TDD Part 4 §2.1). The client-facing shape of the
 * server-authoritative `user_profile` prefs (tradition, depth, appearance, ritual time,
 * location/tz). Server remains the source of truth; STORE_prefs mirrors a subset for
 * instant UI (§4.1/§4.2). Full field contracts live in @panchangpal/api / OpenAPI.
 */
import type { AppearanceMode, ContentDepth, TraditionCode } from '@panchangpal/shared';

export interface Preferences {
  tradition: TraditionCode;
  depth: ContentDepth;
  appearance: AppearanceMode;
  /** Local wall time "HH:MM" for the daily ritual reminder, or null if unset. */
  ritualTime: string | null;
  /** IANA time zone (ADR-026) — never defaulted to India tz. */
  timezone: string | null;
  city: string | null;
}

/** A partial update; only provided fields are written (PATCH semantics). */
export type PreferencesPatch = Partial<Preferences>;

/** Documented defaults (TBL_USER_PROFILE, TDD Part 2 §2). Used when no row exists yet. */
export const DEFAULT_PREFERENCES: Preferences = {
  tradition: 'generic',
  depth: 'quick',
  appearance: 'system',
  ritualTime: null,
  timezone: null,
  city: null,
};
