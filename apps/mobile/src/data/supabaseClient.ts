/**
 * Supabase client (client-side, TDD Part 4 §10.1). Uses ONLY the public anon key
 * (EXPO_PUBLIC_*); no secrets on device (ADR-030). RLS is the authorization boundary
 * (ADR-018). JWT is held in memory; refreshed silently. This is the single client the
 * data layer wraps — features/domain never call supabase-js directly.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = extra.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}
