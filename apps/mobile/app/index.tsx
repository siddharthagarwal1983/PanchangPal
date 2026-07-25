/**
 * SCR_SPLASH_001 — Splash + bootstrap (TDD Part 4 §3.1/§8.3). Initializes the session
 * (restore or anonymous sign-in, ADR-009), then routes via the onboarding gate
 * (src/navigation/guards.ts). Shows the brand splash while bootstrapping (< 1s budget,
 * NFR-01). No business logic in the view — bootstrap is delegated to STORE_session.
 */
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { SplashBackdrop, BrandLogo, Spinner } from '@panchangpal/ui';
import { useSessionStore } from '../src/store/session';
import { resolveRootRoute } from '../src/navigation/guards';
import { isOnboarded } from '../src/data/onboardingRepository';
import { t } from '../src/i18n';

export default function Splash() {
  const status = useSessionStore((s) => s.status);
  const bootstrap = useSessionStore((s) => s.bootstrap);

  // Read once per mount rather than on every render: it is a storage read on the launch path
  // (< 1s budget, NFR-01), and the value cannot change while this screen is mounted — completing
  // onboarding navigates away from it.
  //
  // This replaces `const ONBOARDED = true`, which made the gate unconditional: SCR_AUTH_001 never
  // rendered from a cold launch, and FLOW_ONBOARDING could not be written.
  const [onboarded] = useState(isOnboarded);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const route = resolveRootRoute({ status, onboarded });
  if (route === 'tabs') return <Redirect href="/(tabs)/today" />;
  if (route === 'onboarding') return <Redirect href="/(onboarding)/sign-in" />;

  return (
    <SplashBackdrop testID="splash">
      <BrandLogo />
      <Spinner label={t('splash.loading')} />
    </SplashBackdrop>
  );
}
