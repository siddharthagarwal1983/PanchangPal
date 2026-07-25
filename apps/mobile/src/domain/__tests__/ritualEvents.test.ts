/**
 * The daily habit funnel (PDD §11.4), which the North Star sums.
 *
 * The assertions that matter are the ones about NOT firing. Weekly Household Ritual Completions is
 * EVT_017 grouped by household per week, so a duplicate completion does not merely add noise — it
 * inflates the product's headline metric. Deriving events from transitions is what makes "fires
 * exactly once" testable at all, and these cases pin the three ways it could have gone wrong:
 * a re-render repeating a state, a restore being mistaken for a start, and a resume being mistaken
 * for a start.
 */
import {
  ritualAbandonedEvent,
  ritualTransitionEvents,
  streakEvents,
} from '../analytics/ritualEvents';
import type { RitualPlayerViewModel } from '../ritual/types';

const CTX = { ritualId: 'ritual-1', tradition: 'sanatan', durationMs: 90_000, offline: false };

function view(over: Partial<RitualPlayerViewModel> = {}): RitualPlayerViewModel {
  return {
    state: 'intro',
    title: 'Morning ritual',
    depth: 'quick',
    totalSteps: 3,
    canAdvance: true,
    canSkip: true,
    audioAvailable: false,
    completionRecorded: false,
    ...over,
  };
}

describe('ritualTransitionEvents', () => {
  it('emits EVT_015 when the ritual begins', () => {
    const events = ritualTransitionEvents(view(), view({ state: 'active', stepNumber: 1 }), CTX);
    expect(events).toHaveLength(1);
    expect(events[0]?.eventId).toBe('EVT_015');
    expect(events[0]?.props).toMatchObject({
      ritual_id: 'ritual-1',
      tradition: 'sanatan',
      depth: 'quick',
      audio_used: false,
      offline: false,
    });
  });

  it('emits nothing on the first view after a restore — reopening is not starting', () => {
    expect(ritualTransitionEvents(null, view({ state: 'active', stepNumber: 2 }), CTX)).toEqual([]);
  });

  it('emits nothing when a re-render repeats the same state', () => {
    const same = view({ state: 'active', stepNumber: 2 });
    expect(ritualTransitionEvents(same, { ...same }, CTX)).toEqual([]);
  });

  it('does not treat resume-from-pause as a start', () => {
    const events = ritualTransitionEvents(
      view({ state: 'paused', stepNumber: 2 }),
      view({ state: 'active', stepNumber: 2 }),
      CTX,
    );
    expect(events).toEqual([]);
  });

  it('emits EVT_016 once per advanced step, with position', () => {
    const events = ritualTransitionEvents(
      view({ state: 'active', stepNumber: 1 }),
      view({ state: 'active', stepNumber: 2 }),
      CTX,
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.eventId).toBe('EVT_016');
    expect(events[0]?.props).toMatchObject({ step_number: 2, total_steps: 3 });
  });

  it('emits EVT_017 on completion, with duration', () => {
    const events = ritualTransitionEvents(
      view({ state: 'active', stepNumber: 3 }),
      view({ state: 'completed' }),
      CTX,
    );
    expect(events.map((e) => e.eventId)).toEqual(['EVT_017']);
    expect(events[0]?.props).toMatchObject({ duration_ms: 90_000, ritual_id: 'ritual-1' });
  });

  it('emits EVT_017 exactly once — a repeated completed view does not re-fire the North Star input', () => {
    const completed = view({ state: 'completed' });
    const first = ritualTransitionEvents(view({ state: 'active', stepNumber: 3 }), completed, CTX);
    const second = ritualTransitionEvents(completed, { ...completed, completionRecorded: true }, CTX);

    expect(first.map((e) => e.eventId)).toEqual(['EVT_017']);
    expect(second).toEqual([]);
  });

  it('records duration_ms as null when the start was never observed', () => {
    const events = ritualTransitionEvents(
      view({ state: 'active', stepNumber: 3 }),
      view({ state: 'completed' }),
      { ...CTX, durationMs: null },
    );
    expect(events[0]?.props.duration_ms).toBeNull();
  });

  it('carries offline as recorded — the ritual is offline-capable by design', () => {
    const events = ritualTransitionEvents(view(), view({ state: 'active', stepNumber: 1 }), {
      ...CTX,
      offline: true,
    });
    expect(events[0]?.props.offline).toBe(true);
  });
});

describe('ritualAbandonedEvent', () => {
  it.each([
    ['active', 'active'],
    ['paused', 'paused'],
  ] as const)('emits EVT_018 when leaving a %s ritual', (_label, state) => {
    const event = ritualAbandonedEvent(view({ state, stepNumber: 2 }), CTX);
    expect(event?.eventId).toBe('EVT_018');
    expect(event?.props).toMatchObject({ step_number: 2, total_steps: 3 });
  });

  it('emits nothing when leaving from the intro — nothing was abandoned', () => {
    expect(ritualAbandonedEvent(view(), CTX)).toBeNull();
  });

  it('emits nothing when leaving a completed ritual', () => {
    expect(ritualAbandonedEvent(view({ state: 'completed' }), CTX)).toBeNull();
  });
});

describe('streakEvents', () => {
  it('emits EVT_020 with the server-reported streak', () => {
    const events = streakEvents({
      current_len: 5,
      best_len: 9,
      grace_remaining: 1,
      grace_used: false,
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.eventId).toBe('EVT_020');
    expect(events[0]?.props).toEqual({ streak_len: 5, grace_remaining: 1 });
  });

  it('adds EVT_021 when a grace day was consumed', () => {
    const events = streakEvents({
      current_len: 5,
      best_len: 9,
      grace_remaining: 0,
      grace_used: true,
    });
    expect(events.map((e) => e.eventId)).toEqual(['EVT_020', 'EVT_021']);
    expect(events[1]?.props).toEqual({ streak_len: 5, grace_remaining: 0 });
  });
});
