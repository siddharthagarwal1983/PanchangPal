/**
 * Composition root for the AnalyticsService (ADR-013). Assembles the batching implementation over
 * the Postgres sink and exposes the app-wide singleton.
 *
 * Batching is in memory, not durable. Events queued when the process dies are lost — accepted:
 * analytics is lossy by nature, the North Star is a weekly household rollup, and persisting a
 * queue would put user-behaviour data on disk, which is the opposite of what ADR-031 asks for.
 * Ritual sessions persist because losing one costs a user their place; losing a metric costs a row.
 */
import { AppState, Platform, type AppStateStatus } from 'react-native';
import Constants from 'expo-constants';
import type { AnalyticsEventEnvelope, EventId } from '@panchangpal/shared';
import {
  NullAnalyticsService,
  buildEnvelope,
  enqueue,
  shouldFlush,
  type AnalyticsProps,
  type AnalyticsService,
} from '../domain/analytics';
import { getUserPseudoId } from './pseudoId';
import { getAnalyticsRepository, type AnalyticsRepository } from './analyticsRepository';

/**
 * The §11.1 common properties this app can supply without a new dependency. The rest of the
 * envelope's documented set — screen_id, network, reduced_motion, text_scale — is owed by the call
 * sites and a11y state that know them, and is deliberately absent rather than faked.
 */
function contextProps(): AnalyticsProps {
  return {
    app_version: Constants.expoConfig?.version ?? 'unknown',
    platform: Platform.OS,
  };
}

export interface BatchingAnalyticsDeps {
  repository?: AnalyticsRepository;
  pseudoId?: () => string;
  now?: () => Date;
}

/**
 * Queues events and posts them in batches.
 *
 * `track` is synchronous and swallows everything: a metric must never throw into a render path, and
 * an unknown EVT_* (which `buildEnvelope` rejects, since PDD §11 owns that list) must fail as a
 * dropped event and a warning, not as a crash.
 */
export class BatchingAnalyticsService implements AnalyticsService {
  private queue: AnalyticsEventEnvelope[] = [];
  private householdId: string | null = null;
  private sending = false;
  private readonly deps: Required<BatchingAnalyticsDeps>;

  constructor(deps: BatchingAnalyticsDeps = {}) {
    this.deps = {
      repository: deps.repository ?? getAnalyticsRepository(),
      pseudoId: deps.pseudoId ?? getUserPseudoId,
      now: deps.now ?? (() => new Date()),
    };
  }

  track(eventId: EventId, props?: AnalyticsProps): void {
    try {
      const envelope = buildEnvelope({
        eventId,
        userPseudoId: this.deps.pseudoId(),
        householdId: this.householdId,
        props: { ...contextProps(), ...props },
        now: this.deps.now(),
      });
      this.queue = enqueue(this.queue, envelope);
      if (shouldFlush(this.queue.length)) void this.flush();
    } catch (error) {
      console.warn('[analytics] Dropped an event.', error);
    }
  }

  async flush(): Promise<void> {
    // One in-flight batch at a time: two concurrent flushes would send the same envelopes twice,
    // and the table has no natural key to deduplicate on.
    if (this.sending || this.queue.length === 0) return;
    this.sending = true;
    const batch = this.queue;
    this.queue = [];
    try {
      await this.deps.repository.insertBatch(batch);
    } catch (error) {
      // Re-queue ahead of anything tracked meanwhile, so ordering survives a failed send. The cap
      // in `enqueue` still applies on the next track, so a permanently failing sink cannot grow
      // this without bound.
      this.queue = [...batch, ...this.queue];
      console.warn('[analytics] Batch failed; will retry on the next flush.', error);
    } finally {
      this.sending = false;
    }
  }

  setHouseholdId(householdId: string | null): void {
    this.householdId = householdId;
  }

  /** Test/inspection seam — how many envelopes are waiting. */
  get pending(): number {
    return this.queue.length;
  }
}

let service: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!service) service = new BatchingAnalyticsService();
  return service;
}

/** Test/DI seam — override the service (e.g. NullAnalyticsService or a spy). */
export function setAnalyticsService(next: AnalyticsService | null): void {
  service = next;
}

/**
 * Flush when the app leaves the foreground — the last chance to send before the process may be
 * frozen or killed. Returns an unsubscribe function; installed by AppProviders.
 */
export function installAnalyticsFlushOnBackground(): () => void {
  const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') void getAnalyticsService().flush();
  });
  return () => subscription.remove();
}

export { NullAnalyticsService };
