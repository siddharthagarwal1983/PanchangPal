-- =============================================================================
-- apps/backend/tests/rls/rls_policies.test.sql
-- PanchangPal — RLS policy test-suite (pgTAP)
-- Resolves the release-gate security tests mandated in TDD Part 2 §4.4 (NFR-18).
--
-- Asserts, per §4.4:
--   1. Anonymous users can read public content.
--   2. Users can write their own rows.
--   3. Cross-user reads are denied.
--   4. Cross-household reads are denied.
--   5. Client entitlement writes are denied (service-only).
--   6. Service-only tables (job) reject client access.
--   7. F-21 (ratified 2026-07-12): household members CAN read another member's
--      completion/streak COUNTS.
--   8. analytics_event is INSERT-ONLY for clients (ADR-013): the device can append
--      envelopes and can never read, update, or delete them.
--
-- Run in CI against a freshly migrated DB (pgTAP), e.g.:
--   supabase test db            # if wired to this path, or
--   pg_prove -d "$DATABASE_URL" apps/backend/tests/rls/*.test.sql
--
-- The suite simulates Supabase auth by setting `role authenticated` and the
-- `request.jwt.claims` GUC (auth.uid() reads claims->>'sub').
-- =============================================================================

begin;
select plan(17);

-- pgTAP is provided by the `pgtap` extension in CI.
create extension if not exists pgtap;

-- ---- Fixtures (service role / setup context) --------------------------------
-- Two users in two different households, plus a shared household with two members.
insert into auth.users (id, is_anonymous) values
  ('11111111-1111-1111-1111-111111111111', false),  -- User A (household H1, member)
  ('22222222-2222-2222-2222-222222222222', false),  -- User B (household H2)
  ('33333333-3333-3333-3333-333333333333', false)   -- User C (household H1, co-member of A)
on conflict (id) do nothing;
-- app_user rows are created by the handle_new_user() trigger on the inserts above.

insert into household (id, name, owner_id) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'H1', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'H2', '22222222-2222-2222-2222-222222222222');

insert into household_member (household_id, user_id, display_name, is_active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'A', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'C', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'B', true);

insert into tradition (code, name) values ('generic', 'Generic') on conflict do nothing;
insert into ritual (id, slug, tradition_code, title)
  values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'r1', 'generic', 'R1') on conflict do nothing;

-- User A and co-member C each log a completion.
insert into ritual_completion (user_id, ritual_id, local_date, completed_at, client_id) values
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-07-12', now(), gen_random_uuid()),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-07-12', now(), gen_random_uuid());

-- A private personal date owned by User A.
insert into personal_date (user_id, name, basis, client_id) values
  ('11111111-1111-1111-1111-111111111111', 'Dadaji', 'gregorian', gen_random_uuid());

-- A subscription/entitlement for household H1.
insert into subscription (household_id, rc_original_txn_id, kind, status)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'txn-1', 'family', 'active');
insert into entitlement (household_id, kind, is_active)
  values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'family', true);

-- ---- Helper: become a given authenticated user ------------------------------
create or replace function tests_set_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, true);
end; $$;

create or replace function tests_set_anonymous() returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', gen_random_uuid(), 'is_anonymous', true)::text, true);
end; $$;

-- =============================================================================
-- 1. Anonymous can read public content
-- =============================================================================
select tests_set_anonymous();
set local role authenticated;
select ok(
  (select count(*) from tradition) >= 1,
  'anonymous user can read public content (tradition)'
);
reset role;

-- =============================================================================
-- 2. User can read their own rows
-- =============================================================================
select tests_set_user('11111111-1111-1111-1111-111111111111');
set local role authenticated;
select ok(
  (select count(*) from personal_date) = 1,
  'owner can read their own personal_date'
);

-- =============================================================================
-- 3. Cross-user read denied (User B cannot see User A's personal date)
-- =============================================================================
select tests_set_user('22222222-2222-2222-2222-222222222222');
select ok(
  (select count(*) from personal_date) = 0,
  'cross-user read of personal_date is denied by RLS'
);

-- =============================================================================
-- 4. Cross-household read denied (User B cannot read H1 subscription/entitlement)
-- =============================================================================
select ok(
  (select count(*) from subscription) = 0,
  'cross-household read of subscription is denied'
);
select ok(
  (select count(*) from entitlement) = 0,
  'cross-household read of entitlement is denied'
);

-- =============================================================================
-- 5. Client cannot write entitlement (service-only)
-- =============================================================================
select throws_ok(
  $$ insert into entitlement (household_id, kind, is_active)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'family', true) $$,
  '42501',
  null,
  'client entitlement INSERT is denied (service-only)'
);

-- =============================================================================
-- 6. Service-only table `job` rejects client reads and writes
-- =============================================================================
select ok(
  (select count(*) from job) = 0,
  'client cannot read service-only job table'
);
select throws_ok(
  $$ insert into job (type) values ('analytics_rollup') $$,
  '42501',
  null,
  'client job INSERT is denied (service-only)'
);
reset role;

-- =============================================================================
-- 7. Owner writes own habit row; cross-user habit write denied
-- =============================================================================
select tests_set_user('22222222-2222-2222-2222-222222222222');
set local role authenticated;
select lives_ok(
  $$ insert into ritual_completion (user_id, ritual_id, local_date, completed_at, client_id)
     values ('22222222-2222-2222-2222-222222222222',
             'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-07-12', now(), gen_random_uuid()) $$,
  'user can insert their own ritual_completion'
);
select throws_ok(
  $$ insert into ritual_completion (user_id, ritual_id, local_date, completed_at, client_id)
     values ('11111111-1111-1111-1111-111111111111',
             'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-07-13', now(), gen_random_uuid()) $$,
  '42501',
  null,
  'inserting a ritual_completion for another user is denied'
);
reset role;

-- =============================================================================
-- 8. F-21 (ratified): household members CAN read a co-member's completion COUNTS
--    User A should see both A's and co-member C's completions in household H1.
-- =============================================================================
select tests_set_user('11111111-1111-1111-1111-111111111111');
set local role authenticated;
select ok(
  (select count(*) from ritual_completion
     where user_id = '33333333-3333-3333-3333-333333333333') = 1,
  'F-21: household member can read a co-member''s completion count'
);
-- Negative control: a user in a DIFFERENT household cannot.
reset role;
select tests_set_user('22222222-2222-2222-2222-222222222222');
set local role authenticated;
select ok(
  (select count(*) from ritual_completion
     where user_id = '33333333-3333-3333-3333-333333333333') = 0,
  'F-21: a non-household user cannot read those completions'
);
reset role;

-- =============================================================================
-- 9. analytics_event is INSERT-ONLY for clients (ADR-013 / TDD Part 5 §7.1)
--
--    The mobile analytics adapter writes envelopes here and never reads them;
--    rollups run service-side (pg_cron, ADR-025). Until now nothing had ever
--    written a row: the adapter's insert path was covered only by unit tests
--    against a fake repository, so "the client can insert, and cannot read"
--    was an assumption. These tests make it a gate, and they use the EXACT
--    envelope shape `buildEnvelope()` produces — event_id, user_pseudo_id,
--    household_id, session_id, ts, props — so a schema or policy change that
--    breaks the client fails here rather than in production.
-- =============================================================================
select tests_set_user('11111111-1111-1111-1111-111111111111');
set local role authenticated;

select lives_ok(
  $$ insert into analytics_event (event_id, user_pseudo_id, household_id, session_id, ts, props)
     values ('EVT_017',
             '7f3a1c94-0000-4000-8000-000000000001',
             'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
             'sess-1',
             now(),
             '{"ritual_id":"cccccccc-cccc-cccc-cccc-cccccccccccc","depth":"quick","duration_ms":90000}'::jsonb) $$,
  'client can INSERT an analytics_event envelope (the North Star input, EVT_017)'
);

-- household_id and session_id are nullable in the envelope: an anonymous user with
-- no household still emits events, and the client sends explicit nulls.
select lives_ok(
  $$ insert into analytics_event (event_id, user_pseudo_id, household_id, session_id, ts, props)
     values ('EVT_012', '7f3a1c94-0000-4000-8000-000000000002', null, null, now(), '{}'::jsonb) $$,
  'client can INSERT an event with no household and no session'
);

-- No SELECT policy exists, which is the point: a device contributes events and can
-- never read anyone's, including its own. A count, not a throws_ok — RLS filters
-- rows rather than raising, so a leak would show up as a non-zero count.
select ok(
  (select count(*) from analytics_event) = 0,
  'client CANNOT read analytics_event (no select policy — rollups are service-side)'
);

-- UPDATE and DELETE are `is_empty`, NOT `throws_ok`, and the difference is the point.
-- Supabase grants anon/authenticated broad table privileges and lets RLS do the gating, so a
-- write with no matching policy is FILTERED rather than refused: no rows are visible, so none
-- are modified, and Postgres raises nothing. Asserting a 42501 here would have failed — and
-- asserting `lives_ok` alone would have passed while proving nothing. `returning 1` makes the
-- rows-affected count observable without a SELECT policy.
select is_empty(
  $$ update analytics_event set session_id = 'tampered' returning 1 $$,
  'client analytics_event UPDATE modifies nothing (append-only event store)'
);

select is_empty(
  $$ delete from analytics_event returning 1 $$,
  'client analytics_event DELETE removes nothing (append-only event store)'
);
reset role;

select * from finish();
rollback;
