/**
 * BillingRepository — RevenueCat entitlement reconciliation (TDD Part 2 §3.13, §5.6, F-4).
 * Service-role only. Idempotent upsert by rc_original_txn_id; entitlement at HOUSEHOLD grain.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SubscriptionUpsert } from '../../revenuecat-webhook/logic.ts';

export class BillingRepository {
  constructor(private db: SupabaseClient) {}

  /** Resolve the household for a RevenueCat app_user_id (rc_app_user_id ↔ our uid ↔ household). */
  async householdForRcUser(rcAppUserId: string): Promise<string | null> {
    // rc_app_user_id is set to our auth uid at purchase; map uid → active household.
    const { data } = await this.db
      .from('household_member')
      .select('household_id')
      .eq('user_id', rcAppUserId)
      .eq('is_active', true)
      .maybeSingle();
    return data?.household_id ?? null;
  }

  /** Idempotent subscription upsert + entitlement sync at household grain. */
  async applyEntitlement(
    householdId: string,
    sub: SubscriptionUpsert,
    entitlementActive: boolean,
  ): Promise<void> {
    await this.db.from('subscription').upsert(
      { household_id: householdId, ...sub },
      { onConflict: 'rc_original_txn_id' },
    );
    await this.db.from('entitlement').upsert(
      {
        household_id: householdId,
        kind: sub.kind,
        is_active: entitlementActive,
        granted_at: entitlementActive ? new Date().toISOString() : null,
      },
      { onConflict: 'household_id,kind' },
    );
  }
}
