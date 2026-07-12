-- =============================================================================
-- apps/backend/tests/integration/db_operations.test.sql
-- PanchangPal — DB operation integration tests (pgTAP). Asserts the constraint-level
-- guarantees the repositories rely on (TDD Part 2 §4.3/§6.6): idempotent upserts,
-- household-grain entitlement, merge reassignment, and the AI operational helpers
-- (rate-limit increment, cost window). Runs in CI against a freshly migrated DB
-- (pg_prove), same harness as the RLS suite.
-- =============================================================================

begin;
select plan(9);
create extension if not exists pgtap;

-- ---- Fixtures (service context; RLS bypassed by superuser in CI) -------------
insert into auth.users (id, is_anonymous) values
  ('11111111-1111-1111-1111-111111111111', true),   -- anon
  ('22222222-2222-2222-2222-222222222222', false)   -- auth
on conflict do nothing;
insert into household (id, name, owner_id)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'H1', '22222222-2222-2222-2222-222222222222');
insert into household_member (household_id, user_id, display_name, is_active)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'A', true);
insert into tradition (code, name) values ('generic','Generic') on conflict do nothing;
insert into ritual (id, slug, tradition_code, title)
  values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'r1', 'generic', 'R1') on conflict do nothing;

-- ---- 1–2. ritual_completion idempotent by (user_id, local_date) --------------
insert into ritual_completion (user_id, ritual_id, local_date, completed_at, client_id)
  values ('22222222-2222-2222-2222-222222222222','cccccccc-cccc-cccc-cccc-cccccccccccc','2026-07-12', now(), gen_random_uuid());
select lives_ok(
  $$ insert into ritual_completion (user_id, ritual_id, local_date, completed_at, client_id)
     values ('22222222-2222-2222-2222-222222222222','cccccccc-cccc-cccc-cccc-cccccccccccc','2026-07-12', now(), gen_random_uuid())
     on conflict (user_id, local_date) do nothing $$,
  'duplicate daily completion upsert-do-nothing succeeds (idempotent)'
);
select is(
  (select count(*)::int from ritual_completion where user_id='22222222-2222-2222-2222-222222222222' and local_date='2026-07-12'),
  1, 'still exactly one completion for the day'
);

-- ---- 3. subscription idempotent by rc_original_txn_id ------------------------
insert into subscription (household_id, rc_original_txn_id, kind, status)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','txn-1','family','active');
select throws_ok(
  $$ insert into subscription (household_id, rc_original_txn_id, kind, status)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','txn-1','family','active') $$,
  '23505', null, 'duplicate rc_original_txn_id is rejected (idempotent webhook)'
);

-- ---- 4. entitlement at household grain --------------------------------------
insert into entitlement (household_id, kind, is_active) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','family',true);
select is(
  (select count(*)::int from entitlement where household_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and is_active),
  1, 'entitlement stored once at household grain (F-4)'
);

-- ---- 5. notification dedupe_key idempotency ---------------------------------
insert into notification (user_id, notif_type, channel, dedupe_key)
  values ('22222222-2222-2222-2222-222222222222','morning','daily','2026-07-12:morning');
select throws_ok(
  $$ insert into notification (user_id, notif_type, channel, dedupe_key)
     values ('22222222-2222-2222-2222-222222222222','morning','daily','2026-07-12:morning') $$,
  '23505', null, 'duplicate (user, dedupe_key) notification is rejected'
);

-- ---- 6. merge reassignment (F-1) --------------------------------------------
insert into user_profile (user_id) values ('11111111-1111-1111-1111-111111111111');
update user_profile set user_id='22222222-2222-2222-2222-222222222222'
  where user_id='11111111-1111-1111-1111-111111111111';
select is(
  (select count(*)::int from user_profile where user_id='22222222-2222-2222-2222-222222222222'),
  1, 'anon-owned profile reassigned to auth uid (merge)'
);

-- ---- 7–8. AI rate-limit atomic increment ------------------------------------
select is(ai_rate_incr('u:test', 100), 1, 'ai_rate_incr starts at 1 for a new window');
select is(ai_rate_incr('u:test', 100), 2, 'ai_rate_incr increments within the same window');

-- ---- 9. AI cost window ------------------------------------------------------
insert into ai_cost_ledger (model, cost_usd) values ('gpt-5-mini', 1.25);
select ok(ai_window_spend_usd(interval '24 hours') >= 1.25, 'ai_window_spend_usd sums recent spend');

select * from finish();
rollback;
