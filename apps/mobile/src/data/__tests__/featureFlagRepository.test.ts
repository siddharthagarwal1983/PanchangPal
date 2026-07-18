/**
 * featureFlagRepository tests (ADR-021). The security-relevant property is FAIL-CLOSED mapping:
 * only a real boolean `true` enables a flag, and anything missing/malformed reads as disabled —
 * a post-v1 feature must never switch on by accident. Flags are read-only on the client.
 */
import { rowsToFlagMap } from '../featureFlagRepository';

describe('rowsToFlagMap', () => {
  it('maps enabled/disabled flags', () => {
    expect(rowsToFlagMap([{ key: 'FF_FAMILY_PLAN', enabled: true }, { key: 'FF_JAIN_MODE', enabled: false }])).toEqual({
      FF_FAMILY_PLAN: true,
      FF_JAIN_MODE: false,
    });
  });

  it('treats only a real boolean true as enabled (no coercion)', () => {
    expect(rowsToFlagMap([{ key: 'FF_FAMILY_PLAN', enabled: 'true' }])).toEqual({ FF_FAMILY_PLAN: false });
    expect(rowsToFlagMap([{ key: 'FF_FAMILY_PLAN', enabled: 1 }])).toEqual({ FF_FAMILY_PLAN: false });
  });

  it('ignores rows without a string key', () => {
    expect(rowsToFlagMap([{ enabled: true }, { key: 42, enabled: true }])).toEqual({});
  });

  it('is null-safe — an unreadable table yields no enabled flags', () => {
    expect(rowsToFlagMap(null)).toEqual({});
    expect(rowsToFlagMap(undefined)).toEqual({});
  });
});
