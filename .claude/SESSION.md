# SESSION.md

# PanchangPal — Current Session

Version: 2.7.0
Last Updated: 2026-07-27 (B6.3 — privacy inventory, policy draft, store labels; B6 closed at
verifiable scope)

**Main is at `44b402a`.** Merged at the start of this session: PR #68, the dependency-triage handoff
doc the previous session wrote and left open with all five gates green.

Working branch: `feat/b6-3-privacy-inventory`.

---

# Completed

**B6.3 — the last B6 increment. Three documents, each derived from the one above it.**

- **`docs/devops/DATA_INVENTORY.md`** — all 32 tables classified (Identifying / Personal /
  Pseudonymous / Non-personal) with what each holds, who writes it, and whether it is collected
  **today**; the nine `EVT_*` ids the app actually emits with their props; six on-device storage
  keys; six third-party processors; permissions (none requested today). Built from
  `apps/backend/migrations` and `apps/mobile/{app,src}`, **not** from the documentation.
- **`docs/devops/PRIVACY_POLICY_DRAFT.md`** — user-facing draft, `[LEGAL REVIEW REQUIRED]`, with
  `[UNBUILT]` markers wherever a normal policy sentence would be false today.
- **`docs/devops/STORE_PRIVACY_LABELS.md`** — Play Data Safety + Apple App Privacy answers, each
  with the ⚠️ trigger that changes it when a deferred dependency lands.

**The inventory is machine-checked**, which is the part that will still be true in six months.
`apps/backend/tests/privacy/data-inventory.test.ts` parses `create table` out of the migrations and
quoted `'EVT_*'` literals out of the mobile source, then compares both against the document **in
both directions**: an unclassified new table is collection nobody disclosed, and a classified table
the schema no longer has is a disclosure for data the product does not hold. Same pattern as
`SYNCABLE_KINDS` reading SVC_sync's source.

**Verified:** four perturbations, each failing the right test — a new table in a migration, a table
row deleted from the doc, a newly emitted `EVT_029`, an event row deleted from the doc. 88 vitest
(+6), eslint 0 errors.

# Defects found

1. ⛔ **Account deletion is scheduled and never executed.** `POST /account/delete` gates the request
   per F-3 and writes `account_deletion` with a 30-day `execute_after`. **Nothing reads that row
   back** — no Edge Function queries the table, no runner processes `job`, `pg_cron` is *commented
   out* in `20260712000001_extensions.sql`, `executed_at` is never set. TDD Part 5 §6.2's
   "hard-deletes owned rows" does not exist in the repository. The system accepts a deletion request
   and keeps the data indefinitely, and the row it writes makes it look like the request is being
   honoured. **The same absence is why no retention sweep exists** — no analytics rollup or prune, no
   personal-date tombstone removal, no `panchang_cache` TTL. One fix, not five.
2. **The CCPA export omits `message` rows** — `EXPORT_TABLES` returns the `conversation` header
   without its messages, so the export goes incomplete the day `GURU_LIVE` is enabled.
3. **No in-app affordance for export or deletion.** Both endpoints work; no screen calls either.
   **Apple 5.1.1(v) requires in-app account deletion**, making this mandatory rather than a nicety —
   and it needs SVC_household too, since F-3 requires ownership transfer first.
4. **A user-deleted personal date is a tombstone, not an erasure** (`deleted_at`, for offline
   reconcile). Must be disclosed; "delete" reasonably implies erasure.
5. **`packages/database`'s `TABLES` registry had drifted** — 29 names against 32 tables; the three
   `ai_operational` tables were never registered. Which is why the test parses the migrations.

# Open

- ⛔ **The deletion executor is unbuilt** — the top priority, and fully engineering-closable.
- Nothing in B6.3 is legally reviewed. No policy or label is publishable until (a) the executor
  exists and (b) a qualified reviewer has approved the text. Open items are listed in the draft's
  appendix and `STORE_PRIVACY_LABELS.md` §4.
- Offline sync has never run against a live backend; no `FLOW_OFFLINE_SYNC` flow exists.
- **Doc/workflow drift: E2E runs 5 flows, not 4.** `e2e.yml`'s step-summary echo still lists four
  names. Still owed (a code change, not a doc).
- §6.4 wants EVT_* on sync confirm; B4.5 fires them from view-model transitions. Unchanged.
- PDD owes approved copy for 11 of 24 ERR_* codes; SCR_ONBOARDING_* slides remain unbuilt.
- **Five Dependabot PRs (#61–#65) remain open and deliberately unmerged.** Three red (#63 jest
  29→30 stops all five `@panchangpal/ui` suites from *running*; #62 i18next 23→26; #61 the
  production-minor group, likely the same jest break transitively). Two green but crossing the SDK
  54 pin (#64 `@expo/metro-runtime` → 57, #65 `@babel/runtime` → 8). Their green is weak: the bundle
  gate is `expo export`, and no dependency PR has ever been exercised on a device. Full reasoning in
  `44b402a`.

# Blockers

1. ⛔ **The account-deletion executor** (engineering, no purchase) — blocks the privacy policy, both
   store forms, Apple 5.1.1(v), and every retention sweep.
2. **Paid Supabase (~$25/mo)** — no PITR; user data unrecoverable. NFR-15 unmet, launch blocker.
3. **Sentry org + DSN** (free tier) — the only thing between B4 and done.
4. Apple $99 · Google Play $25 → most of B3.

# Recommended next task

**Build the account-deletion executor.** An Edge Function (or a `pg_cron`-invoked routine) that
reads `account_deletion` rows past `execute_after`, hard-deletes the `OWNED_TABLES` set, sets
`executed_at`, and removes the `auth.users` row — plus something to invoke it, since this project
currently has no scheduled execution of any kind. That last part is the wider fix: it is also what
every retention sweep is waiting on.

Prove it the way this repo proves things: a test that fails with the executor removed, and a check
that a deleted user's rows are genuinely gone rather than orphaned.

Cheap follow-ups still worth folding in: correct `e2e.yml`'s flow-name echo, add `message` rows to
the CCPA export, and write `FLOW_OFFLINE_SYNC` now that a local emulator makes iterating fast.
