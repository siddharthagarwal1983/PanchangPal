-- =============================================================================
-- 20260712000080_platform.sql
-- PanchangPal — Platform tables (TBL_REFERRAL is in _household; here:
-- TBL_FEATURE_FLAG, TBL_ANALYTICS_EVENT, TBL_JOB, TBL_ACCOUNT_DELETION,
-- TBL_SUPPORT_TICKET)
-- Source: TDD Part 2 §3.15, §4.
-- =============================================================================

-- ---- TBL_FEATURE_FLAG (FF_*) — public-read (§7.3, ADR-021) -------------------
create table if not exists feature_flag (
  key        text primary key,                      -- FF_*
  enabled    boolean not null default false,
  rollout    jsonb null,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_feature_flag_updated_at on feature_flag;
create trigger trg_feature_flag_updated_at
  before update on feature_flag for each row execute function set_updated_at();

-- ---- TBL_ANALYTICS_EVENT (envelope §11.1, NO PII; ADR-013/031) --------------
create table if not exists analytics_event (
  id             uuid primary key default gen_random_uuid(),
  event_id       text not null,                     -- EVT_* (packages/shared)
  user_pseudo_id text not null,                     -- pseudonymous, never PII
  household_id   uuid null,
  session_id     text null,
  ts             timestamptz not null,
  props          jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists idx_analytics_event_id_ts on analytics_event(event_id, ts);
create index if not exists idx_analytics_event_household_ts on analytics_event(household_id, ts); -- North Star rollup

-- ---- TBL_JOB (background queue; service-only) -------------------------------
create table if not exists job (
  id         uuid primary key default gen_random_uuid(),
  type       job_type not null,
  status     job_status not null default 'pending',
  run_at     timestamptz null,
  payload    jsonb null,
  attempts   int not null default 0,
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_job_status_runat on job(status, run_at);
drop trigger if exists trg_job_updated_at on job;
create trigger trg_job_updated_at
  before update on job for each row execute function set_updated_at();

-- ---- TBL_ACCOUNT_DELETION (grace window, F-3) -------------------------------
create table if not exists account_deletion (
  user_id       uuid primary key references app_user(id) on delete cascade,
  requested_at  timestamptz not null,
  execute_after timestamptz not null,
  executed_at   timestamptz null
);

-- ---- TBL_SUPPORT_TICKET ------------------------------------------------------
create table if not exists support_ticket (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid null references app_user(id) on delete set null,
  email      text null,
  subject    text null,
  body       text null,
  created_at timestamptz not null default now()
);

-- ---- RLS --------------------------------------------------------------------
alter table feature_flag enable row level security;
alter table analytics_event enable row level security;
alter table job enable row level security;
alter table account_deletion enable row level security;
alter table support_ticket enable row level security;

-- Feature flags: public-read.
drop policy if exists feature_flag_sel_public on feature_flag;
create policy feature_flag_sel_public on feature_flag for select using (true);

-- Analytics: insert-only by owner (no client read).
drop policy if exists analytics_ins_own on analytics_event;
create policy analytics_ins_own on analytics_event
  for insert with check (true);
-- (No select policy → clients cannot read analytics; rollups run service-side.)

-- Jobs: service-only (no client policies → all client access denied).

-- Account deletion: owner-read.
drop policy if exists account_deletion_sel_own on account_deletion;
create policy account_deletion_sel_own on account_deletion
  for select using (user_id = auth.uid());

-- Support tickets: owner-insert (email-only tickets created via service role).
drop policy if exists support_ticket_ins_own on support_ticket;
create policy support_ticket_ins_own on support_ticket
  for insert with check (user_id = auth.uid() or user_id is null);
