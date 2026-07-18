# TASK.md

# PanchangPal — Current Task

Version: 2.4.0
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
Status: ✅ COMPLETE (approved; merged to main as PR #4). CMP_PLAN_CARD / CMP_VALUE_LIST / CMP_LEGAL_FOOTNOTE (a11y:
radio, text-not-color best-value, SR text equivalents); SCR_SUBSCRIPTION_001 with all states
(default/skeleton/empty/offline/error/success + already-premium) + You-hub entry + route registration;
usePlans/usePurchase/useRestore via the PaymentAdapter seam (no receipt logic on device; entitlement
never granted client-side); usePremiumGate wired at deep-dive (Settings depth) + extended Ask Guru
(contextual, dismissible). Component + hook tests. tsc-clean (jest runs in CI).

---

## M8 Increment 3 — Contextual paywall sheet + routing + FF_FAMILY_PLAN
Status: ✅ COMPLETE (awaiting review). CMP_BOTTOM_SHEET built to PDD §5.12 (it had never been
implemented); contextual paywall composed from it + CMP_PLAN_CARD at the `app/modal/paywall` route
(TDD §3.1) and reached by navigation intent so MOD_guru never imports MOD_you (§2.2); Settings
deep-dive and Ask Guru upsells now open the sheet; `panchangpal://subscription` →
SCR_SUBSCRIPTION_001 in both the linking table and notification tap routing; FF_FAMILY_PLAN offering
gate via a new fail-closed feature-flag seam (featureFlagRepository + HOOK_useFeatureFlag, ADR-021)
applied through the pure `visibleOfferings`. tsc + eslint clean; 153 tests green across mobile + ui.

**With this, Mobile MVP Phase 1 (M1–M8) is feature-complete.**

---

# Current Task

## Title
Beta Readiness & Platform Hardening (TDD Part 5) — milestone kickoff

Status
⏳ NOT STARTED — do not begin until M8 Increment 3 is reviewed/approved.

Priority
🔴 Critical (the milestone that takes the feature-complete MVP to a shippable beta)

Estimated Effort
Multi-session (to be sliced at kickoff)

---

# Objective
Take the feature-complete Mobile MVP to beta readiness. No new product scope; this milestone is
environments, observability, verification, and release mechanics.
- **Environments** — provision dev/staging/prod Supabase projects + secrets; apply migrations via CD.
- **Observability** — Sentry, AI/analytics dashboards, alerts; DR restore drill.
- **Verification** — E2E (Maestro FLOW_*); first live integration run of the entitlement,
  notification, and feature-flag reads that have only ever run against fakes.
- **Security** — OWASP Mobile review.
- **Release** — TestFlight / Play Internal, then phased store rollout (US/AU/NZ).

# Inputs
- docs/tdd/ Part 5 (beta readiness, hardening, release)
- docs/devops/CONFIGURATION_REGISTRY.md (env/secret/flag registry)
- ADR-033 status (gates a panchang-inclusive launch)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables (to slice at kickoff)
- [ ] Supabase dev/staging/prod provisioned; migrations applied via CD
- [ ] Sentry + dashboards + alerts wired
- [ ] DR restore drill executed and documented
- [ ] Maestro FLOW_* E2E green in CI
- [ ] OWASP Mobile review completed
- [ ] Store submission prerequisites (assets, privacy disclosures, pricing)

# Success Criteria
A clean clone builds, migrates, and runs against a live environment; E2E green in CI; alerting
proven; no unresolved OWASP findings; a beta build distributed to TestFlight / Play Internal.

# Constraints
No new product scope. Architecture unchanged. Secrets never committed. ADR-033 must be ratified
before a panchang-inclusive launch; GURU_LIVE stays off until corpus + eval readiness.

# After Completion
Update DASHBOARD/PROJECT_STATUS/CURRENT_MILESTONE/IMPLEMENTATION_ROADMAP/SESSION/TASK; proceed to
phased production release.

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B.
ℹ️ Backend: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook Edge Functions (client
contracts already coded). Add `react-native-purchases` + RC public key on the Mac (lockfile) to swap
NullPaymentAdapter for the concrete RevenueCat adapter.
