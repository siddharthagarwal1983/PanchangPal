/**
 * Guru transport selection with a readiness gate (TASK M5 constraint: "do not present a live
 * answer until corpus/eval readiness permits"). While GURU_LIVE is false, the app uses the
 * UnavailableGuruTransport (honest decline), NOT the production SSE stream — even though the
 * ProductionGuruTransport is fully implemented + tested. Flipping GURU_LIVE (once the reviewed
 * corpus + eval gate pass, TDD Part 3 §9/§10B) is the only change needed to go live.
 */
import Constants from 'expo-constants';
import type { GuruTransport } from './GuruTransport';
import { UnavailableGuruTransport } from './GuruTransport';
import { ProductionGuruTransport } from './ProductionGuruTransport';
import { getSupabase } from '../../data/supabaseClient';

/** Launch-safe: live Ask Guru answers are OFF until corpus/eval readiness (§10B). */
export const GURU_LIVE = false;

export function getGuruTransport(): GuruTransport {
  if (!GURU_LIVE) return new UnavailableGuruTransport();

  const extra = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string; supabaseAnonKey?: string };
  const base = extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = extra.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return new ProductionGuruTransport({
    url: `${base.replace('.supabase.co', '.functions.supabase.co')}/ask-guru`,
    anonKey,
    getJwt: async () => (await getSupabase().auth.getSession()).data.session?.access_token ?? null,
  });
}
