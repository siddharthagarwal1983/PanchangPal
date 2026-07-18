-- =============================================================================
-- 20260712000060_billing.sql
-- PanchangPal — Subscription & Entitlement (TBL_SUBSCRIPTION, TBL_ENTITLEMENT)
-- Source: TDD Part 2 §3.13, §4. Household-grain (F-4). Household members read;
-- writes are SERVICE-ROLE ONLY (SVC_revenuecat_webhook) — clients never write
-- entitlements (Part 1 §1.5).
-- =============================================================================

-- ---- TBL_SUBSCRIPTION (RevenueCat-mirrored) ---------------------------------
create table if not exists subscription (
  id                 uuid primary key default gen_random_uuid(),
  household_id       uuid not null references household(id) on delete cascade,
  rc_app_user_id     text null,
  rc_original_txn_id text not null unique,          -- idempotency key for webhook upsert
  kind               entitlement_kind not null,
  status             sub_status not null,
  current_period_end timestamptz null,
  store              text null,                     -- app_store | play
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_subscription_household on subscription(household_id);
drop trigger if exists trg_subscription_updated_at on subscription;
create trigger trg_subscription_updated_at
  before update on subscription for each row execute function set_updated_at();

-- ---- TBL_ENTITLEMENT (active entitlements at household grain) ----------------
create table if not exists entitlement (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references household(id) on delete cascade,
  kind         entitlement_kind not null,
  is_active    boolean not null,
  granted_at   timestamptz null,
  expires_at   timestamptz null,
  source       text not null default 'revenuecat'
);
create index if not exists idx_entitlement_household_active on entitlement(household_id, is_active);

-- ---- RLS --------------------------------------------------------------------
alter table subscription enable row level security;
alter table entitlement enable row level security;

-- Household members may read; NO client write policies → all client writes denied.
drop policy if exists subscription_sel_member on subscription;
create policy subscription_sel_member on subscription
  for select using (is_household_member(household_id));
drop policy if exists entitlement_sel_member on entitlement;
create policy entitlement_sel_member on entitlement
  for select using (is_household_member(household_id));

-- Explicit deny-all-writes guard (belt-and-suspenders; service role bypasses RLS).
drop policy if exists entitlement_no_client_write on entitlement;
create policy entitlement_no_client_write on entitlement
  for all using (false) with check (false);
