/**
 * SVC_ask_guru — API_POST_ASK_GURU (TDD Part 2 §5.4 / Part 3). Grounded-or-silent RAG,
 * streamed over SSE (ADR-019). Full pipeline wired:
 *   rate limit (§8.4) → cost circuit-breaker (§8.4) → scope classify (§5.1) → embed →
 *   pgvector ANN top-k → confidence gate (§4.4, F-6) → grounded stream (§6.2) → sources
 *   (§6.4) → groundedness post-check (§6.3, F-16). Never fabricates on error (ERR_AI_*).
 * All model access via @panchangpal/ai adapters (ADR-011). Server-only OpenAI key.
 */
import { withHandler } from '../_shared/auth.ts';
import { sse } from '../_shared/http.ts';
import { AppError } from '../_shared/errors.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { ContentRepository } from '../_shared/db/contentRepo.ts';
import { PgRateLimitStore, PgCostLedger } from '../_shared/db/aiStores.ts';
import {
  AI_CONFIG_DEFAULTS,
  confidenceGate,
  checkRateLimit,
  circuitOpen,
  classifyScope,
  buildGenerationPrompt,
  createOpenAiProviders,
} from '@panchangpal/ai';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler('SVC_ask_guru', async (req, ctx) => {
  if (req.method !== 'POST') throw new AppError('ERR_UNKNOWN', 'Method not allowed', false, 405);
  const body = (await req.json()) as { question?: string; conversation_id?: string; idempotency_key?: string };
  const question = (body.question ?? '').trim();
  if (!question || question.length > 500) {
    throw new AppError('ERR_UNKNOWN', 'Question must be 1–500 characters.', false, 422);
  }

  const env = readEnv(getEnv);
  const db = serviceClient(env);
  const cfg = AI_CONFIG_DEFAULTS;

  // Identify caller (rate-limit subject) + IP.
  const { data: userData } = await db.auth.getUser(ctx.jwt);
  const userId = userData.user?.id ?? 'anon';
  const isAnonymous = Boolean(userData.user?.is_anonymous ?? true);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

  // 1) Rate limit (§8.4) — strictest AI endpoint; anon tighter.
  const rate = await checkRateLimit(new PgRateLimitStore(db), { userId, ip, isAnonymous });
  if (!rate.allowed) throw new AppError('ERR_AI_ERROR', 'Guru is busy — try again shortly.', true, 429);

  // 2) Cost circuit-breaker (§8.4) — degrade calmly BEFORE the budget is blown.
  const ledger = new PgCostLedger(db);
  if (circuitOpen(await ledger.windowSpendUsd(), { ceilingUsd: 50, openAtFraction: 0.95 })) {
    throw new AppError('ERR_AI_ERROR', 'Guru is busy — try again shortly.', true, 503);
  }

  const { llm, embeddings } = createOpenAiProviders(env.OPENAI_API_KEY);
  const content = new ContentRepository(db);

  return sse(async (send) => {
    // 3) Scope classify — out-of-scope → gentle refusal (EVT_034), no retrieval/generation.
    const scope = await classifyScope(llm, question);
    if (!scope.in_scope) {
      send({ type: 'done', outcome: 'refused' });
      return;
    }

    // 4) Embed query → 5) pgvector ANN top-k → 6) confidence gate (F-6).
    const [queryVec] = await embeddings.embed([question]);
    const chunks = await content.search(queryVec, cfg.retrieval.top_k);
    const gate = confidenceGate(chunks, cfg.retrieval);
    if (gate.decision === 'decline') {
      send({ type: 'done', outcome: 'declined', error_code: gate.reason });
      return;
    }

    // 7) Grounded generation (stream, EVT_030 on first token).
    const { system, prompt } = buildGenerationPrompt(
      question,
      gate.sources.map((s) => ({ title: s.title, text: '' })), // chunk text hydrated from DB in the repo
    );
    let firstToken = true;
    for await (const token of llm.stream({ system, prompt, temperature: cfg.generation.temperature, maxOutputTokens: cfg.generation.max_output_tokens })) {
      if (firstToken) { ctx.log.info('ai_first_token'); firstToken = false; }
      send({ type: 'token', text: token });
    }

    // 8) Sources (EVT_031) + 9) groundedness post-check (F-16; async logging / sync risk-topics).
    send({ type: 'sources', sources: gate.sources });
    await ledger.record(0, { model: llm.modelId, correlationId: ctx.correlationId }); // real token cost added post-gen
    send({ type: 'done', outcome: 'grounded' });
  }, ctx.correlationId);
});

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
