-- =============================================================================
-- apps/backend/tests/integration/account_deletion.test.sql
-- PanchangPal — F-3 account deletion executor (pgTAP).
-- Source: TDD Part 2 §6.5, TDD Part 5 §6.2, ADR-031.
--
-- WHY THIS SUITE IS THE POINT OF THE FEATURE, NOT AN ADDITION TO IT.
-- Before 2026-07-27 the deletion path wrote an `account_deletion` row and nothing ever
-- executed it. Nothing failed; nothing was red; the data simply stayed. A deletion that
-- silently does not delete is indistinguishable from one that works unless something
-- asserts the rows are GONE — so that is what these tests do, table by table, rather than
-- asserting that the function returned without error.
--
-- Runs in CI via pg_prove against a freshly migrated DB, same harness as the RLS suite.
-- =============================================================================

begin;
select plan(23);
create extension if not exists pgtap;

-- ---- Fixtures ---------------------------------------------------------------
-- The sweep is global by nature: it processes every due row in the table, not a set handed
-- to it. So the (deleted, blocked) counts below are only meaningful if this suite owns the
-- whole table. Cleared inside the transaction, and rolled back with everything else — this
-- costs nothing and removes a dependency on which suites pg_prove happened to run first.
delete from account_deletion;

-- A: the user being deleted, holding a row in every table that cascades.
-- B: a bystander — owns the household A belongs to, and referred A.
-- C: an owner whose household still has another active member → must be BLOCKED (F-3).
-- D: C's co-member, and a deletion request whose grace window has NOT expired.

insert into tradition (code, name) values ('generic','Generic') on conflict do nothing;
insert into ritual (id, slug, tradition_code, title)
  values ('d0000000-0000-0000-0000-0000000000f1'::uuid, 'del-r1', 'generic', 'R1') on conflict do nothing;
insert into checklist_item (id, tradition_code, label)
  values ('d0000000-0000-0000-0000-0000000000c1'::uuid, 'generic', 'Deletion suite item') on conflict do nothing;

insert into auth.users (id, is_anonymous) values
  ('da000000-0000-0000-0000-00000000000a', false),
  ('db000000-0000-0000-0000-00000000000b', false),
  ('dc000000-0000-0000-0000-00000000000c', false),
  ('dd000000-0000-0000-0000-00000000000d', false)
on conflict do nothing;

-- A's data, one row per cascade edge.
insert into user_profile (user_id, city) values ('da000000-0000-0000-0000-00000000000a','Sydney');
insert into ritual_completion (user_id, ritual_id, local_date, completed_at, client_id)
  values ('da000000-0000-0000-0000-00000000000a','d0000000-0000-0000-0000-0000000000f1'::uuid,'2026-07-01', now(), gen_random_uuid());
insert into streak (user_id, current_len) values ('da000000-0000-0000-0000-00000000000a', 5);
insert into checklist_completion (user_id, item_id, local_date, client_id)
  values ('da000000-0000-0000-0000-00000000000a','d0000000-0000-0000-0000-0000000000c1'::uuid,'2026-07-01', gen_random_uuid());
insert into personal_date (user_id, name, basis, gregorian_date, client_id)
  values ('da000000-0000-0000-0000-00000000000a','Dadaji','gregorian','1950-03-04', gen_random_uuid());
insert into conversation (id, user_id, title)
  values ('dcafe000-0000-0000-0000-00000000000a','da000000-0000-0000-0000-00000000000a','Thread');
insert into message (conversation_id, role, content)
  values ('dcafe000-0000-0000-0000-00000000000a','user','free text the user typed');
insert into push_token (user_id, expo_token) values ('da000000-0000-0000-0000-00000000000a','ExpoTok[del-A]');
insert into notification (user_id, deep_link) values ('da000000-0000-0000-0000-00000000000a','panchangpal://today');
insert into support_ticket (user_id, email, body)
  values ('da000000-0000-0000-0000-00000000000a','a@example.com','an email address in free text');

-- B's household; A is a member but NOT the owner, so A is deletable.
insert into household (id, name, owner_id)
  values ('d8000000-0000-0000-0000-00000000000b','Family','db000000-0000-0000-0000-00000000000b');
insert into household_member (household_id, user_id, display_name) values
  ('d8000000-0000-0000-0000-00000000000b','db000000-0000-0000-0000-00000000000b','Bee'),
  ('d8000000-0000-0000-0000-00000000000b','da000000-0000-0000-0000-00000000000a','Ay');

-- The four foreign keys that RESTRICT — the ones a naive delete fails on.
insert into invite (household_id, token, inviter_id, expires_at)
  values ('d8000000-0000-0000-0000-00000000000b','del-tok-sent-by-A','da000000-0000-0000-0000-00000000000a', now() + interval '7 days');
insert into invite (household_id, token, inviter_id, expires_at, accepted_by, accepted_at)
  values ('d8000000-0000-0000-0000-00000000000b','del-tok-accepted-by-A','db000000-0000-0000-0000-00000000000b', now() + interval '7 days','da000000-0000-0000-0000-00000000000a', now());
insert into referral (referrer_id, code, referred_user_id, activated_at)
  values ('db000000-0000-0000-0000-00000000000b','DEL-B-CODE','da000000-0000-0000-0000-00000000000a', now());
insert into referral (referrer_id, code) values ('da000000-0000-0000-0000-00000000000a','DEL-A-CODE');

-- C owns a household with another ACTIVE member → F-3 blocks deletion.
insert into household (id, name, owner_id)
  values ('d8000000-0000-0000-0000-00000000000c','Cee House','dc000000-0000-0000-0000-00000000000c');
insert into household_member (household_id, user_id, display_name) values
  ('d8000000-0000-0000-0000-00000000000c','dc000000-0000-0000-0000-00000000000c','Cee'),
  ('d8000000-0000-0000-0000-00000000000c','dd000000-0000-0000-0000-00000000000d','Dee');

-- Requests: A due, C due-but-blocked, D not yet due.
insert into account_deletion (user_id, requested_at, execute_after) values
  ('da000000-0000-0000-0000-00000000000a', now() - interval '31 days', now() - interval '1 day'),
  ('dc000000-0000-0000-0000-00000000000c', now() - interval '31 days', now() - interval '1 day'),
  ('dd000000-0000-0000-0000-00000000000d', now(), now() + interval '30 days');

-- ---- The sweep --------------------------------------------------------------
create temporary table sweep_result as select * from sweep_due_account_deletions();

select is((select deleted from sweep_result), 1, 'sweep erased exactly the one deletable due account');
select is((select blocked from sweep_result), 1, 'sweep reported the household owner as blocked, not deleted');

-- ---- 3–13. A is GONE, table by table ----------------------------------------
-- Asserted individually rather than as one total: a single summed count would pass while
-- one table quietly retained its rows, which is precisely the defect being guarded.
select is((select count(*)::int from user_profile where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'user_profile erased');
select is((select count(*)::int from ritual_completion where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'ritual_completion erased');
select is((select count(*)::int from streak where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'streak erased');
select is((select count(*)::int from checklist_completion where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'checklist_completion erased');
select is((select count(*)::int from personal_date where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'personal_date erased (the most sensitive field in the product)');
select is((select count(*)::int from message where conversation_id='dcafe000-0000-0000-0000-00000000000a'), 0, 'message erased through conversation''s cascade');
select is((select count(*)::int from push_token where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'push_token erased');
select is((select count(*)::int from notification where user_id='da000000-0000-0000-0000-00000000000a'), 0, 'notification erased');
-- These two are asserted by CONTENT, not by user_id, and the distinction is the whole point.
-- Both tables use ON DELETE SET NULL, which keeps the row and merely drops the link — so a
-- `where user_id = ...` count reads 0 whether the row was erased or merely orphaned, and
-- passes while the user's email and display name sit in the table. A perturbation that
-- removed the explicit delete proved exactly that: the assertion below is the one that
-- catches it.
select is((select count(*)::int from support_ticket where email='a@example.com'), 0,
  'support_ticket erased by content — ON DELETE SET NULL would have orphaned the row and kept the email and body');
select is((select count(*)::int from household_member where display_name='Ay' and household_id='d8000000-0000-0000-0000-00000000000b'), 0,
  'household_member erased by content — ON DELETE SET NULL would have kept the deleted user''s display_name in the household');
select is((select count(*)::int from invite where inviter_id='da000000-0000-0000-0000-00000000000a' or accepted_by='da000000-0000-0000-0000-00000000000a'), 0, 'invites naming the user erased, both directions');
select is((select count(*)::int from auth.users where id='da000000-0000-0000-0000-00000000000a'), 0, 'the auth row itself is gone');

-- ---- 15. The bystander's row survives, with the personal link removed --------
-- A referral belongs to the REFERRER. One user's erasure must not destroy another user's
-- record, so the reference is nulled while their activation credit is kept.
select ok(
  (select count(*)::int from referral where referrer_id='db000000-0000-0000-0000-00000000000b'
     and referred_user_id is null and activated_at is not null) = 1,
  'the referrer keeps their row and their credit; only the link to the deleted user is nulled'
);

-- ---- 16. F-3: the household owner is refused, and stays refused -------------
select is(
  (select count(*)::int from auth.users where id='dc000000-0000-0000-0000-00000000000c'), 1,
  'an owner with other active members is NOT deleted (F-3 transfer-ownership-first)'
);

-- ---- 17. The grace window is real -------------------------------------------
select is(
  (select count(*)::int from auth.users where id='dd000000-0000-0000-0000-00000000000d'), 1,
  'a request inside its grace window is not executed early'
);

-- ---- 18-23. ADR-034: the audit OUTLIVES the erasure it records -------------
-- The whole point. `account_deletion` cascades away with its subject, so before ADR-034 a completed
-- erasure left no record at all — while TDD Part 5 §5.1 names that record as the repudiation
-- mitigation. These assert the audit exists, is a DIGEST rather than an identifier, and carries no
-- recovered content.

select is(
  (select count(*)::int from account_deletion_audit
     where subject_digest = account_deletion_subject_digest('da000000-0000-0000-0000-00000000000a')),
  1,
  'a completed erasure leaves exactly one audit row, keyed by the digest of its subject'
);

select is(
  (select count(*)::int from account_deletion where user_id='da000000-0000-0000-0000-00000000000a'),
  0,
  'the REQUEST row is gone — the audit survives an erasure that destroyed its own source'
);

-- The digest must not be the identifier. Asserting on CONTENT rather than on the column name,
-- because the same class of mistake as "assert a deletion by user_id" is available here: a column
-- called subject_digest that happens to hold a uuid would pass a name-based check.
select ok(
  (select subject_digest from account_deletion_audit
     where subject_digest = account_deletion_subject_digest('da000000-0000-0000-0000-00000000000a'))
    <> 'da000000-0000-0000-0000-00000000000a',
  'the stored value is NOT the raw uid (ADR-034 chose the digest over Alternative B)'
);

select ok(
  (select subject_digest from account_deletion_audit
     where subject_digest = account_deletion_subject_digest('da000000-0000-0000-0000-00000000000a'))
    ~ '^[0-9a-f]{64}$',
  'the stored value is a 64-char hex sha256 digest, the frozen construction ADR-034 specifies'
);

-- Verification is the operation a repudiation dispute needs: digest the uid the claimant supplies
-- and look it up. A uid that was never erased must NOT match.
select is(
  (select count(*)::int from account_deletion_audit
     where subject_digest = account_deletion_subject_digest('dc000000-0000-0000-0000-00000000000c')),
  0,
  'a user who was NOT erased has no audit row — the record can refute a claim as well as confirm one'
);

-- The grace window is evidenced, which is the other half of what §5.1 asks the record to prove.
select ok(
  (select requested_at is not null from account_deletion_audit
     where subject_digest = account_deletion_subject_digest('da000000-0000-0000-0000-00000000000a')),
  'the audit carries requested_at, captured before the request row cascaded away'
);

select * from finish();
rollback;
