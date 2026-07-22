import { decideTimeZoneSync } from '../profile/timezoneSync';

/**
 * ADR-026 / issue #30, increment 2. The rule under test is the PDD's: the zone comes from
 * location or the user, with the device locale as the fallback when neither has spoken
 * (docs/pdd/01_FOUNDATIONS.md:672-674, :799-800).
 */
describe('decideTimeZoneSync', () => {
  it('adopts the device zone when the profile has none — the state every user is in today', () => {
    expect(decideTimeZoneSync(null, 'Pacific/Auckland')).toEqual({
      timeZone: 'Pacific/Auckland',
      shouldPersist: true,
    });
    expect(decideTimeZoneSync(undefined, 'America/New_York')).toEqual({
      timeZone: 'America/New_York',
      shouldPersist: true,
    });
  });

  it('never overwrites a stored zone, so travelling does not move the observance', () => {
    // Home is Auckland; the phone is in India for a fortnight. The user keeps their calendar
    // until they deliberately change it (Settings -> Location, PDD :791).
    expect(decideTimeZoneSync('Pacific/Auckland', 'Asia/Kolkata')).toEqual({
      timeZone: 'Pacific/Auckland',
      shouldPersist: false,
    });
  });

  it('does not write when the stored zone already matches the device', () => {
    expect(decideTimeZoneSync('Australia/Sydney', 'Australia/Sydney')).toEqual({
      timeZone: 'Australia/Sydney',
      shouldPersist: false,
    });
  });

  it('treats an unusable stored zone as absent rather than poisoning every date with it', () => {
    expect(decideTimeZoneSync('Not/AZone', 'Europe/London')).toEqual({
      timeZone: 'Europe/London',
      shouldPersist: true,
    });
    expect(decideTimeZoneSync('', 'Europe/London')).toEqual({
      timeZone: 'Europe/London',
      shouldPersist: true,
    });
  });

  it('reports no zone rather than defaulting when neither source is usable (ADR-026)', () => {
    // The ADR forbids defaulting to India time. Null is a state the caller must handle; a
    // plausible guess would silently mis-date every completion.
    expect(decideTimeZoneSync(null, null)).toEqual({ timeZone: null, shouldPersist: false });
    expect(decideTimeZoneSync(null, 'Not/AZone')).toEqual({ timeZone: null, shouldPersist: false });
    expect(decideTimeZoneSync('Not/AZone', 'Also/Invalid')).toEqual({
      timeZone: null,
      shouldPersist: false,
    });
  });

  it('is total — no input combination throws, because it runs during launch', () => {
    expect(() => decideTimeZoneSync(undefined, undefined)).not.toThrow();
    expect(() => decideTimeZoneSync('', '')).not.toThrow();
  });
});
