/**
 * Root Expo Router layout (TDD Part 4 §3.1). Mounts app-wide providers and the top-level
 * stack: the onboarding/auth group (no tab bar) and the (tabs) group. Deep linking is
 * derived from the file tree (src/navigation/linking.ts documents the entry table). The
 * splash/bootstrap gate lives in app/index.tsx.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../src/providers/AppProviders';

export { ErrorBoundary } from 'expo-router'; // per-route error boundary (TDD Part 4 §5.3)

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProviders>
  );
}
