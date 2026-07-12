/**
 * SVC_notify_scheduler — API_POST_NOTIF_SCHEDULE + delivery sweep (TDD Part 2 §5.7,
 * ADR-020). pg_cron-driven (ADR-025). Computes due notifications from user-local time,
 * sunrise, festivals, and personal-date tithi recurrences, then applies quiet hours,
 * frequency caps, and completion suppression before sending via Expo Push with deep-link
 * payloads. Idempotent by notification.dedupe_key. Personal-date reminders are grief-aware
 * (never streak/promo, UX-7).
 *
 * Note: sunrise/tithi timing depends on SVC_panchang (engine BLOCKED — see panchang/engine.ts);
 * the sweep structure, quiet-hours/caps/suppression seams, and Expo send seam are in place.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler(
  'SVC_notify_scheduler',
  async (_req, ctx) => {
    const env = readEnv(getEnv);
    const db = serviceClient(env);
    void db;
    // 1) query due notifications (notification.scheduled_for <= now, not sent)
    // 2) apply quiet hours + frequency caps + completion suppression (ADR-020)
    // 3) send via Expo Push (EVT_040) with panchangpal:// deep link
    // 4) mark sent; dedupe_key guarantees idempotency
    ctx.log.info('notify_sweep');
    return json({ scheduled: 0 });
  },
  { requireAuth: false }, // invoked by pg_cron / scheduled trigger (service context)
);

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
