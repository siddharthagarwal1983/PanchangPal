# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.16.0

Last Updated: 2026-07-25 (B5 opened — DR runbooks + a mechanised restore drill; PITR gap stated)

Purpose:
This is the first file Claude should read at the beginning of every session.
It provides a one-minute overview of the project's current state.

For details, consult:

- PROJECT_MEMORY.md
- CURRENT_MILESTONE.md
- SESSION.md
- TASK.md

---

# Project

**Name**

PanchangPal

**Status**

🟢 Active Development

**Health**

🟢 On Track

---

# Current Phase

🚧 Beta Readiness & Platform Hardening (TDD Part 5)

Progress

25%

(Canonical progress metric — 1 of 8 Beta Readiness slices COMPLETE: **B2 (E2E verification)**, plus
**3 of B4's 4 increments** — B4.1 telemetry seam, B4.2 EVT_* analytics sink, B4.3 server seam +
release gate — plus **1 of B5's 3** (runbooks + restore drill), giving (1 + ¾ + ⅓)/8 ≈ 25%.
**B4 cannot go further without a Sentry org + DSN.** The EVT_* instrumentation, the analytics RLS
gate and the API contract gate do not move this number: they complete or restore work other slices
began, and the percentage counts increments, not commits.)
B1 ~85%, B3 ~80%. B2 is now DONE: the bundle gate plus all three in-scope Maestro flows
(FLOW_RETURNING, FLOW_MORNING_RITUAL, FLOW_SESSION_PERSISTENCE) are GREEN in CI on a real native
Android build (run 30155737941, 2026-07-25). The three flows still not present — onboarding,
household invite, live Ask Guru — are blocked on other slices / backends / a gated feature, not on
B2's engineering. B1 and B3's remaining items are gated on money, a store account, or a later slice.
PROJECT_STATUS.md and CURRENT_MILESTONE.md must report this same number; DASHBOARD.md is
authoritative if they diverge.)

Mobile MVP Phase 1: ✅ 100% (M1–M8, merged 2026-07-18).

Prior phases ✅ complete: Documentation → Repository & Platform Foundation → Backend Foundation →
Mobile MVP Phase 1 (M1–M8).

---

# Current Milestone

Beta Readiness & Platform Hardening

See:

CURRENT_MILESTONE.md

---

# Current Task

**B5 — Reliability & DR opened: runbooks exist, and the drill is mechanised.**

`docs/devops/DR_RUNBOOKS.md` covers §8.3's five scenarios (DB restore, region incident, Edge Function
outage, secret compromise, store outage) with literal commands from this repo. A monthly
`dr-drill.yml` builds from migrations + seed, does a `pg_dump` → `pg_restore --exit-on-error` round
trip, and re-runs the **same** invariants file against the restored database — catching what comes
back subtly wrong and looks healthy: missing tables, **RLS silently disabled**, absent policies,
post-v1 `FF_*` restored ON, `pgvector` gone, enums missing. It also runs on any PR touching
migrations or seed, so an un-restorable schema fails review rather than an incident. First run:
restore in **1s**, invariants OK both sides, seeded row counts equal.

⛔ **Stated, not buried: there is no PITR to restore from.** Both hosted projects are free-tier, so
**NFR-15's RPO ≤ 24 h / RTO ≤ 4 h is UNMET for user data** — schema and seed rebuild in minutes,
everything a user created does not. The runbook says plainly not to launch to real users in that
state. It is the same ~$25/month that closes B1.

---

**B4 — the sink receives more than errors. The North Star input fires.**

**B4.5 — EVT_* instrumentation (the daily habit funnel, PDD §11.4).** EVT_012 Today Viewed ·
EVT_015 Ritual Started · EVT_016 Step Advanced · **EVT_017 Ritual Completed** · EVT_018 Abandoned ·
EVT_019 Checklist Item Completed · EVT_020/021 Streak Advanced / Grace Used. Registry events only,
with §11.2's property schemas.

Ritual events are derived from view-model **transitions** by a pure mapper, not tracked at six call
sites: a screen that tracks inline double-fires the moment a re-render repeats a state, and for the
metric the North Star sums an inflated count is worse than none. Tests pin the three ways that goes
wrong — a repeated render, a restore mistaken for a start, a resume mistaken for a start.
EVT_020/021 fire from the **server's** streak, never a client guess.

**Defect fixed from B4.1:** EVT_054 carried `code`/`surface`; PDD §11.2 specifies
`error_code`/`screen_id`. Nothing would have caught it — `event_id` is a text column and `props` a
jsonb blob, so a wrong property name fails months later as a dashboard query returning nothing.

244 tests (+15), tsc clean, eslint 0 errors.

---

**B4 proper is 3 of 4 increments done, and blocked on an owner action, not on engineering.**

**B4.3 — the server seam and a release gate that can fail.** Edge Function errors now leave through
a `ServerTelemetry` port at `errorResponse()` (the one exit every ERR_* already shared), carrying the
function name and correlation id and **no message** — on the server an unknown error is usually a
library's, and a Postgres or fetch failure puts a query or a token in its text. preflight now
requires `SENTRY_DSN`/`SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` at the production tier
(proven: exit 1 unset, exit 0 set), and `release-build.yml` blocks a production build when Sentry is
unconfigured — a release with no crash reporting cannot be measured against NFR-06, which §10.1
gates on.

**The source-map upload is deliberately NOT wired.** Hermes maps must be uploaded from inside the
EAS build that produced the bundle (`@sentry/react-native`'s config plugin); maps from a separate
`expo export` belong to a different bundle, so uploading them gives symbolication that is
confidently wrong. The gate says so rather than a step pretending to upload.

⛔ **B4 stops here without a Sentry org + DSN** (free tier).

---

**B4.2 — the EVT_* analytics sink** (merged, PR #40).

**B4.2 — the EVT_* analytics sink.** `AnalyticsService` port + a batching implementation over the
`analytics_event` table (ADR-013; insert-only under RLS, no client read, rollups service-side).
Batches of 20, capped at 200 with oldest-first drop, flushed on backgrounding; a failed batch
re-queues ahead of newer events. The queue stays in memory — persisting user-behaviour data to disk
is what ADR-031 argues against, and a lost metric costs a row where a lost ritual session costs a
user their place.

Two guarantees are structural: props are primitives only (an object or array is how an error or a
server response would carry user content into the store), and an event id outside the PDD §11
EVT_* taxonomy is rejected, since `event_id` is only a text column and nothing downstream would
catch an invented event.

**`user_pseudo_id` is a device-minted random UUID**, never derived from the auth uid — no document
specified a derivation, so it is recorded as a decision. A reinstall mints a new id and two devices
count twice; the North Star groups EVT_017 by `household_id`, so it is unaffected.

**Every ERR_* now lands as EVT_054** in `analytics_event` — what §7.1 asked for and B4.1 could only
map. The crash reporter stays a separate destination, so error-rate reporting no longer waits on
Sentry. 229 tests (+24), tsc clean, eslint 0 errors.

---

**B4.1 — the telemetry seam** (earlier, merged as PR #39).

`TelemetryAdapter` port + `NullTelemetryAdapter` (deferred Sentry, mirroring NotificationAdapter and
PaymentAdapter); pure `toErrorCode()` / `toClientErrorEvent()` mapping every ERR_* to EVT_054 per
§7.1; both call sites wired — `ErrorBoundary.componentDidCatch` (replacing its TODO) and a global
`ErrorUtils` handler for throws no React tree is on the stack for. No PII by construction: an
unrecognised error yields `ERR_UNKNOWN` rather than its message, EVT_054's props are a closed
four-key shape, and `componentStack` is not forwarded. 205 tests (+29), tsc clean, eslint 0 errors.

**What it does not buy:** nothing is reported anywhere. `@sentry/react-native` is uninstalled and no
DSN is provisioned, so crash-free sessions (NFR-06) still cannot be measured and B4 cannot close on
the seam. `getTelemetryBackend()` returns `'none'`, and a DSN configured with no adapter warns —
because an app that reports nothing otherwise looks exactly like an app with no errors.

Still true after B4.2: **crash reports go nowhere.** EVT_054 now lands in `analytics_event`, so error
*rates* are measurable, but crash-free sessions (NFR-06, §7.2) still require a real reporter.

Next: **B4.3** — source-map upload (the item B3 deferred) + Edge Function Sentry.

---

Earlier the same session — the question that stood open for a week, does a ritual session survive a
process restart, was answered: **yes, now.** The path there:

1. **PR #35 — the E2E build was failing, disguised as a timeout.** The single-ABI run had failed in
   `assembleRelease` at ~11 min, then Gradle hung ~80 min until the 90-min job timeout killed it and
   it reported `cancelled` — the "gate goes dark" pathology, one layer down. Fixed: cap the build
   step with `timeout` + `--stacktrace`, and drop release-only work the emulator APK doesn't need
   (release lint + native-debug-metadata). Build then went green (~10 min) and the flows finally ran.

2. **The flow ran and caught a real bug.** `FLOW_SESSION_PERSISTENCE` failed: sessions did not
   survive a restart. Logcat proved the cause — **`react-native-mmkv@2.12.2` is incompatible with
   the New Architecture's bridgeless runtime**, so MMKV's JSI never installed, every instance threw,
   and `ritualSessionRepository` silently ran on its in-memory fallback. A dependency-version bug,
   not a storage-logic bug.

3. **PR #36 — the fix.** Upgrade `react-native-mmkv` v2→**v4.3.2** (Nitro line, bridgeless-compatible)
   + its `react-native-nitro-modules` peer; absorb the v4 API changes (`createMMKV()` factory,
   `delete`→`remove`) at the port boundary; jest mock so v4's eager nitro import doesn't crash suites.
   **E2E on a native build (run 30155737941): all three flows GREEN, `FLOW_SESSION_PERSISTENCE`
   PASSED.** MMKV v4 loads and persists under New Arch; no memory fallback.

Verified end-to-end. **PR #36 merged to main as `e1e10d4`**; the docs checkpoint followed as PR #37
(`45f1b0d`). Main's E2E is green again (run 30156615768). See TASK.md.

# Today's Objective

Session of 2026-07-25. Two things closed. First, the week-old question — does a ritual session
survive a restart — is **answered: yes, now** (fix the E2E build, read the verdict it produced, ship
the MMKV v2→v4 fix); **B2 is complete**. Second, **B4 opened** with its telemetry seam: errors now
leave the app through one port, at both call sites, with the EVT_054 mapping settled and no PII
possible by construction — while reporting nothing at all until a real adapter and a DSN land.

Then **B4 opened and reached its halfway point**: B4.1 gave errors one exit (the TelemetryAdapter
port at both call sites, EVT_054 mapping, no PII possible by construction), and B4.2 gave that
mapping somewhere to go — the AnalyticsService port over the `analytics_event` sink, with a
device-minted pseudonymous id and primitives-only props. Crash *reporting* is still deferred.

No new product scope.

# Overall Progress

| Area | Status |
|--------|--------|
| Product Research | ✅ |
| MRD | ✅ |
| PRD | ✅ |
| PDD | ✅ |
| TDD | ✅ |
| AI Knowledge Base | ✅ |
| Repository & Platform Foundation | ✅ |
| Backend Foundation (SVC_*) | ✅ (panchang engine blocked; SVC_household/notify/revenuecat pending) |
| Mobile — App Shell / Today / Ritual / Calendar / Ask Guru | ✅ M1–M5 |
| Mobile — Profile / Household | ✅ M6 |
| Mobile — Notifications | ✅ M7 |
| Mobile — Subscription | ✅ M8 |
| AI Platform | 🟡 adapters done; corpus + eval pending |
| Testing | 🟢 321 unit/component/domain (244 mobile + 77 vitest) + 17 pgTAP · bundle gate per PR · 🟢 **E2E green in CI** — 3/3 Maestro flows on a real native Android build incl. FLOW_SESSION_PERSISTENCE (run 30165186141, 2026-07-25); gate fails fast (PR #35) and no longer fails against emulator ANR dialogs (PR #41) · AI-eval + api-contract de-declared (owed: contract tests + §9.4 harness) |
| Beta | 🚧 In progress — **B2 ✅ complete**; **B4 🟡 ~75%** (owner-gated on a Sentry org); **B5 🟡 ~33%** (runbooks + drill in; PITR undrillable on the free tier); B1/B3 owner-gated; B6–B8 pending |
| Production | ⏳ |

---

# Current Priorities

1. **Owner: create a Sentry org + DSN (free tier)** — B4's remaining work (source-map upload, §7.2 dashboards/alerts) needs a real project to be verifiable. B4.1 ✅ · B4.2 ✅ · B4.3 ✅ to its credential-free limit · B4.4 blocked.
2. **Credential-free engineering:** `FLOW_ONBOARDING` is still unreachable (`app/index.tsx:16` hardcodes `ONBOARDED = true`), or continue **B5** (graceful-degradation verification, §8.2).
3. Owner decisions: prod Supabase (~$25/mo, closes B1) · Apple $99 (iOS) · Google Play $25 (internal track)
3. ⛔ Canonical Panchang Engine decision (ADR-033) — unblocks Today panchang, Calendar markers, notifications
3. AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)
4. Backend Edge Functions: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook (client contracts coded)
5. Apply migrations to a live Supabase project + integration run
6. E2E (Maestro FLOW_*) + first live CI run

---

# Active Branch

main

---

# Blockers

⛔ Canonical Panchang Engine (ADR-033, Proposed): astronomical algorithm undocumented — panchang
compute, Calendar/festival markers, and sunrise/tithi notifications stay unavailable until Part B
is ratified. Everything else is unblocked. See docs/architecture/canonical-panchang-engine/.

🔒 Ask Guru live answers are gated OFF (GURU_LIVE=false) until reviewed corpus + eval readiness
(TDD Part 3 §9/§10B). The client is complete; flipping the flag goes live.

ℹ️ Vendor deps deferred: `expo-notifications` (M7) and `react-native-purchases` (M8) are not yet
installed. Their adapters ship as pure ports + Null impls; concrete adapters are one-line swaps once
the deps + keys land on the Mac. (The lockfile *can* be regenerated here — proven 2026-07-18 by the
SDK 54 upgrade — so this deferral is now a choice, not a constraint.)

⚠️ Platform re-baselined to **Expo SDK 54 / RN 0.81 / React 19 / New Architecture** on
`chore/expo-sdk-54-upgrade` (unmerged). Verified by bundling, 121 tests, and Expo Go on device;
**not** verified against a native build — no Xcode here. B3 is the first real test.

✅ Resolved (2026-07-25): the `react-native-mmkv` defect. Two layers — (1) it threw in Expo Go / on
absent native modules, handled since PR #24 by the `KeyValueStore` port degrading to memory rather
than crashing; (2) the deeper bug the working E2E gate exposed — **mmkv v2 is incompatible with the
New Architecture (bridgeless)**, so it degraded to memory even on a native build and ritual sessions
never persisted. Fixed by the v2→v4 upgrade (PR #36), verified by a green FLOW_SESSION_PERSISTENCE on
a native emulator build. The repositories-throw-on-absent-config defect alongside it was already
resolved (PR #14).

---

# Next Deliverable

Two owner purchases now gate reliability itself, not just convenience: **a Sentry org + DSN** (free
tier) closes B4, and **a paid Supabase plan** (~$25/mo) closes B1 *and* makes NFR-15 achievable — no
PITR means no recovery of user data. Credential-free meanwhile: B5's remaining increments (§8.2
graceful degradation, §8.4) or making onboarding reachable. B1/B3 remainders stay owner-gated: prod Supabase (~$25/mo) closes B1; Apple
($99) + Google Play ($25) close most of B3.

---

# After Current Deliverable

B2 E2E → B3 builds/distribution → B4 observability → B5 DR → B6 security/privacy → B7 release
mechanics → B8 go/no-go → phased production release (US/AU/NZ)

---

# Documentation Status

MRD ✅ Approved · PRD ✅ Approved · PDD ✅ Approved · TDD ✅ Approved · Architecture Stable ✅ Yes

---

# Architecture Snapshot

Frontend: React Native + Expo (Expo Router, Zustand, TanStack Query)
Backend: Supabase (Postgres + RLS + Edge Functions)
AI: GPT-5 mini + RAG (behind adapters; live answers gated)
Payments: RevenueCat (behind PaymentAdapter; entitlement household-grain, read-only on device)
State: Zustand + TanStack Query

---

# Startup Checklist

Before coding: read PROJECT_MEMORY.md · CURRENT_MILESTONE.md · SESSION.md · TASK.md · ARCHITECTURE_SUMMARY.md.
Only retrieve additional documentation if required.

---

# Increment / Milestone Completion Checklist

Run this at EVERY increment or milestone boundary — not only at End Session (see the Increment &
Milestone Completion Checkpoint in CLAUDE.md):

□ Update DASHBOARD.md (progress %, current task/objective) · □ Update PROJECT_STATUS.md ·
□ Update CURRENT_MILESTONE.md (slice/increment status) · □ Update IMPLEMENTATION_ROADMAP.md ("where we are")
□ Update SESSION.md · □ Update TASK.md · □ Keep the progress % identical across DASHBOARD / PROJECT_STATUS / CURRENT_MILESTONE
□ Update DECISIONS.md (only if a permanent decision was made) · □ Update PROJECT_MEMORY.md (only if permanent knowledge changed)

# End Session Checklist

□ Update SESSION.md · □ Update PROJECT_STATUS.md · □ Update TASK.md · □ Update DECISIONS.md (if needed)
□ Update PROJECT_MEMORY.md (only if permanent knowledge changed) · □ Recommend next task

---

# Executive Summary

Documentation and architecture are frozen. The repository, platform foundation, backend SVC_*, and
**the full Mobile MVP (M1–M8)** are complete and merged to main. The project is now in **Beta
Readiness & Platform Hardening** (TDD Part 5), sliced B1–B8: environments, E2E, builds,
observability, DR, security/privacy, release mechanics, and go/no-go.

The defining issue at the start of this milestone is that CD's green status overstates what is
actually verified. Four gates checked nothing; two of them (AI eval subset, API/zod contract) were
**de-declared** in B1 rather than left green, and CD's Maestro E2E and EAS build remain placeholders
for B2/B3. Preflight, contrary to the milestone's original claim, already fails closed. CI now runs a
real bundle gate. The only architectural blocker is the Canonical Panchang Engine
decision (ADR-033); Ask Guru live answers are intentionally gated until corpus/eval readiness.
