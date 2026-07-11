/**
 * Core domain types shared across app and Edge Functions. These are lightweight
 * seams for the scaffold; full field-level shapes live in the API contracts
 * (@panchangpal/api) which are generated against TDD Part 2 §5 and the OpenAPI spec.
 */
import type { ContentDepth, TraditionCode } from './enums.js';

/** Branded UUID for clarity at call sites. */
export type Uuid = string;

/** IANA time zone (e.g. "America/New_York"). Never default to India tz (ADR-026). */
export type IanaTimeZone = string;

/** ISO-8601 date (YYYY-MM-DD), interpreted in the user's local tz. */
export type LocalDate = string;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface StreakState {
  current_len: number;
  best_len: number;
  grace_remaining: number;
  grace_used?: boolean;
}

export interface ProfilePrefs {
  tradition_code: TraditionCode;
  content_depth: ContentDepth;
  timezone: IanaTimeZone | null;
}
