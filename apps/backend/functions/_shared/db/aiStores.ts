/**
 * Postgres-backed implementations of the AI rate-limit + cost-ledger interfaces
 * (packages/ai). Uses the atomic SQL helpers from migration 20260712000090 so counters
 * are race-free. Service-role client (tables are service-only).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RateLimitStore } from '@panchangpal/ai';
import type { CostLedger } from '@panchangpal/ai';

export class PgRateLimitStore implements RateLimitStore {
  constructor(private db: SupabaseClient) {}
  async incr(key: string, windowStartEpochMin: number): Promise<number> {
    const { data, error } = await this.db.rpc('ai_rate_incr', {
      p_subject: key,
      p_window: windowStartEpochMin,
    });
    if (error) throw new Error(`ai_rate_incr: ${error.message}`);
    return data as number;
  }
}

export class PgCostLedger implements CostLedger {
  constructor(private db: SupabaseClient) {}
  async record(costUsd: number, meta: { model: string; correlationId: string }): Promise<void> {
    const { error } = await this.db.from('ai_cost_ledger').insert({
      model: meta.model,
      cost_usd: costUsd,
      correlation_id: meta.correlationId,
    });
    if (error) throw new Error(`ai_cost_ledger insert: ${error.message}`);
  }
  async windowSpendUsd(): Promise<number> {
    const { data, error } = await this.db.rpc('ai_window_spend_usd', {});
    if (error) throw new Error(`ai_window_spend_usd: ${error.message}`);
    return Number(data ?? 0);
  }
}
