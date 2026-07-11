/**
 * TanStack Query client (TDD Part 4 §4.3). Server data lives here — never copied
 * into Zustand. Persistence to MMKV (§6.1) is wired during the offline-queue task;
 * this establishes the client + sane defaults so providers can mount.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Long for deterministic panchang/calendar; per-entity overrides set at the hook (§4.3).
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Offline mutations enqueue in STORE_offlineQueue rather than firing directly (§6.3).
      retry: 0,
    },
  },
});
