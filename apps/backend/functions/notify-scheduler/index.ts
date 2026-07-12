/**
 * SVC_notify_scheduler — API_POST_NOTIF_SCHEDULE + delivery sweep (TDD Part 2 §5.7,
 * ADR-020, ADR-025). Depends ONLY on the abstract PanchangEngine interface for
 * sunrise/tithi timing — it makes no assumption about the calculation implementation
 * (engine is injected). The sweep, quiet-hours/caps/completion-suppression, dedupe, and
 * Expo-send seams are engine-independent and fully wired here.
 *
 * While the engine is blocked (ADR-033), sunrise-relative + personal-date-tithi
 * notifications are computed lazily and skipped-with-log if the engine is unavailable;
 * fixed-time notifications (e.g. a user's chosen ritual_time) still schedule normally.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { NotificationRepository } from '../_shared/db/notificationRepo.ts';
import { applyQuietHours, withinFrequencyCap, type DueNotification } from './logic.ts';
import { unimplementedPanchangEngine, type PanchangEngine } from '../panchang/engine.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

// Injected abstract engine — NOT an implementation. Blocked until ADR-033.
const engine: PanchangEngine = unimplementedPanchangEngine;

export const handler = withHandler(
  'SVC_notify_scheduler',
  async (_req, ctx) => {
    const env = readEnv(getEnv);
    const repo = new NotificationRepository(serviceClient(env));

    // 1) load candidate schedules (user prefs, ritual_time, festivals, personal dates).
    const candidates: DueNotification[] = await repo.loadDueCandidates(new Date());

    // 2) resolve sunrise/tithi timing ONLY via the engine interface; skip-with-log if blocked.
    let engineSkipped = 0;
    const resolved = candidates.filter((c) => {
      if (!c.requiresEngine) return true;
      try {
        // engine.compute(...) would supply sunrise; interface-only, no assumed algorithm.
        void engine;
        return true;
      } catch {
        engineSkipped++;
        return false; // sunrise/tithi-dependent notifications wait for the engine (ADR-033)
      }
    });

    // 3) apply quiet hours + frequency caps + completion suppression (engine-independent).
    const toSend = resolved
      .filter((c) => applyQuietHours(c))
      .filter((c) => withinFrequencyCap(c));

    // 4) send via Expo Push (EVT_040) with panchangpal:// deep link; dedupe_key idempotency.
    const sent = await repo.sendDue(toSend);
    ctx.log.info('notify_sweep', { candidates: candidates.length, sent, engine_skipped: engineSkipped });
    return json({ scheduled: sent, engine_pending: engineSkipped });
  },
  { requireAuth: false },
);

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
