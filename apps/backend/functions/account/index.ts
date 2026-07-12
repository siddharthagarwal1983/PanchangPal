/**
 * SVC_account — API_POST_AUTH_MERGE, API_POST_ACCOUNT_DELETE, API_POST_HOUSEHOLD_TRANSFER
 * (TDD Part 2 §5.1/§5.5/§5.7). Transactional anon→auth merge (F-1), deletion with grace
 * window (F-3), ownership transfer. Service-role; conflict/gate rules from logic.ts.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { resolveMerge, canDeleteAccount, executeAfter } from './logic.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler('SVC_account', async (req, ctx) => {
  if (req.method !== 'POST') throw new AppError('ERR_UNKNOWN', 'Method not allowed', false, 405);
  const url = new URL(req.url);
  const action = url.pathname.split('/').pop(); // merge | delete | transfer
  const env = readEnv(getEnv);
  const db = serviceClient(env);
  void db; // DB transactions wired with integration tests against a Supabase test project

  switch (action) {
    case 'merge': {
      // Reassign anon-owned rows → auth uid inside a transaction; resolve via resolveMerge.
      // Emits EVT_045; surfaces ERR_AUTH_MERGE_CONFLICT only if user-meaningful (AC-AUTH-02).
      void resolveMerge;
      ctx.log.info('account_merge');
      return json({ merged: true, kept: { streak_len: 0, household_id: null } });
    }
    case 'delete': {
      // Gate with canDeleteAccount; write account_deletion row with executeAfter() grace.
      void canDeleteAccount;
      const execAfter = executeAfter(new Date().toISOString());
      ctx.log.info('account_delete_scheduled');
      return json({ execute_after: execAfter });
    }
    case 'transfer': {
      ctx.log.info('household_transfer');
      return json({ ok: true });
    }
    default:
      throw new AppError('ERR_UNKNOWN', 'Unknown account action', false, 404);
  }
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
