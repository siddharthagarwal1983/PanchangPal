/**
 * Typed server-side environment access (TDD Part 5 §4.1). SERVER-ONLY secrets —
 * these never reach the device (ADR-030). Read from Supabase Edge secrets.
 */
export interface ServerEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  OPENAI_API_KEY: string;
  REVENUECAT_WEBHOOK_SECRET: string;
}

const REQUIRED: (keyof ServerEnv)[] = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
];

/** Reads and validates required env at boot. `optional` keys (OpenAI/RC) are validated by the functions that need them. */
export function readEnv(get: (k: string) => string | undefined): ServerEnv {
  const missing = REQUIRED.filter((k) => !get(k));
  if (missing.length) {
    throw new Error(`Missing required server env: ${missing.join(', ')}`);
  }
  return {
    SUPABASE_URL: get('SUPABASE_URL')!,
    SUPABASE_SERVICE_ROLE_KEY: get('SUPABASE_SERVICE_ROLE_KEY')!,
    SUPABASE_ANON_KEY: get('SUPABASE_ANON_KEY')!,
    OPENAI_API_KEY: get('OPENAI_API_KEY') ?? '',
    REVENUECAT_WEBHOOK_SECRET: get('REVENUECAT_WEBHOOK_SECRET') ?? '',
  };
}
