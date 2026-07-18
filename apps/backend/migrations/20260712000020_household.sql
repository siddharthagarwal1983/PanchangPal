-- =============================================================================
-- 20260712000020_household.sql
-- PanchangPal — Household, Membership, Invite, Referral + RLS helper predicates
-- Source: TDD Part 2 §3.3–3.5, §3.15 (referral), §4. Enforces F-2 (one active
-- household/user) via a partial unique index.
-- =============================================================================

-- ---- TBL_HOUSEHOLD -----------------------------------------------------------
create table if not exists household (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 1 and 40),
  owner_id       uuid not null references app_user(id),
  tradition_code tradition_code not null default 'generic',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_household_owner on household(owner_id);
drop trigger if exists trg_household_updated_at on household;
create trigger trg_household_updated_at
  before update on household for each row execute function set_updated_at();

-- ---- TBL_HOUSEHOLD_MEMBER ----------------------------------------------------
create table if not exists household_member (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  user_id      uuid null references app_user(id) on delete set null, -- null = local (uninvited) member
  display_name text not null,
  role         member_role not null default 'other',
  depth        content_depth not null default 'quick',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (household_id, user_id)
);
create index if not exists idx_household_member_household on household_member(household_id);
-- F-2: a user is an active member of exactly one household.
create unique index if not exists one_active_household
  on household_member(user_id)
  where is_active and user_id is not null;
drop trigger if exists trg_household_member_updated_at on household_member;
create trigger trg_household_member_updated_at
  before update on household_member for each row execute function set_updated_at();

-- ---- RLS helper predicates (defined now that household_member exists) --------
-- SECURITY DEFINER + stable so RLS policies can call them without recursion.
create or replace function current_household_id()
returns uuid language sql stable security definer set search_path = public as $$
  select household_id
  from household_member
  where user_id = auth.uid() and is_active
  limit 1;
$$;

create or replace function is_household_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from household_member
    where household_id = hid and user_id = auth.uid() and is_active
  );
$$;

create or replace function is_household_owner(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from household where id = hid and owner_id = auth.uid()
  );
$$;

-- ---- TBL_INVITE --------------------------------------------------------------
create table if not exists invite (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  token        text not null unique,                 -- opaque, random
  inviter_id   uuid not null references app_user(id),
  expires_at   timestamptz not null,
  accepted_by  uuid null references app_user(id),
  accepted_at  timestamptz null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_invite_token on invite(token);
create index if not exists idx_invite_household on invite(household_id);

-- ---- TBL_REFERRAL ------------------------------------------------------------
create table if not exists referral (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid not null references app_user(id) on delete cascade,
  code             text not null unique,
  referred_user_id uuid null references app_user(id),
  activated_at     timestamptz null,
  created_at       timestamptz not null default now()
);
create index if not exists idx_referral_referrer on referral(referrer_id);

-- ---- RLS --------------------------------------------------------------------
alter table household enable row level security;
alter table household_member enable row level security;
alter table invite enable row level security;
alter table referral enable row level security;

-- Household: members read; owner updates/deletes; any authenticated user may create.
drop policy if exists household_sel_member on household;
create policy household_sel_member on household
  for select using (is_household_member(id) or owner_id = auth.uid());
drop policy if exists household_ins_auth on household;
create policy household_ins_auth on household
  for insert with check (owner_id = auth.uid());
drop policy if exists household_upd_owner on household;
create policy household_upd_owner on household
  for update using (owner_id = auth.uid());
drop policy if exists household_del_owner on household;
create policy household_del_owner on household
  for delete using (owner_id = auth.uid());

-- Household member: same-household members read; owner manages; self manages own row.
drop policy if exists hh_member_sel on household_member;
create policy hh_member_sel on household_member
  for select using (is_household_member(household_id) or user_id = auth.uid());
drop policy if exists hh_member_ins on household_member;
create policy hh_member_ins on household_member
  for insert with check (is_household_owner(household_id) or user_id = auth.uid());
drop policy if exists hh_member_upd on household_member;
create policy hh_member_upd on household_member
  for update using (is_household_owner(household_id) or user_id = auth.uid());
drop policy if exists hh_member_del on household_member;
create policy hh_member_del on household_member
  for delete using (is_household_owner(household_id) or user_id = auth.uid());

-- Invite: household members read their household's invites. Accept path runs in
-- SVC_household/SVC_account (service role) because the invitee is not yet a member.
drop policy if exists invite_sel_member on invite;
create policy invite_sel_member on invite
  for select using (is_household_member(household_id));

-- Referral: owner-read.
drop policy if exists referral_sel_own on referral;
create policy referral_sel_own on referral
  for select using (referrer_id = auth.uid());
drop policy if exists referral_ins_own on referral;
create policy referral_ins_own on referral
  for insert with check (referrer_id = auth.uid());
