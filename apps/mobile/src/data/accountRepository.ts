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

/**
 * The CCPA export envelope (F-10, awaiting ratification — see `exportData`). `data` is keyed by
 * table name and holds rows verbatim: a CCPA export is meant to be complete, and a mapping layer
 * is where a field gets quietly dropped as the schema grows.
 */
export interface AccountExport {
  format: string;
  format_status: string;
  exported_at: string;
  user_id: string;
  data: Record<string, unknown[]>;
}

export class AccountRepository {
  private _db?: SupabaseClient;

  // Lazy client. `getSupabase()` as a default parameter is evaluated at CONSTRUCTION, which
  // for a module-level singleton means at import — so an absent EXPO_PUBLIC_SUPABASE_URL threw
  // "supabaseUrl is required." while a route module was still evaluating, and expo-router
  // then reported "Page could not be found" instead of a calm error state. It also made these
  // repositories untestable, since importing one detonated. Resolve on first real use.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

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
   * CCPA data export (POST /account/export, TDD Part 2 §6.4 / Part 5 §6.2, F-10).
   *
   * Returns the caller's own rows — the server derives the user from the JWT and there is no uid
   * to pass, deliberately: an export endpoint that accepted a uid would hand any caller anyone's
   * personal data.
   *
   * The envelope is versioned (`panchangpal.export.v1`) because F-10 is an unratified,
   * product-owned decision: §6.4 specifies WHICH rows, not their shape. Callers should treat
   * `format` as significant and not assume this shape survives ratification.
   *
   * NO UI CONSUMES THIS YET. PDD §5 governance lists "CCPA data export/delete" as outstanding and
   * specifies no screen or affordance for it, so adding a Settings row here would be inventing UX.
   * The capability is real and testable; the affordance is owed by the PDD.
   */
  async exportData(): Promise<AccountExport> {
    const { data, error } = await this.db.functions.invoke('account/export', { body: {} });
    if (error) throw new Error(errCode(error));
    return data as AccountExport;
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
