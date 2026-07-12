/**
 * householdRepository — gateway for SCR_HOUSEHOLD_* (TDD Part 2 §3.3–3.5, §5.5; openapi
 * API_*_HOUSEHOLD* / API_*_INVITE*). Reads use supabase-js under RLS (household-member read,
 * ADR-018); writes that must run privileged logic (add/remove member, mint/accept invites) go
 * through the SVC_household Edge Function via functions.invoke — the client never holds a service
 * role and never fabricates household data. Invoke paths follow the OpenAPI operation paths, the
 * same convention as authRepository (`account/merge`) and todayRepository (`panchang/…`).
 * Features/domain call this only through HOOK_useHousehold / HOOK_useInvite, never supabase-js.
 */
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import {
  rowToHousehold,
  type Household,
  type Invite,
  type InvitePreview,
  type MemberInput,
  type MemberPatch,
} from '../domain/household';

const HOUSEHOLD_SELECT =
  'id, name, owner_id, tradition_code, members:household_member(id, household_id, user_id, display_name, role, depth, is_active)';

/** Read the ERR_* code the Edge Function envelope carries (falls back to the raw message). */
function errCode(error: unknown): string {
  return (error as { context?: { code?: string } })?.context?.code ?? (error as Error)?.message ?? 'ERR_UNKNOWN';
}

export class HouseholdRepository {
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  /** Owner/member read of the caller's household (RLS-scoped); null if the user has none yet. */
  async getHousehold(): Promise<Household | null> {
    const { data, error } = await this.db.from('household').select(HOUSEHOLD_SELECT).maybeSingle();
    if (error) throw error;
    return rowToHousehold(data as Parameters<typeof rowToHousehold>[0]);
  }

  /** Create a household owned by the caller (POST /household). */
  async createHousehold(name: string): Promise<Household> {
    const { data, error } = await this.db.functions.invoke('household', { body: { name } });
    if (error) throw new Error(errCode(error));
    return rowToHousehold(data as Parameters<typeof rowToHousehold>[0])!;
  }

  /** Add a member (POST /household/member, SVC_household). */
  async addMember(householdId: string, input: MemberInput): Promise<Household> {
    const { data, error } = await this.db.functions.invoke('household/member', {
      body: { household_id: householdId, display_name: input.displayName, role: input.role, depth: input.depth },
    });
    if (error) throw new Error(errCode(error));
    return rowToHousehold(data as Parameters<typeof rowToHousehold>[0])!;
  }

  /** Update a member's role/depth/name (PATCH /household/member/{id}, SVC_household). */
  async updateMember(memberId: string, patch: MemberPatch): Promise<Household> {
    const body: Record<string, unknown> = {};
    if (patch.displayName !== undefined) body.display_name = patch.displayName;
    if (patch.role !== undefined) body.role = patch.role;
    if (patch.depth !== undefined) body.depth = patch.depth;
    const { data, error } = await this.db.functions.invoke(`household/member/${memberId}`, { method: 'PATCH', body });
    if (error) throw new Error(errCode(error));
    return rowToHousehold(data as Parameters<typeof rowToHousehold>[0])!;
  }

  /** Remove a member (DELETE /household/member/{id}, SVC_household). */
  async removeMember(memberId: string): Promise<Household> {
    const { data, error } = await this.db.functions.invoke(`household/member/${memberId}`, { method: 'DELETE' });
    if (error) throw new Error(errCode(error));
    return rowToHousehold(data as Parameters<typeof rowToHousehold>[0])!;
  }

  /** Mint a shareable invite token/URL (POST /invite, SVC_household). */
  async createInvite(householdId: string): Promise<Invite> {
    const { data, error } = await this.db.functions.invoke('invite', { body: { household_id: householdId } });
    if (error) throw new Error(errCode(error));
    const d = data as { token: string; url: string; expires_at: string };
    return { token: d.token, url: d.url, expiresAt: d.expires_at };
  }

  /** Public preview of an invite before joining (GET /invite/{token}); throws ERR_INVITE_EXPIRED. */
  async getInvitePreview(token: string): Promise<InvitePreview> {
    const { data, error } = await this.db.functions.invoke(`invite/${token}`, { method: 'GET' });
    if (error) throw new Error(errCode(error));
    const d = data as { household_name: string; inviter: string };
    return { householdName: d.household_name, inviter: d.inviter };
  }

  /**
   * Accept an invite (POST /invite/accept). Enforces one-active-household (F-2) server-side;
   * idempotency_key makes retries safe. Requires an authenticated caller (deferred-auth gate).
   */
  async acceptInvite(args: {
    token: string;
    role?: MemberInput['role'];
    depth?: MemberInput['depth'];
    idempotencyKey: string;
  }): Promise<{ householdId: string; switchedFrom?: string }> {
    const { data, error } = await this.db.functions.invoke('invite/accept', {
      body: { token: args.token, role: args.role, depth: args.depth, idempotency_key: args.idempotencyKey },
    });
    if (error) throw new Error(errCode(error));
    const d = data as { household_id: string; switched_from?: string };
    return { householdId: d.household_id, switchedFrom: d.switched_from };
  }

  /**
   * Subscribe to member changes for positive social proof (TDD §5.4). RLS-scoped; the caller
   * MUST invoke the returned unsubscribe on unmount/background to save battery. `onChange` is
   * a signal to refetch, not a data source — the query stays the single source of truth.
   */
  subscribeMembers(householdId: string, onChange: () => void): () => void {
    const channel: RealtimeChannel = this.db
      .channel(`household:${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'household_member', filter: `household_id=eq.${householdId}` },
        () => onChange(),
      )
      .subscribe();
    return () => {
      void this.db.removeChannel(channel);
    };
  }
}

let defaultRepository: HouseholdRepository | null = null;

export function getHouseholdRepository(): HouseholdRepository {
  if (!defaultRepository) defaultRepository = new HouseholdRepository();
  return defaultRepository;
}
</content>
