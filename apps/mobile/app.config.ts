import type { ExpoConfig } from 'expo/config';
/**
 * Expo config (TDD Part 1 §2.3/§3). Deep-link scheme `panchangpal://` powers the
 * notification/invite/referral flows (FLOW D4). Public config only — no secrets on
 * device (ADR-030); server secrets live in Edge Function / EAS / CI stores.
 */
const config: ExpoConfig = {
  name: 'PanchangPal',
  slug: 'panchangpal',
  scheme: 'panchangpal',
  version: '0.1.0',
  orientation: 'portrait',
  platforms: ['ios', 'android'],
  // Hermes is MANDATORY per TDD Part 5 §2.3. It is already the SDK 54 default (and the
  // only engine supported under the New Architecture) — `expo export` emits .hbc bytecode —
  // but it is stated explicitly so a future default change cannot silently drop it.
  jsEngine: 'hermes',
  // Config plugins required from SDK 54 — these packages now ship native config that must
  // be declared explicitly (previously autolinked). `expo install` cannot write to a
  // dynamic (.ts) config, so they are maintained here by hand.
  plugins: ['expo-localization', 'expo-router', 'expo-secure-store'],
  extra: {
    // Populated from EXPO_PUBLIC_* env at build time (TDD Part 1 §7.2).
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    revenueCatKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
};

export default config;
