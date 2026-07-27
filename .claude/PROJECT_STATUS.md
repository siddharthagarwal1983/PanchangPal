# PROJECT_STATUS.md

# PanchangPal — Project Status Dashboard

Version: 1.10.0

Last Updated: 2026-07-27 (the account-deletion executor — the blocker B6.3 found is closed)

Purpose:
This document provides a high-level snapshot of the overall project.

It should answer:

- Where is the project today?
- What has been completed?
- What is currently being worked on?
- What comes next?

This is **not** a session log.

For day-to-day work see:

- SESSION.md
- TASK.md

Canonical progress metric: the **Beta Readiness & Platform Hardening** milestone percentage,
shared verbatim with DASHBOARD.md and CURRENT_MILESTONE.md. If these three disagree, DASHBOARD.md
is authoritative and the others must be reconciled to it.

---

# Overall Status

Current Phase

🚧 Beta Readiness & Platform Hardening (TDD Part 5)

Overall Progress

░░░░░░░░░░░░░░░░░░░░

**Mobile MVP — Phase 1: ✅ 100% (all 8 slices, merged)** · **Beta Readiness & Platform Hardening: 🚧 47% (3 of 8 slices — B2, B5, B6 — plus ¾ of B4)**

Project Health

🟢 On Track

Target MVP

Beta

Target Release

TBD

---

# Phase Progress

| Phase | Status | Progress |
|---------|---------|---------:|
| Idea Validation | ✅ Complete | 100% |
| Market Research | ✅ Complete | 100% |
| MRD | ✅ Complete | 100% |
| PRD | ✅ Complete | 100% |
| Product Design (PDD) | ✅ Complete | 100% |
| Technical Design (TDD) | ✅ Complete | 100% |
| AI Knowledge Base | ✅ Complete | 100% |
| Repository Foundation | ✅ Complete | 100% |
| ADR Repository | ✅ Complete | 100% |
| API Specification | ✅ Complete | 100% |
| Database Design | ✅ Complete | 100% |
| Backend Foundation (SVC_*) | ✅ Complete | 100% (panchang compute blocked by ADR-033) |
| Mobile Development (feature slices) | ✅ Complete | 100% (M1–M8 done) |
| AI Platform | 🟡 In Progress | Adapters + RAG pipeline done; corpus + eval pending |
| Testing | 🟢 Healthy | 447 green (350 mobile jest + 97 vitest) + **17 pgTAP assertions on the F-3 deletion executor** + 17 pgTAP RLS/DB assertions; bundle gate per PR; **4 Maestro FLOW_* green on main**; the emulator-ANR false-red is now fixed at its cause (AOSP image, PR #55) after PR #41's `hide_error_dialogs` proved a symptom patch — 3 of the last 4 failures were launcher ANRs; API contract gate restored and proven to fail; AI eval harness still owed |
| Beta | 🚧 In progress | 47% (B2 ✅; B5 ✅ at verifiable scope — NFR-15 still needs PITR; **B6 ✅ at verifiable scope** — OWASP review + 2 critical fixes + CCPA export + B6.3 inventory/policy/labels + §5.2 controls, ⛔ **but deletion is never executed**; B4 🟡 ~75% owner-gated on a Sentry org; B1/B3 owner-gated; B7–B8 pending) |
| Production Launch | ⏳ Pending | 0% |

---

# Current Milestone

Beta Readiness & Platform Hardening (TDD Part 5)

Objective

Take the feature-complete Mobile MVP (M1–M8) to a shippable beta — environments, E2E,
builds/distribution, observability, DR, security/privacy, release mechanics, go/no-go. No new
product scope. Sliced B1–B8; see CURRENT_MILESTONE.md.

Current Focus

- **B6 — Security & Privacy — ✅ complete at verifiable scope (2026-07-27).** B6.3 delivered the
  data-collection inventory, the privacy policy draft and the store Data Safety / App Privacy
  answers (`docs/devops/`), each derived from the one before it and the inventory pinned to the
  schema and the emitted `EVT_*` set by a conformance test proven to fail four ways.
  It found that account deletion was never executed — **and that is now closed.** The executor,
  the sweep, the pg_cron schedule, the secret-authorized operator trigger and 17 pgTAP assertions
  all exist, verified against a real Postgres 17. Residual: **pg_cron must be enabled on the hosted
  project** (owner, dashboard), and `executed_at` is unwritable because the audit row cascades with
  its own subject — a TDD contradiction now recorded. Next: **the `job` table worker** (ADR-025),
  which the analytics rollup, tombstone sweep and cache TTL are all waiting on.
- **Offline sync (TDD Part 4 §6) — ✅ complete at engineering scope (2026-07-26).** Mutation queue
  persisted and drained to SVC_sync; §6.1 read cache persisted. Never run against a live backend
  and not covered by a Maestro flow.
- M7 Notifications — ✅ complete (reviewed/approved 2026-07-18).
- M8 Subscription — ✅ complete (3 increments):
  - Increment 1 (household-grain entitlement read + gating) — ✅ complete, approved.
  - Increment 2 (SCR_SUBSCRIPTION_001 + plans/purchase/restore + affordance wiring) — ✅ complete, merged as PR #4.
  - Increment 3 (contextual paywall sheet + panchangpal://subscription routing + FF_FAMILY_PLAN) — ✅ complete, merged as PR #7.

Completed slices: M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru ·
M6 Profile/Household · M7 Notifications.

- **Session of 2026-07-25 — B2 (E2E verification) COMPLETE; session persistence verified.** Fixing
  the E2E build (PR #35 — it had been failing in `assembleRelease` and hanging to the timeout, so
  `cancelled` disguised a red build) let `FLOW_SESSION_PERSISTENCE` run. It failed, correctly:
  `react-native-mmkv@2.12.2` is incompatible with the New Architecture's bridgeless runtime, so MMKV
  degraded to memory and ritual sessions never persisted. Fixed by MMKV v2→v4 (PR #36). All three
  in-scope Maestro flows now GREEN in CI on a real native Android build (run 30155737941), persistence
  included. 176 tests, tsc, eslint clean.
- **Session of 2026-07-22** — issue #30: every date in the daily loop was computed in **UTC** and
  stored as the user's local date. In New Zealand and Australia that recorded the morning ritual
  against **yesterday for the entire local morning** — two of the three primary launch markets.
  Fixed across four increments (PR #31): the tz-aware utility ADR-026 always mandated, adoption of
  the device zone into `user_profile.timezone` (which nothing had ever written), `useLocalDate` in
  the screens, and an ESLint guard proven to fail on the reintroduced expression. Separately, the
  E2E gate was found to have produced **no signal since 2026-07-19** — `expo-updates` pushed the
  Android build past its timeout and cancelled runs hid it (PR #32). iOS verified running in Expo Go.
- **Beta Readiness build-out (2026-07-18/19)** — ✅ merged, 14 PRs. The MVP had never been
  executed anywhere; 12 defects fixed. Platform re-baselined to Expo SDK 54 / RN 0.81 / React 19
  and verified natively (3 Android APKs). CI now compiles the app every PR; CD migrates, seeds and
  deploys for real; dev + staging both provisioned and seeded; releases build unattended from a
  `v*` tag; Maestro E2E flows green in CI. **B2 now ✅ complete (2026-07-25).** B1 ~85%, B3 ~80% —
  their remainders gated on money, a store account, or a later slice. See CURRENT_MILESTONE.md.

See:

.claude/CURRENT_MILESTONE.md

---

# Documentation Status

| Document | Status |
|-----------|---------|
| MRD | ✅ Approved |
| PRD | ✅ Approved |
| PDD | ✅ Approved |
| TDD | ✅ Approved |
| AI Knowledge Base | ✅ Complete |
| ADR Repository | ✅ Complete |
| OpenAPI Specification | ✅ Complete |
| Database Documentation | ✅ Complete |
| Runbooks | 🟢 DevOps docs added (SETUP.md + docs/devops/*); operational runbooks partial |

---

# Architecture Status

| Area | Status |
|--------|---------|
| Mobile Architecture | ✅ Complete |
| Backend Architecture | ✅ Complete |
| AI Architecture | ✅ Complete |
| Platform Architecture | ✅ Complete |
| Security Architecture | ✅ Complete |
| Release Architecture | ✅ Complete |

Implementation: Mobile MVP Phase 1 is feature-complete (M1–M8).

---

# Repository Status

| Area | Status |
|--------|---------|
| Repository Structure | ✅ Complete |
| Shared Packages | ✅ Scaffolded |
| Expo App | ✅ App shell + all M1–M8 slices |
| Supabase Project | ⏳ Pending (migrations defined; not yet applied to a live project) |
| GitHub Actions | ✅ Complete |
| CI/CD | ✅ Defined |

---

# Backend Status

| Area | Status |
|--------|---------|
| Authentication | ✅ AuthRepository + anon-first/OAuth/OTP (backend + shell) |
| Database | ✅ Schema + RLS + repositories (migrations not yet applied live) |
| Edge Functions | 🟢 7 SVC_* wired (panchang compute blocked by ADR-033); SVC_household / SVC_notify_scheduler / SVC_revenuecat_webhook pending (client contracts coded) |
| APIs | ✅ OpenAPI (65 operations) + SVC_* handlers |
| RLS Policies | ✅ Defined across 29 tables |
| AI Provider | ✅ OpenAI adapters + RAG pipeline + rate limit/cost |
| Analytics Adapter | ✅ Client adapter + Postgres sink (ADR-013); daily-habit EVT_* emitting; insert-only contract gated by pgTAP and verified against hosted staging (INSERT 201 · SELECT/UPDATE/DELETE all no-op) |
| Payment Adapter | ✅ Webhook + BillingRepository (F-4) — webhook Edge Function pending |

---

# Mobile Status

| Area | Status |
|--------|---------|
| Expo Setup | ✅ App shell |
| Navigation | ✅ Shell (splash/auth/4-tab/guards/deep links) |
| Design System | ✅ Tokens + shell/feature components (extends per slice) |
| Components | 🟢 CMP_* for M1–M8 (Subscription: PLAN_CARD/VALUE_LIST/LEGAL_FOOTNOTE; BOTTOM_SHEET added Inc 3) |
| Authentication Flow | ✅ Anon-first + OAuth/OTP (shell) |
| Today (MOD_today) | ✅ SCR_HOME_001 (panchang unavailable per ADR-033) |
| Ritual Experience | ✅ Guided player (session engine, offline restore, text-first audio seam) |
| Calendar Experience | 🟡 Month shell (grid/navigation; spiritual markers blocked by ADR-033) |
| Ask Guru | 🟢 Client complete (live answers gated, GURU_LIVE=false) |
| Settings / Preferences | ✅ SCR_SETTINGS_001 (server-authoritative prefs; optimistic + offline) |
| Profile | ✅ SCR_PROFILE_001 (account state, deferred-auth prompt, entries) |
| Household | ✅ SCR_HOUSEHOLD_001 + SCR_HOUSEHOLD_INVITE_001 (members/roles/depth, invites, realtime) |
| Account deletion | ✅ SCR_DELETE_ACCOUNT_001 (F-3 transfer gate + grace window) |
| Notifications | ✅ Opt-in priming, per-channel prefs, token registration (NotificationAdapter seam), deep-link routing; sunrise/tithi content gated by ADR-033 |
| Subscription | ✅ Complete (entitlement read + usePremiumGate + PaymentAdapter/Null; SCR_SUBSCRIPTION_001 + plans/purchase/restore; contextual paywall sheet at app/modal/paywall; panchangpal://subscription routing; FF_FAMILY_PLAN offering gate) |

---

# AI Platform Status

| Area | Status |
|--------|---------|
| RAG Pipeline | ✅ Implemented (retrieval + pgvector RPC) |
| Prompt Registry | 🟡 In Progress |
| Model Registry | 🟡 In Progress |
| Embeddings | ✅ pgvector migration + retrieval RPC |
| Content Corpus (reviewed) | ⏳ Pending — gates live Ask Guru |
| Evaluation Suite | ⏳ Pending — gates live Ask Guru |

---

# DevOps Status

| Area | Status |
|--------|---------|
| GitHub Actions | ✅ Complete + hardened (least-privilege, retries, preflight gates, summaries; YAML-validated) |
| Linting | ✅ ESLint + Prettier configured |
| Testing Pipeline | 🟢 Vitest + pgTAP suites; CI db-tests now installs psql + pg_prove (first live run pending) |
| Build Pipeline | ✅ Turborepo defined |
| OTA Strategy | ✅ Defined |
| Release Automation | 🟡 Defined + preflight validator (scripts/preflight.sh); deploy steps scaffolded until EAS/projects provisioned |

---

# Testing Status

| Area | Status |
|--------|---------|
| Unit Tests | 🟢 In place (12+ Vitest suites) |
| Integration Tests | 🟢 pgTAP integration suite |
| Component Tests | 🟢 In place for delivered slices |
| Accessibility Tests | 🟢 a11y assertions in slice tests |
| AI Evaluation | ⏳ Pending |
| E2E Tests | 🟢 **5 FLOW_* GREEN** (incl. FLOW_AUTH_SESSION_PERSISTENCE, proven to fail without its fix) in CI on a native build (RETURNING, MORNING_RITUAL, SESSION_PERSISTENCE, AUTH_SESSION_PERSISTENCE, ONBOARDING) — **5/5 in 5m16s, run 30207484940 on `a05760d`**, 2026-07-26; gate fails fast (PR #35) and the launcher-ANR false-red is removed at its cause by the AOSP system image (PR #55, verified 4/4 in 1m23s on run 30196467032) |

---

# Top Priorities

Priority 1

🟡 **Owner: enable `pg_cron` on the hosted Supabase projects** (Dashboard → Database → Extensions).
The account-deletion executor shipped 2026-07-27 with a migration that schedules the daily sweep
wherever the extension exists and warns loudly where it does not. Until it is enabled in production,
deletions execute only when an operator triggers `POST /account/sweep` by hand — which works, but is
not a schedule, and both stores' Data Safety answers assume one. Verify with
`select account_deletion_sweep_is_scheduled();`.

Priority 2

⛔ **Build the `job` table worker (ADR-025).** The deletion sweep proved the pg_cron half; the
worker pattern is unbuilt, and `analytics_rollup`, `notify_schedule`, `winback_segment`,
`content_ingest` and `entitlement_reconcile` are enum values with no consumer. It is what the
analytics rollup and prune, the personal-date tombstone sweep and the `panchang_cache` TTL are all
waiting on — the residue of "nothing scheduled runs in this project", now one user short of empty.

Priority 3

**Owner action: create a Sentry org + DSN (free tier).** B4.1–B4.3 are in — client and server
telemetry seams, the EVT_* sink, `SENTRY_*` required at preflight's production tier, and a release
gate that blocks a production build with Sentry unconfigured. What remains (the source-map upload and
the §7.2 dashboards/alerts) needs a real Sentry project to be verifiable rather than configured, so
**B4 is now owner-gated like B1 and B3** — at no cost.

The EVT_* instrumentation is done (the daily habit funnel emits, EVT_017 included), the analytics
insert-only contract is gated in CI and verified against hosted staging, and the **API contract gate
B1 de-declared is restored as a real one** — proven to fail by three deliberate perturbations. Of
B1's two hollow gates, only the AI eval harness remains owed, and it is blocked on the corpus.

Priority 4

⛔ Ratify ADR-033 (Canonical Panchang Engine) — unblocks Today panchang, Calendar markers, notifications

Priority 5

AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)

Priority 6

Backend Edge Functions — SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook (client
contracts already coded). **SVC_household is now on the deletion critical path**: F-3 requires a
household owner to transfer ownership before deletion, so in-app account deletion cannot ship
without it.

Priority 7

Apply migrations to a live Supabase project + integration run

Priority 8

E2E (Maestro FLOW_*) + first live CI run

---

# Known Blockers

⛔ **Canonical Panchang Computation Engine** (ADR-033, Proposed)
- Issue: the deterministic astronomical algorithm (ephemeris, ayanamsa, per-tradition conventions, sunrise/tithi/muhurta) is not specified in any MRD/PRD/PDD/TDD and must not be guessed (a wrong tithi breaks trust, MRD Risk §1).
- Impact: SVC_panchang compute (Today/calendar/detail) and sunrise/tithi-timed notifications are blocked. Everything else is done. The whole system depends only on the abstract PanchangEngine/PanchangProvider interfaces, so no rework when it lands.
- Owner: Architecture + Product (+ pandit reviewer).
- Expected Resolution: ratify ADR-033 Part B (ephemeris/ayanamsa/traditions/methodology/validation dataset/tolerances) → implement a concrete engine → pass golden dataset. See docs/architecture/canonical-panchang-engine/.

🔒 **Ask Guru live answers gated** (GURU_LIVE = false)
- The Ask Guru client is complete but streams live answers only once a reviewed content corpus and evaluation readiness are in place (TDD Part 3 §9/§10B). Until then it honestly declines. Flipping the flag goes live.

ℹ️ **Deferred vendor dependencies** — `expo-notifications` (M7) and `react-native-purchases` (M8) are
not yet installed (offline sandbox can't regenerate the lockfile). Their adapters ship as pure ports +
Null implementations (NullNotificationAdapter / NullPaymentAdapter); the concrete adapters are one-line
swaps in the composition roots once the deps + keys land on the Mac. Entitlement READS and notification
prefs work today, so gating and prefs are real before the SDKs are wired.

---

# Next Major Deliverables

- Beta Readiness B1 (environments + fail-closed preflight), then B2 (replace the Maestro E2E placeholder with real FLOW_* specs)
- Reviewed AI content corpus + evaluation harness (unblocks live Ask Guru)
- Backend Edge Functions — SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook
- Initial Supabase Project (apply migrations) + integration run
- E2E automation (Maestro FLOW_*) + first live CI run

---

# Recently Completed

- **The account-deletion executor (2026-07-27).** The launch blocker B6.3 found, closed the same
  day. `execute_account_deletion(uuid)` performs an atomic per-user erasure — SQL rather than
  TypeScript, because it spans nine tables and supabase-js has no transaction across calls, so a
  failure midway would leave an account half-erased with no way to tell how far it got.
  `sweep_due_account_deletions()` isolates each user in its own subtransaction so one blocked
  account cannot stop every other erasure. A pg_cron migration schedules it daily and warns loudly
  where the extension is absent; `POST /account/sweep` is the operator trigger TDD §6.5 names,
  authorized by a provisioned secret rather than a user JWT — **an unconfigured secret refuses
  everyone**, because "not protected yet" is how an endpoint that deletes accounts ships open.
  **Six foreign keys needed explicit handling**: four RESTRICT, and two using ON DELETE SET NULL
  that keep the row and drop only the link, leaving a deleted user's display name in a household
  and their email and free-text body in a support ticket. `referral.referred_user_id` is nulled
  rather than deleted, because that row belongs to the referrer and one user's erasure must not
  destroy another's record.
  **A perturbation caught a defect in the test itself**: asserting `where user_id = ...` passes
  against exactly the SET NULL leak, since that is the column being nulled — the assertions key on
  content instead.
  Verified against a real Postgres 17: migrations from scratch, 17 pgTAP assertions, five SQL
  perturbations, two TypeScript perturbations, the pg_cron branch exercised with the extension
  installed (schedules, idempotent, reports false when disabled), and a DR invariant that fails with
  the executor dropped. Residual: **pg_cron must be enabled on the hosted project** (owner), and
  `executed_at` is unwritable because the audit row cascades with its own subject — a TDD
  contradiction now recorded. Progress unchanged at 47%.
- **B6.3 — the privacy inventory, and the deletion right that was never executed (2026-07-27).**
  Three documents in `docs/devops/`, each derived from the one before it: `DATA_INVENTORY.md`
  (all 32 tables classified, the nine `EVT_*` ids actually emitted with their props, six device
  storage keys, six third-party processors, permissions), `PRIVACY_POLICY_DRAFT.md` and
  `STORE_PRIVACY_LABELS.md`. Built from the migrations and the mobile source rather than from the
  documentation — reading the claim against the implementation is what has worked every time this
  milestone.
  **The inventory is pinned by a conformance test** (`apps/backend/tests/privacy/`), which parses
  `create table` from the migrations and quoted `'EVT_*'` literals from `apps/mobile/{app,src}` and
  compares both against the document in **both** directions: an unclassified table is undisclosed
  collection, and a classified table the schema lacks is a disclosure for data the product does not
  hold. Four perturbations each failed the right test. Same pattern as `SYNCABLE_KINDS` reading
  SVC_sync's source.
  ⛔ **It found that account deletion is scheduled and never executed** — `account_deletion` rows
  are written and never read back, `pg_cron` is commented out, no runner processes `job`, and
  `executed_at` is never set. Also found: the export omits `message` rows; no in-app affordance
  exists for export or deletion (Apple 5.1.1(v) makes one mandatory); a user-deleted personal date
  is a tombstone, not an erasure; and `packages/database`'s `TABLES` registry had drifted from the
  schema (29 against 32). **With this B6 is complete at verifiable scope; 44% → 47%.**
- **Offline sync — implemented (2026-07-26).** The launch blocker B6 surfaced. `STORE_offlineQueue`
  was an in-memory zustand slice beneath a header claiming MMKV persistence — never written to
  disk, never drained, never dequeued — and **nothing in `src/data` bound API_POST_SYNC at all**,
  so SVC_sync (implemented server-side since the Backend Foundation milestone) was unreachable from
  the app. Offline, a completion was lost on app kill; online, the successful entry leaked forever.
  Now: pure drain rules in `domain/sync` (FIFO batching, exponential backoff with half-range
  jitter, capped attempts, reconciliation where a conflict counts as acknowledged and anything
  unacknowledged is retried), a persisted queue through the shared `KeyValueStore` seam, the
  missing `syncRepository` binding, a single-flight `syncService`, `useOfflineSync` wiring §6.4's
  three triggers, and **the §6.1 persisted query cache** — the read half, without which a cold
  start offline is empty and §6.2's `[MANDATORY]` cached daily loop cannot hold. Two further
  defects found and guarded: the client queued five mutation kinds against a server that accepts
  three, and enqueuing before hydration overwrote the previous launch's pending mutations. Four
  perturbations proven to fail; 350 mobile tests (+51), 82 vitest, tsc/eslint/bundle green.
  **Not verified against a live backend, and no `FLOW_OFFLINE_SYNC` flow exists** — stated rather
  than implied. Progress is unchanged at 44%: this is a TDD Part 4 §6 gap in the Mobile MVP, not
  one of the eight Beta slices.
- **B6 — Security & Privacy, 3 of 4 increments (2026-07-26, PRs #57/#58).** The §5.2 OWASP Mobile
  Top 10 review, performed against the app as built. It found **two critical defects**, both fixed
  and each proven by reintroducing the defect and watching the test fail:
  **(1)** the auth session was never persisted — `persistSession: true` with no storage adapter
  falls back to memory in React Native, and because the app is anon-first that minted a FRESH
  anonymous uid on every cold start, orphaning the user's profile, household, streak, completions,
  personal dates and conversations; **(2)** `SVC_account` read the acting identity from the request
  body while running with the service role, so any caller could delete any account or reassign a
  victim's owned rows to themselves — account takeover, with co-members directly targetable since
  household member lists expose `user_id`. Also: CCPA export built to the §6.4 row set behind a
  versioned envelope (F-10 unratified, so the shape is explicitly provisional), and §5.2's SBOM,
  Dependabot and `eas-cli@latest` pinning closed. **B6.3** — data inventory, privacy policy, store
  labels — remains.
- **E2E gate made trustworthy (2026-07-26, PR #55):** the launcher-ANR false-red is removed at its
  cause — AVD `target: google_apis` → `default` (AOSP), which ships neither Pixel Launcher nor the
  Google app, neither of which anything under test needs. PR #41's `hide_error_dialogs` had bought
  three green runs and then stopped holding. Artifact analysis across the four recent failures put
  the real rate at **3 of 4 (~21% of runs)**, all with the suppression already active; the fourth was
  the genuine #50 gate breakage. Verified 4/4 in 1m23s with zero `Pixel Launcher` references in the
  artifacts. **Also corrected: the previous handoff recorded main as red with PR #53 unproven — main
  had gone 4/4 green half an hour after the failure it was written from.** A written status is not a
  verified state.
- **B5 §8.4 + the onboarding gate (2026-07-26):** operator-resilience section separating §8.4's real
  mitigations from the absent ones (no alerting, no contracted help). And `app/index.tsx`'s
  `const ONBOARDED = true` replaced with a persisted flag — SCR_AUTH_001 had never rendered from a
  cold launch, which is why B2 could not write FLOW_ONBOARDING. That flow now exists.
- **B5 §8.2 — graceful degradation encoded (2026-07-25):** a tested policy per ERR_* (surface,
  retry, queueing, daily-loop impact, copy key, PDD §12 row), exhaustive over the taxonomy. The
  bundle had three error strings for 24 codes. Copy is §13.5 verbatim where approved; the eleven
  codes §13.5 has not covered are pinned in `AWAITING_APPROVED_COPY` rather than filled with
  invented strings.
- **B5 opened — DR runbooks + mechanised restore drill (2026-07-25):** the five §8.3 scenarios
  documented with literal repo commands, and a monthly `dr-drill.yml` that builds from repo,
  round-trips through `pg_dump`/`pg_restore --exit-on-error`, and re-runs the same invariants file
  against the restored database (tables, RLS still enabled, policies, seed, pgvector, enums). First
  run: restore in 1s, invariants OK both sides. **Found and recorded: there is no PITR on the free
  tier, so NFR-15 is unmet for user data — a launch blocker.**
- **API contract gate restored (2026-07-25):** `openapi-conformance.test.ts` compares the zod
  contracts with `docs/api/openapi.yaml` — eight shared enums, ErrorEnvelope, and API_GET_TODAY's
  parameters/response — and was proven to fail by dropping a param, inventing an ERR_*, and renaming
  a response property.
- **Analytics insert-only contract gated (2026-07-25):** five pgTAP assertions on `analytics_event`
  using the client's exact envelope, plus a hosted staging probe (INSERT 201; SELECT/UPDATE/DELETE
  all no-ops). Surfaced that Supabase filters unauthorised writes rather than raising.
- **EVT_* daily habit funnel (2026-07-25):** EVT_012/015/016/017/018/019/020/021 now emit at their
  call sites (PDD §11.4), so `analytics_event` receives more than errors and the North Star input
  (EVT_017) fires. Ritual events derive from view-model transitions via a pure mapper so a re-render
  cannot double-count the metric the North Star sums. Also fixed EVT_054's property names, which
  B4.1 shipped as `code`/`surface` against §11.2's `error_code`/`screen_id`.
- **B4.3 — server telemetry seam + release gate (2026-07-25):** Edge Function errors report through
  a ServerTelemetry port at `errorResponse()` (no message, no PII); `SENTRY_*` required at the
  production preflight tier; `release-build.yml` blocks a production build with Sentry unconfigured.
  The source-map upload is deliberately not wired — it must come from inside the EAS build.
- **E2E false reds fixed (2026-07-25, PR #41):** emulator ANR dialogs were failing flows against a
  healthy app; `hide_error_dialogs` restored 3/3 green in 1m18s.
- **B4.2 — EVT_* analytics sink (2026-07-25):** AnalyticsService port + batching implementation over
  the `analytics_event` table (ADR-013), a device-minted pseudonymous id, primitives-only props, and
  EVT_* validation against the PDD §11 taxonomy. Gives EVT_054 a working destination.
- **B4.1 — telemetry seam (2026-07-25):** TelemetryAdapter port + NullTelemetryAdapter, the pure
  ERR_* → EVT_054 mapping (§7.1), and both error call sites wired (ErrorBoundary + a global
  ErrorUtils handler). No PII by construction. Crash reports still go nowhere — Sentry is deferred
  and no DSN is provisioned — so `getTelemetryBackend()` returns `'none'` and a DSN without an
  adapter warns.
- **B2 — E2E verification (2026-07-25):** E2E build made to fail fast (PR #35); MMKV v2→v4 so ritual
  sessions persist under New Arch (PR #36); all 3 in-scope Maestro flows GREEN in CI on a native build,
  session persistence verified end-to-end.
- Market Research
- MRD
- PRD
- Product Design Document
- Technical Design Document
- AI Knowledge Base
- Repository Organization
- ADR Repository (33 ADRs + template + governance guide)
- OpenAPI Specification (65 operations, docs/api/)
- Database Schema & Migrations (29 tables + RLS, apps/backend/migrations/ + docs/database/)
- Monorepo scaffold (pnpm + Turborepo; packages/api,shared,database,ui,design-tokens,ai; apps/mobile,backend)
- Expo app shell (4-tab router, providers, Zustand stores, theme, i18n) + GitHub Actions CI/CD (ci/cd/ota, CODEOWNERS, scripts)
- Backend Foundation: 7 SVC_* Edge Functions wired; OpenAI adapters + RAG pipeline; DB repositories + 2 pgvector/AI migrations; Ask Guru rate limit + cost circuit-breaker; Vitest suites + pgTAP integration suite; ADR-033 + panchang-engine work item
- Mobile Milestone 1 (Application Shell): PDD §6 design tokens; 11 CMP_* shell components (a11y-first); anon-first + OAuth/OTP auth (AuthRepository + STORE_session); splash/onboarding/4-tab navigation + guards + deep links + error boundary; i18n; 3 test suites
- Mobile Milestone 2 (Today / MOD_today): 9 Today CMP_*; client PanchangProvider abstraction + ProductionPanchangProvider + dev-only MockPanchangProvider; useToday/useChecklist/useCompleteRitual hooks (optimistic + offline queue); StreakService/RitualProgressService; SCR_HOME_001 composed (panchang unavailable per ADR-033); 2 test suites
- Mobile Milestone 3 (Guided Ritual Player / SCR_RITUAL_001): reusable RitualSession + RitualEngine; MMKV ritual-session repository; RitualRepository/query hook; NullAudioAdapter text-first seam; accessible completion state; 5 ritual CMP_* + domain/repository/UI tests
- Mobile Milestone 4 (Calendar Shell / SCR_CALENDAR_001): reusable Gregorian month layout, CalendarProvider/repository/query seam, accessible month navigation/grid/day cells + tradition switcher. Festival/vrat/panchang markers explicitly unavailable until ADR-033 is ratified
- Mobile Milestone 5 (Ask Guru Client / SCR_GURU_HOME/CHAT/HISTORY_001): trust-first home, streamed conversation, source/decline/error/offline states, cached history via a readiness-gated SSE transport. Client calls only the server API/SSE adapter — never an LLM directly and never fabricates. Live answers stay gated (GURU_LIVE=false) until corpus/eval readiness; component/domain/UI + a11y tests
- Mobile Milestone 6 (Profile/Household / MOD_you): server-authoritative preferences (owner-RLS, optimistic + offline queue); SCR_SETTINGS_001 / SCR_PROFILE_001; household domain + householdRepository (RLS read + SVC_household writes + Realtime member seam); useHousehold/useInvite; CMP_MEMBER_ROW/ROLE_PICKER/SHARE_BUTTON/INVITE_*; SCR_HOUSEHOLD_001 + SCR_HOUSEHOLD_INVITE_001; account deletion (F-3 gate + grace window, SCR_DELETE_ACCOUNT_001); domain/repository tests
- DevOps Platform Audit & Hardening (interlude, 2026-07-12): canonical env inventory (14 vars), secrets matrix, 6 .env.*.example templates, scripts/preflight.sh + bootstrap.sh, behavior-preserving workflow hardening (ci/cd/ota), docs/SETUP.md + docs/devops/*, DEVOPS_AUDIT_REPORT.md. No product/architecture/deploy-behavior changes
- **Mobile Milestone 7 (Notifications / MOD_notifications, 2026-07-18):** opt-in priming, per-channel server-authoritative prefs (user_profile.notif_prefs JSON), push-token registration behind the NotificationAdapter seam (NullNotificationAdapter until expo-notifications lands), notification-tap deep-link routing (incl. panchangpal://invite/{token}). Scheduling is always server-side (SVC_notify_scheduler); the client only registers token + prefs. Sunrise/tithi content gated by ADR-033. Reviewed/approved
- **Mobile Milestone 8 — Increment 3 (contextual paywall + routing + FF_FAMILY_PLAN, 2026-07-18):** CMP_BOTTOM_SHEET implemented to PDD §5.12 (specified since the component library but never built; four components already declared it a dependency) — SR-modal with focus trap, required-decision variant, Reduced-Motion fade-in-place. Contextual paywall composed of CMP_BOTTOM_SHEET + CMP_PLAN_CARD (no new CMP_*) as the `app/modal/paywall` route per TDD §3.1, reached by navigation intent so MOD_guru never imports MOD_you (§2.2 forbids cross-feature imports); Settings deep-dive + Ask Guru upsells now open it, replacing both inline cards. `panchangpal://subscription` → SCR_SUBSCRIPTION_001 in the linking table and in notification tap routing (both previously fell back to the You hub). FF_FAMILY_PLAN offering gate via a NEW fail-closed feature-flag read seam (featureFlagRepository + HOOK_useFeatureFlag, ADR-021 — nothing had ever read the `feature_flag` table), applied through the pure `visibleOfferings`. tsc + eslint clean; 153 tests green (mobile 120 / ui 33). Merged to main as PR #7
- **Mobile Milestone 8 — Increment 2 (SCR_SUBSCRIPTION_001 + affordance wiring, 2026-07-18):** 3 new CMP_* (PLAN_CARD as accessible radio with text-not-color best-value; VALUE_LIST with SR text equivalents; LEGAL_FOOTNOTE at min-AA); SCR_SUBSCRIPTION_001 with all states (default/skeleton/empty/offline/error/success + already-premium) + You-hub entry + route registration; usePlans/usePurchase/useRestore via the PaymentAdapter seam (no device receipt logic; entitlement never granted client-side — success only invalidates the entitlement query); usePremiumGate wired at deep-dive (Settings depth) + extended Ask Guru (contextual, dismissible). Component + hook tests; tsc-clean. Approved; merged as PR #4
- **Mobile Milestone 8 — Increment 1 (Subscription entitlement read + gating, 2026-07-18):** household-grain (F-4) entitlement READ via supabase-js RLS + realtime seam; pure mapping/rules (strict is_active; isEntitled/hasFamily/activeKind); PremiumCapability registry (deep_dive_content, extended_ask_guru) + usePremiumGate (fails open while loading; daily loop never gated); PaymentAdapter port + NullPaymentAdapter (never fabricates a purchase). Entitlement is READ-ONLY on device — the entitlement table denies all client writes (migration 20260712000060); the RevenueCat webhook is the sole writer. Domain + repository tests. Approved

Do not duplicate SESSION.md.

Only major milestones belong here.

---

# Success Metrics

Current Goal

Complete the Beta Readiness & Platform Hardening slices (B1–B8) and ship a real beta build.

Entry criteria for this milestone — status as of 2026-07-18:

- ✅ All eight mobile slices (M1–M8) implemented, reviewed, and merged.
- ✅ Every screen composes approved CMP_* with tokens-only styling and localized strings.
- ✅ Unit/component/domain tests pass in CI (153 tests; live CI runs green).
- ✅ A live staging Supabase project is provisioned and migrations applied via CD.
- ⛔ ADR-033 ratification and Ask Guru corpus/eval readiness remain outstanding — they gate a
  panchang-inclusive *launch*, not the beta-readiness work itself.

The project is considered ready for **Phased Production Release** when the §10.1 go/no-go
checklist is satisfied: all CD jobs do real work (no placeholders), FLOW_* E2E green on staging,
observability + alerting live, a DR restore drill performed, OWASP Mobile review clean, and store
compliance complete.

---

# Claude Update Rules

Update this document when:

- A project phase changes.
- A milestone **or increment** completes (see the Increment & Milestone Completion Checkpoint in
  CLAUDE.md — this file is updated at each increment boundary, not only at End Session).
- Overall progress changes significantly.
- Major deliverables are completed.

Do NOT update this file for:

- Daily work
- Small commits
- Bug fixes
- Temporary tasks

Those belong in SESSION.md.

---

# Project Roadmap

✅ Documentation → ✅ Repository Foundation → ✅ Backend Foundation → ✅ Design System →
✅ Authentication → ✅ Today's Panchang (shell; compute blocked by ADR-033) → ✅ Ritual Experience →
✅ Calendar Shell → ✅ Ask Guru AI (client; live answers gated) → ✅ Profile / Household →
✅ Notifications → ✅ Payments (M8 complete) → 🚧 Beta Readiness (B1–B8) → Beta → Production

---

# Executive Summary

The PanchangPal project has completed the product definition and architecture phases, the
repository and platform foundation, and the backend SVC_* services.

The Mobile MVP Phase 1 feature-slice milestone is **complete (100%)** and merged to main. All eight
slices — App Shell, Today, Guided Ritual, Calendar Shell, Ask Guru Client, Profile/Household,
Notifications, and Subscription (M1–M8) — are implemented, tsc/eslint clean, and green in CI.

The project is now in **Beta Readiness & Platform Hardening** (TDD Part 5), sliced B1–B8, at **47%
(3 of 8 — B2, B5 and B6, the latter two at verifiable scope — plus ¾ of B4)**. The milestone opened
on a known gap: CD reported green while its Maestro E2E and EAS build jobs were placeholders.

**B6 closed on 2026-07-27, and closing it found a launch blocker.** B6.3's data-collection
inventory — built from the migrations and the mobile source rather than from the documentation, and
pinned to both by a conformance test — established that **account deletion is recorded and never
executed**. The request is written to `account_deletion` with a 30-day grace and no code ever reads
it back; `pg_cron` is commented out and no job runner exists, so nothing scheduled runs in this
project at all. That single absence blocks the privacy policy, both stores' Data Safety answers and
Apple's in-app-deletion requirement, and is also why no retention sweep exists. It is the fourth
instance of the milestone's signature defect — a documented control, never implemented, with nothing
asserting it — and the most consequential, because the row it writes makes the system look like the
request is being honoured.

**B6's security review found the two most serious defects of the milestone** — the auth session that
never persisted (so every restart minted a new anonymous identity and orphaned the user's data), and
`SVC_account` reading the acting identity from the request body while running with the service role
(so any caller could delete any account or reassign a victim's rows to themselves). Both are fixed,
and each is proven by reintroducing the defect and watching the test fail. A third finding — the
offline queue is never drained, so offline-first is not implemented on the client — is recorded as a
launch blocker rather than fixed, because it is a missing feature and not a vulnerability.

**B2 (E2E verification) is complete** — the
Maestro placeholder is replaced by real FLOW_* specs GREEN in CI on a native Android build,
including FLOW_SESSION_PERSISTENCE, which along the way exposed and fixed a real persistence bug
(MMKV v2 vs New Architecture → v4 upgrade, PR #36). Staging migrations and Edge Function deploys are
real. B1 (prod environment) and B3 (store distribution) remainders are owner-gated.

**B4 (observability) is at ~75%, and its remainder is owner-gated.** B4.1 gives errors a single exit — the TelemetryAdapter port,
wired at the ErrorBoundary and at a global handler, with the ERR_* → EVT_054 mapping settled and no
PII possible by construction — and B4.2 gives that mapping a destination: the AnalyticsService port
over the `analytics_event` sink (ADR-013), with a device-minted pseudonymous id and primitives-only
props. Error rates are therefore measurable today.

B4.3 added the server half — Edge Function errors report through a ServerTelemetry port at the one
exit every ERR_* shares — plus the guardrails around a release: `SENTRY_*` required at preflight's
production tier, and a `release-build.yml` gate that blocks a production build when Sentry is
unconfigured, because a release with no crash reporting cannot be measured against NFR-06.

Crash reporting itself is still not happening. No Sentry org or DSN exists, so the §7.2 crash-free
SLO remains unmeasurable and B4 cannot close; the source-map upload was deliberately left unwritten
rather than faked, since Hermes maps must come from inside the EAS build that produced the bundle. That state is deliberately inspectable
(`getTelemetryBackend() === 'none'`) rather than silent, because an app that reports nothing is
otherwise indistinguishable from an app with no errors.
The only architectural blocker is the Canonical Panchang Engine decision (ADR-033); Ask Guru live
answers are intentionally gated until corpus/eval readiness.

The project remains on track and architecture is considered stable.
