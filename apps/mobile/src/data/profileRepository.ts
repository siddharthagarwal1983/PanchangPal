/**
 * profileRepository — API_GET/PATCH_PREFERENCES + API_POST_PROFILE gateway (TDD Part 2 §5;
 * openapi SCR_SETTINGS_001). Owner-only `user_profile` access via supabase-js RLS
 * (user_id = auth.uid(), ADR-018); no secrets on device. Features/domain call this only
 * through HOOK_usePreferences — never supabase-js directly. Read falls back to documented
 * defaults when no row exists yet (fresh anonymous profile).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import {
  DEFAULT_PREFERENCES,
  preferencesPatchToRow,
  rowToPreferences,
  type Preferences,
  type PreferencesPatch,
  type UserProfileRow,
} from '../domain/profile';

const TABLE = 'user_profile';
const COLUMNS = 'tradition_code, content_depth, appearance, ritual_time, timezone, city';

export class ProfileRepository {
  private _db?: SupabaseClient;

  // Lazy client. `getSupabase()` as a default parameter is evaluated at CONSTRUCTION, which
  // for a module-level singleton means at import — so an absent EXPO_PUBLIC_SUPABASE_URL threw
  // "supabaseUrl is required." while a route module was still evaluating, and expo-router
  // then reported "Page could not be found" instead of a calm error state. It also made these
  // repositories untestable, since importing one detonated. Resolve on first real use.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

  /** Owner-only read; returns documented defaults if the profile row does not exist yet. */
  async getPreferences(userId: string): Promise<Preferences> {
    const { data, error } = await this.db
      .from(TABLE)
      .select(COLUMNS)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return rowToPreferences((data as UserProfileRow | null) ?? null);
  }

  /** Owner-only upsert of the changed columns; returns the reconciled Preferences. */
  async updatePreferences(userId: string, patch: PreferencesPatch): Promise<Preferences> {
    const row = { user_id: userId, ...preferencesPatchToRow(patch) };
    const { data, error } = await this.db
      .from(TABLE)
      .upsert(row, { onConflict: 'user_id' })
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw error;
    // If the row is returned, trust it; otherwise reflect the optimistic patch on defaults.
    return data ? rowToPreferences(data as UserProfileRow) : { ...DEFAULT_PREFERENCES, ...patch };
  }
}

let defaultRepository: ProfileRepository | null = null;

export function getProfileRepository(): ProfileRepository {
  if (!defaultRepository) defaultRepository = new ProfileRepository();
  return defaultRepository;
}
