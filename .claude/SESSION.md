# SESSION.md

# PanchangPal — Current Session

Version: 2.9.0
Last Updated: 2026-07-27 (B6.3, the deletion executor, pg_cron enabled, and the three owed
follow-ups — all merged)

**Main is at `6099267`, clean, with CD and E2E both green.** Merged this session, in order:
`44b402a` #68 dependency triage · `603b5f5` #69 B6.3 · `de5ff14` #70 deletion executor ·
`2e792dd` #71 CD sweep check · `c9f5f28` #72 export + echo · `6099267` #73 FLOW_OFFLINE_SYNC.

---

# Completed

**B6.3 — the privacy documents (#69).** `DATA_INVENTORY.md` classifies all 32 tables, the nine
`EVT_*` ids actually emitted, six device-storage keys, six third-party processors and the
permissions — built from the migrations and the mobile source, not the documentation.
`PRIVACY_POLICY_DRAFT.md` and `STORE_PRIVACY_LABELS.md` derive from it. §2 and §4 are pinned by
`apps/backend/tests/privacy/data-inventory.test.ts`, which compares the document against the schema
and the emitted event set **in both directions**. Four perturbations proved it fails.

**The account-deletion executor (#70).** The launch blocker B6.3 found, closed the same day.
`execute_account_deletion(uuid)` is an atomic per-user erasure; `sweep_due_account_deletions()`
isolates each user in its own subtransaction; a pg_cron migration schedules it daily;
`POST /account/sweep` is the operator trigger TDD §6.5 names, secret-authorized, refusing everyone
when unconfigured. SQL rather than TypeScript because the erasure spans nine tables and supabase-js
has no transaction across calls.

**pg_cron enabled on both hosted projects, and confirmed.** Staging via CD
(`account_deletion_sweep_is_scheduled()` true, the ⚠️ annotation gone); dev via a dispatched
`dev-migrate` (`NOTICE: Scheduled panchangpal_account_deletion_sweep (daily 03:15 UTC)`).
**This is the first scheduled job that has ever run in this project.**

**The three owed follow-ups (#72, #73).** The CCPA export's missing messages; `e2e.yml`'s flow echo
now derived from the directory; and `FLOW_OFFLINE_SYNC`, green on main — **E2E runs 6 flows.**

# Defects found

1. ⛔ **Account deletion was recorded and never executed** (B6.3) — fixed in #70.
2. **Six foreign keys a naive `delete from auth.users` gets wrong** — four RESTRICT, and two
   (`household_member`, `support_ticket`) using ON DELETE SET NULL, which keeps the row and drops
   only the link, leaving a display name in a household and an email in a support ticket.
3. **A defect in my own test**, caught by perturbation: asserting `where user_id = ...` passes
   against exactly that SET NULL leak. The assertions now key on content.
4. **The CCPA export omitted every message** — `message` keys on `conversation_id`, not `user_id`.
5. **SVC_notify_scheduler is a shell** — `loadDueCandidates()` discards its query and returns `[]`
   unconditionally, `sendDue()` returns `0`, `suppressIfCompleted()` is never called. Found while
   evaluating whether to schedule it; **doing so would have made notifications look live while
   provably sending nothing.**
6. **The #61 Dependabot theory was wrong** — jest stays at 29.7.0. The cause is
   `Incorrect version of "react-test-renderer" … Expected "19.2.8", but found "19.1.0"`, because the
   group bumps `react` past the exactly-pinned SDK 54 baseline. **Three** PRs cross that pin, not
   two; the other seven bumps in the group are not SDK-coupled and could be split out.
7. **Three E2E-harness defects, none in offline sync** — a launch race where a stale TASK's
   destroy-timeout killed the newly started process; the flow breaking a neighbour because a
   cleared offline banner proves the app *thinks* it is online rather than that it is; and both
   being visible only in the uploaded artifact, never the run log.
8. **`analytics_event` has no specified retention** — v1.0 of the inventory attributed a prune to
   ADR-025, which mentions pruning zero times, while §6.4 says deletion leaves analytics intact.
   Corrected; recorded as a documentation gap.

# Open

- ⚠️ **`executed_at` is unwritable** — `account_deletion` cascades with its own subject, so a
  completed deletion leaves no record. Contradicts TDD Part 2 §5.1's deletion-audit claim.
  **The TDD owes a resolution.**
- ⛔ **No worker consumes the `job` table.** Every `job_type` is blocked: `analytics_rollup` on F-5
  (TDD §688 gates rollup tables on ratified KPI targets), `notify_schedule` on the shell above,
  `content_ingest` on the corpus, `winback_segment` post-v1, `entitlement_reconcile` on RevenueCat.
  Building the worker now would add a mechanism with nothing to process.
- **Apple 5.1.1(v) requires an in-app deletion screen** — needs a PDD affordance and SVC_household.
- Nothing in the privacy documents is legally reviewed.
- **A latent E2E hazard:** `FLOW_MORNING_RITUAL` and `FLOW_RETURNING` end without cleanup, so any
  flow opening with a cleared launch can draw the launch race depending on Maestro's ordering.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides unbuilt.
- **Five Dependabot PRs (#61–#65) open and deliberately unmerged** — see defect 6.

# Blockers

1. **Paid Supabase (~$25/mo)** — no PITR; user data unrecoverable. NFR-15 unmet, launch blocker.
2. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
3. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**Split the seven non-SDK bumps out of #61** — `@supabase/supabase-js`, both `@tanstack/*`,
`@typescript-eslint/*`, `prettier`, `turbo`. They are not SDK-coupled, and landing them shrinks the
open dependency queue from five to a coherent three that all cross the SDK 54 pin and belong in one
deliberate upgrade increment.

After that the credential-free engineering is largely exhausted: what remains is owner-gated
(purchases), product-gated (F-5, PDD screens and copy, the corpus), or the TDD resolution above.
