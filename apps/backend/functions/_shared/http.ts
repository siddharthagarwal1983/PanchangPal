/**
 * HTTP helpers for Edge Functions: JSON responses, CORS, and SSE (ADR-019 streaming).
 * The error envelope is applied at the handler boundary (see withHandler in auth.ts).
 */
import { toEnvelope, httpStatusFor } from './errors.ts';
import {
  NullServerTelemetry,
  toServerErrorReport,
  type ServerTelemetry,
} from './telemetry.ts';
import { SentryServerTelemetry } from './sentryServerTelemetry.ts';

/**
 * The server telemetry client (TDD Part 5 §7.1). Module-level rather than threaded through every
 * handler: `errorResponse` is the one place every ERR_* passes through, which is exactly why the
 * report belongs here.
 *
 * Resolved from `SENTRY_DSN` at module load. With no DSN — the state today — this is
 * `NullServerTelemetry` and the Sentry SDK is never even imported, so functions boot exactly as
 * they did before (see `sentryServerTelemetry.ts` for why that matters when every function shares
 * this module). `Deno` is read defensively so the module still loads under Vitest, where the pure
 * logic beside it is tested.
 */
function resolveTelemetry(): ServerTelemetry {
  const dsn = (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env
    ?.get('SENTRY_DSN');
  if (!dsn) return new NullServerTelemetry();

  const environment =
    (globalThis as { Deno?: { env: { get(k: string): string | undefined } } }).Deno?.env?.get(
      'SENTRY_ENVIRONMENT',
    ) ?? 'production';
  return new SentryServerTelemetry(dsn, environment);
}

let telemetry: ServerTelemetry = resolveTelemetry();

/** Test/DI seam — inject a spy, or the real client at composition time. */
export function setServerTelemetry(next: ServerTelemetry): void {
  telemetry = next;
}

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-revenuecat-signature, x-panchangpal-api-version, idempotency-key',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders, ...extra },
  });
}

/**
 * The single exit for a failed request: the wire envelope, the correlation-id header, and — since
 * B4.3 — the telemetry report (§7.1). `fn` names the Edge Function; it defaults rather than being
 * required so existing call sites keep working, but passing it makes a report attributable.
 *
 * Reporting is wrapped: a telemetry fault must never turn a handled 400 into an unhandled 500.
 */
export function errorResponse(err: unknown, correlationId: string, fn = 'unknown'): Response {
  try {
    telemetry.captureError(toServerErrorReport(err, { fn, correlationId }), err);
  } catch {
    // Deliberately silent — the response below, and the structured error log, still happen.
  }
  return json(toEnvelope(err, correlationId), httpStatusFor(err), {
    'x-correlation-id': correlationId,
  });
}

export function preflight(): Response {
  return new Response('ok', { headers: corsHeaders });
}

/**
 * SSE stream helper (API_POST_ASK_GURU, TDD Part 2 §5.4 / Part 3 §6.2). Caller pushes
 * typed events; `token` | `sources` | `done`. Never present a half-sentence as complete
 * on error (PDD §9.4) — the caller discards partials rather than closing mid-answer.
 */
export function sse(
  produce: (send: (event: Record<string, unknown>) => void) => Promise<void>,
  correlationId: string,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      try {
        await produce(send);
      } catch (err) {
        // Terminal error event — no fabricated content (ADR-019).
        send({ type: 'done', outcome: 'error', error_code: 'ERR_AI_ERROR' });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'x-correlation-id': correlationId,
      ...corsHeaders,
    },
  });
}
