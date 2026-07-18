# TASK.md

# PanchangPal — Current Task

Version: 2.3.0
Last Updated: 2026-07-18

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Previous Tasks

## M7 — Notifications (MOD_notifications)
Status: ✅ COMPLETE — reviewed/approved 2026-07-18. Opt-in priming, per-channel server-authoritative
prefs, push-token registration behind the NotificationAdapter seam, notification-tap deep-link routing
(incl. panchangpal://invite/{token}). Sunrise/tithi content gated by ADR-033.

## M8 Increment 1 — Entitlement read + gating foundation
Status: ✅ COMPLETE (approved). Household-grain (F-4) entitlement read via supabase-js RLS +
realtime seam; pure mapping/rules (isEntitled/hasFamily/activeKind); PremiumCapability registry
(deep_dive_content, extended_ask_guru) + usePremiumGate; PaymentAdapter port + NullPaymentAdapter.
Client never writes entitlements. Domain + repository tests.

## M8 Increment 2 — SCR_SUBSCRIPTION_001 + affordance wiring
Status: ✅ COMPLETE (awaiting review). CMP_PLAN_CARD / CMP_VALUE_LIST / CMP_LEGAL_FOOTNOTE (a11y:
radio, text-not-color best-value, SR text equivalents); SCR_SUBSCRIPTION_001 with all states
(default/skeleton/empty/offline/error/success + already-premium) + You-hub entry + route registration;
usePlans/usePurchase/useRestore via the PaymentAdapter seam (no receipt logic on device; entitlement
never granted client-side); usePremiumGate wired at deep-dive (Settings depth) + extended Ask Guru
(contextual, dismissible). Component + hook tests. tsc-clean (jest runs in CI).

---

# Current Task

## Title
Mobile MVP Milestone 8 — Subscription, Increment 3 (contextual paywall sheet + routing + FF_FAMILY_PLAN)

Status
⏳ NOT STARTED — do not begin until M8 Increment 2 is reviewed/approved.

Priority
🔴 Critical (final increment of the final Phase-1 slice)

Estimated Effort
1 Session

---

# Objective
Complete the Subscription slice. Reuse existing CMP_* + seams; no new architecture.
- **Contextual paywall sheet** composed of CMP_BOTTOM_SHEET + CMP_PLAN_CARD (PDD §3 note — NOT a new
  component); always dismissible; never an interstitial over the ritual (UX-9); daily loop never gated (P4).
- **`panchangpal://subscription` deep-link routing** — register in the linking/notification-routing
  resolver so upgrade CTAs and notifications route to SCR_SUBSCRIPTION_001.
- **FF_FAMILY_PLAN** — gate the Family offering behind the feature flag (an offering gate, not an
  in-app capability gate); Individual remains the default.

# Inputs
- docs/tdd/04_MOBILE_ARCHITECTURE.md (§7.3 payments, §8.2 rendering, deep-link routing)
- docs/pdd/02_USER_FLOWS.md (SCR_SUBSCRIPTION_001, UX-9, AC-SUB-01)
- docs/pdd/03_COMPONENT_LIBRARY.md (CMP_BOTTOM_SHEET; the paywall sheet composition note)
- Feature-flag registry (FF_FAMILY_PLAN)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables (to plan at kickoff)
- [ ] Contextual paywall sheet (CMP_BOTTOM_SHEET + CMP_PLAN_CARD), reusable from the gated affordances
- [ ] Route the deep-dive + extended-Ask-Guru upsells through the sheet (replacing the inline cards)
- [ ] panchangpal://subscription deep-link routing
- [ ] FF_FAMILY_PLAN gating of the Family offering
- [ ] Tests

# Success Criteria
AC-SUB-01 (dismissible, never blocks the loop). Tokens-only styling; localized strings; no business
logic in screens; FF_FAMILY_PLAN respected; tests pass in CI.

# Constraints
No architecture change; the paywall is a composition (no new CMP_*); client never writes entitlement;
the daily loop is never gated; no fabricated data; no hardcoded prices.

# After Completion
Update DASHBOARD/PROJECT_STATUS/CURRENT_MILESTONE/IMPLEMENTATION_ROADMAP/SESSION/TASK; the Mobile MVP
milestone (M1–M8) is then feature-complete → transition to Beta Readiness & Platform Hardening (TDD Part 5).

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B.
ℹ️ Backend: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook Edge Functions (client
contracts already coded). Add `react-native-purchases` + RC public key on the Mac (lockfile) to swap
NullPaymentAdapter for the concrete RevenueCat adapter.
