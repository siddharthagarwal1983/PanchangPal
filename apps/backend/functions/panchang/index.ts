/**
 * SVC_panchang — API_GET_TODAY, API_GET_PANCHANG_DETAIL, calendar, ritual complete,
 * tithi recurrence (TDD Part 2 §5.2/§5.3). Deterministic + cacheable (ADR-010): serve
 * from panchang_cache by cacheKey; compute-on-miss via an injected PanchangEngine.
 *
 * The engine is injected as an ABSTRACT PROVIDER (engine.ts). Until the "Canonical
 * Panchang Computation Engine" decision (ADR-033) is approved, the only registered
 * engine fails closed (ERR_PANCHANG_UNAVAILABLE, never fabricated data). Caching,
 * cache-key, contract shape, and ritual-completion wiring are complete and engine-agnostic.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { cacheKey } from './cacheKey.ts';
import {
  unimplementedPanchangEngine,
  PanchangEngineUnavailableError,
  type PanchangEngine,
} from './engine.ts';
import { SyncRepository } from '../_shared/db/syncRepo.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

// The single registered engine (blocked). Swap for the approved concrete engine post-ADR-033.
const engine: PanchangEngine = unimplementedPanchangEngine;

export const handler = withHandler('SVC_panchang', async (req, ctx) => {
  const url = new URL(req.url);
  const env = readEnv(getEnv);
  const db = serviceClient(env);
  const path = url.pathname;

  // POST /ritual/complete — engine-INDEPENDENT (uses cached streak, no astronomy). Fully wired.
  if (req.method === 'POST' && path.endsWith('/ritual/complete')) {
    const body = (await req.json()) as {
      ritual_id: string; local_date: string; client_id: string; idempotency_key: string; source?: string;
    };
    if (!body?.ritual_id || !body.local_date || !body.client_id) {
      throw new AppError('ERR_UNKNOWN', 'Invalid ritual completion payload', false, 422);
    }
    const repo = new SyncRepository(db);
    const uid = await repo.currentUserId(ctx.jwt);
    const streak = await repo.completeRitual(uid, body);
    ctx.log.info('ritual_complete', { grace_used: streak.grace_used });
    return json({ streak });
  }

  // GET /today, /panchang/{date}, /calendar/{month} — engine-DEPENDENT (astronomy).
  if (req.method === 'GET' && path.endsWith('/today')) {
    const lat = Number(url.searchParams.get('lat'));
    const lng = Number(url.searchParams.get('lng'));
    const tradition = url.searchParams.get('tradition') ?? 'generic';
    const localDate = url.searchParams.get('local_date') ?? '';
    const key = cacheKey(localDate, lat, lng, tradition, engine.engineVersion);

    const repo = new SyncRepository(db);
    const cached = await repo.getPanchangCache(key);
    if (cached) return json(cached, 200, { 'cache-control': 'public, max-age=3600' });

    // Cache miss → compute. BLOCKED until ADR-033 (engine fails closed, never fabricates).
    try {
      engine.compute({ instant: `${localDate}T00:00:00Z`, lat, lng, tz: url.searchParams.get('tz') ?? 'UTC', tradition: tradition as never });
    } catch (e) {
      if (e instanceof PanchangEngineUnavailableError) {
        throw new AppError('ERR_PANCHANG_UNAVAILABLE', 'Panchang is temporarily unavailable.', true, 503);
      }
      throw e;
    }
    throw new AppError('ERR_PANCHANG_UNAVAILABLE', 'Panchang is temporarily unavailable.', true, 503);
  }

  throw new AppError('ERR_UNKNOWN', 'Unsupported panchang route', false, 404);
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
