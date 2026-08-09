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
  /**
   * The user's LOCAL date (ADR-026, via `useLocalDate`). Null until the zone resolves.
   *
   * ⛔ WITHOUT THIS THE NORTH STAR IS WRONG FOR TWO OF THE THREE LAUNCH MARKETS. The envelope
   * carries only `ts`, a UTC instant, so a rollup has to bucket on the UTC date — and a 07:00
   * morning ritual in Auckland is 18:00 UTC the PREVIOUS day. Across a week boundary that moves
   * the completion into the wrong ISO week, and §11.3 sums the North Star per ISO week. This is
   * issue #30 ("UTC dates recorded the AU/NZ morning ritual against yesterday") one layer up:
   * `localDateIn`/ADR-026 fixed the data model and the analytics family never got the same
   * treatment. EVT_012 already passes `local_date`; the ritual family did not.
   *
   * ⛔ AND THE SERVER CANNOT REPAIR IT. The obvious fix — look up the user's timezone and convert
   * — is impossible by construction: `user_pseudo_id` is device-minted and DELIBERATELY never
   * derived from the auth uid (ADR-031), so there is no join to `user_profile.timezone`. The
   * pseudonymity property and the metric's correctness are in genuine tension, and pseudonymity
   * is the one already ratified. The day therefore has to travel WITH the event.
   */
  localDate?: string | null;
}

export interface RitualAnalyticsEvent {
  eventId: EventId;
  props: AnalyticsProps;
}

/**
 * Shared §11.2 properties for the ritual family.
 *
 * `local_date` is emitted as NULL rather than omitted when the zone has not resolved, and that is
 * a deliberate choice between two bad options. EVT_012 waits for the zone before firing, which is
 * right for a *view* — an unrecorded view costs nothing. A ritual COMPLETION is different: not
 * firing it under-counts the metric the whole product optimises for, while guessing a day
 * mis-attributes it. Null keeps the event (so household totals stay correct) and makes the gap
 * explicit, so a rollup has to decide what to do with unattributed rows instead of silently
 * bucketing them into whatever UTC implies.
 */
function baseProps(view: RitualPlayerViewModel, ctx: RitualEventContext): AnalyticsProps {
  return {
    ritual_id: ctx.ritualId,
    tradition: ctx.tradition,
    depth: view.depth,
    audio_used: view.audioAvailable,
    offline: ctx.offline ?? false,
    local_date: ctx.localDate ?? null,
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
export function streakEvents(
  streak: StreakResult,
  localDate: string | null = null,
): RitualAnalyticsEvent[] {
  const props: AnalyticsProps = {
    streak_len: streak.current_len,
    grace_remaining: streak.grace_remaining,
    // Same reason as the ritual family: a streak advance is a daily-habit funnel step, and the
    // envelope's UTC `ts` cannot be bucketed into the user's day without it.
    local_date: localDate,
  };
  const events: RitualAnalyticsEvent[] = [{ eventId: 'EVT_020', props }];
  if (streak.grace_used) events.push({ eventId: 'EVT_021', props });
  return events;
}
