/**
 * Preferences mapping domain tests (MOD_you, SCR_SETTINGS_001). Pure, no network. Asserts:
 * a missing row yields documented defaults; valid rows map through; invalid/corrupt enum
 * values fall back to defaults (never surfaced to the UI); patch → column mapping only
 * includes provided keys.
 */
import { rowToPreferences, preferencesPatchToRow } from '../profile/preferences';
import { DEFAULT_PREFERENCES } from '../profile/types';

describe('preferences row mapping', () => {
  it('returns documented defaults when no profile row exists yet', () => {
    expect(rowToPreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(rowToPreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
  });

  it('maps a valid row through to Preferences', () => {
    expect(
      rowToPreferences({
        tradition_code: 'bengali',
        content_depth: 'deep',
        appearance: 'dark',
        ritual_time: '06:30',
        timezone: 'America/New_York',
        city: 'Jersey City',
      }),
    ).toEqual({
      tradition: 'bengali',
      depth: 'deep',
      appearance: 'dark',
      ritualTime: '06:30',
      timezone: 'America/New_York',
      city: 'Jersey City',
    });
  });

  it('falls back to defaults for invalid/corrupt enum values (never fabricated)', () => {
    const prefs = rowToPreferences({
      tradition_code: 'martian',
      content_depth: 42,
      appearance: null,
      ritual_time: '',
      timezone: 123,
    });
    expect(prefs.tradition).toBe(DEFAULT_PREFERENCES.tradition);
    expect(prefs.depth).toBe(DEFAULT_PREFERENCES.depth);
    expect(prefs.appearance).toBe(DEFAULT_PREFERENCES.appearance);
    expect(prefs.ritualTime).toBeNull();
    expect(prefs.timezone).toBeNull();
  });

  it('maps only provided patch keys to columns', () => {
    expect(preferencesPatchToRow({ appearance: 'light' })).toEqual({ appearance: 'light' });
    expect(preferencesPatchToRow({ tradition: 'north_indian', depth: 'deep' })).toEqual({
      tradition_code: 'north_indian',
      content_depth: 'deep',
    });
    expect(preferencesPatchToRow({ ritualTime: null })).toEqual({ ritual_time: null });
    expect(preferencesPatchToRow({})).toEqual({});
  });
});
