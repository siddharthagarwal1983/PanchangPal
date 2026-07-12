/**
 * accountRepository — gateway for SCR_DELETE_ACCOUNT_001 (TDD Part 2 §5.1/§5.7, F-3; openapi
 * API_POST_ACCOUNT_DELETE / API_POST_REAUTH / API_POST_HOUSEHOLD_TRANSFER). All calls go through
 * the SVC_account Edge Function via functions.invoke (service-role work never runs on device);
 * invoke paths follow the OpenAPI operation paths, matching authRepository (`account/merge`).
 * Deletion is a grace-window REQUEST (returns execute_after), not an immediate wipe — the server
 * re-checks the F-3 gate and requires a short-lived reauth token for this sensitive action.
 * Features call this only through the account hooks, never supabase-js directly.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';

function errCode(error: unknown): string {
  return (error as { context?: { code?: string } })?.context?.code ?? (error as Error)?.message ?? 'ERR_UNKNOWN';
}

export class AccountRepository {
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  /** Obtain a short-lived reauth token for a sensitive action (POST /reauth, API_POST_REAUTH). */
  async requestReauth(): Promise<string> {
    const { data, error } = await this.db.functions.invoke('reauth', { body: {} });
    if (error) throw new Error(errCode(error));
    return (data as { reauth_token: string }).reauth_token;
  }

  /**
   * Transfer household ownership to another member (POST /household/transfer, SVC_account).
   * Required before an owner-with-members can delete (F-3).
   */
  async transferOwnership(householdId: string, newOwnerId: string): Promise<void> {
    const { error } = await this.db.functions.invoke('household/transfer', {
      body: { household_id: householdId, new_owner_id: newOwnerId },
    });
    if (error) throw new Error(errCode(error));
  }

  /**
   * Request account deletion (POST /account/delete). Returns the grace-window execution date.
   * Throws ERR_UNKNOWN (409) if the server's F-3 gate still requires an ownership transfer.
   */
  async requestDeletion(reauthToken: string): Promise<{ executeAfter: string }> {
    const { data, error } = await this.db.functions.invoke('account/delete', {
      body: { reauth_token: reauthToken },
    });
    if (error) throw new Error(errCode(error));
    return { executeAfter: (data as { execute_after: string }).execute_after };
  }
}

let defaultRepository: AccountRepository | null = null;

export function getAccountRepository(): AccountRepository {
  if (!defaultRepository) defaultRepository = new AccountRepository();
  return defaultRepository;
}
</content>
