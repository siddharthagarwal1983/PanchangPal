# DASHBOARD.md

# PanchangPal Dashboard

Version: 1.1.0

Last Updated: 2026-07-12 06:15

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

84%

Prior phases ✅ complete: Documentation → Repository & Platform Foundation → Backend Foundation.

---

# Current Milestone

Mobile MVP — Phase 1

See:

CURRENT_MILESTONE.md

---

# Current Task

Milestone 5 — Ask Guru Client ✅ COMPLETE (awaiting review).
Next recommended: Milestone 6 — Profile / Household (MOD_you).

See:

TASK.md

---

# Today's Objective

Mobile MVP feature slices are progressing: M1 App Shell, M2 Today, M3 Guided Ritual, M4 Calendar
Shell, and M5 Ask Guru Client are complete. Panchang compute + Ask Guru live answers remain gated
(ADR-033 / corpus+eval). Next: Profile/Household, then Notifications and Subscription.

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
| Backend Foundation (SVC_*) | ✅ (panchang engine blocked) |
| Mobile — App Shell / Today / Ritual / Calendar / Ask Guru | ✅ M1–M5 |
| Mobile — Profile / Notifications / Subscription | ⏳ M6–M8 |
| AI Platform | 🟡 adapters done; corpus + eval pending |
| Testing | 🟡 unit/component/domain in place; E2E pending |
| Beta | ⏳ |
| Production | ⏳ |

---

# Current Priorities

1. Mobile feature slices — Profile/Household (M6), Notifications (M7), Subscription (M8)
2. ⛔ Canonical Panchang Engine decision (ADR-033) — unblocks Today panchang, Calendar markers, notifications
3. AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)
4. Apply migrations to a live Supabase project + integration run
5. E2E (Maestro FLOW_*) + first live CI run

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

---

# Next Deliverable

Milestone 6 — Profile / Household (MOD_you)

---

# After Current Deliverable

Milestone 7 — Notifications, then Milestone 8 — Subscription

---

# Documentation Status

MRD ✅ Approved · PRD ✅ Approved · PDD ✅ Approved · TDD ✅ Approved · Architecture Stable ✅ Yes

---

# Architecture Snapshot

Frontend: React Native + Expo (Expo Router, Zustand, TanStack Query)
Backend: Supabase (Postgres + RLS + Edge Functions)
AI: GPT-5 mini + RAG (behind adapters; live answers gated)
Payments: RevenueCat · State: Zustand + TanStack Query

---

# Startup Checklist

Before coding: read PROJECT_MEMORY.md · CURRENT_MILESTONE.md · SESSION.md · TASK.md · ARCHITECTURE_SUMMARY.md.
Only retrieve additional documentation if required.

---

# End Session Checklist

□ Update SESSION.md · □ Update PROJECT_STATUS.md · □ Update TASK.md · □ Update DECISIONS.md (if needed)
□ Update PROJECT_MEMORY.md (only if permanent knowledge changed) · □ Recommend next task

---

# Executive Summary

Documentation and architecture are frozen. The repository, platform foundation, and backend
SVC_* are complete. The mobile app is being built as sequenced feature slices — App Shell, Today,
Guided Ritual, Calendar Shell, and Ask Guru are done (M1–M5). The only architectural blocker is
the Canonical Panchang Engine decision (ADR-033); Ask Guru live answers are intentionally gated
until corpus/eval readiness. Current focus: the remaining mobile slices (Profile/Household,
Notifications, Subscription).
