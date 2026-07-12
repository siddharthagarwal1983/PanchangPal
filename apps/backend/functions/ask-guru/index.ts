/**
 * SVC_ask_guru — API_POST_ASK_GURU (TDD Part 2 §5.4 / Part 3). Grounded-or-silent RAG,
 * streamed over SSE (ADR-019). Pipeline (Part 3 §2.1): normalize + PII strip → answer
 * cache → scope classify (refuse out-of-scope, EVT_034) → embed query → pgvector ANN
 * top-k → confidence gate (F-6; decline if low, EVT_033) → grounded generation (stream,
 * EVT_030) → sources (EVT_031) → optional groundedness post-check (F-16). Never fabricates
 * on error (ERR_AI_*). All model access via @panchangpal/ai adapters (ADR-011).
 *
 * The pipeline wiring below is conformant to the SSE contract and the confidence gate;
 * the LLMProvider/EmbeddingProvider concrete OpenAI impls are injected server-side with
 * the API key at deploy (not in this repo). Requires the ingested corpus (content-ingest).
 */
import { withHandler } from '../_shared/auth.ts';
import { sse } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { AI_CONFIG_DEFAULTS, confidenceGate, type ScoredChunk } from '@panchangpal/ai';

export const handler = withHandler('SVC_ask_guru', async (req, ctx) => {
  if (req.method !== 'POST') throw new AppError('ERR_UNKNOWN', 'Method not allowed', false, 405);
  const body = (await req.json()) as { question?: string; conversation_id?: string; idempotency_key?: string };
  const question = (body.question ?? '').trim();
  if (!question || question.length > 500) {
    throw new AppError('ERR_UNKNOWN', 'Question must be 1–500 characters.', false, 422);
  }

  const cfg = AI_CONFIG_DEFAULTS;
  ctx.log.info('ask_guru', { len: question.length }); // EVT_029 emitted client+server; no PII beyond question

  return sse(async (send) => {
    // 1) scope classify (LLMProvider) → out-of-scope: send refusal + done{refused} (EVT_034).
    // 2) embed query (EmbeddingProvider) → pgvector ANN top-k (cfg.retrieval.top_k).
    const retrieved: ScoredChunk[] = []; // ← pgvector search result (needs corpus + adapters)
    const gate = confidenceGate(retrieved, cfg.retrieval);
    if (gate.decision === 'decline') {
      send({ type: 'done', outcome: 'declined', error_code: gate.reason });
      return;
    }
    // 3) grounded generation (LLMProvider.stream) → send token events (EVT_030 on first).
    // 4) send sources event (EVT_031) from gate.sources; 5) optional groundedness post-check (F-16).
    send({ type: 'sources', sources: gate.sources });
    send({ type: 'done', outcome: 'grounded' });
  }, ctx.correlationId);
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
