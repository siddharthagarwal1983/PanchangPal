import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Root Vitest config (TDD Part 1 §3 #17 — Vitest for Edge Functions). Runs the pure,
 * Deno-free logic tests across packages/* and apps/backend/functions/* (conflict rules,
 * RC mapping, merge/deletion gating, panchang cache key, retrieval confidence gate).
 * Edge Function handlers (index.ts, Deno globals) are integration-tested separately.
 * The mobile app uses jest-expo (apps/mobile), not Vitest.
 */
export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/backend/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@panchangpal/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@panchangpal/ai': path.resolve(__dirname, 'packages/ai/src/index.ts'),
      '@panchangpal/api': path.resolve(__dirname, 'packages/api/src/index.ts'),
    },
  },
});
