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
import '../i18n';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider appearance="system">
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
