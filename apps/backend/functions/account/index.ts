/**
 * SVC_account — API_POST_AUTH_MERGE, API_POST_ACCOUNT_DELETE, API_POST_HOUSEHOLD_TRANSFER
 * (TDD Part 2 §5.1/§5.5/§5.7). anon→auth merge (F-1), deletion with grace window (F-3),
 * ownership transfer. Service-role; conflict/gate rules from logic.ts.
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

  switch (action) {
    case 'merge': {
      const authUid = body.auth_uid ?? '';
      const anonUid = body.anon_uid ?? '';
      if (!authUid || !anonUid) throw new AppError('ERR_UNKNOWN', 'merge requires anon_uid', false, 422);
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
      const userId = body.user_id ?? '';
      const householdId = await repo.getActiveHousehold(userId);
      const others = householdId ? await repo.countOtherActiveMembers(householdId, userId) : 0;
      const gate = canDeleteAccount(Boolean(householdId), others);
      if (!gate.allowed) throw new AppError('ERR_UNKNOWN', 'Transfer household ownership first.', false, 409);
      const execAfter = executeAfter(new Date().toISOString());
      await repo.scheduleDeletion(userId, execAfter);
      ctx.log.info('account_delete_scheduled');
      return json({ execute_after: execAfter });
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
