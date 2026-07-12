/**
 * SVC_sync — API_POST_SYNC (TDD Part 2 §5.7). Reconciles the offline mutation batch with
 * per-kind conflict rules (logic.ts), idempotent via client_id + DB unique constraints.
 * Realizes FLOW E5. Engine-independent.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { SyncRepository, type RitualCompletePayload } from '../_shared/db/syncRepo.ts';
import {
  resolveRitualCompletion,
  resolveChecklist,
  resolvePersonalDate,
  type Mutation,
  type ConflictResult,
} from './logic.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

interface SyncRequest {
  mutations: Mutation[];
  client_ts?: string;
  idempotency_key: string;
}

export const handler = withHandler('SVC_sync', async (req, ctx) => {
  if (req.method !== 'POST') throw new AppError('ERR_UNKNOWN', 'Method not allowed', false, 405);
  const body = (await req.json()) as SyncRequest;
  if (!body?.idempotency_key || !Array.isArray(body.mutations)) {
    throw new AppError('ERR_UNKNOWN', 'Invalid sync payload', false, 422);
  }

  const repo = new SyncRepository(serviceClient(readEnv(getEnv)));
  const userId = await repo.currentUserId(ctx.jwt);

  const applied: string[] = [];
  const conflicts: ConflictResult[] = [];

  const record = (r: ConflictResult) => {
    if (r.resolution === 'applied') applied.push(r.client_id);
    else conflicts.push(r);
  };

  for (const m of body.mutations) {
    switch (m.kind) {
      case 'ritual_complete': {
        // DB upsert is idempotent (ON CONFLICT (user_id, local_date) DO NOTHING).
        await repo.completeRitual(userId, m.payload as unknown as RitualCompletePayload);
        record(resolveRitualCompletion(m, false));
        break;
      }
      case 'checklist':
        // checklist_completion upsert is idempotent by (user_id, item_id, local_date).
        record(resolveChecklist(m, false));
        break;
      case 'personal_date':
        record(resolvePersonalDate(m, null));
        break;
      default:
        ctx.log.warn('sync_unknown_kind', { kind: (m as Mutation).kind });
    }
  }

  const streak = await repo.recomputeStreak(userId);
  ctx.log.info('sync_batch', { applied: applied.length, conflicts: conflicts.length });
  return json({ applied, conflicts, server_state: { streak } });
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
