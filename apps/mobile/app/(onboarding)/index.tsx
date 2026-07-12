/**
 * Onboarding group index → redirects to the sign-in entry (SCR_AUTH_001). The splash
 * (app/index.tsx) routes here for unonboarded users; sign-in offers "Skip for now"
 * (deferred auth, UX-2). Full onboarding slides (SCR_ONBOARDING_*) are a later task.
 */
import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/sign-in" />;
}
