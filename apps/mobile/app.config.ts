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
  // Store identity. Required by `eas build` in non-interactive mode, and the anchor for
  // signing certificates, RevenueCat products, and App/Android App Links.
  //
  // CHANGEABLE UNTIL THE FIRST STORE SUBMISSION, PERMANENT AFTER. Once an app ships under
  // these identifiers they cannot be altered — a different one is a new store listing that
  // loses existing installs and reviews. Revisit before B3's submit step, not after.
  // `com.panchangpal.*` deliberately does not claim a domain the project may not own.
  android: { package: 'com.panchangpal.app' },
  ios: { bundleIdentifier: 'com.panchangpal.app' },
  // Hermes is MANDATORY per TDD Part 5 §2.3. It is already the SDK 54 default (and the
  // only engine supported under the New Architecture) — `expo export` emits .hbc bytecode —
  // but it is stated explicitly so a future default change cannot silently drop it.
  jsEngine: 'hermes',
  // Config plugins required from SDK 54 — these packages now ship native config that must
  // be declared explicitly (previously autolinked). `expo install` cannot write to a
  // dynamic (.ts) config, so they are maintained here by hand.
  plugins: ['expo-localization', 'expo-router', 'expo-secure-store'],
  // OTA (TDD Part 5 §2.4 [MANDATORY]). `eas update:configure` cannot write to a dynamic
  // .ts config, so this is maintained by hand — as with `plugins` and the EAS project id.
  updates: {
    url: 'https://u.expo.dev/cbe97143-a335-4b27-a144-006d5cbfca91',
  },
  // §2.4 forbids shipping native-module or config-plugin changes over OTA, and requires every
  // update to be tied to a runtime version. The `fingerprint` policy ENFORCES that rather than
  // relying on discipline: the runtime version is derived from the native project, so an update
  // built against different native dependencies gets a different fingerprint and is simply not
  // delivered to existing builds. `appVersion` would permit exactly the mismatch §2.4 forbids.
  // The TDD does not name a policy; this is the choice that makes its rule mechanical.
  runtimeVersion: { policy: 'fingerprint' },
  extra: {
    // EAS project linkage (TDD Part 5 §2.3). `eas init` cannot write to a dynamic .ts
    // config, so it is recorded by hand — the same limitation that applies to `plugins`
    // above. Not a secret: this ID identifies the project, it does not authorize anything
    // (EXPO_ACCESS_TOKEN does that, and lives only in CI secrets).
    eas: { projectId: 'cbe97143-a335-4b27-a144-006d5cbfca91' },
    // Populated from EXPO_PUBLIC_* env at build time (TDD Part 1 §7.2).
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    revenueCatKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
};

export default config;
