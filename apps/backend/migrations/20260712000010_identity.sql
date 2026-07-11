-- =============================================================================
-- 20260712000010_identity.sql
-- PanchangPal — Identity & Profile (TBL_APP_USER, TBL_USER_PROFILE)
-- Source: TDD Part 2 §3.1–3.2, §4. RLS shipped with each table (§6.1).
-- =============================================================================

-- ---- TBL_APP_USER (mirrors auth.users; app-level, non-auth fields) ----------
create table app_user (
  id            uuid primary key references auth.users(id) on delete cascade,
  is_anonymous  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_app_user_updated_at
  before update on app_user
  for each row execute function set_updated_at();

-- Populate on auth signup (function defined in 20260712000003_functions.sql).
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

alter table app_user enable row level security;

create policy app_user_sel_self on app_user
  for select using (id = auth.uid());
create policy app_user_upd_self on app_user
  for update using (id = auth.uid());

-- ---- TBL_USER_PROFILE (owner-only prefs) ------------------------------------
create table user_profile (
  user_id        uuid primary key references app_user(id) on delete cascade,
  tradition_code tradition_code not null default 'generic',
  ritual_time    time null,                       -- local wall time (tz below)
  content_depth  content_depth not null default 'quick',
  city           text null,
  lat            double precision null,
  lng            double precision null,
  timezone       text null,                        -- IANA tz (ADR-026)
  appearance     appearance_mode not null default 'system',
  locale         text not null default 'en-US',
  notif_prefs    jsonb not null default '{}'::jsonb, -- per-channel toggles + quiet hours
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_user_profile_user on user_profile(user_id);

create trigger trg_user_profile_updated_at
  before update on user_profile
  for each row execute function set_updated_at();

alter table user_profile enable row level security;

create policy user_profile_sel_own on user_profile
  for select using (user_id = auth.uid());
create policy user_profile_ins_own on user_profile
  for insert with check (user_id = auth.uid());
create policy user_profile_upd_own on user_profile
  for update using (user_id = auth.uid());
