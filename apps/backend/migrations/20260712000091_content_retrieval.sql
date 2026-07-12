-- =============================================================================
-- 20260712000091_content_retrieval.sql
-- PanchangPal — RAG retrieval RPC (TDD Part 3 §4). pgvector ANN over active chunks,
-- tradition-filtered, using the HNSW cosine index from 20260712000030_content.sql.
-- SECURITY DEFINER so SVC_ask_guru can call it; content is public-read anyway.
-- =============================================================================

create or replace function match_content_chunks(
  query_embedding vector(1536),
  match_count int default 6,
  p_tradition tradition_code default null
)
returns table (content_chunk_id uuid, title text, score real)
language sql stable security definer set search_path = public as $$
  select
    cc.id as content_chunk_id,
    ci.title,
    1 - (cc.embedding <=> query_embedding) as score   -- cosine similarity
  from content_chunk cc
  join content_item ci on ci.id = cc.content_item_id
  where ci.is_active
    and (p_tradition is null or ci.tradition_code = p_tradition or ci.tradition_code is null)
  order by cc.embedding <=> query_embedding            -- cosine distance (ANN via HNSW)
  limit match_count;
$$;
