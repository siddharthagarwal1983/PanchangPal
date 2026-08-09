-- =============================================================================
-- apps/backend/tests/integration/analytics_rollup.test.sql
-- PanchangPal — the analytics_event daily rollup (pgTAP).
-- Source: ADR-025, PDD §11.3/§11.4, TDD Part 5 §7.1.
--
-- WHY THESE ASSERTIONS AND NOT "THE FUNCTION RAN".
-- The rollup exists to make the North Star readable, and the ways it can be wrong are all
-- quiet: it can bucket an AU/NZ morning into the wrong day, it can double-count on a second
-- run, it can inflate a household total by treating two NULL household_ids as distinct, or it
-- can abort on one malformed client-supplied prop and leave the table looking merely stale.
-- None of those raise an error, so each one is asserted directly.
-- =============================================================================

begin;
select plan(17);
create extension if not exists pgtap;

-- ---- Fixtures ---------------------------------------------------------------
-- This suite owns the tables it counts, exactly as the deletion suite does: the aggregates
-- below are only meaningful if no other suite's rows are present. Rolled back with everything.
delete from analytics_rollup_daily;
delete from analytics_event;

-- Auckland is the case that matters. 2026-08-10 07:00 NZST is 2026-08-09 19:00 UTC — a Monday
-- morning ritual whose UTC date is the previous SUNDAY, which is also the previous ISO week.
insert into analytics_event (event_id, user_pseudo_id, household_id, ts, props) values
  ('EVT_017', 'pseudo-a', 'aa000000-0000-0000-0000-0000000000a1',
   '2026-08-09T19:00:00Z', '{"local_date":"2026-08-10"}'::jsonb),
  ('EVT_017', 'pseudo-b', 'aa000000-0000-0000-0000-0000000000a1',
   '2026-08-09T19:30:00Z', '{"local_date":"2026-08-10"}'::jsonb),
  -- same user twice on the same day: event_count 2, user_count 1
  ('EVT_017', 'pseudo-b', 'aa000000-0000-0000-0000-0000000000a1',
   '2026-08-09T20:00:00Z', '{"local_date":"2026-08-10"}'::jsonb),
  -- a solo user with NO household — the NULL-key case
  ('EVT_017', 'pseudo-c', null, '2026-08-09T19:10:00Z', '{"local_date":"2026-08-10"}'::jsonb),
  ('EVT_017', 'pseudo-d', null, '2026-08-09T19:20:00Z', '{"local_date":"2026-08-10"}'::jsonb),
  -- no local_date at all: unattributed, must fall back to the UTC date and be MARKED
  ('EVT_017', 'pseudo-e', 'aa000000-0000-0000-0000-0000000000a1',
   '2026-08-09T19:40:00Z', '{}'::jsonb),
  -- a malformed client-supplied date: must be treated as absent, never cast
  ('EVT_019', 'pseudo-f', null, '2026-08-09T19:50:00Z', '{"local_date":"not-a-date"}'::jsonb);

select is(rollup_analytics_daily(3650)::int > 0, true, 'the rollup writes rows');

-- ---- 1. The Auckland case: attributed to the user's day, not UTC -------------
select is(
  (select event_count from analytics_rollup_daily
    where local_date = '2026-08-10' and event_id = 'EVT_017'
      and household_id = 'aa000000-0000-0000-0000-0000000000a1' and attributed),
  3::bigint,
  'a 07:00 Auckland ritual is counted on the user local day (2026-08-10), not the UTC day');

select is(
  (select count(*) from analytics_rollup_daily
    where local_date = '2026-08-09' and event_id = 'EVT_017' and attributed),
  0::bigint,
  'and nothing attributed lands on the previous UTC day — the issue #30 shape');

select is(
  (select user_count from analytics_rollup_daily
    where local_date = '2026-08-10' and event_id = 'EVT_017'
      and household_id = 'aa000000-0000-0000-0000-0000000000a1' and attributed),
  2::bigint,
  'user_count is distinct users, so one user completing twice does not read as two');

-- ---- 2. The NULL household must be ONE bucket, not many ----------------------
select is(
  (select count(*) from analytics_rollup_daily
    where local_date = '2026-08-10' and event_id = 'EVT_017' and household_id is null and attributed),
  1::bigint,
  'two events with a NULL household_id collapse into ONE row (nulls not distinct)');

select is(
  (select event_count from analytics_rollup_daily
    where local_date = '2026-08-10' and event_id = 'EVT_017' and household_id is null and attributed),
  2::bigint,
  'and that row carries both of them');

-- ---- 3. Unattributed rows are kept, bucketed by UTC, and MARKED --------------
select is(
  (select event_count from analytics_rollup_daily
    where local_date = '2026-08-09' and event_id = 'EVT_017' and not attributed),
  1::bigint,
  'an event with no local_date falls back to the UTC date rather than being dropped');

select is(
  (select attributed from analytics_rollup_daily
    where local_date = '2026-08-09' and event_id = 'EVT_017' and not attributed),
  false,
  'and is flagged unattributed, so a query can exclude it instead of trusting it');

-- ---- 4. Malformed client input is absent, not fatal --------------------------
select is(
  (select event_count from analytics_rollup_daily
    where event_id = 'EVT_019' and not attributed),
  1::bigint,
  'a malformed props.local_date is treated as ABSENT — one bad row cannot abort the run');

select is(
  (select count(*) from analytics_rollup_daily where event_id = 'EVT_019' and attributed),
  0::bigint,
  'and is never cast into a real date');

-- ---- 5. Idempotence: the property that makes a scheduled worker safe ---------
select is(
  (select sum(event_count)::bigint from analytics_rollup_daily),
  7::bigint,
  'total counted events equals the events inserted');

select lives_ok(
  $$ select rollup_analytics_daily(3650) $$,
  'the rollup can be re-run');

select is(
  (select sum(event_count)::bigint from analytics_rollup_daily),
  7::bigint,
  're-running does NOT double-count — nothing is incremented, only recomputed');

-- ---- 6. Late arrivals are picked up by recomputing the window ----------------
insert into analytics_event (event_id, user_pseudo_id, household_id, ts, props) values
  ('EVT_017', 'pseudo-late', 'aa000000-0000-0000-0000-0000000000a1',
   now(), '{"local_date":"2026-08-10"}'::jsonb);
select is(rollup_analytics_daily(3650)::int > 0, true, 'a later run processes late arrivals');
select is(
  (select event_count from analytics_rollup_daily
    where local_date = '2026-08-10' and event_id = 'EVT_017'
      and household_id = 'aa000000-0000-0000-0000-0000000000a1' and attributed),
  4::bigint,
  'an event arriving days after its local_date is folded into the day it belongs to');

-- ---- 7. Guards --------------------------------------------------------------
select throws_ok(
  $$ select rollup_analytics_daily(-1) $$,
  'rollup_analytics_daily: p_lookback_days must be >= 0, got -1',
  'a negative lookback fails loudly rather than silently rolling up nothing');

select is(
  analytics_rollup_is_scheduled(),
  false,
  'is_scheduled() reports FALSE where pg_cron is absent (CI) rather than assuming success');

select * from finish();
rollback;
