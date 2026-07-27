# SESSION.md

# PanchangPal — Current Session

Version: 2.8.0
Last Updated: 2026-07-27 (B6.3 merged; the account-deletion executor built and verified)

**Main is at `603b5f5`** — B6.3 merged as PR #69, all five gates green. Working branch:
`feat/account-deletion-executor`.

Earlier this session: PR #68 (the previous session's dependency-triage handoff, left open and green)
was merged as `44b402a`.

---

# Completed

**1. B6.3 — the privacy inventory, policy draft and store labels (PR #69, merged).**
`docs/devops/DATA_INVENTORY.md` classifies all 32 tables, the nine `EVT_*` ids actually emitted,
six device-storage keys, six third-party processors and the permissions — built from the migrations
and the mobile source rather than the documentation. `PRIVACY_POLICY_DRAFT.md` and
`STORE_PRIVACY_LABELS.md` derive from it. The inventory is pinned by
`apps/backend/tests/privacy/data-inventory.test.ts`, which compares it against the schema and the
emitted event set **in both directions**; four perturbations proved it fails.

**2. The account-deletion executor — the launch blocker B6.3 found, closed the same day.**

| Piece | Where |
|---|---|
| Atomic per-user erasure | `execute_account_deletion(uuid)` — `20260727000110_…executor.sql` |
| Due-row sweep, one subtransaction per user | `sweep_due_account_deletions()` |
| pg_cron schedule, daily 03:15 UTC, idempotent | `20260727000120_…schedule.sql` |
| Assertable state | `account_deletion_sweep_is_scheduled()` |
| Operator trigger (TDD §6.5's scheduled SVC_account job) | `POST /account/sweep` |
| Proof | 17 pgTAP assertions in `tests/integration/account_deletion.test.sql` |

**SQL rather than TypeScript**: the erasure spans nine tables and supabase-js has no transaction
across calls, so a failure midway would leave an account half-erased with no way to tell how far it
got. The sweep secret is provisioned, never a user JWT, and **an unconfigured secret refuses
everyone**; `ACCOUNT_SWEEP_SECRET` is required at preflight's production tier.

# Defects found

1. **Six foreign keys a naive `delete from auth.users` gets wrong.** Four RESTRICT
   (`household.owner_id`, `invite.inviter_id`, `invite.accepted_by`, `referral.referred_user_id`)
   so the delete errors outright. Two use **ON DELETE SET NULL**, which keeps the row and drops only
   the link — leaving the deleted user's `display_name` in a household and their `email` and
   free-text `body` in a support ticket. Two tables had quietly opted out of erasure.
2. **A defect in my own test, caught by perturbation.** Removing the `support_ticket` delete did not
   fail the suite: the assertion counted `where user_id = ...`, the exact column SET NULL had just
   nulled. It read zero while the email sat in the table. Assertions now key on **content**.
3. **`executed_at` is unwritable** — `account_deletion` cascades with `app_user`, so the request row
   is erased with its own subject. This contradicts TDD Part 2 §5.1, which names the table as the
   **deletion audit** mitigating repudiation. The schema was implemented as declared rather than
   changing a foreign key (the surviving row would name a uid — a privacy decision). **TDD owes a
   resolution**; a completed deletion currently leaves no record.

# Verification

Against a real Postgres 17 in Docker, not asserted: migrations from scratch (32 tables) · **17
pgTAP assertions** checking rows are gone table by table · **five SQL perturbations** each failing
the right assertions · **two TypeScript perturbations** on the sweep authorization failing at both
layers · the **pg_cron branch exercised with the extension installed** (schedules, idempotent on
re-run, reports false when disabled) · the DR invariant failing with the executor dropped ·
preflight exit 1 without `ACCOUNT_SWEEP_SECRET`, 0 with. 97 vitest (+9), eslint at baseline, RLS and
DB suites green.

# Open

- ⚠️ **pg_cron is not enabled on the hosted projects** — owner dashboard action. Until then
  deletions execute only via the operator trigger, and both stores' Data Safety answers assume a
  schedule. Verify with `select account_deletion_sweep_is_scheduled();`.
- ⛔ **No worker consumes the `job` table** — `analytics_rollup`, `notify_schedule`,
  `winback_segment`, `content_ingest`, `entitlement_reconcile` have no consumer. The analytics
  rollup and prune, the personal-date tombstone sweep and the `panchang_cache` TTL all wait on it.
- **Apple 5.1.1(v) requires an in-app deletion screen** — needs a PDD affordance (none specified)
  and SVC_household for ownership transfer.
- **The CCPA export omits `message` rows** — incomplete the day `GURU_LIVE` is enabled.
- Nothing in the privacy documents is legally reviewed.
- Offline sync has never run against a live backend; no `FLOW_OFFLINE_SYNC` flow.
- `e2e.yml`'s step-summary echo still lists four flow names when five run.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides unbuilt.
- **Five Dependabot PRs (#61–#65) remain deliberately unmerged** — three red (jest 29→30 stops all
  five `@panchangpal/ui` suites from running; i18next 23→26; the production-minor group), two green
  but crossing the SDK 54 pin. Reasoning in `44b402a`.

# Blockers

1. **Owner: enable pg_cron** (free, dashboard) — turns the manual trigger into the daily schedule.
2. **Paid Supabase (~$25/mo)** — no PITR; user data unrecoverable. NFR-15 unmet, launch blocker.
3. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
4. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**The `job` table worker (ADR-025).** The deletion sweep proved the pg_cron half of that ADR; the
worker half is unbuilt, and it is the last of "nothing scheduled runs in this project". Start with
`analytics_rollup`, since ADR-013 already specifies service-side rollups and `analytics_event` is
the one table accumulating rows today with no prune.

Cheap follow-ups: add `message` rows to the CCPA export, correct `e2e.yml`'s flow-name echo, and
write `FLOW_OFFLINE_SYNC` now that a local emulator makes iterating fast.
