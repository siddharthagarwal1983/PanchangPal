/**
 * HTTP helpers for Edge Functions: JSON responses, CORS, and SSE (ADR-019 streaming).
 * The error envelope is applied at the handler boundary (see withHandler in auth.ts).
 */
import { toEnvelope, httpStatusFor } from './errors.ts';

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

export function errorResponse(err: unknown, correlationId: string): Response {
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
