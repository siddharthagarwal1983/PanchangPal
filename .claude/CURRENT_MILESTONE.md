# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 2.0.0

Last Updated: 2026-07-12 06:15

Purpose:
This document defines the current milestone. Unlike SESSION.md (daily work) or TASK.md (current
task), it changes only when the project moves to a new milestone. Read it to understand the
broader implementation objective before beginning any work.

---

# Current Milestone

## Mobile MVP — Phase 1 (Feature Slices)

Status

🟡 In Progress

Overall Progress

~65% (5 of 8 planned slices complete)

Previous Milestones

✅ Documentation Complete
✅ Repository & Platform Foundation
✅ Backend Foundation (SVC_* Edge Functions)

Next Milestone

Beta Readiness & Platform Hardening (TDD Part 5)

---

# Milestone Objective

Build the PanchangPal mobile application as a sequence of vertical, production-quality feature
slices on top of the completed foundation and backend. Each slice compiles independently, passes
tests, reuses the design system, keeps business logic out of screens, and supports loading /
empty / offline / error states. One milestone is implemented per session; no slice starts before
the previous is reviewed.

---

# Scope — the eight slices

| # | Slice | Screens | Status |
|---|---|---|---|
| M1 | Application Shell | splash, onboarding/auth, 4-tab nav | ✅ Complete |
| M2 | Today | SCR_HOME_001 | ✅ Complete |
| M3 | Guided Ritual Player | SCR_RITUAL_001 | ✅ Complete |
| M4 | Calendar Shell | SCR_CALENDAR_001 | ✅ Complete |
| M5 | Ask Guru Client | SCR_GURU_HOME/CHAT/HISTORY_001 | ✅ Complete |
| M6 | Profile / Household | SCR_PROFILE_001, SCR_HOUSEHOLD_*, SCR_SETTINGS_001 | ⏳ Next |
| M7 | Notifications | opt-in, prefs, deep-link routing | ⏳ Pending |
| M8 | Subscription | SCR_SUBSCRIPTION_001 (RevenueCat) | ⏳ Pending |

---

# Milestone Deliverables

## Completed slices (M1–M5)

- [x] M1 Application Shell — design tokens (PDD §6), shell CMP_*, anon-first + OAuth/OTP auth,
      splash/onboarding/4-tab navigation, guards, deep links, error boundaries, i18n.
- [x] M2 Today — panchang/ritual/streak/checklist/rotating cards; PanchangProvider abstraction
      (production "unavailable" per ADR-033 + dev-only mock); useToday/useChecklist/useCompleteRitual.
- [x] M3 Guided Ritual Player — RitualEngine/session model, MMKV persistence, AudioAdapter port
      (NullAudioAdapter; text-guided fallback), intro/step/progress/audio/completion CMP_*.
- [x] M4 Calendar Shell — month grid/nav/day-cell/tradition switcher; markers stay unavailable
      (ADR-033) via the calendar provider seam.
- [x] M5 Ask Guru Client — home + streamed conversation + cached history; readiness-gated SSE
      transport (GURU_LIVE=false → honest decline until corpus/eval); no LLM/fabrication on device.

## Remaining slices (M6–M8)

- [ ] M6 Profile / Household — profile, household members/invites, settings, account deletion.
- [ ] M7 Notifications — opt-in priming, per-channel prefs, token registration, deep-link routing.
- [ ] M8 Subscription — plans, purchase/restore via RevenueCat, entitlement gating (daily loop never gated).

---

# Out of Scope (this milestone)

- Astronomical panchang calculations — frozen behind the PanchangEngine interface until ADR-033.
- Live Ask Guru answers — gated (GURU_LIVE) until reviewed corpus + eval readiness (TDD Part 3 §10B).
- E2E automation, store submission, and platform hardening — the next milestone (TDD Part 5).

---

# Success Criteria

The milestone is complete when M1–M8 are implemented and reviewed, every screen composes approved
CMP_* with tokens-only styling and localized strings, no business logic lives in screens, the
offline/empty/error states are covered, and unit/component/domain tests pass in CI.

---

# Current Risks

- Documentation/code drift (kept in check by per-slice SESSION/TASK updates).
- Unapproved architectural changes (guarded by the PanchangEngine + provider abstractions).
- ADR-033 remaining unratified — keeps Today panchang, Calendar markers, and notifications partial.
- Offline sandbox prevents local install/test runs — verification lands in CI.

---

# Definition of Done

- All eight slices implemented, reviewed, and green in CI.
- Architecture matches the TDD; abstractions (PanchangEngine, PanchangProvider, GuruTransport,
  AudioAdapter) never bypassed.
- Documentation synchronized; the app runs from a clean clone once dependencies install.

---

# Milestone Transition

On completion:
1. Update PROJECT_STATUS.md.
2. Update PROJECT_MEMORY.md if permanent knowledge changed.
3. Replace this file with the next milestone (Beta Readiness & Platform Hardening).

---

# Next Milestone Preview

## Beta Readiness & Platform Hardening (TDD Part 5)

Provision dev/staging/prod Supabase + secrets; apply migrations via CD; Sentry + AI/analytics
dashboards + alerts; DR restore drill; E2E (Maestro FLOW_*); OWASP Mobile review; phased store
rollout (US/AU/NZ). Requires ADR-033 ratified and Ask Guru corpus/eval readiness for a panchang-
inclusive launch.

---

# Milestone Summary

> **Current focus: build the mobile app as sequenced, production-quality feature slices — App
> Shell, Today, Ritual, Calendar, Ask Guru done (M1–M5); Profile/Household, Notifications, and
> Subscription remain.**
