/**
 * Supabase client (client-side, TDD Part 4 §10.1). Uses ONLY the public anon key
 * (EXPO_PUBLIC_*); no secrets on device (ADR-030). RLS is the authorization boundary
 * (ADR-018). The session is persisted to the device Keychain/Keystore (see below) and
 * refreshed silently. This is the single client the data layer wraps — features/domain
 * never call supabase-js directly.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import { createSecureSessionStorage } from './secureSessionStorage';

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
    auth: {
      // `storage` is REQUIRED for persistSession to mean anything in React Native. Without it
      // auth-js falls back to localStorage, which does not exist here, and then to an in-memory
      // store — so the flag asked for persistence and got memory. Because the app is anon-first
      // that lost the user's IDENTITY on every cold start, not just their login: `restore()`
      // returned null and `session.ts` minted a fresh anonymous uid, orphaning that user's
      // profile, household, streak, completions, personal dates and conversations.
      // Proven by FLOW_AUTH_SESSION_PERSISTENCE, which asserts the uid is unchanged across a
      // process restart — the assertion no existing flow made.
      storage: createSecureSessionStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}
