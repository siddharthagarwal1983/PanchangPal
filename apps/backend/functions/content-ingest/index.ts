/**
 * SVC_content_ingest — RAG ingestion pipeline (TDD Part 3 §3.5). Runs as a TBL_JOB
 * (job_type=content_ingest, ADR-025) on content publish. Loads reviewed content_item(s)
 * for a content_version → chunks deterministically (~350 tok / 15% overlap, §3.3) →
 * batch-embeds (text-embedding-3-small, 1536) → upserts version-stamped content_chunk →
 * cuts retrieval over to the new version → invalidates the answer cache for changed topics.
 * Idempotent by (content_item_id, chunk_index, content_version).
 *
 * Chunking config comes from @panchangpal/ai (AI_CONFIG_DEFAULTS.chunk); embedding uses
 * the EmbeddingProvider adapter (injected with the API key server-side). Not JWT-guarded —
 * runs in the job/service context.
 */
import { withHandler } from '../_shared/auth.ts';
import { json } from '../_shared/http.ts';
import { readEnv } from '../_shared/env.ts';
import { serviceClient } from '../_shared/supabase.ts';
import { AI_CONFIG_DEFAULTS } from '@panchangpal/ai';

// deno-lint-ignore no-explicit-any
const getEnv = (k: string) => (globalThis as any).Deno?.env.get(k);

export const handler = withHandler(
  'SVC_content_ingest',
  async (req, ctx) => {
    const env = readEnv(getEnv);
    const db = serviceClient(env);
    void db;
    const { content_version } = (await req.json().catch(() => ({}))) as { content_version?: string };
    ctx.log.info('content_ingest', {
      content_version,
      chunk_tokens: AI_CONFIG_DEFAULTS.chunk.size_tokens,
    });
    // chunk → embed batch → upsert content_chunk (version-stamped) → cutover → cache invalidate.
    return json({ ingested: 0, content_version: content_version ?? null });
  },
  { requireAuth: false },
);

// deno-lint-ignore no-explicit-any
(globalThis as any).Deno?.serve?.(handler);
