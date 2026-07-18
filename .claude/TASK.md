# TASK.md

# PanchangPal — Current Task

Version: 2.2.0
Last Updated: 2026-07-18

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Previous Tasks

## M7 — Notifications (MOD_notifications)
Status: ✅ COMPLETE — reviewed/approved 2026-07-18. Opt-in priming, per-channel server-authoritative
prefs, push-token registration behind the NotificationAdapter seam, notification-tap deep-link routing
(incl. panchangpal://invite/{token}). Sunrise/tithi content gated by ADR-033.

## M8 Increment 1 — Entitlement read + gating foundation
Status: ✅ COMPLETE (awaiting review). Household-grain (F-4) entitlement read via supabase-js RLS +
realtime seam; pure mapping/rules (isEntitled/hasFamily/activeKind); PremiumCapability registry
(deep_dive_content, extended_ask_guru) + usePremiumGate; PaymentAdapter port + NullPaymentAdapter.
Client never writes entitlements. Domain + repository tests.

---

# Current Task

## Title
Mobile MVP Milestone 8 — Subscription, Increment 2 (SCR_SUBSCRIPTION_001 + affordance wiring)

Status
⏳ NOT STARTED — do not begin until M8 Increment 1 is reviewed/approved.

Priority
🔴 Critical (final Phase-1 slice)

Estimated Effort
1 Session

---

# Objective
Build the subscription screen and wire the v1 gates. Reuse CMP_* + existing seams; no new architecture.
- SCR_SUBSCRIPTION_001 with all documented states (default/loading/skeleton/empty/offline/error/success);
  never an interstitial over the ritual (UX-9); daily loop never gated (P4).
- CMP_PLAN_CARD (individual/family; best-value as TEXT not color), CMP_VALUE_LIST, CMP_LEGAL_FOOTNOTE.
- Plans/purchase/restore via the PaymentAdapter seam (API_GET_SUB_PLANS / API_POST_SUB_VALIDATE /
  API_POST_SUB_RESTORE). No receipt logic on device; entitlement never granted client-side.
- Wire `usePremiumGate` at the two gated affordances: deep-dive content (Settings depth) and extended
  Ask Guru — contextual, dismissible upgrade → the new screen.

# Inputs
- docs/tdd/04_MOBILE_ARCHITECTURE.md (§7.3 payments, §3.4 entitlement, §8.2 rendering)
- docs/pdd/02_USER_FLOWS.md (SCR_SUBSCRIPTION_001, FLOW F1, AC-SUB-01..04)
- docs/pdd/03_COMPONENT_LIBRARY.md (CMP_PLAN_CARD, CMP_VALUE_LIST, CMP_LEGAL_FOOTNOTE)
- docs/api/openapi.yaml (§5.6 subscription endpoints; Entitlement/Plan schemas)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables (to plan at kickoff)
- [ ] CMP_PLAN_CARD / CMP_VALUE_LIST / CMP_LEGAL_FOOTNOTE
- [ ] SCR_SUBSCRIPTION_001 (all states) + You-hub entry + tab registration
- [ ] usePlans / usePurchase / useRestore (EVT_049–052)
- [ ] Affordance wiring: deep-dive content + extended Ask Guru → usePremiumGate → contextual upgrade
- [ ] Unit/component/domain tests

# Success Criteria
AC-SUB-01 (dismissible, never blocks loop, EVT_049) · AC-SUB-02 (server-validated grant → warm
confirmation) · AC-SUB-03 (ERR_PAYMENT_FAILED → clear reason, no grant) · AC-SUB-04 (restore, EVT_052).
Tokens-only styling; localized strings; no business logic in screens; tests pass in CI.

# Constraints
No architecture change; no receipt logic on device; client never writes entitlement; the daily loop is
never gated; no fabricated data; no hardcoded prices (offerings come from the store).

# After Completion
Update SESSION.md, PROJECT_STATUS.md, TASK.md; stop for review. Then Increment 3 (paywall sheet +
routing + FF_FAMILY_PLAN).

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B.
ℹ️ Backend: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook Edge Functions (client
contracts already coded). Add `react-native-purchases` + RC public key on the Mac (lockfile) to swap
NullPaymentAdapter for the concrete RevenueCat adapter.
