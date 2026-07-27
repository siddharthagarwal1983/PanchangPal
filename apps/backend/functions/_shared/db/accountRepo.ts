/**
 * AccountRepository — anon→auth merge (F-1), deletion (F-3), transfer. Service-role,
 * transactional. Conflict/gate decisions come from account/logic.ts; this performs the
 * row reassignment and writes.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const OWNED_TABLES = [
  'user_profile',
  'ritual_completion',
  'streak',
  'checklist_completion',
  'personal_date',
  'conversation',
  'push_token',
  'notification',
  'referral',
] as const;

/**
 * The user's own rows, for CCPA export (TDD Part 2 §6.4 / Part 5 §6.2): "profile, personal dates,
 * conversations, streak, completions". Checklist completions are included as part of "completions" —
 * they are the user's own daily-loop records and withholding them would make the export incomplete
 * in a way §6.2's intent does not support.
 *
 * DELIBERATELY NOT the same list as OWNED_TABLES. `push_token` is a device credential, `notification`
 * is delivery bookkeeping, and `referral` concerns another party as much as this user — reassigning
 * those on merge is right, handing them back as "your data" is not.
 *
 * `message` is absent from this list because it cannot be fetched the same way — it keys on
 * `conversation_id`, not `user_id` — and is added by `exportOwnedRows` in a second query. See there.
 */
const EXPORT_TABLES = [
  'user_profile',
  'personal_date',
  'conversation',
  'streak',
  'ritual_completion',
  'checklist_completion',
] as const;

export class AccountRepository {
  constructor(private db: SupabaseClient) {}

  /**
   * Resolve the CALLER from their JWT. `withHandler` only proves a bearer token is present, and
   * this function runs with the service role — so RLS is not a backstop and the request body must
   * never be trusted to say who the caller is. Mirrors SyncRepository.currentUserId, which had this
   * right; SVC_account did not, and read the uid from the body (fixed in B6.2).
   */
  async currentUserId(jwt: string): Promise<string> {
    const { data, error } = await this.db.auth.getUser(jwt);
    if (error || !data.user) throw new Error('auth_getUser_failed');
    return data.user.id;
  }

  /**
   * Execute every account deletion whose grace window has expired (F-3).
   *
   * Delegates to the `sweep_due_account_deletions()` SQL function rather than issuing the
   * deletes from here, and that is the point: the erasure spans nine tables with four foreign
   * keys that RESTRICT, and supabase-js has no transaction across calls — a failure midway
   * through would leave an account half-erased with no way to tell how far it got. The function
   * body is one transaction per user. This method exists to give the sweep a caller, a log line
   * and a correlation id, not to reimplement it.
   *
   * `blocked` counts users the sweep refused: a household owner who never transferred ownership.
   * Those rows stay in place and are retried, so a rising count means people are stuck behind a
   * transfer nobody asked them to perform — worth surfacing rather than summing into a total.
   */
  async sweepDueDeletions(): Promise<{ deleted: number; blocked: number }> {
    const { data, error } = await this.db.rpc('sweep_due_account_deletions');
    if (error) throw error;
    // Postgres returns a one-row set for a `returns table` function.
    const row = (Array.isArray(data) ? data[0] : data) as { deleted?: number; blocked?: number } | null;
    return { deleted: row?.deleted ?? 0, blocked: row?.blocked ?? 0 };
  }

  /** Every row this user owns, keyed by table. Used only by the export action. */
  async exportOwnedRows(userId: string): Promise<Record<string, unknown[]>> {
    const out: Record<string, unknown[]> = {};
    for (const table of EXPORT_TABLES) {
      const { data, error } = await this.db.from(table).select('*').eq('user_id', userId);
      if (error) throw error;
      out[table] = data ?? [];
    }

    // Messages are the one export row set that cannot be reached by `user_id` — `message` keys on
    // `conversation_id`, so the loop above silently returned the conversation HEADERS with none of
    // their content. §6.2 promises "the user's owned rows"; a thread's title without the question
    // the user asked and the answer they were given is not that, and it is the single most
    // personal text in the product.
    //
    // Harmless today (Ask Guru is gated off, so there are no messages) and wrong the day
    // `GURU_LIVE` flips — which is exactly the kind of gap that gets discovered by a data-rights
    // request rather than by a test.
    const conversationIds = (out.conversation ?? [])
      .map((row) => (row as { id?: string }).id)
      .filter((id): id is string => typeof id === 'string');

    if (conversationIds.length > 0) {
      const { data, error } = await this.db
        .from('message')
        .select('*')
        .in('conversation_id', conversationIds);
      if (error) throw error;
      out.message = data ?? [];
    } else {
      // Present and empty rather than absent: a consumer should not have to distinguish "no
      // messages" from "this export predates message support".
      out.message = [];
    }

    // `message_source` is deliberately NOT exported. It records which reviewed CORPUS chunk backed
    // an answer — a reference into shared content, not anything the user wrote or that describes
    // them. Including it would hand back the product's own library rows under the heading "your
    // data", which is the mirror of the mistake this fix corrects.
    return out;
  }

  async getStreakLen(userId: string): Promise<number> {
    const { data } = await this.db.from('streak').select('current_len').eq('user_id', userId).maybeSingle();
    return data?.current_len ?? 0;
  }

  async getActiveHousehold(userId: string): Promise<string | null> {
    const { data } = await this.db
      .from('household_member')
      .select('household_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    return data?.household_id ?? null;
  }

  /** Reassign anon-owned rows → auth uid across owned tables. Idempotent per row. */
  async reassignOwnership(anonUid: string, authUid: string): Promise<void> {
    for (const table of OWNED_TABLES) {
      await this.db.from(table).update({ user_id: authUid }).eq('user_id', anonUid);
    }
  }

  async countOtherActiveMembers(householdId: string, userId: string): Promise<number> {
    const { count } = await this.db
      .from('household_member')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', householdId)
      .eq('is_active', true)
      .neq('user_id', userId);
    return count ?? 0;
  }

  async scheduleDeletion(userId: string, executeAfterIso: string): Promise<void> {
    await this.db.from('account_deletion').upsert(
      { user_id: userId, requested_at: new Date().toISOString(), execute_after: executeAfterIso },
      { onConflict: 'user_id' },
    );
  }
}
