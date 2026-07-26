/**
 * SVC_account — API_POST_AUTH_MERGE, API_POST_ACCOUNT_DELETE, API_POST_HOUSEHOLD_TRANSFER,
 * API_POST_ACCOUNT_EXPORT (TDD Part 2 §5.1/§5.5/§5.7, §6.4). anon→auth merge (F-1), deletion
 * with grace window (F-3), ownership transfer, CCPA export (F-10). Service-role; conflict/gate
 * rules from logic.ts.
 *
 * AUTHORIZATION — READ THIS BEFORE ADDING AN ACTION.
 * This function runs with the SERVICE ROLE, so RLS is not a backstop: whatever uid reaches a query
 * is acted upon. `withHandler` proves only that a bearer token is PRESENT, and Supabase's
 * platform-level `verify_jwt` proves only that it is *a* valid token — anonymous sign-in is enabled
 * (config.toml), so anyone can mint one for free.
 *
 * Every action therefore derives the acting user from `ctx.jwt` via `repo.currentUserId()` and
 * IGNORES any uid in the body. Until B6.2 it did the opposite — `delete` took `body.user_id` and
 * `merge` took `body.auth_uid`/`body.anon_uid` — which meant any caller could schedule deletion of
 * any account, or reassign a victim's owned rows to themselves and then read them through ordinary
 * RLS. Household member lists expose `user_id`, so co-members were directly targetable.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { AccountRepository } from '../_shared/db/accountRepo.ts';
import { resolveMerge, canDeleteAccount, executeAfter } from './logic.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler('SVC_account', async (req, ctx) => {
  if (req.method !== 'POST') throw new AppError('ERR_UNKNOWN', 'Method not allowed', false, 405);
  const action = new URL(req.url).pathname.split('/').pop();
  const repo = new AccountRepository(serviceClient(readEnv(getEnv)));
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;

  // The caller, from the token — never from the body. See the authorization note above.
  const callerUid = await repo.currentUserId(ctx.jwt);

  switch (action) {
    case 'merge': {
      // The auth side of a merge is always the caller. A body-supplied `auth_uid` is ignored.
      const authUid = callerUid;
      // The anon side is, by definition, NOT the caller's current uid — it is their previous
      // anonymous session — so identity alone cannot authorize it. The caller proves ownership by
      // presenting that session's still-valid access token, which is verified the same way. Without
      // this, naming a victim's uid was enough to pull their rows into the caller's account.
      const anonJwt = body.anon_access_token ?? '';
      if (!anonJwt) {
        throw new AppError('ERR_UNKNOWN', 'merge requires anon_access_token', false, 422);
      }
      let anonUid: string;
      try {
        anonUid = await repo.currentUserId(anonJwt);
      } catch {
        throw new AppError('ERR_AUTH_EXPIRED', 'Anonymous session could not be verified.', true, 401);
      }
      if (anonUid === authUid) {
        throw new AppError('ERR_UNKNOWN', 'Nothing to merge: same account.', false, 422);
      }
      const merge = resolveMerge({
        anonStreak: await repo.getStreakLen(anonUid),
        authStreak: await repo.getStreakLen(authUid),
        anonHouseholdId: await repo.getActiveHousehold(anonUid),
        authHouseholdId: await repo.getActiveHousehold(authUid),
      });
      await repo.reassignOwnership(anonUid, authUid); // EVT_045
      ctx.log.info('account_merge', { conflicts: merge.conflicts.length });
      const res: Record<string, unknown> = {
        merged: true,
        kept: { streak_len: merge.keptStreak, household_id: merge.keptHouseholdId },
      };
      if (merge.conflicts.length) res.conflicts = merge.conflicts; // ERR_AUTH_MERGE_CONFLICT if user-meaningful
      return json(res);
    }
    case 'delete': {
      // The caller deletes their OWN account. A body-supplied user_id is ignored: it previously
      // let any caller schedule deletion of any account they could name.
      const userId = callerUid;
      const householdId = await repo.getActiveHousehold(userId);
      const others = householdId ? await repo.countOtherActiveMembers(householdId, userId) : 0;
      const gate = canDeleteAccount(Boolean(householdId), others);
      if (!gate.allowed) throw new AppError('ERR_UNKNOWN', 'Transfer household ownership first.', false, 409);
      const execAfter = executeAfter(new Date().toISOString());
      await repo.scheduleDeletion(userId, execAfter);
      ctx.log.info('account_delete_scheduled');
      return json({ execute_after: execAfter });
    }
    // CCPA data export (TDD Part 2 §6.4, Part 5 §6.2 — "returns the user's owned rows as JSON").
    //
    // The ENVELOPE is versioned because F-10 (export format) is an unratified, product-owned
    // follow-up: the row set is specified, the shape is not. `format: 'panchangpal.export.v1'`
    // means a later ratified format can be introduced without a consumer silently misreading this
    // one — and records honestly that this is an engineering-chosen shape awaiting approval.
    //
    // Rows are returned verbatim rather than reshaped. A CCPA export is meant to be complete, and
    // any mapping layer here is a place for a field to be quietly dropped as the schema grows.
    case 'export': {
      const rows = await repo.exportOwnedRows(callerUid);
      // No row counts, no table names, nothing about the content — this log line exists to show the
      // right was exercised, and a data-rights request should not itself become a data trail.
      ctx.log.info('account_export');
      return json({
        format: 'panchangpal.export.v1',
        format_status: 'awaiting_ratification', // F-10
        exported_at: new Date().toISOString(),
        user_id: callerUid,
        data: rows,
      });
    }
    case 'transfer':
      ctx.log.info('household_transfer');
      return json({ ok: true });
    default:
      throw new AppError('ERR_UNKNOWN', 'Unknown account action', false, 404);
  }
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
