# CURRENT_MILESTONE.md

# PanchangPal — Current Milestone

Version: 2.4.0

Last Updated: 2026-07-18 (M8 Increment 3 complete — all eight slices implemented)

Purpose:
This document defines the current milestone. Unlike SESSION.md (daily work) or TASK.md (current
task), it changes only when the project moves to a new milestone. Read it to understand the
broader implementation objective before beginning any work.

---

# Current Milestone

## Mobile MVP — Phase 1 (Feature Slices)

Status

🟢 Feature-complete (awaiting review of M8 Increment 3)

Overall Progress

100% (8 of 8 slices complete)

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
| M6 | Profile / Household | SCR_PROFILE_001, SCR_HOUSEHOLD_*, SCR_SETTINGS_001, SCR_DELETE_ACCOUNT_001 | ✅ Complete |
| M7 | Notifications | opt-in, prefs, deep-link routing | ✅ Complete |
| M8 | Subscription | SCR_SUBSCRIPTION_001 (RevenueCat) | ✅ Complete |

---

# Milestone Deliverables

## Completed slices (M1–M7)

- [x] M1 Application Shell — design tokens, shell CMP_*, anon-first auth, splash/onboarding/4-tab nav.
- [x] M2 Today — panchang/ritual/streak/checklist cards; PanchangProvider abstraction (ADR-033 unavailable).
- [x] M3 Guided Ritual Player — RitualEngine/session model, MMKV persistence, AudioAdapter port.
- [x] M4 Calendar Shell — month grid/nav/day-cell/tradition switcher; markers unavailable (ADR-033).
- [x] M5 Ask Guru Client — home + streamed conversation + cached history; readiness-gated SSE (GURU_LIVE).
- [x] M6 Profile / Household — preferences/settings, profile, household members/roles/invites/realtime, deletion.
- [x] M7 Notifications — opt-in priming, per-channel prefs, token registration (NotificationAdapter seam),
      deep-link routing (incl. panchangpal://invite/{token}); sunrise/tithi gated (ADR-033).

## Final slice (M8 — Subscription, in 3 increments) — complete

- [x] M8 Increment 1 — Entitlement read + gating: household-grain (F-4) entitlement read (supabase-js
      RLS + realtime), PaymentAdapter port + NullPaymentAdapter, PremiumCapability registry
      (deep_dive_content, extended_ask_guru), HOOK_useEntitlement + usePremiumGate.
- [x] M8 Increment 2 — SCR_SUBSCRIPTION_001 (CMP_PLAN_CARD/VALUE_LIST/LEGAL_FOOTNOTE), plans/purchase/
      restore via the PaymentAdapter (usePlans/usePurchase/useRestore), and affordance wiring —
      deep-dive content (Settings depth) + extended Ask Guru — via usePremiumGate (contextual, dismissible).
- [x] M8 Increment 3 — CMP_BOTTOM_SHEET (PDD §5.12, previously unimplemented) + the contextual
      paywall composed from it and CMP_PLAN_CARD at the `app/modal/paywall` route (§3.1), reached by
      navigation intent so MOD_guru never imports MOD_you (§2.2); `panchangpal://subscription` →
      SCR_SUBSCRIPTION_001 in both the linking table and notification tap routing; FF_FAMILY_PLAN
      offering gate via a new fail-closed feature-flag read seam (featureFlagRepository +
      HOOK_useFeatureFlag, ADR-021).

---

# Out of Scope (this milestone)

- Astronomical panchang calculations — frozen behind the PanchangEngine interface until ADR-033.
- Live Ask Guru answers — gated (GURU_LIVE) until reviewed corpus + eval readiness (TDD Part 3 §10B).
- RevenueCat webhook / receipt reconciliation — server-only (SVC_revenuecat_webhook).
- Final pricing / ad-supported free tier — open PRD decision (F-11).
- E2E automation, store submission, and platform hardening — the next milestone (TDD Part 5).

---

# Success Criteria

The milestone is complete when M1–M8 are implemented and reviewed, every screen composes approved
CMP_* with tokens-only styling and localized strings, no business logic lives in screens, the
offline/empty/error states are covered, and unit/component/domain tests pass in CI.

---

# Current Risks

- Documentation/code drift (kept in check by per-slice SESSION/TASK updates).
- Unapproved architectural changes (guarded by the provider abstractions).
- ADR-033 remaining unratified — keeps Today panchang, Calendar markers, and notifications partial.
- Deferred vendor deps (expo-notifications, react-native-purchases) — adapters ship as Null seams;
  concrete impls land once deps/keys are added on the Mac.
- Offline sandbox prevents local install/test runs — verification lands in CI.

---

# Definition of Done

- All eight slices implemented, reviewed, and green in CI.
- Architecture matches the TDD; abstractions (PanchangEngine, PanchangProvider, GuruTransport,
  AudioAdapter, NotificationAdapter, PaymentAdapter) never bypassed.
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

> **All eight slices are implemented — App Shell, Today, Ritual, Calendar, Ask Guru,
> Profile/Household, Notifications, and Subscription. The Mobile MVP is feature-complete; next
> milestone is Beta Readiness & Platform Hardening (TDD Part 5).**
