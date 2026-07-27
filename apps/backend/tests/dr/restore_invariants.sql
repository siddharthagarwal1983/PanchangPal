-- =============================================================================
-- apps/backend/tests/dr/restore_invariants.sql
-- PanchangPal — DR restore invariants (TDD Part 5 §8.1 / §8.3)
--
-- Run identically BEFORE the backup and AFTER the restore. If a restore is
-- lossy — missing extension, dropped policy, empty seed, absent enum — the same
-- file that passed on the source database fails on the restored one, which is
-- the only way a drill can tell "restored" from "restored correctly".
--
-- Raises on failure so psql -v ON_ERROR_STOP=1 fails the job. Prints nothing on
-- success beyond a single confirmation line: a drill that needs a human to read
-- its output is a drill that silently rots.
-- =============================================================================

\set ON_ERROR_STOP on

do $$
declare
  missing text;
  n int;
begin
  -- ---- 1. Every table the schema defines survived --------------------------
  -- A restore that drops a table is the failure mode that matters most, and the
  -- one a smoke test of "can I connect" would never notice.
  select string_agg(t, ', ') into missing
  from unnest(array[
    'app_user','user_profile','household','household_member','tradition','ritual',
    'ritual_completion','streak','checklist_item','festival','personal_date',
    'content_item','content_chunk','conversation','message','message_source',
    'notification','push_token','subscription','entitlement','feature_flag',
    'analytics_event','job','invite','panchang_cache','account_deletion'
  ]) as t
  where to_regclass('public.' || t) is null;

  if missing is not null then
    raise exception 'DR: tables missing after restore: %', missing;
  end if;

  -- ---- 2. RLS is still ENABLED on the tables that carry user data ----------
  -- Restoring rows while losing row-level security would look completely
  -- healthy and expose every household's data. Worth asserting explicitly.
  select string_agg(c.relname, ', ') into missing
  from pg_class c
  join pg_namespace nsp on nsp.oid = c.relnamespace
  where nsp.nspname = 'public'
    and c.relkind = 'r'
    and c.relname in (
      'user_profile','household','household_member','ritual_completion','streak',
      'personal_date','conversation','message','notification','push_token',
      'subscription','entitlement','analytics_event','job','checklist_item'
    )
    and c.relrowsecurity = false;

  if missing is not null then
    raise exception 'DR: RLS is DISABLED after restore on: %', missing;
  end if;

  -- ---- 3. Policies came back ----------------------------------------------
  -- RLS enabled with zero policies denies everything: the app would be "up" and
  -- entirely non-functional, which reads as an app bug rather than a bad restore.
  select count(*) into n from pg_policies where schemaname = 'public';
  if n < 20 then
    raise exception 'DR: only % RLS policies present after restore (expected the full set)', n;
  end if;

  -- ---- 4. Seed content is present -----------------------------------------
  -- §8.1 relies on "content corpus + seed reproducible from the repo". These are
  -- the rows the app cannot render a screen without.
  select count(*) into n from tradition where is_active;
  if n < 4 then
    raise exception 'DR: expected the 4 seeded traditions, found %', n;
  end if;

  select count(*) into n from feature_flag;
  if n < 4 then
    raise exception 'DR: expected the seeded FF_* rows, found %', n;
  end if;

  -- Post-v1 flags must restore to OFF. A flag that comes back ON would ship
  -- unfinished scope to users during an incident, when nobody is looking at flags.
  select count(*) into n from feature_flag where enabled;
  if n > 0 then
    raise exception 'DR: % feature flag(s) restored as ENABLED; post-v1 FF_* must be OFF', n;
  end if;

  select count(*) into n from ritual;
  if n < 1 then
    raise exception 'DR: no ritual rows after restore';
  end if;

  -- ---- 5. Extensions the app depends on ------------------------------------
  -- pgvector is the one that bites: restore the schema without it and every
  -- retrieval query fails at query time, long after the restore "succeeded".
  select count(*) into n from pg_extension where extname = 'vector';
  if n < 1 then
    raise exception 'DR: the vector extension is absent after restore (RAG retrieval would fail)';
  end if;

  -- ---- 6. Enum types survived ---------------------------------------------
  select string_agg(t, ', ') into missing
  from unnest(array['notif_type','notif_channel','entitlement_kind','sub_status']) as t
  where to_regtype(t) is null;

  if missing is not null then
    raise exception 'DR: enum types missing after restore: %', missing;
  end if;

  -- ---- 7. The deletion executor survived the restore -----------------------
  -- Both functions must exist, or a restored database silently stops honouring CCPA
  -- deletion requests: `SVC_account.delete` keeps writing `account_deletion` rows and
  -- nothing executes them. That is exactly the state the executor was written to fix, and
  -- it is invisible — no error, no red, the data just stays.
  select string_agg(t, ', ') into missing
  from unnest(array[
    'execute_account_deletion',
    'sweep_due_account_deletions',
    'account_deletion_sweep_is_scheduled'
  ]) as t
  where to_regproc(t) is null;

  if missing is not null then
    raise exception 'DR: account-deletion functions missing after restore: % (deletion requests would accumulate unexecuted)', missing;
  end if;

  -- The SCHEDULE is checked but not enforced here. pg_cron is absent from the CI Postgres
  -- and from local stacks, so requiring it would fail every drill; and `cron.job` is not
  -- part of a `pg_dump` of the application database, so a restored copy legitimately comes
  -- back unscheduled. What matters is that an operator restoring production is told, rather
  -- than discovering it from a data-subject complaint months later.
  if not account_deletion_sweep_is_scheduled() then
    raise warning 'DR: the account-deletion sweep is NOT scheduled in this database. Expected for CI/local; if this is a restored PRODUCTION database, re-run 20260727000120_account_deletion_schedule.sql or deletion requests will never execute.';
  end if;

  raise notice 'DR invariants: OK';
end $$;
