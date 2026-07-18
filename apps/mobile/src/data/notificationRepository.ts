/**
 * notificationRepository — gateway for MOD_notifications (TDD Part 2 §5.7 / Part 4 §7.2; openapi
 * API_POST_NOTIF_TOKEN, API_POST_NOTIF_SCHEDULE, API_GET/PATCH_PREFERENCES). Owner-only access:
 *  - push token: upsert `push_token` via supabase-js under RLS (user_id = auth.uid(), ADR-018) —
 *    x-impl: supabase-js (no Edge Function, no service role on device);
 *  - notif prefs: read/write the `user_profile.notif_prefs` JSON column via supabase-js;
 *  - schedule: functions.invoke('notify/schedule', …) → SVC_notify_scheduler (server-authoritative;
 *    quiet hours / caps / completion suppression are applied server-side, ADR-020).
 * Features/domain call this only through the HOOK_* hooks — never supabase-js directly.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import {
  DEFAULT_NOTIF_PREFS,
  applyNotifPatch,
  notifPrefsFromBlob,
  notifPrefsToBlob,
  structuredNotifPrefs,
  type NotifPrefs,
  type NotifPrefsBlob,
  type NotifPrefsPatch,
} from '../domain/notifications';

const PROFILE_TABLE = 'user_profile';
const TOKEN_TABLE = 'push_token';

/** Read the ERR_* code an Edge Function envelope carries (falls back to the raw message). */
function errCode(error: unknown): string {
  return (error as { context?: { code?: string } })?.context?.code ?? (error as Error)?.message ?? 'ERR_UNKNOWN';
}

export class NotificationRepository {
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

  /** Owner-only read of notif_prefs; documented calm defaults when no row/blob exists yet. */
  async getPrefs(userId: string): Promise<NotifPrefs> {
    const { data, error } = await this.db
      .from(PROFILE_TABLE)
      .select('notif_prefs')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    const blob = (data as { notif_prefs?: NotifPrefsBlob } | null)?.notif_prefs ?? null;
    return notifPrefsFromBlob(blob);
  }

  /**
   * Owner-only upsert of the full notif_prefs blob (JSON column is replaced atomically). The
   * patch is merged onto the current server prefs first so partial channel toggles are safe.
   * Returns the reconciled NotifPrefs.
   */
  async updatePrefs(userId: string, patch: NotifPrefsPatch): Promise<NotifPrefs> {
    const current = await this.getPrefs(userId);
    const next = applyNotifPatch(current, patch);
    const { data, error } = await this.db
      .from(PROFILE_TABLE)
      .upsert({ user_id: userId, notif_prefs: notifPrefsToBlob(next) }, { onConflict: 'user_id' })
      .select('notif_prefs')
      .maybeSingle();
    if (error) throw error;
    const blob = (data as { notif_prefs?: NotifPrefsBlob } | null)?.notif_prefs ?? null;
    return blob ? notifPrefsFromBlob(blob) : structuredNotifPrefs(next);
  }

  /** Register/refresh the Expo push token for this device (owner-only upsert on expo_token). */
  async registerToken(userId: string, expoToken: string, platform: 'ios' | 'android'): Promise<void> {
    const { error } = await this.db
      .from(TOKEN_TABLE)
      .upsert({ user_id: userId, expo_token: expoToken, platform }, { onConflict: 'expo_token' });
    if (error) throw error;
  }

  /**
   * Ask the server to (re)compute the due notification set from the current prefs (FLOW A4).
   * The client never schedules locally; this is a hint to SVC_notify_scheduler. Idempotent
   * server-side. Returns how many notifications were scheduled.
   */
  async requestSchedule(prefs: NotifPrefs = DEFAULT_NOTIF_PREFS): Promise<{ scheduled: number }> {
    const { data, error } = await this.db.functions.invoke('notify/schedule', {
      body: notifPrefsToBlob(prefs),
    });
    if (error) throw new Error(errCode(error));
    const d = (data as { scheduled?: number } | null) ?? {};
    return { scheduled: typeof d.scheduled === 'number' ? d.scheduled : 0 };
  }
}

let defaultRepository: NotificationRepository | null = null;

export function getNotificationRepository(): NotificationRepository {
  if (!defaultRepository) defaultRepository = new NotificationRepository();
  return defaultRepository;
}
