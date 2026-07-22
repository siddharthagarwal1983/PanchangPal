/**
 * The device's IANA time zone — the one place expo-localization is read (ADR-026, issue #30).
 *
 * A module rather than an inline call so the domain stays pure and testable: `decideTimeZoneSync`
 * takes the zone as an argument, and this is the only thing that knows where it comes from.
 * Same reasoning as the other provider seams, at a much smaller scale — no port/adapter pair is
 * warranted for a single synchronous read with no vendor lock.
 */
import { getCalendars } from 'expo-localization';

/**
 * The device zone, or null when the platform will not name one.
 *
 * NEVER throws and never guesses. ADR-026 forbids defaulting to India time, and a plausible
 * wrong zone is worse than an absent one: it mis-dates every completion silently, whereas null
 * is handled explicitly upstream.
 *
 * `getCalendars()[0].timeZone` rather than `Intl.DateTimeFormat().resolvedOptions().timeZone`,
 * because Hermes' Intl support varies by platform and build, while expo-localization reads the
 * OS setting directly. The Intl path is still what FORMATS with the zone once we have it — the
 * risk there is a missing zone database, not a missing device setting.
 */
export function getDeviceTimeZone(): string | null {
  try {
    const [calendar] = getCalendars();
    const zone = calendar?.timeZone;
    return typeof zone === 'string' && zone.length > 0 ? zone : null;
  } catch {
    // A native module failing at launch must not take the splash down; the caller treats null
    // as "no zone yet" and the profile simply stays unfilled.
    return null;
  }
}
