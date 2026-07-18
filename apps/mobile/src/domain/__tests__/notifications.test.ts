/**
 * MOD_notifications domain tests (pure; no network/SDK). Assert: notif_prefs blob mapping falls
 * back to documented calm defaults and drops unknown keys/invalid quiet hours; patches merge
 * safely (unknown channels ignored, quiet-hours validated); the re-ask/prime gates follow PDD A4;
 * and notification-type / deep-link resolution routes to valid back-stacks (TDD §3.3/§7.2).
 */
import {
  DEFAULT_NOTIF_PREFS,
  applyNotifPatch,
  isValidHHMM,
  isValidQuietHours,
  notifPrefsFromBlob,
  notifPrefsToBlob,
  resolveNotificationRoute,
  routeForDeepLink,
  routeForNotifType,
  shouldOfferReask,
  shouldPrime,
} from '../notifications';

describe('notif prefs mapping', () => {
  it('returns calm defaults for a null/absent blob', () => {
    expect(notifPrefsFromBlob(null)).toEqual(DEFAULT_NOTIF_PREFS);
    expect(notifPrefsFromBlob(undefined)).toEqual(DEFAULT_NOTIF_PREFS);
    // growth/lifecycle (marketing) are OFF by default — never spam.
    expect(notifPrefsFromBlob(null).channels.growth).toBe(false);
    expect(notifPrefsFromBlob(null).channels.lifecycle).toBe(false);
    expect(notifPrefsFromBlob(null).channels.daily).toBe(true);
  });

  it('fills missing channels from defaults and ignores unknown keys', () => {
    const prefs = notifPrefsFromBlob({ channels: { daily: false, bogus: true } as never });
    expect(prefs.channels.daily).toBe(false);
    expect(prefs.channels.festival).toBe(true); // default
    expect((prefs.channels as Record<string, unknown>).bogus).toBeUndefined();
  });

  it('accepts a valid quiet window and rejects an invalid/empty one', () => {
    expect(notifPrefsFromBlob({ quiet_hours: { start: '22:00', end: '07:00' } }).quietHours).toEqual({
      start: '22:00',
      end: '07:00',
    });
    expect(notifPrefsFromBlob({ quiet_hours: { start: '25:00', end: '07:00' } }).quietHours).toBeNull();
    expect(notifPrefsFromBlob({ quiet_hours: { start: '08:00', end: '08:00' } }).quietHours).toBeNull();
  });

  it('round-trips prefs → blob (snake_case) → prefs', () => {
    const prefs = { channels: { ...DEFAULT_NOTIF_PREFS.channels, growth: true }, quietHours: { start: '21:30', end: '06:15' } };
    expect(notifPrefsFromBlob(notifPrefsToBlob(prefs))).toEqual(prefs);
  });
});

describe('HH:MM + quiet-hours validation', () => {
  it('validates wall-clock times', () => {
    expect(isValidHHMM('00:00')).toBe(true);
    expect(isValidHHMM('23:59')).toBe(true);
    expect(isValidHHMM('24:00')).toBe(false);
    expect(isValidHHMM('7:00')).toBe(false);
    expect(isValidHHMM('nope')).toBe(false);
  });

  it('requires two distinct valid ends', () => {
    expect(isValidQuietHours({ start: '22:00', end: '07:00' })).toBe(true);
    expect(isValidQuietHours({ start: '22:00', end: '22:00' })).toBe(false);
    expect(isValidQuietHours({ start: '22:00' })).toBe(false);
  });
});

describe('applyNotifPatch', () => {
  it('toggles only the listed channels', () => {
    const next = applyNotifPatch(DEFAULT_NOTIF_PREFS, { channels: { growth: true } });
    expect(next.channels.growth).toBe(true);
    expect(next.channels.daily).toBe(true); // unchanged
  });

  it('ignores unknown channels and invalid quiet hours', () => {
    const next = applyNotifPatch(DEFAULT_NOTIF_PREFS, {
      channels: { bogus: true } as never,
      quietHours: { start: '99:99', end: '07:00' },
    });
    expect((next.channels as Record<string, unknown>).bogus).toBeUndefined();
    expect(next.quietHours).toBeNull(); // invalid ignored → stays at current (null)
  });

  it('clears quiet hours when set to null', () => {
    const withQuiet = { channels: DEFAULT_NOTIF_PREFS.channels, quietHours: { start: '22:00', end: '07:00' } };
    expect(applyNotifPatch(withQuiet, { quietHours: null }).quietHours).toBeNull();
  });
});

describe('prime + re-ask gates (PDD A4)', () => {
  it('primes only when undetermined', () => {
    expect(shouldPrime('undetermined')).toBe(true);
    expect(shouldPrime('granted')).toBe(false);
    expect(shouldPrime('denied')).toBe(false);
  });

  it('re-asks after 2 completed loops when denied, never when granted', () => {
    expect(shouldOfferReask('denied', 0)).toBe(false);
    expect(shouldOfferReask('denied', 2)).toBe(true);
    expect(shouldOfferReask('granted', 5)).toBe(false);
    expect(shouldOfferReask('undetermined', 5)).toBe(false);
  });
});

describe('tap routing (deep-link table)', () => {
  it('maps notification types to valid back-stacks', () => {
    expect(routeForNotifType('morning')).toBe('/(tabs)/today');
    expect(routeForNotifType('festival')).toBe('/(tabs)/calendar');
    expect(routeForNotifType('household')).toBe('/(tabs)/you/household');
    expect(routeForNotifType('household_invite', { token: 'abc' })).toBe('/(tabs)/you/invite?token=abc');
    expect(routeForNotifType('household_invite')).toBe('/(tabs)/you/household'); // no token → safe fallback
    // M8: SCR_SUBSCRIPTION_001 exists, so the interim You-hub fallback is gone.
    expect(routeForNotifType('subscription')).toBe('/(tabs)/you/subscription');
  });

  it('resolves panchangpal:// deep links', () => {
    expect(routeForDeepLink('panchangpal://today?focus=ritual')).toBe('/(tabs)/today');
    expect(routeForDeepLink('panchangpal://invite/tok_9')).toBe('/(tabs)/you/invite?token=tok_9');
    expect(routeForDeepLink('panchangpal://festival/42')).toBe('/(tabs)/calendar');
    expect(routeForDeepLink('panchangpal://subscription')).toBe('/(tabs)/you/subscription');
    expect(routeForDeepLink('https://example.com')).toBeNull();
    expect(routeForDeepLink('panchangpal://unknown')).toBeNull();
  });

  it('prefers a valid deep_link, else the type, else null', () => {
    expect(resolveNotificationRoute({ deep_link: 'panchangpal://ask' })).toBe('/(tabs)/guru');
    expect(resolveNotificationRoute({ type: 'festival' })).toBe('/(tabs)/calendar');
    expect(resolveNotificationRoute({ type: 'not_a_type' })).toBeNull();
    expect(resolveNotificationRoute(null)).toBeNull();
  });
});
