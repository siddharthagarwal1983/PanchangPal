/**
 * HOOK_useFeatureFlag (ADR-021, TDD Part 1 §7.3). Reads the public `feature_flag` table once at
 * launch, caches it, and invalidates on Realtime change so a remote toggle lands without a
 * relaunch. Flags are read-only on the client.
 *
 * FAILS CLOSED: while loading, on error, and for any key absent from the table, the flag reads
 * `false`. Post-v1 features stay off unless the server explicitly says otherwise — the opposite
 * default would leak unreleased scope.
 */
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { FeatureFlag } from '@panchangpal/shared';
import { getFeatureFlagRepository, type FeatureFlagMap } from '../featureFlagRepository';

export const FEATURE_FLAGS_KEY = ['feature-flags'] as const;

/** The whole flag map. Rarely needed directly — prefer `useFeatureFlag(key)`. */
export function useFeatureFlags() {
  const qc = useQueryClient();

  const query = useQuery<FeatureFlagMap>({
    queryKey: FEATURE_FLAGS_KEY,
    queryFn: () => getFeatureFlagRepository().getFlags(),
    // Flags change rarely and Realtime covers the urgent case; keep launch traffic minimal.
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = getFeatureFlagRepository().subscribeFlags(() => {
      void qc.invalidateQueries({ queryKey: FEATURE_FLAGS_KEY });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}

/** True only when the server reports the flag enabled. Fails closed while loading/on error. */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { data } = useFeatureFlags();
  return data?.[flag] === true;
}
