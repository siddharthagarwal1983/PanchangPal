-- =============================================================================
-- ADR-035 is the preferences rule; THIS is ADR-034 — Account-Deletion Audit Record.
-- Ratified 2026-08-02: Alternative C, a one-way digest of the subject.
--
-- THE CONTRADICTION THIS CLOSES. TDD Part 5 §5.1 (STRIDE, [MANDATORY]) names
-- TBL_ACCOUNT_DELETION as the deletion AUDIT mitigating repudiation — which requires the row to
-- outlive the erasure. TDD Part 2 §3.15 declares `user_id ... on delete cascade` — which erases it
-- along with its own subject. Neither document is wrong; one row was being asked to have two
-- lifetimes. A completed deletion therefore left NO record that it happened.
--
-- The request and the audit are separate records:
--   `account_deletion`       pending intent, F-3 grace window, owner-readable, cascades. Correct.
--   `account_deletion_audit` the fact of a completed erasure. No FK to app_user, so no cascade
--                            reaches it. Service-role only.
--
-- WHY A DIGEST AND NOT THE RAW uid (ADR-034 Alternative C over B). A table of raw user ids is a
-- durable list of the identifiers of people who asked to be forgotten — the single most sensitive
-- by-product this feature can produce, and one an attacker with service-role access would find more
-- useful than the deleted data itself. The digest still answers the question a repudiation dispute
-- actually asks — "did you erase MY account?" — because the claimant supplies the identifier and
-- the operator digests it and compares. What it gives up is open enumeration ("list everyone erased
-- in March"), which no dispute needs and which is precisely the roster we do not want to hold.
--
-- ⚠️ THE DIGEST CONSTRUCTION IS FROZEN. It is sha256 of the uid's canonical text form, hex-encoded,
-- unsalted. Changing it — a salt, a different algorithm, a different text rendering — makes every
-- existing record unverifiable, because there is no remaining row anywhere to recompute from.
-- Unsalted is deliberate and safe here: a v4 uuid has 122 bits of entropy, so the dictionary attack
-- a salt defends against is infeasible, and a per-row salt would add nothing an attacker holding the
-- table does not already have.
-- =============================================================================

-- The one place the digest is defined. Callers must never inline the expression.
--
-- ⚠️ USES CORE `sha256()`, NOT pgcrypto's `digest()`. The first version called
-- `digest(p_user_id::text, 'sha256')` and applied cleanly against a local Postgres 17 — and then
-- failed CD on staging with `function digest(text, unknown) does not exist`. On Supabase, pgcrypto
-- is installed into the **`extensions`** schema, not `public`, so with `search_path = public` the
-- function is unresolvable; a local `create extension pgcrypto` puts it in `public`, which is why
-- local verification could not see it.
--
-- `sha256(bytea)` has been in **pg_catalog** since PostgreSQL 11, and pg_catalog is always in the
-- search path. That removes the extension dependency altogether rather than papering over it by
-- adding `extensions` to `search_path` — one less thing that has to be true about the environment.
-- The output is byte-identical to the pgcrypto form: both hash the UTF-8 bytes of the same text.
create or replace function account_deletion_subject_digest(p_user_id uuid)
returns text
language sql
immutable
set search_path = public
as $$
  select encode(sha256(p_user_id::text::bytea), 'hex');
$$;

comment on function account_deletion_subject_digest(uuid) is
  'ADR-034: frozen one-way digest of an erased subject. sha256(uuid::text), hex, unsalted. '
  'Changing this makes every existing audit record unverifiable — there is no row left to recompute from.';

create table if not exists account_deletion_audit (
  id              uuid primary key default gen_random_uuid(),
  -- NOT a foreign key, and deliberately not a uuid: nothing may cascade to this row, and the
  -- value is a digest rather than an identifier.
  subject_digest  text not null,
  -- The FACT of the erasure. `requested_at` is copied from the request row before it cascades, so
  -- the audit can evidence that the F-3 grace window was honoured.
  requested_at    timestamptz null,
  executed_at     timestamptz not null default now(),
  outcome         text not null default 'erased',
  created_at      timestamptz not null default now(),
  constraint account_deletion_audit_outcome_chk check (outcome in ('erased'))
);

-- Verification is "digest the uid I was given and look it up", so that is the index.
create index if not exists idx_account_deletion_audit_subject
  on account_deletion_audit(subject_digest);
create index if not exists idx_account_deletion_audit_executed
  on account_deletion_audit(executed_at);

comment on table account_deletion_audit is
  'ADR-034 / TDD Part 5 §5.1: durable evidence that an erasure completed. Holds the FACT only — '
  'never content recovered from the deleted rows. Service-role only; no cascade reaches it.';

-- SERVICE ROLE ONLY. RLS on with NO policies denies every client role outright; the service role
-- bypasses RLS. Under ADR-030 and the B6.2 finding, `authenticated` includes anonymous users and
-- anyone can mint an anonymous JWT for free — a table listing completed erasures must not be
-- reachable by any client credential.
alter table account_deletion_audit enable row level security;

-- =============================================================================
-- Write the audit INSIDE the erasure, before the cascade removes its source.
-- Same transaction as the deletion: an erasure that completed without a record, or a record
-- without an erasure, would each be worse than the gap this closes.
-- =============================================================================
create or replace function execute_account_deletion(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
  v_owned_households int;
  v_requested_at timestamptz;
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

  -- Captured BEFORE the cascade destroys the request row: the audit evidences that the F-3 grace
  -- window was honoured, which is half of what §5.1 asks the record to prove (ADR-034).
  select requested_at into v_requested_at from account_deletion where user_id = p_user_id;

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

  -- AFTER the erasure, so a failure above leaves no audit claiming an erasure that did not
  -- happen. Same transaction, so the reverse cannot happen either (ADR-034).
  insert into account_deletion_audit (subject_digest, requested_at, outcome)
  values (account_deletion_subject_digest(p_user_id), v_requested_at, 'erased');

  return true;
end;
$$;

comment on function execute_account_deletion(uuid) is
  'F-3 hard-erasure of one user. Atomic. Raises if the user owns a household with other active '
  'members. Writes account_deletion_audit in the same transaction (ADR-034).';

-- =============================================================================
-- Retire `executed_at`. It is dead schema: nothing writes it — nothing CAN, because the row
-- cascades with its own subject — and its only reader was `where executed_at is null`, a predicate
-- unconditionally true. A column that exists to record an event which destroys the row it lives on
-- is a standing invitation to reimplement the bug.
-- =============================================================================
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
    where execute_after <= p_now
    order by execute_after
  loop
    begin
      if execute_account_deletion(r.user_id) then
        v_deleted := v_deleted + 1;
      end if;
    exception when others then
      -- One blocked account must not stop every other erasure. Each user gets its own
      -- subtransaction; a raise here (F-3 ownership) is counted and skipped.
      v_blocked := v_blocked + 1;
    end;
  end loop;

  deleted := v_deleted;
  blocked := v_blocked;
  return next;
end;
$$;

alter table account_deletion drop column if exists executed_at;
