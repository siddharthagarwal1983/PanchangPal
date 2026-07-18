# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.6.0

Last Updated: 2026-07-18 (Beta Readiness milestone opened)

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

(Canonical progress metric — 0 of 8 Beta Readiness slices complete. PROJECT_STATUS.md and
CURRENT_MILESTONE.md must report this same number; DASHBOARD.md is authoritative if they diverge.)

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

**Mobile MVP Phase 1 (M1–M8) is complete and merged to main** (M8 Increment 3 = PR #7, 2026-07-18).

Beta Readiness & Platform Hardening is now open, sliced B1–B8.
Current: **B1 — Environments & secrets**. In progress on `feat/b1-bundle-gate`: CI bundle gate
added (pulled forward from B2), preflight gained a `dev` target and two newly-required production
secrets. Remaining B1 work is owner-performed provisioning of the dev + prod Supabase projects.

⚠️ B1's written premise — "preflight.sh warns then exits 0" — was **false**; it already failed
closed. See CURRENT_MILESTONE.md → Corrected Premise. Verify each remaining slice's premise against
the code before implementing it.

See:

TASK.md

---

# Today's Objective

B1 code-side work, on `feat/b1-bundle-gate`.

**The app had never been run.** A demo attempt on 2026-07-18 found six defects — three of them
bundle-blocking, one a genuine product bug (SCR_YOU_001 crashed on a Realtime channel collision) —
all accumulated across M1–M8 behind a fully green CI. `lint`, `typecheck`, and `jest` never invoke
Metro, and the E2E job that would have is an `echo`. All six are fixed and merged to main (PR #9);
the app now boots on a physical iPhone against a local Supabase stack.

A **CI bundle gate** is therefore pulled forward from B2 into B1, verified to fail on a
reintroduced resolver defect rather than merely to pass. B1's own written premise then turned out
to be false — preflight already failed closed — so the slice became the *actual* fail-open gaps:
a missing `SUPABASE_PROD_REF`, production treating billing secrets as warnings, and no `dev`
target. See the Execution Gap and Corrected Premise sections in CURRENT_MILESTONE.md.

No new product scope in this milestone.

---

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
| Testing | 🟡 unit/component/domain green; **bundle gate added 2026-07-18** (B1); E2E still a CD placeholder (B2); AI-eval + api-contract gates are hollow |
| Beta | 🚧 In progress (B1–B8) |
| Production | ⏳ |

---

# Current Priorities

1. Beta Readiness B1 — environments & per-env secrets (preflight already fails closed; provisioning is owner-performed)
2. Beta Readiness B2 — replace the Maestro placeholder with real FLOW_* specs
3. ⛔ Canonical Panchang Engine decision (ADR-033) — unblocks Today panchang, Calendar markers, notifications
3. AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)
4. Backend Edge Functions: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook (client contracts coded)
5. Apply migrations to a live Supabase project + integration run
6. E2E (Maestro FLOW_*) + first live CI run

---

# Active Branch

feat/b1-bundle-gate (B1 code-side; main is at PR #9)

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

⚠️ Two open defects from the 2026-07-18 demo session: nine `src/data/` repositories throw on absent
config (surfacing as "Page could not be found" rather than a calm error state), and
`react-native-mmkv` is unavailable in Expo Go so the Ritual screen crashes there. Details in
CURRENT_MILESTONE.md → Current Risks.

---

# Next Deliverable

Beta Readiness — Slice B1: Environments & secrets (dev + prod Supabase projects + per-env secrets —
owner-performed; the code-side work is done)

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
actually verified — **four** gates check nothing (Maestro E2E, EAS build, AI eval subset, and the
API/zod contract gate, which runs `--passWithNoTests` against a package with no tests). Preflight,
contrary to the milestone's original claim, already fails closed. B1 and B2 address the rest. The only architectural blocker is the Canonical Panchang Engine
decision (ADR-033); Ask Guru live answers are intentionally gated until corpus/eval readiness.
