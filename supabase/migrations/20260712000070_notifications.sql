-- =============================================================================
-- 20260712000070_notifications.sql
-- PanchangPal — Notifications (TBL_PUSH_TOKEN, TBL_NOTIFICATION)
-- Source: TDD Part 2 §3.14, §4. Owner-only. Scheduling/sending by
-- SVC_notify_scheduler (service role); dedupe_key guarantees idempotent sends.
-- =============================================================================

-- ---- TBL_PUSH_TOKEN ----------------------------------------------------------
create table push_token (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references app_user(id) on delete cascade,
  expo_token   text not null unique,
  platform     text null,                           -- ios | android
  last_seen_at timestamptz null,
  created_at   timestamptz not null default now()
);
create index idx_push_token_user on push_token(user_id);

-- ---- TBL_NOTIFICATION --------------------------------------------------------
create table notification (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references app_user(id) on delete cascade,
  notif_type    notif_type null,
  channel       notif_channel null,
  scheduled_for timestamptz null,
  sent_at       timestamptz null,
  opened_at     timestamptz null,
  deep_link     text null,
  payload       jsonb null,
  dedupe_key    text null,
  created_at    timestamptz not null default now(),
  unique (user_id, dedupe_key)                      -- idempotent scheduling
);
create index idx_notification_user_scheduled on notification(user_id, scheduled_for);
create index idx_notification_sent on notification(sent_at);

-- ---- RLS: owner-only ---------------------------------------------------------
alter table push_token enable row level security;
alter table notification enable row level security;

create policy push_token_sel_own on push_token for select using (user_id = auth.uid());
create policy push_token_ins_own on push_token for insert with check (user_id = auth.uid());
create policy push_token_upd_own on push_token for update using (user_id = auth.uid());

create policy notification_sel_own on notification for select using (user_id = auth.uid());
-- Inserts/updates (scheduling, send/open marks) run in SVC_notify_scheduler (service role).
