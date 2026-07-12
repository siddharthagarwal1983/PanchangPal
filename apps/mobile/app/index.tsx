/**
 * SCR_SPLASH_001 — Splash + bootstrap (TDD Part 4 §3.1/§8.3). Initializes the session
 * (restore or anonymous sign-in, ADR-009), then routes via the onboarding gate
 * (src/navigation/guards.ts). Shows the brand splash while bootstrapping (< 1s budget,
 * NFR-01). No business logic in the view — bootstrap is delegated to STORE_session.
 */
import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { SplashBackdrop, BrandLogo, Spinner } from '@panchangpal/ui';
import { useSessionStore } from '../src/store/session';
import { resolveRootRoute } from '../src/navigation/guards';
import { t } from '../src/i18n';

// Onboarding completion is persisted (MMKV) in the onboarding task; the shell assumes
// onboarded once a non-loading session exists (deferred-auth: anon users reach tabs).
const ONBOARDED = true;

export default function Splash() {
  const status = useSessionStore((s) => s.status);
  const bootstrap = useSessionStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const route = resolveRootRoute({ status, onboarded: ONBOARDED });
  if (route === 'tabs') return <Redirect href="/(tabs)/today" />;
  if (route === 'onboarding') return <Redirect href="/(onboarding)/sign-in" />;

  return (
    <SplashBackdrop testID="splash">
      <BrandLogo />
      <Spinner label={t('splash.loading')} />
    </SplashBackdrop>
  );
}
