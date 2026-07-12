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

export class AccountRepository {
  constructor(private db: SupabaseClient) {}

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
