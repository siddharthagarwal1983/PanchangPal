-- =============================================================================
-- 20260809000140_analytics_rollup.sql
-- PanchangPal — the `analytics_event` daily rollup (ADR-025; PDD §11.3/§11.4; TDD Part 5 §7.1).
--
-- WHY THIS EXISTS. `analytics_event` is INSERT-ONLY for clients (policy `analytics_ins_own`,
-- no select policy) because rollups run service-side (ADR-013/ADR-025). Until now nothing ran
-- them, so every EVT_* the app records has been WRITE-ONLY: §10.1 items 11, 19 and 21 all trace
-- back to this one absence. The North Star has been computable in principle and computed by
-- nothing.
--
-- COUNTS, NEVER RATIOS. §11.3 states habit depth as "ritual completion rate (EVT_017/opens)"
-- and never defines "opens". Storing a rate here would freeze one reading of an undefined
-- denominator into the data itself, where it would outlive anyone's memory of the choice. Counts
-- are facts; a rate is an interpretation, and interpretations belong in the query.
--
-- DAILY GRAIN, WEEKS DERIVED. The North Star is weekly (§11.3), but storing weeks would make
-- every other question (D1/D7/D30, §11.5) unanswerable without a second table. Days sum into
-- ISO weeks; weeks do not divide into days.
-- =============================================================================

-- ---- TBL_ANALYTICS_ROLLUP_DAILY ---------------------------------------------
create table if not exists analytics_rollup_daily (
  local_date   date        not null,
  event_id     text        not null,
  household_id uuid        null,
  -- `false` means this row is bucketed by the UTC date because the event carried no usable
  -- `local_date`. See the attribution note below: it is NOT a synonym for the user's day.
  attributed   boolean     not null,
  event_count  bigint      not null,
  user_count   bigint      not null,
  computed_at  timestamptz not null default now(),
  constraint analytics_rollup_daily_counts_sane check (event_count >= user_count and user_count >= 0)
);

-- `nulls not distinct` because household_id is legitimately NULL (a solo user with no household),
-- and the default NULL semantics would let the upsert insert an unbounded number of duplicate
-- "no household" rows instead of updating one — silently inflating every total that sums them.
create unique index if not exists analytics_rollup_daily_key
  on analytics_rollup_daily (local_date, event_id, household_id, attributed) nulls not distinct;

comment on table analytics_rollup_daily is
  'Daily counts derived from analytics_event (ADR-025). Counts only, never rates: PDD §11.3 '
  'leaves the "opens" denominator undefined, so a stored ratio would freeze an unratified '
  'interpretation. Service-role only, exactly like its source.';

comment on column analytics_rollup_daily.attributed is
  'True = bucketed by the user''s own local_date (ADR-026). False = the event carried none and '
  'is bucketed by UTC, which is WRONG for AU/NZ mornings by up to a day. Filter on true for the '
  'North Star; count false to see how much of the data cannot be trusted to a day.';

-- ---- RLS: service-role only, matching the source table -----------------------
-- No policies at all. Edge Functions run with the service role and bypass RLS; every other
-- caller is denied. A rollup is aggregate behavioural data about identifiable households, so it
-- is no more readable by a client than `analytics_event` is (which has an insert policy and
-- deliberately no select policy).
alter table analytics_rollup_daily enable row level security;

-- -----------------------------------------------------------------------------
-- rollup_analytics_daily(p_lookback_days)
--
-- Idempotent by construction: recomputes each touched (local_date, event_id, household_id,
-- attributed) bucket from source rows and upserts. Re-running changes nothing; running twice
-- concurrently cannot double-count, because nothing is incremented.
--
-- ⚠️ THE LOOKBACK IS NOT COSMETIC. Events reach the server LATE by design — the client batches
-- them (20 per batch, flushed on backgrounding) and the offline queue drains only on reconnect,
-- so a completion made on a plane can land days after it happened. A worker that rolled up
-- "yesterday" once and never revisited it would permanently under-count exactly the offline-first
-- usage the product is built around. Recomputing a window is what makes late arrivals correct
-- rather than lost.
-- -----------------------------------------------------------------------------
create or replace function rollup_analytics_daily(p_lookback_days int default 7)
returns bigint
language plpgsql
as $$
declare
  v_from  date;
  v_rows  bigint;
begin
  if p_lookback_days is null or p_lookback_days < 0 then
    raise exception 'rollup_analytics_daily: p_lookback_days must be >= 0, got %', p_lookback_days;
  end if;

  v_from := (current_date - make_interval(days => p_lookback_days))::date;

  with src as (
    select
      -- The client supplies `props`, so this must not be able to break the worker. A malformed
      -- local_date is treated as ABSENT rather than cast (an unguarded ::date would abort the
      -- whole run on one bad row) — and absent is already a state this table represents.
      case
        when e.props->>'local_date' ~ '^\d{4}-\d{2}-\d{2}$'
          then (e.props->>'local_date')::date
      end                                             as local_date,
      (e.ts at time zone 'UTC')::date                 as utc_date,
      e.event_id,
      e.household_id,
      e.user_pseudo_id
    from analytics_event e
  ), bucketed as (
    select
      coalesce(local_date, utc_date) as local_date,
      (local_date is not null)       as attributed,
      event_id, household_id, user_pseudo_id
    from src
  )
  insert into analytics_rollup_daily
    (local_date, event_id, household_id, attributed, event_count, user_count, computed_at)
  select
    local_date, event_id, household_id, attributed,
    count(*)                        as event_count,
    count(distinct user_pseudo_id)  as user_count,
    now()
  from bucketed
  where local_date >= v_from
  group by local_date, event_id, household_id, attributed
  on conflict (local_date, event_id, household_id, attributed) do update
    set event_count = excluded.event_count,
        user_count  = excluded.user_count,
        computed_at = excluded.computed_at;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

comment on function rollup_analytics_daily(int) is
  'Recomputes daily analytics buckets for the last N days and upserts them. Idempotent: nothing '
  'is incremented, so a re-run or an overlapping run cannot double-count. The window exists '
  'because batching and the offline queue make events arrive late.';

-- -----------------------------------------------------------------------------
-- Schedule it. Same shape as the deletion sweep (20260727000120), and for the same reason:
-- pg_cron is a Supabase dashboard/extension action, absent in CI, so this must neither
-- `create extension` (which would fail every CI run) nor skip silently.
-- -----------------------------------------------------------------------------
do $$
declare
  v_has_cron boolean;
begin
  select exists (select 1 from pg_extension where extname = 'pg_cron') into v_has_cron;

  if not v_has_cron then
    raise warning using message =
      'pg_cron is not installed: the analytics rollup is NOT scheduled. Every EVT_* the app '
      'records stays write-only, and the North Star, activation and monetization boards have no '
      'source. Enable pg_cron (Supabase Dashboard -> Database -> Extensions) and re-run this '
      'migration. Verify with: select analytics_rollup_is_scheduled();';
    return;
  end if;

  perform cron.unschedule('panchangpal_analytics_rollup')
  where exists (select 1 from cron.job where jobname = 'panchangpal_analytics_rollup');

  -- Hourly at :20. Hourly rather than daily because a dashboard that is up to 24 hours stale is
  -- one nobody trusts during a launch; :20 to stay clear of the 03:15 deletion sweep, which takes
  -- row locks across nine tables.
  perform cron.schedule(
    'panchangpal_analytics_rollup',
    '20 * * * *',
    $cron$ select rollup_analytics_daily(7); $cron$
  );

  raise notice 'Scheduled panchangpal_analytics_rollup (hourly at :20, 7-day lookback).';
end
$$;

-- -----------------------------------------------------------------------------
-- analytics_rollup_is_scheduled()
--
-- Makes "is the rollup actually running?" answerable rather than assumed — the same lever the
-- deletion sweep needed. False when pg_cron is absent, the job is missing, OR it exists and is
-- inactive: an operator can disable a cron job, and a disabled rollup looks identical to a
-- scheduled one from the migration's point of view. A silently-stopped rollup does not error;
-- the dashboards simply stop moving, which is indistinguishable from a quiet week.
-- -----------------------------------------------------------------------------
create or replace function analytics_rollup_is_scheduled()
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
      select 1 from cron.job where jobname = 'panchangpal_analytics_rollup' and active
    )
  $q$ into v_ok;
  return coalesce(v_ok, false);
end;
$$;

comment on function analytics_rollup_is_scheduled() is
  'True only if pg_cron is installed AND the analytics rollup job exists AND it is active. '
  'False means EVT_* data is accumulating with nothing reading it.';
