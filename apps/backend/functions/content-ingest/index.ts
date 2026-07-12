/**
 * SVC_content_ingest — RAG ingestion (TDD Part 3 §3.5). TBL_JOB (job_type=content_ingest,
 * ADR-025) on content publish. Loads reviewed content_item(s) for a content_version →
 * chunks deterministically (chunker.ts, ~350 tok / 15% overlap) → batch-embeds
 * (text-embedding-3-small, 1536) → upserts version-stamped content_chunk → cutover →
 * invalidate answer cache. Idempotent by (content_item_id, chunk_index, content_version).
 * Service context (no JWT).
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { ContentRepository, type ChunkUpsert } from '../_shared/db/contentRepo.ts';
import { createOpenAiProviders, AI_CONFIG_DEFAULTS } from '@panchangpal/ai';
import { chunkText } from './chunker.ts';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler(
  'SVC_content_ingest',
  async (req, ctx) => {
    const env = readEnv(getEnv);
    const db = serviceClient(env);
    const repo = new ContentRepository(db);
    const { embeddings } = createOpenAiProviders(env.OPENAI_API_KEY);
    const { content_version, items } = (await req.json().catch(() => ({}))) as {
      content_version?: string;
      items?: { id: string; text: string }[];
    };
    if (!content_version || !items?.length) return json({ ingested: 0, content_version: content_version ?? null });

    const cfg = AI_CONFIG_DEFAULTS.chunk;
    const upserts: ChunkUpsert[] = [];
    for (const item of items) {
      const chunks = chunkText(item.text, cfg.size_tokens, cfg.overlap_pct);
      const vectors = await embeddings.embed(chunks.map((c) => c.text));
      chunks.forEach((c, i) =>
        upserts.push({
          content_item_id: item.id,
          chunk_index: c.index,
          text: c.text,
          embedding: vectors[i]!,
          token_count: c.approxTokens,
          content_version,
        }),
      );
    }
    const n = await repo.upsertChunks(upserts);
    ctx.log.info('content_ingest', { content_version, chunks: n });
    return json({ ingested: n, content_version });
  },
  { requireAuth: false },
);

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
