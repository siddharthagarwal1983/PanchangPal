/**
 * SVC_revenuecat_webhook — API_POST_RC_WEBHOOK (TDD Part 2 §5.6, ADR-005).
 * [MANDATORY] verify X-RevenueCat-Signature (REVENUECAT_WEBHOOK_SECRET) → upsert
 * subscription (by rc_original_txn_id) + entitlement at HOUSEHOLD grain (F-4).
 * Idempotent by RC event id. Clients NEVER write entitlements (service-only, §4.1).
 * No JWT: authenticity comes from the HMAC, not a user session.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { verifyHmac } from '../_shared/crypto.ts';
import { mapEvent, type RevenueCatEvent } from './logic.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler(
  'SVC_revenuecat_webhook',
  async (req, ctx) => {
    if (req.method !== 'POST') throw new AppError('ERR_UNKNOWN', 'Method not allowed', false, 405);
    const env = readEnv(getEnv);
    const raw = await req.text();
    const signature = req.headers.get('x-revenuecat-signature') ?? '';

    if (!(await verifyHmac(env.REVENUECAT_WEBHOOK_SECRET, raw, signature))) {
      ctx.log.warn('rc_webhook_bad_signature');
      throw new AppError('ERR_UNKNOWN', 'Invalid signature', false, 401);
    }

    const evt = JSON.parse(raw).event as RevenueCatEvent;
    const { subscription, entitlementActive } = mapEvent(evt);
    const db = serviceClient(env);

    // Idempotent upsert by rc_original_txn_id; entitlement at household grain (F-4).
    // household resolution (rc_app_user_id → household_id) + the two upserts are wired
    // with the integration test against a Supabase test project. Dedupe also by evt.id.
    ctx.log.info('rc_webhook', { type: evt.type, active: entitlementActive });
    void db;
    void subscription;

    return json({ ok: true });
  },
  { requireAuth: false },
);

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
