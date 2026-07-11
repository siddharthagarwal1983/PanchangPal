/**
 * Root Expo Router layout (TDD Part 4 §3.1). Mounts app-wide providers and the
 * top-level stack: the onboarding/auth group (no tab bar) and the (tabs) group.
 * The splash/onboarding gate (API_GET_SESSION_VALIDATE) and deep-link config are
 * added in the onboarding/auth task; this establishes the router entry + providers.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../src/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProviders>
  );
}
