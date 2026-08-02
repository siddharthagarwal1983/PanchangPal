/**
 * SVC_health — the uptime probe NFR-14 needs (availability ≥ 99.9% on core reads, TDD Part 5 §7.2).
 *
 * ⚠️ THIS IS THE ONLY UNAUTHENTICATED FUNCTION IN THE SYSTEM. `verify_jwt` defaults to true and
 * every other function keeps it, which is exactly why NFR-14 had no instrument: an uptime monitor
 * polling any of them anonymously measures the auth layer returning 401, not availability.
 *
 * Three consequences, all deliberate:
 *
 *   1. **It does NOT use `withHandler`.** That wrapper exists to prove a bearer token is present;
 *      requiring one here would defeat the endpoint's only purpose. Nothing else in `_shared/auth`
 *      is bypassed, because there is no identity involved at all — this endpoint reads no user data
 *      and takes no input.
 *   2. **It answers only GET (and OPTIONS).** No body is parsed, no query parameter is read.
 *      An unauthenticated endpoint that accepts input is an unauthenticated endpoint with an attack
 *      surface; this one has none to speak of.
 *   3. **It leaks nothing.** The body is a closed two-key shape built in `probe.ts`, never from the
 *      dependency error. Anything returned here is public to the internet.
 *
 * The dependency check is a real database read, not a bare 200 — see probe.ts for why a shallow
 * probe would report 99.9% through a total outage.
 */
import { corsHeaders, json, preflight } from '../_shared/http.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { evaluateHealth } from './probe.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

/**
 * Cheapest read that proves Postgres answered.
 *
 * `feature_flag` is the right table for this: it is tiny, it is read by the app at every launch, so
 * a probe against it exercises a path the product actually depends on, and it carries no user data
 * — a health check must not touch personal rows. `head: true` returns no rows at all, only status,
 * so nothing from the table can reach the response even by accident.
 */
async function databaseReachable(): Promise<boolean> {
  try {
    const db = serviceClient(readEnv(getEnv));
    const { error } = await db.from('feature_flag').select('key', { head: true, count: undefined }).limit(1);
    return !error;
  } catch {
    // Includes a missing/malformed environment, which is genuinely "not serving".
    return false;
  }
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return preflight();

  if (req.method !== 'GET') {
    return new Response(null, { status: 405, headers: { ...corsHeaders, Allow: 'GET, OPTIONS' } });
  }

  const result = evaluateHealth(await databaseReachable());

  // `no-store`: a cached 200 from a CDN would keep reporting healthy through an outage, which is
  // the failure this endpoint exists to detect.
  return json(result.body, result.httpStatus, { 'Cache-Control': 'no-store' });
};

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
