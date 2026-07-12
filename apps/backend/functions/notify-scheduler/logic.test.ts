import { describe, it, expect } from 'vitest';
import { applyQuietHours, withinFrequencyCap, suppressIfCompleted, type DueNotification } from './logic';

const n = (over: Partial<DueNotification> = {}): DueNotification => ({
  user_id: 'u1',
  notif_type: 'morning',
  channel: 'daily',
  localMinutes: 6 * 60, // 06:00
  requiresEngine: false,
  quietStartMin: 22 * 60, // 22:00
  quietEndMin: 7 * 60, // 07:00 (wraps midnight)
  sentInWindow: 0,
  cap: 2,
  completedToday: false,
  ...over,
});

describe('notify-scheduler logic (ADR-020, engine-independent)', () => {
  it('blocks sends inside wrap-around quiet hours', () => {
    expect(applyQuietHours(n({ localMinutes: 6 * 60 }))).toBe(false); // 06:00 in 22:00–07:00
    expect(applyQuietHours(n({ localMinutes: 9 * 60 }))).toBe(true); // 09:00 outside
    expect(applyQuietHours(n({ localMinutes: 23 * 60 }))).toBe(false); // 23:00 inside
  });

  it('respects same-window frequency caps', () => {
    expect(withinFrequencyCap(n({ sentInWindow: 1, cap: 2 }))).toBe(true);
    expect(withinFrequencyCap(n({ sentInWindow: 2, cap: 2 }))).toBe(false);
  });

  it('suppresses the morning nudge once completed', () => {
    expect(suppressIfCompleted(n({ completedToday: true }))).toBe(false);
    expect(suppressIfCompleted(n({ completedToday: false }))).toBe(true);
    expect(suppressIfCompleted(n({ notif_type: 'festival', completedToday: true }))).toBe(true);
  });
});
