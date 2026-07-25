/**
 * The daily habit funnel, derived from ritual state transitions (PDD §11.4:
 * EVT_041/EVT_012 → EVT_015 → EVT_016 → EVT_017 → EVT_020). This is the funnel the North Star
 * sums, so EVT_017 is the single most consequential event in the app: Weekly Household Ritual
 * Completions is computed by grouping it on `household_id` per ISO week (§11.3).
 *
 * Pure, and derived from transitions rather than sprinkled through the screen, for two reasons.
 * A screen that calls `track()` in six places double-fires the moment a re-render repeats a
 * state — and the analytics that measure a habit loop are worthless if the loop's own count is
 * inflated. And it makes the funnel testable without mounting anything, which is how the ORDER
 * bug in `resolveRitualScreenState` was caught in this same screen.
 *
 * Only events in the PDD §1 registry appear here (§11.0: registry-bound). Properties follow
 * §11.2; nothing is invented.
 */
import type { EventId } from '@panchangpal/shared';
import type { RitualPlayerViewModel } from '../ritual/types';
import type { AnalyticsProps } from './AnalyticsService';

export interface RitualEventContext {
  ritualId: string;
  tradition: string;
  /** Elapsed since `begin()`, for EVT_017's `duration_ms` (§11.2). Null when unknown. */
  durationMs?: number | null;
  /** Whether the device was offline for the ritual — the flow is offline-capable by design. */
  offline?: boolean;
}

export interface RitualAnalyticsEvent {
  eventId: EventId;
  props: AnalyticsProps;
}

/** Shared §11.2 properties for the ritual family. */
function baseProps(view: RitualPlayerViewModel, ctx: RitualEventContext): AnalyticsProps {
  return {
    ritual_id: ctx.ritualId,
    tradition: ctx.tradition,
    depth: view.depth,
    audio_used: view.audioAvailable,
    offline: ctx.offline ?? false,
  };
}

/**
 * Events for one transition. Returns `[]` when nothing meaningful changed, which is the common
 * case — a re-render with an identical state must produce no events.
 *
 * `prev` is null on the first view after restore. That deliberately emits nothing: restoring an
 * in-progress session is not a start, and counting it as EVT_015 would inflate the funnel's top
 * every time someone reopens the app mid-ritual. A restored session that was ALREADY completed
 * likewise emits nothing — its EVT_017 fired when it actually completed.
 */
export function ritualTransitionEvents(
  prev: RitualPlayerViewModel | null,
  next: RitualPlayerViewModel,
  ctx: RitualEventContext,
): RitualAnalyticsEvent[] {
  if (!prev) return [];

  const events: RitualAnalyticsEvent[] = [];

  // EVT_015 Ritual Started — "Begin" on the guided ritual (PDD §1 registry; AC-RIT-01).
  // Resume from pause is NOT a start: the ritual was already begun.
  if (prev.state === 'intro' && next.state === 'active') {
    events.push({ eventId: 'EVT_015', props: baseProps(next, ctx) });
  }

  // EVT_016 Ritual Step Advanced — each guided step completion. Skip advances the step too, and
  // is reported as such via `skipped` so a skipped ritual is distinguishable from a worked one.
  if (
    prev.state === 'active' &&
    next.state === 'active' &&
    typeof prev.stepNumber === 'number' &&
    typeof next.stepNumber === 'number' &&
    next.stepNumber > prev.stepNumber
  ) {
    events.push({
      eventId: 'EVT_016',
      props: { ...baseProps(next, ctx), step_number: next.stepNumber, total_steps: next.totalSteps },
    });
  }

  // EVT_017 Ritual Completed — the reward state (AC-RIT-02). The North Star's input.
  if (prev.state !== 'completed' && next.state === 'completed') {
    events.push({
      eventId: 'EVT_017',
      props: { ...baseProps(next, ctx), duration_ms: ctx.durationMs ?? null },
    });
  }

  return events;
}

/**
 * EVT_018 Ritual Abandoned — leaving an active or paused ritual without completing it. Separate
 * from the transition mapper because leaving is a navigation intent, not a state change the view
 * model reports: the engine saves and the screen routes away.
 */
export function ritualAbandonedEvent(
  view: RitualPlayerViewModel,
  ctx: RitualEventContext,
): RitualAnalyticsEvent | null {
  if (view.state !== 'active' && view.state !== 'paused') return null;
  return {
    eventId: 'EVT_018',
    props: {
      ...baseProps(view, ctx),
      step_number: view.stepNumber ?? null,
      total_steps: view.totalSteps,
    },
  };
}

/** The streak shape the server returns on completion (`todayRepository.completeRitual`). */
export interface StreakResult {
  current_len: number;
  best_len: number;
  grace_remaining: number;
  grace_used: boolean;
}

/**
 * EVT_020 Streak Advanced / EVT_021 Grace Day Used (§11.2: `streak_len`, `grace_remaining`).
 *
 * Driven by the SERVER's streak response, never by a client guess — the streak is server-derived
 * (HOOK_useCompleteRitual reconciles from server truth), and an analytics event that disagreed
 * with the streak the user sees would be worse than no event.
 */
export function streakEvents(streak: StreakResult): RitualAnalyticsEvent[] {
  const props: AnalyticsProps = {
    streak_len: streak.current_len,
    grace_remaining: streak.grace_remaining,
  };
  const events: RitualAnalyticsEvent[] = [{ eventId: 'EVT_020', props }];
  if (streak.grace_used) events.push({ eventId: 'EVT_021', props });
  return events;
}
