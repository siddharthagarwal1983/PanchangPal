# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.8.0

Last Updated: 2026-07-22 (ADR-026 date defect fixed; E2E gate found dark since 2026-07-19)

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

0%

(Canonical progress metric — 0 of 8 Beta Readiness slices COMPLETE. B1 ~85%, B2 ~75%, B3 ~80%;
B2 revised down on 2026-07-22: its ~85% rested on a 2026-07-19 run that has not held since, because
the gate then produced no signal for three days;
a slice counts only when done, and every remaining item in those three is gated on money, a store
account, or a later slice. PROJECT_STATUS.md and CURRENT_MILESTONE.md must report this same
number; DASHBOARD.md is authoritative if they diverge.)

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

**Land PR #31 and PR #32, then read the persistence verdict.**

1. **PR #31 — issue #30 fixed.** Today and Ritual derived the day with
   `new Date().toISOString().slice(0, 10)`, which is UTC. In New Zealand and Australia that named
   **yesterday for the entire local morning** — the morning ritual, in two of three primary launch
   markets. Four commits: the tz utility ADR-026 always required, adopting the device zone into
   `user_profile.timezone` (which nothing had ever written), `useLocalDate` in the screens, and an
   ESLint guard proven to fail on the reintroduced expression.

2. **PR #32 — the E2E gate had gone dark.** No run has completed since 2026-07-19 11:59 UTC.
   `expo-updates` (PR #24) pushed the Android build past `timeout-minutes: 45`, and six runs were
   cancelled by `cancel-in-progress` before any of them could say so. A cancelled run is not a red
   run, so nothing was reported. Fixed: no cancel-on-push, 90-minute budget, Gradle cache, and one
   ABI instead of four.

3. **Session persistence is STILL UNVERIFIED.** `FLOW_SESSION_PERSISTENCE` is written and asserts
   the intended behaviour, but **no run has reached the emulator**. Merging #32 may turn main's E2E
   red — that is an honest gate reporting a real defect, and is the expected outcome if the defect
   is real.

The 2026-07-19 reconciliation still holds: claims here carry a file:line where one exists, and
anything unverifiable from the repo is marked rather than asserted.

See:

TASK.md

# Today's Objective

Session of 2026-07-22. One question asked — does a ritual session survive a restart — and it is
**still unanswered**, because two things stood in front of it.

The E2E gate had been silent for three days: `expo-updates` made the Android build outgrow its
timeout, and concurrency cancellation hid that fact behind runs that were neither green nor red.

Reading the ritual code to design the persistence flow surfaced a worse defect: every date in the
daily loop was computed in UTC and stored as the user's local date. Australia and New Zealand
recorded the morning ritual against yesterday, all morning.

iOS now runs in Expo Go (bundle verified, HTTP 200) — but persistence cannot be tested there, since
MMKV is absent and the store degrades to memory by design.

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
| Testing | 🟢 190 unit/component/domain (176 mobile + 14 shared) · bundle gate per PR · ⚠️ **E2E produced no signal 2026-07-19 → 2026-07-22** (build outgrew its timeout; cancelled runs hid it — PR #32) · AI-eval + api-contract de-declared (owed: contract tests + §9.4 harness) |
| Beta | 🚧 In progress (B1–B8) |
| Production | ⏳ |

---

# Current Priorities

1. Land PR #31 (issue #30 — UTC dates) and PR #32 (E2E gate fixes), then re-run E2E and read the persistence verdict — still unverified, no run has reached the emulator
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

⚠️ One open defect from the 2026-07-18 demo session: `react-native-mmkv` is unavailable in Expo Go,
so the Ritual screen crashes there. It sits behind the `KeyValueStore` port, and a development build
(B3) removes the constraint entirely. The repositories-throw-on-absent-config defect that stood
alongside it is resolved (PR #14 — all ten now construct lazily). Details in CURRENT_MILESTONE.md →
Current Risks.

---

# Next Deliverable

Owner-gated: prod Supabase project (~$25/mo) closes B1. Apple ($99) and Google Play ($25) close
most of B3. Everything achievable without spending has been done.

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
