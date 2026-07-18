-- =============================================================================
-- 20260712000030_content.sql
-- PanchangPal — Public content + panchang cache + RAG corpus
-- TBL_TRADITION, TBL_FESTIVAL, TBL_RITUAL, TBL_CHECKLIST_ITEM,
-- TBL_PANCHANG_CACHE, TBL_CONTENT_ITEM, TBL_CONTENT_CHUNK
-- Source: TDD Part 2 §3.6, §3.8 (items), §3.10–3.11, §4. Public-read; writes are
-- service-role only (content pipeline / SVC_content_ingest).
-- =============================================================================

-- ---- TBL_TRADITION -----------------------------------------------------------
create table if not exists tradition (
  code        tradition_code primary key,
  name        text not null,
  description text null,
  is_active   boolean not null default true
);

-- ---- TBL_RITUAL (referenced by festival) ------------------------------------
create table if not exists ritual (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  tradition_code    tradition_code not null references tradition(code),
  title             text not null,
  intro             text null,
  steps             jsonb not null default '[]'::jsonb,  -- ordered: {text, audio_key, duration}
  audio_bucket_path text null,
  depth             content_depth not null default 'quick',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_ritual_tradition on ritual(tradition_code);
drop trigger if exists trg_ritual_updated_at on ritual;
create trigger trg_ritual_updated_at
  before update on ritual for each row execute function set_updated_at();

-- ---- TBL_FESTIVAL ------------------------------------------------------------
create table if not exists festival (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  tradition_code tradition_code not null references tradition(code),
  name           text not null,
  significance   text null,
  how_to         text null,
  depth_quick    text null,
  depth_deep     text null,
  ritual_id      uuid null references ritual(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_festival_tradition on festival(tradition_code);
drop trigger if exists trg_festival_updated_at on festival;
create trigger trg_festival_updated_at
  before update on festival for each row execute function set_updated_at();

-- ---- TBL_CHECKLIST_ITEM (curated 3–5/day) -----------------------------------
create table if not exists checklist_item (
  id             uuid primary key default gen_random_uuid(),
  tradition_code tradition_code null references tradition(code),
  festival_id    uuid null references festival(id),
  label          text not null,
  "order"        int not null default 0,
  type           text null
);
create index if not exists idx_checklist_item_tradition on checklist_item(tradition_code);

-- ---- TBL_PANCHANG_CACHE (deterministic compute cache, ADR-010) --------------
create table if not exists panchang_cache (
  id             uuid primary key default gen_random_uuid(),
  cache_key      text not null unique,             -- hash(local_date, geo_bucket, tradition_code, engine_version)
  local_date     date not null,
  geo_bucket     text not null,
  tradition_code tradition_code not null references tradition(code),
  engine_version text not null,
  payload        jsonb not null,                   -- tithi, nakshatra, yoga, karana, sunrise/sunset, muhurta, rahu kaal
  computed_at    timestamptz not null,
  expires_at     timestamptz null,
  created_at     timestamptz not null default now()
);
create index if not exists idx_panchang_cache_key on panchang_cache(cache_key);
create index if not exists idx_panchang_cache_lookup on panchang_cache(local_date, geo_bucket, tradition_code);

-- ---- TBL_CONTENT_ITEM / TBL_CONTENT_CHUNK (RAG, pgvector) --------------------
create table if not exists content_item (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  source_ref      text null,                        -- reviewed provenance
  tradition_code  tradition_code null references tradition(code),
  topic           text null,
  content_version text not null,
  reviewed_by     text null,
  reviewed_at     timestamptz null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
drop trigger if exists trg_content_item_updated_at on content_item;
create trigger trg_content_item_updated_at
  before update on content_item for each row execute function set_updated_at();

create table if not exists content_chunk (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references content_item(id) on delete cascade,
  chunk_index     int not null,
  text            text not null,
  embedding       vector(1536),                     -- OpenAI text-embedding-3-small (ADR-011)
  token_count     int null,
  content_version text not null,
  created_at      timestamptz not null default now()
);
-- ANN retrieval (SVC_ask_guru); params tuned to corpus size in TDD Part 3.
create index if not exists idx_content_chunk_hnsw on content_chunk using hnsw (embedding vector_cosine_ops);
create index if not exists idx_content_chunk_item on content_chunk(content_item_id);

-- ---- RLS: public-read for authenticated (incl. anonymous); writes service-role only
alter table tradition enable row level security;
alter table ritual enable row level security;
alter table festival enable row level security;
alter table checklist_item enable row level security;
alter table panchang_cache enable row level security;
alter table content_item enable row level security;
alter table content_chunk enable row level security;

drop policy if exists tradition_sel_public on tradition;
create policy tradition_sel_public       on tradition       for select using (true);
drop policy if exists ritual_sel_public on ritual;
create policy ritual_sel_public          on ritual          for select using (true);
drop policy if exists festival_sel_public on festival;
create policy festival_sel_public        on festival        for select using (true);
drop policy if exists checklist_item_sel_public on checklist_item;
create policy checklist_item_sel_public  on checklist_item  for select using (true);
drop policy if exists panchang_cache_sel_public on panchang_cache;
create policy panchang_cache_sel_public  on panchang_cache  for select using (true);
drop policy if exists content_item_sel_public on content_item;
create policy content_item_sel_public    on content_item    for select using (true);
drop policy if exists content_chunk_sel_public on content_chunk;
create policy content_chunk_sel_public   on content_chunk   for select using (true);

-- No client write policies are defined → RLS denies all client writes.
-- SVC_content_ingest / content pipeline / SVC_panchang write with the service role
-- (bypasses RLS by design, TDD Part 2 §4.1).
