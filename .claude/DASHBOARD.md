# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.10.0

Last Updated: 2026-07-25 (B4 opened — B4.1 telemetry seam landed; reports nothing until a real adapter)

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

16%

(Canonical progress metric — 1 of 8 Beta Readiness slices COMPLETE: **B2 (E2E verification)**, plus
**1 of B4's 4 increments** — B4.1, the telemetry seam — giving (1 + ¼)/8 ≈ 16%.
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

**B4 — Observability, increment 1 of 4 done: the telemetry seam exists and reports nothing.**

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

Next: **B4.2** — the EVT_* analytics sink to `analytics_event` (ADR-013).

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
| Testing | 🟢 190 unit/component/domain (176 mobile + 14 shared) · bundle gate per PR · 🟢 **E2E green in CI** — 3/3 Maestro flows on a real native Android build incl. FLOW_SESSION_PERSISTENCE (run 30155737941, 2026-07-25); gate now fails fast (PR #35) · AI-eval + api-contract de-declared (owed: contract tests + §9.4 harness) |
| Beta | 🚧 In progress — **B2 ✅ complete**; **B4 🟡 ~25%** (B4.1 telemetry seam in, reporting nothing yet); B1/B3 owner-gated; B5–B8 pending |
| Production | ⏳ |

---

# Current Priorities

1. **B4 — Observability**, continuing: B4.1 (telemetry seam) ✅ · B4.2 EVT_* analytics sink → `analytics_event` · B4.3 source-map upload + Edge Function Sentry · B4.4 SLO dashboards + alerts. A real reporter (a Sentry org + DSN) is what turns the seam into observability.
2. Owner decisions: prod Supabase (~$25/mo, closes B1) · Apple $99 (iOS) · Google Play $25 (internal track)
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

**B4.2 — the EVT_* analytics sink** (analytics adapter → `analytics_event`, ADR-013), then B4.3
source maps and B4.4 dashboards/alerts. B1/B3 remainders stay owner-gated: prod Supabase (~$25/mo)
closes B1; Apple ($99) + Google Play ($25) close most of B3.

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
