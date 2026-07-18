# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.5.0

Last Updated: 2026-07-18 (M8 Increment 3 complete — Mobile MVP feature-complete)

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

🚧 Mobile MVP — Phase 1 (Feature Slices)

Progress

100%

(Canonical progress metric — 8 of 8 slices complete. PROJECT_STATUS.md and
CURRENT_MILESTONE.md must report this same number; DASHBOARD.md is authoritative if they diverge.)

Prior phases ✅ complete: Documentation → Repository & Platform Foundation → Backend Foundation.

---

# Current Milestone

Mobile MVP — Phase 1

See:

CURRENT_MILESTONE.md

---

# Current Task

Milestone 7 — Notifications ✅ COMPLETE (reviewed/approved).
Milestone 8 — Subscription: Increment 1 (entitlement read + gating) ✅ COMPLETE (approved).
Milestone 8 — Subscription: Increment 2 (SCR_SUBSCRIPTION_001 + plans/purchase/restore + affordance
wiring) ✅ COMPLETE (approved, merged as PR #4).
Milestone 8 — Subscription: Increment 3 (contextual paywall sheet + panchangpal://subscription
routing + FF_FAMILY_PLAN) ✅ COMPLETE (awaiting review).
**Mobile MVP Phase 1 (M1–M8) is feature-complete.**
Next: transition to Beta Readiness & Platform Hardening (TDD Part 5).

See:

TASK.md

---

# Today's Objective

All eight Mobile MVP feature slices are complete: App Shell, Today, Guided Ritual, Calendar Shell,
Ask Guru, Profile/Household, Notifications, and Subscription. M8 closed with Increment 3 — the
contextual paywall sheet (CMP_BOTTOM_SHEET + CMP_PLAN_CARD composed at `app/modal/paywall`),
`panchangpal://subscription` routing to SCR_SUBSCRIPTION_001, and FF_FAMILY_PLAN gating the Family
offering via a new fail-closed feature-flag read seam. Panchang compute + Ask Guru live answers
remain gated (ADR-033 / corpus+eval).

Do not introduce new architecture.

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
| Testing | 🟡 unit/component/domain in place; E2E pending |
| Beta | ⏳ |
| Production | ⏳ |

---

# Current Priorities

1. Beta Readiness & Platform Hardening (TDD Part 5) — the next milestone
2. ⛔ Canonical Panchang Engine decision (ADR-033) — unblocks Today panchang, Calendar markers, notifications
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
installed (sandbox can't regenerate the lockfile). Their adapters ship as pure ports + Null impls;
concrete adapters are one-line swaps once the deps + keys land on the Mac.

---

# Next Deliverable

Beta Readiness & Platform Hardening (TDD Part 5) — provision Supabase envs, CD migrations, Sentry +
dashboards, E2E (Maestro FLOW_*), OWASP Mobile review, phased store rollout.

---

# After Current Deliverable

Beta (TestFlight / Play Internal) → phased production release (US/AU/NZ)

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

Documentation and architecture are frozen. The repository, platform foundation, and backend
SVC_* are complete. **The Mobile MVP (Phase 1) is feature-complete**: all eight slices — App Shell,
Today, Guided Ritual, Calendar Shell, Ask Guru, Profile/Household, Notifications, and Subscription —
are implemented, tsc-clean, and green in test. The project now transitions to Beta Readiness &
Platform Hardening (TDD Part 5). The only architectural blocker is the Canonical Panchang Engine
decision (ADR-033); Ask Guru live answers are intentionally gated until corpus/eval readiness.
