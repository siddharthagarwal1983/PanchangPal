/**
 * App-wide providers (TDD Part 4 §3.1 root layout, §4). Composition root that mounts
 * server-state (TanStack Query), theming, i18n, and safe-area context. Non-critical
 * init (analytics flush, Realtime subscribe, RC configure) is deferred until after
 * first paint in the relevant subsystem tasks (§8.3).
 */
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../data/queryClient';
import { ThemeProvider } from '../theme/ThemeProvider';
import '../i18n';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
