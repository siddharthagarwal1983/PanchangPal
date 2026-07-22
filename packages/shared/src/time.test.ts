import { describe, it, expect } from 'vitest';
import { isValidTimeZone, localDateIn, msUntilNextLocalMidnight, resolveTimeZone } from './time';

/**
 * ADR-026 conformance tests, and the regression suite for issue #30.
 *
 * These exist because NO E2E FLOW CAN CATCH THIS DEFECT. GitHub runners are UTC, so UTC and
 * local agree there always; a green emulator run says nothing about a user in Auckland. The
 * only thing that catches a wrong date is asserting a fixed instant against a fixed zone.
 *
 * Every instant below is explicit and absolute. Nothing here calls `new Date()` with no
 * argument or reads the ambient zone — a test that depends on where it runs is the same
 * defect it is meant to prevent.
 */

const HOUR = 3_600_000;

describe('localDateIn (ADR-026)', () => {
  it('names the local day, not the UTC day, for the primary launch markets', () => {
    // 2026-07-22T21:00Z. It is already Thursday MORNING in NZ and Australia — the slot the
    // morning ritual occupies — while UTC still says Wednesday.
    const morningDownUnder = new Date('2026-07-22T21:00:00Z');
    expect(morningDownUnder.toISOString().slice(0, 10)).toBe('2026-07-22'); // what the defect produced
    expect(localDateIn(morningDownUnder, 'Pacific/Auckland')).toBe('2026-07-23');
    expect(localDateIn(morningDownUnder, 'Australia/Sydney')).toBe('2026-07-23');

    // 2026-07-23T01:00Z. Still Wednesday EVENING in the US while UTC has rolled to Thursday.
    const eveningInTheStates = new Date('2026-07-23T01:00:00Z');
    expect(eveningInTheStates.toISOString().slice(0, 10)).toBe('2026-07-23'); // what the defect produced
    expect(localDateIn(eveningInTheStates, 'America/New_York')).toBe('2026-07-22');
    expect(localDateIn(eveningInTheStates, 'America/Los_Angeles')).toBe('2026-07-22');
  });

  it('diverges in IST only in the small hours — why this survived local testing', () => {
    // 03:30 IST: one of the 5.5 hours a day where India disagrees with UTC.
    expect(localDateIn(new Date('2026-07-22T22:00:00Z'), 'Asia/Kolkata')).toBe('2026-07-23');
    // 09:00 IST: the other 18.5 hours, where the defect is invisible.
    expect(localDateIn(new Date('2026-07-22T03:30:00Z'), 'Asia/Kolkata')).toBe('2026-07-22');
  });

  it('zero-pads to a strict YYYY-MM-DD, as the date column requires', () => {
    expect(localDateIn(new Date('2026-01-05T12:00:00Z'), 'UTC')).toBe('2026-01-05');
    expect(localDateIn(new Date('2026-12-31T23:59:59Z'), 'UTC')).toBe('2026-12-31');
  });

  it('holds across a DST transition in both hemispheres', () => {
    // US spring-forward: 2026-03-08, 02:00 EST -> 03:00 EDT.
    expect(localDateIn(new Date('2026-03-08T06:59:00Z'), 'America/New_York')).toBe('2026-03-08');
    // NZ DST ends 2026-04-05, 03:00 NZDT -> 02:00 NZST.
    expect(localDateIn(new Date('2026-04-04T13:00:00Z'), 'Pacific/Auckland')).toBe('2026-04-05');
  });

  it('rejects an unusable zone rather than guessing one', () => {
    expect(() => localDateIn(new Date('2026-07-22T00:00:00Z'), 'Mars/Olympus_Mons')).toThrow();
  });
});

describe('resolveTimeZone (ADR-026: never default to India time)', () => {
  it('prefers the server-held profile zone over the device', () => {
    expect(resolveTimeZone('Pacific/Auckland', 'Asia/Kolkata')).toBe('Pacific/Auckland');
  });

  it('falls back to the device when the profile has none — the pre-sync state', () => {
    expect(resolveTimeZone(null, 'America/New_York')).toBe('America/New_York');
    expect(resolveTimeZone(undefined, 'America/New_York')).toBe('America/New_York');
  });

  it('skips a profile zone this runtime cannot compute with', () => {
    expect(resolveTimeZone('Not/AZone', 'Australia/Sydney')).toBe('Australia/Sydney');
  });

  it('throws when neither is usable, and never silently picks a zone', () => {
    expect(() => resolveTimeZone(null, null)).toThrow(/ADR-026/);
    expect(() => resolveTimeZone('', '')).toThrow();
    expect(() => resolveTimeZone('Not/AZone', 'Also/Invalid')).toThrow();
  });
});

describe('msUntilNextLocalMidnight', () => {
  it('measures to the true boundary on an ordinary day', () => {
    expect(msUntilNextLocalMidnight(new Date('2026-07-22T00:00:00Z'), 'UTC')).toBe(24 * HOUR);
    expect(msUntilNextLocalMidnight(new Date('2026-07-22T23:59:59.999Z'), 'UTC')).toBe(1);
  });

  it('measures from a local midnight, not a UTC one', () => {
    // 2026-07-22T12:00Z is 2026-07-23 00:00 in Auckland (NZST, +12) — a rollover has just
    // happened locally, so a full local day remains.
    expect(msUntilNextLocalMidnight(new Date('2026-07-22T12:00:00Z'), 'Pacific/Auckland')).toBe(24 * HOUR);
  });

  it('returns 23 hours on a spring-forward day and 25 on a fall-back day', () => {
    // These are the cases `instant + 86_400_000` gets wrong, an hour early or an hour late.
    // US DST 2026: begins Sun 2026-03-08, ends Sun 2026-11-01.
    const springForwardLocalMidnight = new Date('2026-03-08T05:00:00Z'); // 00:00 EST
    expect(msUntilNextLocalMidnight(springForwardLocalMidnight, 'America/New_York')).toBe(23 * HOUR);

    const fallBackLocalMidnight = new Date('2026-11-01T04:00:00Z'); // 00:00 EDT
    expect(msUntilNextLocalMidnight(fallBackLocalMidnight, 'America/New_York')).toBe(25 * HOUR);
  });

  it('lands exactly on the next day, never short and never over', () => {
    const instant = new Date('2026-11-01T04:00:00Z');
    const ms = msUntilNextLocalMidnight(instant, 'America/New_York');
    const atBoundary = new Date(instant.getTime() + ms);
    const justBefore = new Date(atBoundary.getTime() - 1);
    expect(localDateIn(atBoundary, 'America/New_York')).toBe('2026-11-02');
    expect(localDateIn(justBefore, 'America/New_York')).toBe('2026-11-01');
  });
});

describe('isValidTimeZone', () => {
  it('accepts IANA identifiers and rejects anything else', () => {
    expect(isValidTimeZone('Pacific/Auckland')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});
