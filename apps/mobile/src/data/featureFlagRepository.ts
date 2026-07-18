/**
 * featureFlagRepository — gateway for the `feature_flag` table (ADR-021, TDD Part 1 §7.3;
 * migration 20260712000080_platform). Flags are PUBLIC-READ (`feature_flag_sel_public`) and
 * read-only on the client — the app never writes a flag. Post-v1 `FF_*` flags default OFF, so an
 * unknown, missing, or unreadable flag reads as DISABLED (fail-closed): a flag never turns a
 * feature on by accident.
 *
 * Features call this only through HOOK_useFeatureFlag, never supabase-js directly.
 */
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { FeatureFlag } from '@panchangpal/shared';
import { getSupabase } from './supabaseClient';
import { nextChannelId } from './realtimeChannelId';

const TABLE = 'feature_flag';
const COLUMNS = 'key, enabled';

interface FeatureFlagRow {
  key?: unknown;
  enabled?: unknown;
}

/** The enabled set, keyed by flag. Absent key = disabled. */
export type FeatureFlagMap = Partial<Record<FeatureFlag, boolean>>;

/** rows → map. `enabled` is strict: only a real boolean true enables (never coerced). */
export function rowsToFlagMap(rows: FeatureFlagRow[] | null | undefined): FeatureFlagMap {
  const map: FeatureFlagMap = {};
  if (!Array.isArray(rows)) return map;
  for (const row of rows) {
    if (typeof row.key === 'string') map[row.key as FeatureFlag] = row.enabled === true;
  }
  return map;
}

export class FeatureFlagRepository {
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  /** Read all flags (public select). Throws on transport error; callers fail closed. */
  async getFlags(): Promise<FeatureFlagMap> {
    const { data, error } = await this.db.from(TABLE).select(COLUMNS);
    if (error) throw error;
    return rowsToFlagMap(data as FeatureFlagRow[] | null);
  }

  /**
   * Subscribe to flag changes so a remote toggle reaches the client without a relaunch
   * (ADR-021 Realtime invalidation). `onChange` is a refetch signal, not a data source. The caller
   * MUST invoke the returned unsubscribe on unmount to save battery.
   */
  subscribeFlags(onChange: () => void): () => void {
    // Per-subscription topic suffix — see realtimeChannelId.ts for why reusing a fixed
    // topic throws "cannot add `postgres_changes` callbacks ... after `subscribe()`".
    const channel: RealtimeChannel = this.db
      .channel(`feature_flag:all:${nextChannelId()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => onChange())
      .subscribe();
    return () => {
      void this.db.removeChannel(channel);
    };
  }
}

let defaultRepository: FeatureFlagRepository | null = null;

export function getFeatureFlagRepository(): FeatureFlagRepository {
  if (!defaultRepository) defaultRepository = new FeatureFlagRepository();
  return defaultRepository;
}
