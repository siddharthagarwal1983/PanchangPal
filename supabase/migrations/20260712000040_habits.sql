-- =============================================================================
-- 20260712000040_habits.sql
-- PanchangPal — Habit data (TBL_RITUAL_COMPLETION, TBL_STREAK,
-- TBL_CHECKLIST_COMPLETION, TBL_PERSONAL_DATE)
-- Source: TDD Part 2 §3.7–3.9, §4. Owner-write; household-read for completion/streak
-- COUNTS (North Star + positive social proof, F-21). Idempotent via unique
-- constraints + client_id.
-- =============================================================================

-- ---- TBL_RITUAL_COMPLETION ---------------------------------------------------
create table ritual_completion (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references app_user(id) on delete cascade,
  ritual_id    uuid not null references ritual(id),
  local_date   date not null,                      -- user-tz date (client-authoritative, PDD A4)
  completed_at timestamptz not null,
  source       text null,                          -- home | festival | resume
  client_id    uuid not null,                      -- offline optimistic id (idempotency)
  created_at   timestamptz not null default now(),
  unique (user_id, local_date)                     -- one completion/day
);
create index idx_ritual_completion_user_date on ritual_completion(user_id, local_date);

-- ---- TBL_STREAK --------------------------------------------------------------
create table streak (
  user_id             uuid primary key references app_user(id) on delete cascade,
  current_len         int not null default 0,
  best_len            int not null default 0,
  grace_remaining     int not null default 1,      -- 1 per rolling 7-day window (PDD P0#5)
  last_completed_date date null,
  updated_at          timestamptz not null default now()
);
create trigger trg_streak_updated_at
  before update on streak for each row execute function set_updated_at();

-- ---- TBL_CHECKLIST_COMPLETION ------------------------------------------------
create table checklist_completion (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references app_user(id) on delete cascade,
  item_id      uuid not null references checklist_item(id),
  local_date   date not null,
  client_id    uuid not null,
  completed_at timestamptz null,
  unique (user_id, item_id, local_date)
);
create index idx_checklist_completion_user_date on checklist_completion(user_id, local_date);

-- ---- TBL_PERSONAL_DATE (grief-sensitive, owner-only private) -----------------
create table personal_date (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references app_user(id) on delete cascade,
  name            text not null,                   -- relation/name e.g. "Dadaji"
  basis           date_basis not null,
  gregorian_date  date null,                       -- when basis=gregorian
  tithi           jsonb null,                      -- {paksha, month, tithi} when basis=tithi
  reminder_lead   reminder_lead not null default 'one_day',
  reminder_time   time null,
  next_occurrence date null,                       -- computed by tithi engine (cache)
  is_active       boolean not null default true,
  client_id       uuid not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz null                 -- tombstone for offline reconcile (§6.6)
);
create index idx_personal_date_user_active on personal_date(user_id, is_active);
create index idx_personal_date_next on personal_date(next_occurrence);
create trigger trg_personal_date_updated_at
  before update on personal_date for each row execute function set_updated_at();

-- ---- RLS --------------------------------------------------------------------
alter table ritual_completion enable row level security;
alter table streak enable row level security;
alter table checklist_completion enable row level security;
alter table personal_date enable row level security;

-- Completions: owner writes; owner + same-household members read (counts/social proof, F-21).
create policy rc_sel_household on ritual_completion
  for select using (
    user_id = auth.uid()
    or (is_household_member(current_household_id())
        and user_id in (
          select user_id from household_member
          where household_id = current_household_id() and is_active
        ))
  );
create policy rc_ins_own on ritual_completion
  for insert with check (user_id = auth.uid());
create policy rc_upd_own on ritual_completion
  for update using (user_id = auth.uid());

-- Streak: owner writes; owner + same-household members read.
create policy streak_sel_household on streak
  for select using (
    user_id = auth.uid()
    or (is_household_member(current_household_id())
        and user_id in (
          select user_id from household_member
          where household_id = current_household_id() and is_active
        ))
  );
create policy streak_ins_own on streak
  for insert with check (user_id = auth.uid());
create policy streak_upd_own on streak
  for update using (user_id = auth.uid());

-- Checklist completions: owner write, household read.
create policy cc_sel_household on checklist_completion
  for select using (
    user_id = auth.uid()
    or (is_household_member(current_household_id())
        and user_id in (
          select user_id from household_member
          where household_id = current_household_id() and is_active
        ))
  );
create policy cc_ins_own on checklist_completion
  for insert with check (user_id = auth.uid());
create policy cc_upd_own on checklist_completion
  for update using (user_id = auth.uid());

-- Personal dates: owner-only (private; NOT household-visible by default, T7).
create policy pd_sel_own on personal_date for select using (user_id = auth.uid());
create policy pd_ins_own on personal_date for insert with check (user_id = auth.uid());
create policy pd_upd_own on personal_date for update using (user_id = auth.uid());
create policy pd_del_own on personal_date for delete using (user_id = auth.uid());
