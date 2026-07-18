/**
 * subscriptionRepository — gateway for MOD_subscription (TDD Part 2 §3.13/§5.6; openapi
 * API_GET_SUB_ENTITLEMENT). Household-member READ of the `entitlement` table via supabase-js under
 * RLS (is_household_member(household_id), migration 20260712000060). The client NEVER writes
 * entitlements — the table denies all client writes; RevenueCat's webhook (SVC_revenuecat_webhook)
 * is the sole writer (F-4, household grain). Plans/purchase/restore (API_GET_SUB_PLANS /
 * API_POST_SUB_VALIDATE / API_POST_SUB_RESTORE via the PaymentAdapter) land in Increment 2.
 * Features/domain call this only through HOOK_useEntitlement, never supabase-js directly.
 */
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import { nextChannelId } from './realtimeChannelId';
import { rowsToEntitlements, type Entitlement, type EntitlementRow } from '../domain/subscription';

const TABLE = 'entitlement';
const COLUMNS = 'kind, is_active, granted_at, expires_at, source';

export class SubscriptionRepository {
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  /** Household-member read of active + inactive entitlements (RLS-scoped); [] when none exist. */
  async getEntitlements(): Promise<Entitlement[]> {
    const { data, error } = await this.db.from(TABLE).select(COLUMNS);
    if (error) throw error;
    return rowsToEntitlements((data as EntitlementRow[] | null) ?? null);
  }

  /**
   * Subscribe to entitlement changes so a webhook-driven grant/revoke propagates to the client
   * (F-4 realtime, TDD §5.4). RLS scopes the stream to the caller's household. `onChange` is a
   * refetch signal, not a data source — the query stays the single source of truth. The caller
   * MUST invoke the returned unsubscribe on unmount/background to save battery.
   */
  subscribeEntitlements(onChange: () => void): () => void {
    // The topic carries a per-subscription suffix. supabase-js returns an EXISTING channel
    // when one with the same topic is still registered, and removeChannel() below is async
    // and un-awaited — so a remount (React StrictMode double-invokes effects in dev) would
    // otherwise get back the already-subscribed channel and throw "cannot add
    // `postgres_changes` callbacks ... after `subscribe()`". A unique topic keeps each
    // subscriber's lifecycle independent.
    const channel: RealtimeChannel = this.db
      .channel(`entitlement:self:${nextChannelId()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onChange())
      .subscribe();
    return () => {
      void this.db.removeChannel(channel);
    };
  }
}

let defaultRepository: SubscriptionRepository | null = null;

export function getSubscriptionRepository(): SubscriptionRepository {
  if (!defaultRepository) defaultRepository = new SubscriptionRepository();
  return defaultRepository;
}
