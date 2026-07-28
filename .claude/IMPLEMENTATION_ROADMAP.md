# IMPLEMENTATION_ROADMAP.md

# PanchangPal — Implementation Roadmap

Version: 2.5.0
Last Updated: 2026-07-28 (ADR-034 opens the deletion-audit decision; the SDK-crossing PRs are closed)

Purpose: the forward plan from the current state. Complements PROJECT_STATUS.md (snapshot) and
CURRENT_MILESTONE.md (active milestone). Updated when scope or sequencing changes — and at every
increment/milestone boundary per the Increment & Milestone Completion Checkpoint in CLAUDE.md.

---

## Where we are (2026-07-28)

**Beta Readiness & Platform Hardening, 47%** — B2 ✅, B5 ✅ and B6 ✅ (the latter two at verifiable
scope), plus ¾ of B4. B1 ~85%, B3 ~80%, all remainders owner-gated on money or a store account.

**B6 closed on 2026-07-27 with B6.3** — the data-collection inventory, the privacy policy draft and
the store Data Safety / App Privacy answers, all in `docs/devops/`, each derived from the one before
it. The inventory was built from the migrations and the mobile source rather than from the
documentation, and §2/§4 are pinned to both by a conformance test proven to fail four ways.

It found a launch blocker — account deletion was recorded and never executed — **and that blocker
was closed the same day.** The executor, the sweep, the pg_cron schedule, the secret-authorized
operator trigger and 17 pgTAP assertions all exist, verified against a real Postgres 17 with five
SQL and two TypeScript perturbations.

**`pg_cron` was then enabled on both hosted projects and confirmed** — staging through CD
(`account_deletion_sweep_is_scheduled()` true, the warning annotation gone) and dev through a
dispatched `dev-migrate`. **It is the first scheduled job that has ever run in this project.**

**One residual on the executor:** `executed_at` cannot be written, because the audit row cascades
with its own subject — a contradiction with TDD **Part 5** §5.1's deletion-audit claim. A completed
deletion currently leaves no record that it happened. **Now opened as ADR-034 (see below).**

**The three owed follow-ups also closed** (#72, #73): the CCPA export's missing `message` rows,
`e2e.yml`'s flow echo (now derived from the directory, so it cannot drift again), and
**`FLOW_OFFLINE_SYNC`** — which makes E2E **6 flows, 6/6 green on main**, and closes the residual
risk PR #66 recorded against itself.

**The `job` table worker was investigated and deliberately NOT built.** Nothing writes to `job`, and
every `job_type` is blocked: `analytics_rollup` on **F-5** (TDD Part 1 §688 gates rollup tables on
ratified KPI targets — a PM decision), `notify_schedule` on SVC_notify_scheduler being a shell,
`content_ingest` on the corpus, `winback_segment` post-v1, `entitlement_reconcile` on RevenueCat.
Building it would have added a mechanism with nothing to process — the placeholder shape B1 spent
its time removing.

**The #61 split is DONE (2026-07-28, PR #74, `0185ea9`).** The seven non-SDK bumps —
`@typescript-eslint/*`, `prettier`, `turbo`, `@supabase/supabase-js`, both `@tanstack/*` — are on
main with all five CI gates green.

**And the "SDK-upgrade increment" the split was supposed to produce turned out not to exist
(2026-07-28, PR #77).** The three PRs left in that queue were checked against the **installed peer
graph** and all three closed: **#64** `@expo/metro-runtime` 6.1.2→57.0.7, whose dist-tags map majors
to **SDK majors** (`latest` 57.0.7 is **SDK 57**) against `expo-router@6.0.24`'s `^6.1.2` peer;
**#65** `@babel/runtime` 7→8 against `babel-preset-expo@54.0.12`'s `^7.20.0` peer; and **#75** —
which superseded #61 after #74 landed — `react` 19.1.0→19.2.8, peer-**legal** under RN's `^19.1.0`
but contradicted by react-native shipping a Fabric renderer hardcoded to React `"19.1.0"`. They were
never an increment: `.github/dependabot.yml` held the correct rule and short **patterns** (`expo-*`
does not match a scoped `@expo/` name), now extended to `react`, `@types/react`, `@expo/*` and
`@babel/runtime`.

**Two corrections to what this file previously said.** #64 and #65 were **not** red — they passed
**all five gates including the bundle gate**, and only the peer-legal #75 was red. Green is
anti-correlated with safety for an SDK-pinned package, because `expo export` resolves what fails
natively. And "`react-test-renderer` must move with `react`" was the prescribed fix; satisfying that
assertion (`@testing-library/react-native`'s `ensure-peer-deps.js`, which compares the two exactly)
would have turned CI green while leaving the renderer mismatched.

**The deletion-audit resolution is now open as ADR-034 (Proposed, 2026-07-28).** **TDD Part 5 §5.1**
requires the audit to outlive the erasure; **Part 2 §3.15**'s schema erases it with its own subject.
Neither is wrong — one row is being asked to have two lifetimes, because `account_deletion` is a
correct *request* table and cannot also be the durable record of a completed erasure. The ADR
separates them, makes the audit service-role-only, confines it to the fact of erasure, and retires
the unwritable `executed_at`; it refers **what identifies the subject of a completed erasure** to
Security/Privacy with Legal sign-off, recommending a one-way digest without choosing it. (The
contradiction was mis-cited in seven places as "TDD Part 2 §5.1", which is *Identity, Onboarding &
Profile* — API contracts with no threat model. All corrected.)

**Next, in order:** (1) **owner ratification of ADR-034** — the engineering behind it is small and
entirely blocked on that answer; (2) the **in-app deletion screen** Apple 5.1.1(v) requires, which
needs a PDD affordance and SVC_household for ownership transfer. A genuine Expo SDK upgrade is future
work rather than a milestone deliverable, and when it happens it still needs a native build plus the
six Maestro flows — the only method that has ever caught that class of change here.

**After that the credential-free engineering is largely exhausted.** What remains is owner-gated
(paid Supabase, Sentry, store accounts), product-gated (F-5, PDD screens and ERR_* copy, the
reviewed corpus), or documentation decisions.

**Offline sync (TDD Part 4 §6) was implemented and merged on 2026-07-26** (`86b3843`, PR #66),
closing a launch blocker B6's OWASP review surfaced: the mutation queue was in memory beneath a header claiming persistence, was never
drained or dequeued, and nothing bound API_POST_SYNC, leaving SVC_sync unreachable from the app.
The queue is now durable, drained on §6.4's three triggers with jittered backoff, and dequeued on
server acknowledgement; the §6.1 read cache is persisted so an offline cold start is not empty. It
does not move the percentage — §6 is a Mobile MVP deliverable, not a Beta slice.

Also 2026-07-26: **the app ran natively on the dev Mac for the first time** — local Android SDK,
AOSP arm64 emulator, prebuild + Gradle build, installed and launched. Maestro flows are now
iterable locally rather than only through CI, which is what makes the owed `FLOW_OFFLINE_SYNC`
practical to write.

(B6.3 — the data-collection inventory, draft privacy policy and store Data Safety labels — was the
last credential-free *slice* work, and is now done. The deletion executor above is not slice work:
it is a defect B6.3 exposed in a deliverable B6 had already been counting.)

---

## Where we were (2026-07-22)

Documentation, ADRs (33), OpenAPI, DB schema + migrations, monorepo scaffold, Expo app shell,
CI/CD, Backend Foundation, and the design system are complete. The Mobile MVP — Phase 1 feature
slices are **complete (100%)**: M1 App Shell, M2 Today, M3 Guided Ritual, M4 Calendar Shell,
M5 Ask Guru, M6 Profile/Household, M7 Notifications, and M8 Subscription. M8 closed with
Increment 3 (contextual paywall sheet at app/modal/paywall, panchangpal://subscription routing,
FF_FAMILY_PLAN offering gate), merged to main as PR #7.

The **Beta Readiness & Platform Hardening** milestone (TDD Part 5) is now open, sliced B1–B8:
environments & secrets · E2E · build/distribution · observability · reliability & DR ·
security & privacy · release management · go/no-go. Current slice: **B1 — Environments & secrets
(fail-closed)**, gated on reviewing `chore/expo-sdk-54-upgrade` first.

**Correction to "complete" (2026-07-18/19):** M1–M8 were feature-complete as written, but none of
that code had ever been executed. Running it found 12 defects — three bundle-blocking, two
local-backend, and seven only visible in a running app (one of which typechecked perfectly while
doing nothing). All are fixed and merged, and the platform is re-baselined to Expo SDK 54 /
RN 0.81 / React 19, verified natively.

Read "feature-complete" as "written and unit-tested" for anything predating this. The pipeline now
distinguishes the two: a bundle gate per PR, E2E flows green in CI, and no placeholder jobs
anywhere.

Verified starting position: staging migrations and Edge Function deploys are real, but the Maestro
E2E and EAS build CD jobs are placeholders and `preflight.sh` warns-then-exits-0 on missing secrets,
so CD's green status currently overstates what is verified. B1/B2 address that before anything is
layered on top.

**Update (2026-07-22).** Two findings moved the position, neither of them forward:

- **The E2E gate produced no signal between 2026-07-19 and 2026-07-22.** `expo-updates` (PR #24)
  brought Kotlin/KSP into the Android build, which then outgrew `timeout-minutes: 45`; six runs
  were cancelled by `cancel-in-progress` before any could report it. A cancelled run is not a red
  run, so the docs went on citing a three-day-old result. Fixed in PR #32; B2 revised to ~75%.
- **Issue #30 — the daily loop computed dates in UTC.** `local_date` is the user's day by contract,
  and both Today and Ritual derived it with `toISOString().slice(0, 10)`. In Australia and New
  Zealand that recorded the morning ritual against yesterday, all morning. Fixed in PR #31, guarded
  by lint. ADR-026 had mandated a single tz-aware utility since before implementation began; none
  existed.

Both are the same lesson the Execution Gap taught, in a new place: a claim in CI, or in an ADR, is
not a verified behaviour.

**Update (2026-07-25). B2 — E2E verification — is now COMPLETE, and it earned the lesson a third
time.** Fixing the E2E build (PR #35 — it had been failing in `assembleRelease` and hanging to the
timeout, so `cancelled` hid a red build) let `FLOW_SESSION_PERSISTENCE` run for the first time. It
failed, correctly: `react-native-mmkv@2.12.2` is incompatible with the New Architecture's bridgeless
runtime, so MMKV silently degraded to memory and ritual sessions never persisted — invisible until a
native build ran the flow. Fixed by MMKV v2→v4 (PR #36). All three in-scope Maestro flows are now
GREEN in CI on a real native build (run 30155737941). Canonical progress 0% → 13% (1 of 8). Next
unblocked engineering slice: **B4 — Observability**.

**Update (2026-07-25, later). B4 is open; B4.1 landed.** B4 is sliced into four increments — B4.1
telemetry seam · B4.2 EVT_* analytics sink → `analytics_event` (ADR-013) · B4.3 source-map upload +
Edge Function Sentry · B4.4 SLO dashboards + alerts — taking progress to **16%** ((1 + ¼)/8).

B4.1 gives errors a single exit: a `TelemetryAdapter` port wired at `ErrorBoundary.componentDidCatch`
and at a global `ErrorUtils` handler, with §7.1's ERR_* → EVT_054 mapping settled and no PII possible
by construction (unrecognised errors become `ERR_UNKNOWN` rather than their message; EVT_054's props
are a closed four-key shape).

**B4.2 then gave that mapping a destination.** The AnalyticsService port over the `analytics_event`
sink (ADR-013) — batched, capped, flushed on backgrounding, insert-only under RLS — means every
ERR_* is now recorded as EVT_054 for real, so error *rates* are measurable today. It forced three
privacy decisions no document had settled, now in DECISIONS.md: `user_pseudo_id` is a device-minted
random UUID never derived from an identity, props are primitives only, and an event id outside the
PDD §11 taxonomy is rejected.

The seam distinction still stands for the other half: **a seam is not the behaviour.** The concrete Sentry adapter is deferred and no DSN is provisioned, so every report is
built correctly and then dropped — crash-free sessions (NFR-06, §7.2) remain unmeasurable, and a beta
shipped in this state would fly blind on the metric §10.1 gates on. The difference from the MMKV case
is that the degradation is not silent: `getTelemetryBackend()` reports `'none'`, and a DSN configured
with no adapter warns at startup.

**B4.3 then closed everything that could be made real without credentials.** The Edge Function half
of §7.1 — a ServerTelemetry port at `errorResponse()`, carrying the ERR_* code and correlation id and
never a message — plus the guardrails around shipping: `SENTRY_*` required at preflight's production
tier (proven by running it), and a release-build gate that blocks a production build when Sentry is
unconfigured, because a release with no crash reporting cannot be measured against NFR-06.

The source-map upload was deliberately NOT written. Hermes maps must be uploaded from inside the EAS
build that produced the bundle; maps from a separate `expo export` belong to a different bundle and
would symbolicate confidently wrong. A step that appears to upload would be exactly the placeholder
this milestone spent B1 and B3 removing, so the gate states the gap instead.

Progress is **22%** ((1 + ¾)/8), and **B4 now waits on the owner** for a Sentry org + DSN (free
tier) — the same shape of gate as B1's prod Supabase and B3's store accounts, at no cost.

**Update (2026-07-25, later still). B5 opened, and found the milestone's most consequential gap.**
Runbooks for all five §8.3 scenarios now exist, and the restore drill is mechanised: build from repo,
`pg_dump` → `pg_restore --exit-on-error`, then the SAME invariants file re-run against the restored
database (tables, RLS still enabled, policies, seed, pgvector, enums) plus seeded row-count equality.
It runs monthly and on any PR touching migrations or seed, so an un-restorable schema fails review
rather than an incident. First run restored in 1s.

**But NFR-15 is unmet.** Supabase PITR is a paid-plan feature and both hosted projects are free-tier,
so there is nothing to restore user data FROM. Schema and seed come back in minutes; profiles,
households, completions, streaks, personal dates and conversations do not come back at all. That
makes the ~$25/month Supabase plan a **reliability** decision rather than an environments one, and it
is now a launch blocker rather than a B1 line item: shipping to real users without it means a single
incident is permanent data loss. Progress **25%**.

**The engineering that is NOT blocked** is the instrumentation B4.2's sink was built for: the
documented EVT_* are still not emitted at their call sites, so `analytics_event` would receive only
EVT_054, and the North Star (Weekly Household Ritual Completions) cannot be computed until EVT_017
is emitted.

**Update (2026-07-26). The E2E gate is green and now trustworthy; next slice is B6.** Two things
were settled, and the first is a process finding rather than an engineering one.

**The previous session's handoff was wrong.** It opened with "⛔ MAIN'S E2E IS RED, AND THE FIX IS
UNPROVEN — START HERE." Main had gone **4/4 green including FLOW_ONBOARDING** (run 30171884650,
`0ca0906`) half an hour after the failure the note was written from, so PR #53 was already verified.
A session began by acting on that note without checking CI — one command — and wrote a fix for a
problem that had resolved itself. This is the Execution Gap's lesson a fourth time, in a new place:
it applied to CI's green status, to an ADR's mandate, to a claim in a test, and now to our own
status docs. **A written status is not a verified state, including one we wrote.**

**The gate was failing ~21% of the time for reasons outside the app.** Reading the uploaded
artifacts across all four recent failures — logcat and screen hierarchies exist ONLY in the artifact,
so grepping the run log finds nothing and reads convincingly as absence of evidence — shows **3 of 4
were `Pixel Launcher isn't responding` dialogs** covering a healthy app, every one with PR #41's
`hide_error_dialogs 1` already active. The fourth was the genuine #50 onboarding-gate breakage.
PR #55 fixes it at the cause: AVD `target: google_apis` → `default` (AOSP), no Pixel Launcher and no
Google app, neither of which anything under test needs. Verified 4/4 in 1m23s with zero
`Pixel Launcher` references in the artifacts — a structural absence, not a lucky green.

**Progress stays 25%→31% unchanged by this work**: B2 was already complete and repairing a flaky
gate is not an increment. Next unblocked engineering slice: **B6 — Security & Privacy** (§5/§6),
entirely credential-free.

**Update (2026-07-26, B6). The security review found the two most serious defects of the milestone,
and one missing subsystem.** Progress **31% → 44%**.

Both defects are the same shape the Execution Gap taught, now for the fifth and sixth time: **a
documented control that was never implemented, with nothing asserting it.** `persistSession: true`
claimed persistence and got memory. `SVC_account` was documented as "validate the JWT then act with
the service role" and validated only that a token was *present* — so any caller could delete any
account, or reassign a victim's rows to themselves and read them under ordinary RLS. Neither was
reachable by any existing test; both were found by reading the claim against the implementation.

Each fix is **proven by reintroducing the defect**: `FLOW_AUTH_SESSION_PERSISTENCE` fails without
the storage adapter, and `authorization.test.ts` fails when `body.user_id` is restored. A test that
has never failed is a claim, not a gate.

**The missing subsystem is offline sync.** `STORE_offlineQueue` is in-memory despite claiming MMKV
persistence, is never drained to SVC_sync, and is never dequeued. Online the app works because every
hook also calls the API directly; offline, mutations are silently lost. **Offline-first is a
permanent architecture decision and it is not implemented on the client.** That is the next
increment, ahead of B6.3.

One blocker: the Canonical Panchang Engine (ADR-033, Proposed) — astronomical algorithm
undocumented; the whole system depends only on the abstract PanchangEngine/PanchangProvider
interfaces, so this blocks ONLY panchang compute + sunrise/tithi notifications, with zero rework
when it lands.

---

## Track A — Product build (unblocked, proceed now)

1. ✅ Design System & Component Library — tokens (PDD Part 3 §6) + CMP_* (a11y-first).
2. Mobile feature slices (MOD_*) — ✅ complete.
   - ✅ M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru ·
     M6 Profile/Household · M7 Notifications.
   - ✅ M8 Subscription — all 3 increments (entitlement read + gating; SCR_SUBSCRIPTION_001,
     CMP_PLAN_CARD/VALUE_LIST/LEGAL_FOOTNOTE, plans/purchase/restore via the PaymentAdapter;
     CMP_BOTTOM_SHEET + the contextual paywall route, panchangpal://subscription routing, and the
     FF_FAMILY_PLAN offering gate on a new fail-closed feature-flag seam).
   - Note: the Today panchang view and Calendar markers render "temporarily unavailable" until the
     engine lands; ritual completion / streak / checklist / Ask Guru / household / notifications
     prefs all work now. Live Ask Guru answers stay gated (GURU_LIVE=false).
3. Backend Edge Functions (client contracts already coded) — SVC_household (member/invite),
   SVC_notify_scheduler (notify/schedule), SVC_revenuecat_webhook (entitlement grant/revoke).
4. AI corpus ingestion + eval harness — run SVC_content_ingest on the reviewed corpus; calibrate
   F-6/F-16 on the eval sets; refusal test set in CI (needs the corpus, PDD §9.8).
5. Backend DB wiring hardening — flesh repository upserts vs a live Supabase test project; green
   the pgTAP integration suite; add per-endpoint contract tests.

## Track B — Canonical Panchang Engine (owner-driven, unblocks the rest)

1. Ratify ADR-033 Part B (Architecture + Product + pandit reviewer): ephemeris, ayanamsa,
   per-tradition profiles, methodology, validation dataset, acceptance tolerances.
2. Implement the concrete engine behind PanchangEngine (e.g. Swiss Ephemeris-grade) — only after
   ratification. Legal review of the ephemeris license.
3. Golden-dataset validation gate (vs Drik/mPanchang, per tradition) in CI; reviewer sign-off.
4. Register the engine + set engine_version; un-skip the engine tests; enable SVC_panchang compute
   + sunrise/tithi notifications. No caller changes (interface unchanged).

## Track C — Platform hardening (parallel, TDD Part 5)

- ✅ DevOps platform audit + hardening (2026-07-12): canonical env inventory, secrets matrix,
  6 `.env.*.example` templates, `scripts/preflight.sh` (fail-fast) + `scripts/bootstrap.sh`,
  workflow hardening (least-privilege, retries, `db-tests`/`security-scan` toolchain, preflight
  gates, summaries), `docs/SETUP.md`, `docs/devops/*`, `DEVOPS_AUDIT_REPORT.md`, and the canonical
  `docs/devops/CONFIGURATION_REGISTRY.md`. No deploy behavior changed. See DEVOPS_AUDIT_REPORT.md.
- ⏳ Install deferred vendor deps on the Mac (`expo-notifications`, `react-native-purchases`) + keys;
  swap NullNotificationAdapter / NullPaymentAdapter for the concrete adapters (one-line composition-root
  changes).
- ⏳ Provision dev/staging/prod Supabase projects + secrets; apply migrations via CD. (Pipeline +
  preflight ready; infra/credentials not yet configured — see DEPLOYMENT_READINESS.md.)
- ⏳ Add `eas.json` + EAS credentials; flip CD deploy scaffolds to real.
- ⏳ Stand up Sentry + AI/analytics dashboards + alerts; DR restore drill.
- ⏳ Rate-limit/cost-ceiling values tuned from real usage; OWASP Mobile review + pen test pre-launch.

---

## Milestone sequence

Repository & Platform Foundation (done) -> Backend Foundation (independent done; engine blocked)
-> Design System (done) -> Mobile Features (M1–M8 done) -> AI corpus + eval ->
Beta (§10.1 go/no-go) -> Launch (US/AU/NZ phased). Track B runs alongside and must complete before
a launch that includes panchang.

## Remaining blockers (single source: PROJECT_STATUS.md "Known Blockers")

Canonical Panchang Engine (ADR-033). Ask Guru live answers gated (GURU_LIVE) until corpus/eval.
Deferred vendor deps (expo-notifications, react-native-purchases) shipped as Null seams. Nothing
else is blocking; all other tracks proceed.
