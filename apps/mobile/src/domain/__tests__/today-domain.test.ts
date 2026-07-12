/**
 * Today domain view-logic tests (TDD Part 4 §1.3). Pure functions → fast unit tests. Streak
 * is grace-aware and never loss-framed; ritual progress maps data → card state + action key.
 */
import { toStreakView } from '../streakService';
import { toRitualProgress } from '../ritualProgressService';
import { MockPanchangProvider } from '../panchang/MockPanchangProvider.dev';

describe('StreakService (grace-aware, no loss framing)', () => {
  it('maps a streak to a view', () => {
    expect(toStreakView({ current_len: 5, best_len: 9, grace_remaining: 1 })).toMatchObject({ days: 5, graceUsed: false, showGraceCopy: false });
  });
  it('surfaces supportive grace copy when a grace day was used', () => {
    const v = toStreakView({ current_len: 3, best_len: 3, grace_remaining: 0, grace_used: true });
    expect(v.graceUsed).toBe(true);
    expect(v.showGraceCopy).toBe(true);
  });
  it('defaults to zero for no streak', () => {
    expect(toStreakView(null).days).toBe(0);
  });
});

describe('RitualProgressService (card state mapping)', () => {
  it('not started when nothing done and no resume', () => {
    expect(toRitualProgress({ completedToday: false, resumeStep: null })).toMatchObject({ state: 'not_started', actionKey: 'ritual.begin' });
  });
  it('in progress with a resume step', () => {
    expect(toRitualProgress({ completedToday: false, resumeStep: 3 })).toMatchObject({ state: 'in_progress', actionKey: 'ritual.continue', step: 3 });
  });
  it('completed when done today', () => {
    expect(toRitualProgress({ completedToday: true, resumeStep: null })).toMatchObject({ state: 'completed', actionKey: 'ritual.done' });
  });
});

describe('MockPanchangProvider (dev-only, never authoritative)', () => {
  it('returns clearly-illustrative sample data for UI development', async () => {
    const r = await new MockPanchangProvider().getToday({ lat: 0, lng: 0, tz: 'UTC', tradition: 'generic', localDate: '2026-07-12' });
    expect(r.status).toBe('ok');
    if (r.status === 'ok') expect(r.summary.tithi).toContain('Sample');
  });
});
