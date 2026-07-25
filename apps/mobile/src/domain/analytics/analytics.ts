/**
 * Pure analytics rules (ADR-013, PDD §11.1). Envelope construction, event-id validation, and the
 * batching arithmetic — no SDK, no network, no React.
 *
 * The envelope shape is `AnalyticsEventEnvelope` from `@panchangpal/shared`, which mirrors the
 * `analytics_event` columns exactly (event_id, user_pseudo_id, household_id, session_id, ts,
 * props). PDD §11.1 lists further common properties (app_version, platform, locale, is_anonymous
 * and others); those that the app can supply without new dependencies ride in `props`, and the
 * remainder — screen_id, network, reduced_motion, text_scale — are owed by later increments, when
 * the call sites that know them start emitting.
 */
import { EVENT_IDS, type AnalyticsEventEnvelope, type EventId } from '@panchangpal/shared';
import type { AnalyticsProps } from './AnalyticsService';

const KNOWN_EVENTS = new Set<string>(EVENT_IDS);

/** Whether a string is an EVT_* id from the documented taxonomy (PDD §11.1). */
export function isEventId(value: unknown): value is EventId {
  return typeof value === 'string' && KNOWN_EVENTS.has(value);
}

/**
 * Drop prop values that are not primitives.
 *
 * Objects and arrays are the vector: someone passes an error, a server response, or a form state,
 * and user content lands in the event store — which ADR-031 forbids and which no review reliably
 * catches. Undefined is dropped too, so an absent value never becomes a `null` column of its own.
 */
export function sanitizeProps(props: AnalyticsProps | undefined): Record<string, unknown> {
  if (!props) return {};
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    const type = typeof value;
    if (value === null || type === 'string' || type === 'number' || type === 'boolean') {
      clean[key] = value;
    }
  }
  return clean;
}

export interface EnvelopeInput {
  eventId: EventId;
  userPseudoId: string;
  householdId?: string | null;
  sessionId?: string | null;
  props?: AnalyticsProps;
  /** Injected rather than read from the clock, so the mapping stays pure and testable. */
  now: Date;
}

/**
 * Build one envelope. Throws on an unknown event id — an EVT_* outside the taxonomy is a typo or an
 * invented event, and PDD §11 owns that list (CLAUDE.md: never invent analytics events). The throw
 * is caught at the adapter boundary so a bad call site cannot take the app down.
 */
export function buildEnvelope(input: EnvelopeInput): AnalyticsEventEnvelope {
  if (!isEventId(input.eventId)) {
    throw new Error(`Unknown analytics event id: ${String(input.eventId)}`);
  }
  return {
    event_id: input.eventId,
    user_pseudo_id: input.userPseudoId,
    household_id: input.householdId ?? null,
    session_id: input.sessionId ?? null,
    ts: input.now.toISOString(),
    props: sanitizeProps(input.props),
  };
}

/** Batching limits (ADR-013: events are batched from the client). */
export const ANALYTICS_BATCH_SIZE = 20;
export const ANALYTICS_QUEUE_LIMIT = 200;

/**
 * Enqueue with a hard cap, dropping the OLDEST events on overflow.
 *
 * A queue that grows without limit is a memory leak on a device that has been offline for a day.
 * Oldest-first is the right sacrifice: recent events describe the session someone is debugging or
 * the funnel step just taken, and analytics are lossy by nature — the North Star is a weekly
 * household rollup, which a handful of dropped events on one device does not move.
 */
export function enqueue<T>(queue: readonly T[], event: T, limit = ANALYTICS_QUEUE_LIMIT): T[] {
  const next = [...queue, event];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

/** Whether a queue of this size should be sent now. */
export function shouldFlush(queueLength: number, batchSize = ANALYTICS_BATCH_SIZE): boolean {
  return queueLength >= batchSize;
}
