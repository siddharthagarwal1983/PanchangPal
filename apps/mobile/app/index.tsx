/**
 * SCR_SPLASH_001 — Splash + bootstrap (TDD Part 4 §3.1/§8.3). Initializes the session
 * (restore or anonymous sign-in, ADR-009), then routes via the onboarding gate
 * (src/navigation/guards.ts). Shows the brand splash while bootstrapping (< 1s budget,
 * NFR-01). No business logic in the view — bootstrap is delegated to STORE_session.
 */
import { useEffect, useRef, useState } from 'react';
import { Redirect } from 'expo-router';
import { SplashBackdrop, BrandLogo, Spinner } from '@panchangpal/ui';
import { useSessionStore } from '../src/store/session';
import { resolveRootRoute } from '../src/navigation/guards';
import { isOnboarded } from '../src/data/onboardingRepository';
import { getAnalyticsService } from '../src/data/analyticsAdapter';
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

  // EVT_003 Onboarding Started (PDD §3.0.1) — fired HERE, at the gate, and deliberately not on
  // SCR_AUTH_001 itself.
  //
  // ⚠️ SIGN-IN IS REACHED FROM FOUR PLACES, AND ONLY ONE OF THEM IS ONBOARDING. The You tab, the
  // invite flow and the household screen all push `/(onboarding)/sign-in` for a signed-out user
  // who onboarded weeks ago. Tracking on that screen would put long-since-activated users into
  // the TOP of the activation funnel — the inflated-denominator failure B8.3 avoided, and worse
  // here, because §11.3 measures activation as a RATE and a bloated denominator drags it toward
  // zero while looking like a conversion problem.
  //
  // The gate is the honest place: `onboarded` comes from the persisted flag, so this fires for a
  // user who has genuinely not completed onboarding, once per launch until they do.
  const started = useRef(false);
  useEffect(() => {
    if (route !== 'onboarding' || started.current) return;
    started.current = true;
    getAnalyticsService().track('EVT_003');
  }, [route]);

  if (route === 'tabs') return <Redirect href="/(tabs)/today" />;
  if (route === 'onboarding') return <Redirect href="/(onboarding)/sign-in" />;

  return (
    <SplashBackdrop testID="splash">
      <BrandLogo />
      <Spinner label={t('splash.loading')} />
    </SplashBackdrop>
  );
}
