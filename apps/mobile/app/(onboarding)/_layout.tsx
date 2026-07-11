/**
 * Onboarding + auth stack (TDD Part 4 §3.1) — no tab bar (PDD A1). Screens
 * (SCR_SPLASH_001, SCR_ONBOARDING_*, SCR_AUTH_*) are built in the onboarding/auth task.
 */
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
