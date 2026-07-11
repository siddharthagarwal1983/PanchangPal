-- =============================================================================
-- 20260712000001_extensions.sql
-- PanchangPal — required Postgres extensions
-- Source: TDD Part 2 §2.2 (pgcrypto, pgvector), §7 (pg_trgm/FTS for search)
-- Forward-only migration (TDD Part 2 §6.1).
-- =============================================================================

-- gen_random_uuid() and crypto helpers
create extension if not exists pgcrypto;

-- pgvector for RAG embeddings (content_chunk.embedding vector(1536), ADR-011)
create extension if not exists vector;

-- trigram/FTS support for city-search and conversation history search (TDD Part 2 §7)
create extension if not exists pg_trgm;

-- pg_cron drives the SVC_notify_scheduler sweep and rollup jobs (ADR-025, TDD Part 1 §7.10).
-- Enabled in Supabase via the dashboard/extension catalog; declared here for completeness.
-- create extension if not exists pg_cron;
