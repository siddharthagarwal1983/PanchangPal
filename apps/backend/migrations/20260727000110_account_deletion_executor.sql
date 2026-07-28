-- =============================================================================
-- 20260727000110_account_deletion_executor.sql
-- PanchangPal — execute scheduled account deletions (F-3)
-- Source: TDD Part 2 §6.5 ("executed by a scheduled SVC_account job; hard-deletes
-- user-owned rows, anonymizes analytics"), TDD Part 5 §6.2, ADR-025, ADR-031.
-- Forward-only migration (TDD Part 2 §6.1).
--
-- WHY THIS EXISTS
-- Until B6.3 (2026-07-27) `SVC_account.delete` wrote an `account_deletion` row with a
-- 30-day grace window and NOTHING EVER READ IT BACK. No Edge Function queried the table,
-- no runner processed `job`, pg_cron was not enabled, and `executed_at` was never set.
-- The system recorded an intention to delete and kept the data indefinitely — and the row
-- it wrote made the request look honoured. CCPA §1798.105 grants a right to deletion, not
-- a right to have a request logged.
--
-- WHY IT IS SQL RATHER THAN TYPESCRIPT
-- The erasure spans nine tables with four foreign keys that RESTRICT. supabase-js issues
-- one statement per call with no enclosing transaction, so a failure midway would leave an
-- account half-erased — rows gone, user still present, `executed_at` unset, and no way to
-- tell how far it got. A function body is a single transaction: it completes or it does
-- not happen. The Edge Function (SVC_account `sweep`, per §6.5) calls this; it does not
-- reimplement it.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- execute_account_deletion(uuid)
--
-- Hard-deletes everything a user owns, then removes the auth row so the ON DELETE
-- CASCADE edges fire. Returns true if a user was deleted, false if there was nothing
-- to delete (already gone — the sweep is idempotent by design, since a retry after a
-- partial failure must be safe).
--
-- THE FOUR RESTRICT EDGES, which a naive `delete from auth.users` fails on:
--
--   household.owner_id        -> no ON DELETE clause. Deliberate: F-3 requires an owner
--                                with other members to transfer ownership first, and this
--                                function REFUSES rather than deleting a household out
--                                from under its members. The gate in SVC_account.delete
--                                already blocks the request; this is the backstop for a
--                                household formed during the 30-day grace window.
--   invite.inviter_id         -> deleted. An invite from a user who no longer exists is
--                                unusable, and the row names them.
--   invite.accepted_by        -> deleted. Nulling it would misrepresent a consumed invite
--                                as open, and if the token has not expired that is a live
--                                credential to a household. The membership itself lives in
--                                household_member, so nothing is lost by removing it.
--   referral.referred_user_id -> NULLED, not deleted. That row belongs to the REFERRER, a
--                                different person; one user's erasure must not destroy
--                                another's record. Nulling the reference removes the
--                                personal link while leaving their `activated_at` credit.
--
-- TWO MORE THAT WOULD SILENTLY RETAIN PERSONAL DATA, because ON DELETE SET NULL keeps the
-- row and only drops the link:
--
--   household_member          -> the row would survive as a "local member" still carrying
--                                the deleted user's `display_name`. Deleted outright.
--   support_ticket            -> the row would survive carrying `email` and a free-text
--                                `body`. Deleted outright.
--
-- ANALYTICS ARE LEFT ALONE, per TDD Part 2 §6.5 ("anonymizes analytics (already
-- PII-free)"). `analytics_event` carries a device-minted `user_pseudo_id` never derived
-- from the auth uid (ADR-031/ADR-013), so there is nothing to anonymize and no join back
-- to this user. Deleting those rows would corrupt the household-grain North Star for
-- everyone else in the household without improving the user's privacy position.
-- -----------------------------------------------------------------------------

create or replace function execute_account_deletion(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
  v_owned_households int;
begin
  select exists (select 1 from app_user where id = p_user_id) into v_exists;
  if not v_exists then
    return false;  -- idempotent: a retry after a partial failure must be safe
  end if;

  -- F-3 backstop. SVC_account.delete blocks an owner-with-members at request time, but a
  -- household can be formed during the 30-day grace window, and by then nobody is looking.
  -- Refusing loudly is right: the alternative is a foreign-key error from three statements
  -- later, or — worse, if the constraint were ever relaxed — deleting other people's
  -- household.
  select count(*) into v_owned_households
  from household h
  where h.owner_id = p_user_id
    and exists (
      select 1 from household_member m
      where m.household_id = h.id and m.is_active and m.user_id is distinct from p_user_id
    );

  if v_owned_households > 0 then
    raise exception 'account_deletion_blocked_transfer_ownership_first'
      using errcode = 'raise_exception';
  end if;

  -- Explicit handling for the edges that CASCADE does not cover, before the cascade fires.
  delete from invite where inviter_id = p_user_id or accepted_by = p_user_id;
  update referral set referred_user_id = null where referred_user_id = p_user_id;
  delete from household_member where user_id = p_user_id;
  delete from support_ticket where user_id = p_user_id;

  -- A household this user owns with NO other active members is theirs alone: delete it,
  -- rather than leaving an ownerless row that would block the delete below.
  delete from household where owner_id = p_user_id;

  -- The cascade. auth.users -> app_user -> user_profile, ritual_completion, streak,
  -- checklist_completion, personal_date, conversation (-> message -> message_source),
  -- push_token, notification, referral (as referrer), account_deletion.
  delete from auth.users where id = p_user_id;

  return true;
end;
$$;

comment on function execute_account_deletion(uuid) is
  'F-3 hard-erasure of one user. Atomic. Raises if the user owns a household with other '
  'active members. Idempotent: returns false when the user is already gone.';

-- -----------------------------------------------------------------------------
-- sweep_due_account_deletions()
--
-- The scheduled half: erases every account whose grace window has expired.
--
-- Each row is erased inside its own BEGIN/EXCEPTION block, which in plpgsql is a
-- subtransaction — so one blocked account rolls back alone and cannot stop every other
-- erasure. That is the failure mode of a sweep written as a single statement.
--
-- Rows that raise (a household owner who never transferred) are left in place and retried
-- on the next sweep. A deletion request that cannot be honoured must stay visible rather
-- than be quietly closed.
--
-- ⚠️ `executed_at` IS NOT WRITTEN, AND CANNOT BE. `account_deletion.user_id` is
-- `references app_user(id) on delete cascade`, so the request row is erased along with its
-- own subject: after a successful deletion there is no row left to stamp. Writing the
-- stamp first — the obvious implementation — produces a value nothing can ever observe.
--
-- This is a real tension between two approved documents, and it is recorded rather than
-- resolved here. TDD **Part 5** §5.1's threat model names `TBL_ACCOUNT_DELETION` as the
-- **deletion audit** mitigating repudiation, which requires the row to SURVIVE the
-- erasure; the schema in **Part 2** §3.15 declares a cascade, which requires it not to.
-- (Both were previously cited here as "Part 2 §5.1"; the conflict is across two Parts,
-- which is plausibly why review of either one alone did not catch it.) Changing the
-- foreign key would be inventing a schema decision with privacy consequences (the
-- surviving row names a uid), so this function implements the schema as declared and the
-- gap is logged for the TDD to settle. Consequence today: a completed deletion leaves no
-- record that it happened.
--
-- ➜ NOW TRACKED BY **ADR-034 — Account-Deletion Audit Record** (Proposed, 2026-07-28).
--   It settles what is decidable on engineering grounds — a deletion REQUEST and a
--   deletion AUDIT have opposite lifetimes and cannot be the same row, so the audit
--   becomes a separate service-role-only record that no cascade reaches, and `executed_at`
--   is retired — and refers the remaining question, WHAT IDENTIFIES THE SUBJECT of a
--   completed erasure, to Security/Privacy with Legal sign-off. **Do not change this
--   schema before that ratification.**
--
-- Returns (deleted, blocked) so the caller can log both. A rising `blocked` count means
-- users are stuck behind an ownership transfer they were never asked to perform.
-- -----------------------------------------------------------------------------

create or replace function sweep_due_account_deletions(p_now timestamptz default now())
returns table (deleted int, blocked int)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_deleted int := 0;
  v_blocked int := 0;
begin
  for r in
    select user_id
    from account_deletion
    where executed_at is null
      and execute_after <= p_now
    order by execute_after
  loop
    begin
      if execute_account_deletion(r.user_id) then
        v_deleted := v_deleted + 1;
        -- No stamp: the account_deletion row cascaded away with app_user. See the note above.
      end if;
    exception
      when others then
        v_blocked := v_blocked + 1;  -- row left in place; retried on the next sweep
    end;
  end loop;

  deleted := v_deleted;
  blocked := v_blocked;
  return next;
end;
$$;

comment on function sweep_due_account_deletions(timestamptz) is
  'Executes every account_deletion past its grace window. Blocked rows stay unstamped and '
  'are retried. Idempotent; safe to run on any schedule.';

-- -----------------------------------------------------------------------------
-- Privileges
--
-- Both functions are SECURITY DEFINER and erase data across every owned table, so no
-- client role may reach them. `authenticated` includes anonymous users (ADR-009), and
-- anyone can mint an anonymous JWT for free — the lesson B6.2 recorded when SVC_account
-- trusted the request body for identity. The service role calls these; nobody else can.
-- -----------------------------------------------------------------------------

revoke all on function execute_account_deletion(uuid) from public, anon, authenticated;
revoke all on function sweep_due_account_deletions(timestamptz) from public, anon, authenticated;
grant execute on function sweep_due_account_deletions(timestamptz) to service_role;
grant execute on function execute_account_deletion(uuid) to service_role;
