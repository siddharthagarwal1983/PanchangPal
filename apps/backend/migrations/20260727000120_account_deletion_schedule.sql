-- =============================================================================
-- 20260727000120_account_deletion_schedule.sql
-- PanchangPal — schedule the deletion sweep (ADR-025: pg_cron + jobs table).
-- Source: TDD Part 2 §6.5, TDD Part 1 §7.10.
--
-- THE PROBLEM THIS FILE HAS TO SOLVE HONESTLY
-- `pg_cron` is a Supabase **dashboard/extension-catalog** action on a hosted project, not
-- something a migration can turn on from the repo, and it is NOT present in the CI
-- Postgres container. So this migration cannot simply `create extension pg_cron` — that
-- would fail every CI run — and it must not silently skip either, because "documented,
-- not implemented" is the exact defect the executor was written to fix.
--
-- So: schedule it where pg_cron exists, and where it does not, RAISE A WARNING that names
-- the consequence. The state is then also assertable — see
-- `account_deletion_sweep_is_scheduled()` below, which the production readiness check
-- calls, so an environment that never enabled pg_cron fails a check instead of quietly
-- retaining data it was asked to erase.
-- =============================================================================

do $$
declare
  v_has_cron boolean;
begin
  select exists (select 1 from pg_extension where extname = 'pg_cron') into v_has_cron;

  if not v_has_cron then
    -- Deliberately a WARNING, not an exception: CI and local stacks legitimately lack
    -- pg_cron and must still migrate. Production must not — that is what the readiness
    -- check is for.
    raise warning using message =
      'pg_cron is not installed: the account-deletion sweep is NOT scheduled. '
      'Deletion requests will accumulate unexecuted, which is a CCPA exposure. '
      'Enable pg_cron (Supabase Dashboard -> Database -> Extensions) and re-run this '
      'migration. Verify with: select account_deletion_sweep_is_scheduled();';
    return;
  end if;

  -- Idempotent: unschedule any prior definition before scheduling, so re-running the
  -- migration (forward-only replays are expected, TDD Part 2 §6.1) cannot leave two jobs
  -- racing each other over the same rows.
  perform cron.unschedule('panchangpal_account_deletion_sweep')
  where exists (select 1 from cron.job where jobname = 'panchangpal_account_deletion_sweep');

  -- Daily at 03:15 UTC. The grace window is 30 days, so the sweep's cadence only decides
  -- how far past the window an erasure may sit — hours, not days. Off-peak because the
  -- erasure takes row locks across nine tables.
  perform cron.schedule(
    'panchangpal_account_deletion_sweep',
    '15 3 * * *',
    $cron$ select sweep_due_account_deletions(); $cron$
  );

  raise notice 'Scheduled panchangpal_account_deletion_sweep (daily 03:15 UTC).';
end
$$;

-- -----------------------------------------------------------------------------
-- account_deletion_sweep_is_scheduled()
--
-- Makes "is the sweep actually running?" a question with an answer, rather than an
-- assumption. Returns false when pg_cron is absent OR the job is missing OR it is
-- present but inactive — an operator can disable a cron job, and a disabled sweep looks
-- exactly like a scheduled one from the migration's point of view.
--
-- Called by the production readiness check and asserted by the DR restore drill: a
-- restored database that comes back without its schedule is a database that has silently
-- stopped honouring deletion requests, which is precisely the class of "comes back subtly
-- wrong and looks healthy" the drill exists to catch.
-- -----------------------------------------------------------------------------

create or replace function account_deletion_sweep_is_scheduled()
returns boolean
language plpgsql
stable
as $$
declare
  v_ok boolean;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    return false;
  end if;
  execute $q$
    select exists (
      select 1 from cron.job
      where jobname = 'panchangpal_account_deletion_sweep' and active
    )
  $q$ into v_ok;
  return coalesce(v_ok, false);
end;
$$;

comment on function account_deletion_sweep_is_scheduled() is
  'True only if pg_cron is installed AND the deletion sweep job exists AND it is active. '
  'False means deletion requests are accumulating unexecuted.';
