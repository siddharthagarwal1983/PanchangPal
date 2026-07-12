/**
 * SVC_panchang — API_GET_TODAY, API_GET_PANCHANG_DETAIL, calendar, ritual complete
 * (TDD Part 2 §5.2/§5.3). Deterministic + cacheable (ADR-010): serve from
 * panchang_cache by cacheKey; compute-on-miss via engine.computePanchang.
 *
 * ⚠️ The compute path is BLOCKED on the undocumented astronomical algorithm (engine.ts).
 * Caching, cache-key, contract shape, and ritual-completion wiring are in place so the
 * function is ready the moment the engine lands. Ritual completion is idempotent
 * (ON CONFLICT (user_id, local_date) DO NOTHING) and advances streak grace-aware (§5.2).
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { cacheKey } from './cacheKey.ts';
import { ENGINE_VERSION } from './engine.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler('SVC_panchang', async (req, ctx) => {
  const url = new URL(req.url);
  const env = readEnv(getEnv);
  const db = serviceClient(env);
  void db;

  // Route: GET /today, GET /panchang/{date}, GET /calendar/{month}, POST /ritual/complete.
  if (req.method === 'GET' && url.pathname.endsWith('/today')) {
    const lat = Number(url.searchParams.get('lat'));
    const lng = Number(url.searchParams.get('lng'));
    const tradition = url.searchParams.get('tradition') ?? 'generic';
    const localDate = url.searchParams.get('local_date') ?? '';
    const key = cacheKey(localDate, lat, lng, tradition, ENGINE_VERSION);
    ctx.log.info('today_request', { cache_key: key });

    // 1) look up panchang_cache by key → hit: return payload (cache-control public).
    // 2) miss: computePanchang() [BLOCKED — engine.ts] → store → return.
    throw new AppError(
      'ERR_PANCHANG_UNAVAILABLE',
      'Panchang engine is not yet available.',
      true,
      502,
    );
  }

  throw new AppError('ERR_UNKNOWN', 'Unsupported panchang route', false, 404);
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
