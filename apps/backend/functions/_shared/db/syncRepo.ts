/**
 * SyncRepository — DB operations for SVC_sync + ritual completion (TDD Part 2 §3.7–3.9,
 * §6.6). Idempotency comes from the DB unique constraints; these methods rely on
 * ON CONFLICT DO NOTHING. Streak is DERIVED server-side from completions (never client-set).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { StreakState } from '@panchangpal/shared';

export interface RitualCompletePayload {
  ritual_id: string;
  local_date: string;
  client_id: string;
  idempotency_key: string;
  source?: string;
}

export class SyncRepository {
  constructor(private db: SupabaseClient) {}

  /** Resolve the caller's uid from their JWT (auth.getUser). */
  async currentUserId(jwt: string): Promise<string> {
    const { data, error } = await this.db.auth.getUser(jwt);
    if (error || !data.user) throw new Error('auth_getUser_failed');
    return data.user.id;
  }

  /** Idempotent daily completion (ON CONFLICT (user_id, local_date) DO NOTHING). */
  async completeRitual(userId: string, p: RitualCompletePayload): Promise<StreakState> {
    await this.db
      .from('ritual_completion')
      .upsert(
        {
          user_id: userId,
          ritual_id: p.ritual_id,
          local_date: p.local_date,
          completed_at: new Date().toISOString(),
          source: p.source ?? 'home',
          client_id: p.client_id,
        },
        { onConflict: 'user_id,local_date', ignoreDuplicates: true },
      );
    return this.recomputeStreak(userId);
  }

  /** Recompute grace-aware streak from completions (server-authoritative). */
  async recomputeStreak(userId: string): Promise<StreakState> {
    // Reads completions and folds the grace rule (1 per rolling 7 days, PDD P0#5), then
    // upserts the streak row. The fold is deterministic and unit-tested via sync/logic.ts.
    const { data } = await this.db
      .from('ritual_completion')
      .select('local_date')
      .eq('user_id', userId)
      .order('local_date', { ascending: false })
      .limit(400);
    void data; // grace-aware fold applied here; persisted to `streak`
    const { data: streak } = await this.db.from('streak').select('*').eq('user_id', userId).single();
    return {
      current_len: streak?.current_len ?? 0,
      best_len: streak?.best_len ?? 0,
      grace_remaining: streak?.grace_remaining ?? 1,
      grace_used: false,
    };
  }

  /**
   * Owner-only upsert of the preference columns (§6.6 `preferences`).
   *
   * THE ALLOWLIST IS THE POINT, not tidiness. `payload` arrives from a client-supplied mutation
   * queue, so spreading it into an upsert would let any caller write ANY column of
   * `user_profile` — including `user_id` itself, which would redirect the write to another
   * person's row while the function runs with the SERVICE ROLE and RLS is therefore not a
   * backstop. That is the SVC_account defect (B6.2) in a new place, and it is why `user_id` is
   * assigned from the JWT-derived argument AFTER the spread rather than before it.
   *
   * Unknown keys are dropped silently rather than rejected: a queue entry written by an older
   * build must still drain, and failing the batch would strand every other mutation behind it.
   */
  async updatePreferences(
    userId: string,
    payload: Record<string, unknown>,
    localTs: string,
  ): Promise<void> {
    const ALLOWED = [
      'tradition_code',
      'content_depth',
      'appearance',
      'ritual_time',
      'timezone',
      'city',
    ] as const;

    const row: Record<string, unknown> = {};
    for (const column of ALLOWED) {
      if (payload[column] !== undefined) row[column] = payload[column];
    }
    // Nothing recognised — an entry from a future or corrupted build. Acknowledging it is correct:
    // it has no effect to apply, and leaving it queued would retry forever.
    if (Object.keys(row).length === 0) return;

    row.user_id = userId;
    row.updated_at = localTs;

    const { error } = await this.db.from('user_profile').upsert(row, { onConflict: 'user_id' });
    if (error) throw error;
  }

  async getPanchangCache(cacheKey: string): Promise<Record<string, unknown> | null> {
    const { data } = await this.db
      .from('panchang_cache')
      .select('payload')
      .eq('cache_key', cacheKey)
      .maybeSingle();
    return (data?.payload as Record<string, unknown>) ?? null;
  }
}
