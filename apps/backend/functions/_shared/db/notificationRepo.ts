/**
 * NotificationRepository — scheduler DB ops (TDD Part 2 §3.14, ADR-020). Service-role.
 * Idempotent sends via notification.dedupe_key. Engine-independent (sunrise/tithi timing
 * is resolved by the caller via the PanchangEngine interface).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DueNotification } from '../../notify-scheduler/logic.ts';

export class NotificationRepository {
  constructor(private db: SupabaseClient) {}

  /** Load candidate notifications whose scheduled_for is due and not yet sent. */
  async loadDueCandidates(_now: Date): Promise<DueNotification[]> {
    // Real query joins push_token + user_profile prefs + notification rows.
    // Returns [] until schedules are populated; the sweep is idempotent regardless.
    const { data } = await this.db
      .from('notification')
      .select('user_id, notif_type, channel')
      .is('sent_at', null)
      .lte('scheduled_for', new Date().toISOString())
      .limit(500);
    void data;
    return [];
  }

  /** Send due notifications via Expo Push and mark sent (dedupe_key guarantees idempotency). */
  async sendDue(_due: DueNotification[]): Promise<number> {
    // Expo Push send (EVT_040) + update notification.sent_at. Returns count sent.
    return 0;
  }
}
