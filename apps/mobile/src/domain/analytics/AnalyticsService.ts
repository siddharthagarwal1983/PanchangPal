/**
 * AnalyticsService — the EVT_* seam (ADR-013, TDD Part 5 §7.1). Every analytics event in the app
 * goes through this port; the launch sink is the Postgres `analytics_event` table, and migrating to
 * a managed platform later swaps the implementation, never the call sites (ADR-013's whole point).
 *
 * Events are pseudonymous and carry NO PII (ADR-031). `track` takes an EVT_* id and a narrow prop
 * bag; the envelope (pseudonymous id, household, session, timestamp) is assembled by the
 * implementation, so no caller can supply an identity field even by accident.
 */
import type { EventId } from '@panchangpal/shared';

/**
 * Prop values are primitives only — an object or array is where free-text and PII sneak in.
 *
 * `undefined` is permitted in the input type purely so callers can pass an optional field through
 * without a conditional spread; `sanitizeProps` drops it, so it never reaches the event store as a
 * key at all (which is different from `null`, a recorded absence).
 */
export type AnalyticsPropValue = string | number | boolean | null;
export type AnalyticsProps = Record<string, AnalyticsPropValue | undefined>;

export interface AnalyticsService {
  /**
   * Record an event. Never throws and never rejects: analytics failing is not the user's problem,
   * and a call site must never need a try/catch around a metric.
   */
  track(eventId: EventId, props?: AnalyticsProps): void;
  /** Send anything queued. Called on background/foreground transitions and before sign-out. */
  flush(): Promise<void>;
  /** The household an event belongs to (North Star is household-grain). Null when unknown. */
  setHouseholdId(householdId: string | null): void;
}

/**
 * Drops every event. Used when there is no configured backend to write to — and by tests that
 * care about a call site firing rather than about the sink.
 */
export class NullAnalyticsService implements AnalyticsService {
  track(_eventId: EventId, _props?: AnalyticsProps): void {
    // no-op
  }

  async flush(): Promise<void> {
    // no-op
  }

  setHouseholdId(_householdId: string | null): void {
    // no-op
  }
}
