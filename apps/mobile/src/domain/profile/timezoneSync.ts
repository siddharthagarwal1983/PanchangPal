/**
 * When to adopt the device's time zone into the server-held profile (ADR-026, issue #30).
 *
 * `user_profile.timezone` has existed since the schema landed and NOTHING EVER WROTE IT, so it
 * is null for every user. That is the missing prerequisite behind #30: date logic cannot
 * compute in the user's zone when no zone is recorded.
 *
 * The rule is the PDD's, not an invention. Onboarding 1.2 (docs/pdd/01_FOUNDATIONS.md:672-674,
 * :799-800) resolves the zone from LOCATION — grant → reverse-geocode → city + timezone; deny →
 * manual city picker — and specifies the device locale only as the fallback when the user
 * declines ("'Not now' → default to device locale timezone; banner later to fix"). Settings →
 * Location and a "fix your location" banner (:791) are how a wrong zone gets corrected.
 *
 * Two consequences follow, and they are the whole of this module:
 *
 * FILL WHEN ABSENT. A profile with no zone gets the device's, because computing in the wrong
 * zone is the defect and having no zone at all is worse.
 *
 * NEVER OVERWRITE. A stored zone is either location-derived or user-chosen, and both outrank a
 * device setting. This is what makes travelling coherent: someone in Sydney for a fortnight
 * keeps observing on their home calendar, and corrects it deliberately if they have actually
 * moved. Auto-following the device would silently shift a user's day — and their streak —
 * because they boarded a plane.
 *
 * The location-derived path itself is NOT implemented here: no location screen exists and
 * expo-location is not installed. This module implements the documented fallback only, which
 * is why it takes the device zone as an argument rather than reaching for a provider.
 */
import { isValidTimeZone } from '@panchangpal/shared';

export interface TimeZoneSyncDecision {
  /**
   * The zone to compute dates in, or null when neither source yielded a usable one.
   *
   * Null is a real state, not an error to paper over: ADR-026 forbids defaulting, so a caller
   * that cannot get a zone must degrade visibly rather than pick one. It is expected to be
   * vanishingly rare — every platform this ships on reports a zone.
   */
  timeZone: string | null;
  /** Whether the profile should be patched with `timeZone`. True only when filling an absent value. */
  shouldPersist: boolean;
}

/**
 * Decide the zone to use and whether to write it back.
 *
 * Pure and total — it never throws, because it runs during launch where a throw would take the
 * splash down. `resolveTimeZone` in @panchangpal/shared is the strict counterpart, for call
 * sites that genuinely cannot proceed without a zone.
 */
export function decideTimeZoneSync(
  profileTimeZone: string | null | undefined,
  deviceTimeZone: string | null | undefined,
): TimeZoneSyncDecision {
  // A stored zone wins outright, and a zone this runtime cannot compute with is treated as
  // absent — a corrupt or retired identifier must not silently poison every date.
  if (profileTimeZone && isValidTimeZone(profileTimeZone)) {
    return { timeZone: profileTimeZone, shouldPersist: false };
  }

  if (deviceTimeZone && isValidTimeZone(deviceTimeZone)) {
    return { timeZone: deviceTimeZone, shouldPersist: true };
  }

  return { timeZone: null, shouldPersist: false };
}
