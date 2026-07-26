/**
 * SyncRepository (TDD Part 4 §5.1/§6.4) — the client half of API_POST_SYNC. Posts a batch of
 * queued mutations to SVC_sync and returns the server's answer unmodified; every decision about
 * what to send and what to retire is the caller's (`syncService` + `domain/sync`).
 *
 * SVC_sync has been fully implemented server-side since the Backend Foundation milestone and was
 * unreachable from the app until now — nothing in `src/data` bound API_POST_SYNC at all.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import type { QueuedMutation, SyncResponse } from '../domain/sync';

export class SyncRepository {
  private _db?: SupabaseClient;

  // Lazy client, for the reason documented across the data layer: `getSupabase()` as a default
  // parameter is evaluated at construction, which for a module-level singleton means at import.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

  /**
   * Push one batch. `idempotency_key` is per BATCH (§6.4) and distinct from each mutation's
   * `client_id` (§6.3) — a redelivered batch and a redelivered mutation are different failures,
   * and the server dedupes them at different grains.
   *
   * Throws the ERR_* code rather than an opaque error so the caller can distinguish a transient
   * failure worth retrying from a conflict the server has already resolved.
   */
  async push(
    mutations: readonly QueuedMutation[],
    idempotencyKey: string,
  ): Promise<SyncResponse> {
    const { data, error } = await this.db.functions.invoke('sync', {
      body: {
        // Only the fields the contract defines. `attempts` and `nextAttemptAt` are local retry
        // bookkeeping and are none of the server's business.
        mutations: mutations.map((m) => ({
          kind: m.kind,
          payload: m.payload,
          client_id: m.client_id,
          local_ts: m.local_ts,
        })),
        client_ts: new Date().toISOString(),
        idempotency_key: idempotencyKey,
      },
    });
    if (error) {
      throw new Error((error as { context?: { code?: string } }).context?.code ?? 'ERR_SYNC_CONFLICT');
    }
    const response = (data ?? {}) as Partial<SyncResponse>;
    // Normalize the two lists so callers never branch on absence. A response missing both is a
    // batch the server acknowledged nothing in, which reconciliation correctly treats as a retry.
    return {
      applied: response.applied ?? [],
      conflicts: response.conflicts ?? [],
      server_state: response.server_state,
    };
  }
}

let defaultRepository: SyncRepository | null = null;

/** Created lazily so tests can inject a client without a configured environment. */
export function getSyncRepository(): SyncRepository {
  return (defaultRepository ??= new SyncRepository());
}

/** Test seam: drop the memoized singleton. */
export function resetSyncRepositoryForTests(): void {
  defaultRepository = null;
}
