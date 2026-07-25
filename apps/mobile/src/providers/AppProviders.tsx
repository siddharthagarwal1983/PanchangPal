/**
 * App-wide providers (TDD Part 4 §3.1 root layout, §4). Composition root: safe-area,
 * TanStack Query (server state), the Design System ThemeProvider (@panchangpal/ui), i18n,
 * and the app-level ErrorBoundary. Non-critical init (analytics flush, Realtime, RC) is
 * deferred post-first-paint in later tasks (§8.3).
 */
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@panchangpal/ui';
import { queryClient } from '../data/queryClient';
import { ErrorBoundary } from '../navigation/ErrorBoundary';
import { useTimeZoneSync } from '../data/hooks/useTimeZoneSync';
import { installGlobalErrorHandler } from './installGlobalErrorHandler';
import { installAnalyticsFlushOnBackground } from '../data/analyticsAdapter';
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
  // In an effect rather than at module scope: an eager side effect on import is the exact shape of
  // defect that took down the ritual screen and nine repositories (§8.3 also wants non-critical
  // init deferred past first paint). Render-phase errors are the ErrorBoundary's job regardless,
  // and installGlobalErrorHandler is idempotent, so installing a tick late costs nothing.
  useEffect(() => {
    installGlobalErrorHandler();
  }, []);

  // Send queued analytics before the OS may freeze or kill the process. The batch queue is in
  // memory (ADR-013 batching, but no user-behaviour data on disk — ADR-031), so backgrounding is
  // the last reliable moment to flush it.
  useEffect(() => installAnalyticsFlushOnBackground(), []);

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
