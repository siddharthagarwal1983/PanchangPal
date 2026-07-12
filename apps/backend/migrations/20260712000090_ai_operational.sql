-- =============================================================================
-- 20260712000090_ai_operational.sql
-- PanchangPal — AI operational tables (TDD Part 3 §8A/§8.4). These are AI-SUBSYSTEM
-- infrastructure (Part 3), not product data (Part 2). Service-role only: the client
-- never reads or writes them. Referenced by SVC_ask_guru / SVC_content_ingest.
-- =============================================================================

-- ---- ai_config — governed, server-tunable AI parameters (§8A) --------------------
create table ai_config (
  key        text primary key,          -- e.g. ai.retrieval.confidence_threshold
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger trg_ai_config_updated_at
  before update on ai_config for each row execute function set_updated_at();

-- ---- ai_rate_limit — fixed-window counters for Ask Guru (§8.4) -------------------
create table ai_rate_limit (
  subject          text not null,        -- u:<uid> | ip:<addr>
  window_start_min bigint not null,      -- epoch minute bucket
  count            int not null default 0,
  primary key (subject, window_start_min)
);
create index idx_ai_rate_limit_window on ai_rate_limit(window_start_min);

-- ---- ai_cost_ledger — per-answer cost for the circuit breaker (§8.1, F-11) -------
create table ai_cost_ledger (
  id             uuid primary key default gen_random_uuid(),
  ts             timestamptz not null default now(),
  model          text not null,
  cost_usd       numeric(10,6) not null,
  correlation_id text null,
  user_pseudo_id text null                -- pseudonymous only, no PII (ADR-031)
);
create index idx_ai_cost_ledger_ts on ai_cost_ledger(ts);

-- ---- RLS: service-only (RLS enabled, no client policy → all client access denied)
alter table ai_config enable row level security;
alter table ai_rate_limit enable row level security;
alter table ai_cost_ledger enable row level security;

-- ai_config is read by Edge Functions with the service role (bypasses RLS). If a
-- public-read subset is ever needed, add a narrow SELECT policy then.

-- ---- Atomic rate-limit increment (avoids read-modify-write races) ---------------
create or replace function ai_rate_incr(p_subject text, p_window bigint)
returns int language plpgsql security definer set search_path = public as $$
declare v int;
begin
  insert into ai_rate_limit(subject, window_start_min, count)
  values (p_subject, p_window, 1)
  on conflict (subject, window_start_min)
  do update set count = ai_rate_limit.count + 1
  returning count into v;
  return v;
end;
$$;

-- ---- Rolling-window AI spend (last 24h) for the circuit breaker ------------------
create or replace function ai_window_spend_usd(p_since interval default interval '24 hours')
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce(sum(cost_usd), 0) from ai_cost_ledger where ts >= now() - p_since;
$$;

-- ---- Seed launch AI config defaults (mirrors packages/ai AI_CONFIG_DEFAULTS, §8A) --
insert into ai_config(key, value) values
  ('ai.retrieval.top_k', '6'::jsonb),
  ('ai.retrieval.ef_search', '40'::jsonb),
  ('ai.retrieval.confidence_top', '0.78'::jsonb),
  ('ai.retrieval.confidence_support', '0.72'::jsonb),
  ('ai.context.max_tokens', '2000'::jsonb),
  ('ai.generation.temperature', '0.25'::jsonb),
  ('ai.generation.max_output_tokens', '600'::jsonb),
  ('ai.groundedness.enabled', 'true'::jsonb),
  ('ai.cost.ceiling_usd', '50'::jsonb),
  ('ai.ratelimit.per_user_per_min', '12'::jsonb),
  ('ai.ratelimit.per_ip_per_min', '30'::jsonb),
  ('ai.ratelimit.anon_per_user_per_min', '4'::jsonb)
on conflict (key) do nothing;
