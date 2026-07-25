/**
 * analyticsRepository — gateway to the `analytics_event` sink (ADR-013, TDD Part 2 §5;
 * TBL_ANALYTICS_EVENT). Batched inserts via supabase-js under RLS.
 *
 * The table is INSERT-ONLY for clients: `analytics_ins_own` allows the insert and there is no
 * select policy, so a device can contribute events and can never read anyone's. Rollups run
 * service-side (pg_cron, ADR-025). Nothing here reads back, and nothing should.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsEventEnvelope } from '@panchangpal/shared';
import { getSupabase } from './supabaseClient';

const ANALYTICS_TABLE = 'analytics_event';

export class AnalyticsRepository {
  private _db?: SupabaseClient;

  // Lazy client, as everywhere in this directory: `getSupabase()` as a default parameter is
  // evaluated at construction, which for a module-level singleton means at import.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

  /**
   * Insert a batch. Throws on failure so the caller can decide whether to re-queue — the adapter
   * does, once, rather than losing a batch to one flaky request.
   */
  async insertBatch(events: readonly AnalyticsEventEnvelope[]): Promise<void> {
    if (events.length === 0) return;
    const { error } = await this.db.from(ANALYTICS_TABLE).insert(events as AnalyticsEventEnvelope[]);
    if (error) throw error;
  }
}

let defaultRepository: AnalyticsRepository | null = null;

/** Created lazily so importing this module never requires Supabase configuration. */
export function getAnalyticsRepository(): AnalyticsRepository {
  if (!defaultRepository) defaultRepository = new AnalyticsRepository();
  return defaultRepository;
}

/** Test seam. */
export function setAnalyticsRepositoryForTests(next: AnalyticsRepository | null): void {
  defaultRepository = next;
}
