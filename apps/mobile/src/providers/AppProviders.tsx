/**
 * App-wide providers (TDD Part 4 §3.1 root layout, §4). Composition root: safe-area,
 * TanStack Query (server state), the Design System ThemeProvider (@panchangpal/ui), i18n,
 * and the app-level ErrorBoundary. Non-critical init (analytics flush, Realtime, RC) is
 * deferred post-first-paint in later tasks (§8.3).
 */
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@panchangpal/ui';
import { queryClient } from '../data/queryClient';
import { ErrorBoundary } from '../navigation/ErrorBoundary';
import { useTimeZoneSync } from '../data/hooks/useTimeZoneSync';
import '../i18n';

/**
 * Adopts the device time zone into the profile when it has none (ADR-026, issue #30).
 *
 * A renderless child rather than a call in AppProviders' own body: the hook reads TanStack
 * Query, so it must sit INSIDE QueryClientProvider, and a component that renders nothing keeps
 * the sync from re-rendering the whole tree when the mutation settles.
 */
function TimeZoneSync() {
  useTimeZoneSync();
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider appearance="system">
          <ErrorBoundary>
            <TimeZoneSync />
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
