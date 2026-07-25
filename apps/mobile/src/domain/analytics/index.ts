/**
 * Analytics domain barrel (ADR-013, PDD §11.1). Pure envelope/batching rules plus the
 * AnalyticsService port. Nothing here imports the data layer or a vendor SDK (dependency
 * direction, TDD Part 1 §5); the singleton is composed in `src/data/analyticsAdapter.ts`.
 */
export {
  NullAnalyticsService,
  type AnalyticsProps,
  type AnalyticsPropValue,
  type AnalyticsService,
} from './AnalyticsService';
export {
  ritualAbandonedEvent,
  ritualTransitionEvents,
  streakEvents,
  type RitualAnalyticsEvent,
  type RitualEventContext,
  type StreakResult,
} from './ritualEvents';
export {
  ANALYTICS_BATCH_SIZE,
  ANALYTICS_QUEUE_LIMIT,
  buildEnvelope,
  enqueue,
  isEventId,
  sanitizeProps,
  shouldFlush,
  type EnvelopeInput,
} from './analytics';
