/**
 * Root Expo Router layout (TDD Part 4 §3.1). Mounts app-wide providers and the top-level
 * stack: the onboarding/auth group (no tab bar) and the (tabs) group. Deep linking is
 * derived from the file tree (src/navigation/linking.ts documents the entry table). The
 * splash/bootstrap gate lives in app/index.tsx.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../src/providers/AppProviders';
import { useNotificationRouting } from '../src/navigation/useNotificationRouting';

export { ErrorBoundary } from 'expo-router'; // per-route error boundary (TDD Part 4 §5.3)

export default function RootLayout() {
  // Route notification taps to a valid back-stack (TDD §7.2/§3.3). No-op with the Null adapter.
  useNotificationRouting();
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        {/* Overlay routes (§3.1 modal/*): the contextual paywall sheet. Transparent so the
            surface it was opened from stays visible behind the scrim; always dismissible. */}
        <Stack.Screen
          name="modal/paywall"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack>
    </AppProviders>
  );
}
