/**
 * Onboarding + auth stack (TDD Part 4 §3.1) — no tab bar (PDD A1). Hosts SCR_AUTH_*
 * (sign-in, OTP verify). Deferred auth: users can Skip and continue anonymously (UX-2).
 */
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
