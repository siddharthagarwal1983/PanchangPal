/**
 * Supabase client factories (TDD Part 2 §5.0). Two clients:
 *  - serviceClient(): service role — bypasses RLS by design, used ONLY for privileged
 *    operations documented as service-only (entitlements, invite accept, sync,
 *    notifications, deletion, merge). Never exposed to the client.
 *  - userClient(jwt): acts as the caller under RLS (anon/authenticated) — the default
 *    for anything that should respect the caller's policies.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ServerEnv } from './env.ts';

export function serviceClient(env: ServerEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function userClient(env: ServerEnv, jwt: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
