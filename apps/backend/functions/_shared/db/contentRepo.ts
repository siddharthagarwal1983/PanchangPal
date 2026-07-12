/**
 * ContentRepository — RAG retrieval + ingestion DB ops (TDD Part 2 §3.11, Part 3 §3/§4).
 * Service-role. Retrieval is scoped to is_active + latest content_version; ANN via the
 * pgvector HNSW index (a SECURITY DEFINER `match_content_chunks` RPC added with Part 3).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ScoredChunk } from '@panchangpal/ai';

export interface ChunkUpsert {
  content_item_id: string;
  chunk_index: number;
  text: string;
  embedding: number[]; // 1536
  token_count: number;
  content_version: string;
}

export class ContentRepository {
  constructor(private db: SupabaseClient) {}

  /** pgvector ANN top-k over active chunks, tradition-filtered (Part 3 §4). */
  async search(embedding: number[], topK: number, tradition?: string): Promise<ScoredChunk[]> {
    const { data, error } = await this.db.rpc('match_content_chunks', {
      query_embedding: embedding,
      match_count: topK,
      p_tradition: tradition ?? null,
    });
    if (error) throw new Error(`match_content_chunks: ${error.message}`);
    return (data ?? []) as ScoredChunk[];
  }

  /** Idempotent chunk upsert keyed by (content_item_id, chunk_index, content_version). */
  async upsertChunks(chunks: ChunkUpsert[]): Promise<number> {
    if (chunks.length === 0) return 0;
    const { error } = await this.db
      .from('content_chunk')
      .upsert(chunks, { onConflict: 'content_item_id,chunk_index' });
    if (error) throw new Error(`content_chunk upsert: ${error.message}`);
    return chunks.length;
  }
}
