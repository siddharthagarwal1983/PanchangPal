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
Status: ✅ COMPLETE (merged to main as PR #7). CMP_BOTTOM_SHEET built to PDD §5.12 (it had never been
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
Beta Readiness — Slice B1: Environments & secrets (fail-closed)

Status
⏳ NOT STARTED — begin once M8 Increment 3 review is closed out.

Priority
🔴 Critical (prerequisite for every later slice; also removes a false-green deploy path)

Estimated Effort
1 Session

---

# Objective
Put all three environments on a real, verifiable footing and stop deploys from succeeding when
configuration is missing.
- **Provision dev + prod Supabase projects** alongside the working staging project (§1.1 — three
  isolated projects, no shared databases, migrations promote dev→staging→prod).
- **Place per-environment secrets** per §4.1; RevenueCat sandbox for dev/staging, production
  entitlements for prod.
- **Make `scripts/preflight.sh` fail-closed.** It currently `warn`s on an unset secret and exits 0,
  so a deploy can report green with nothing configured. Required secrets must fail the job for the
  target environment; genuinely optional ones stay warnings.
- **Confirm the prod promotion path** — the CD `Promote to production` job is a manual go/no-go gate
  (§10.1) and must fail closed too.

# Inputs
- docs/tdd/05_PLATFORM_DEVOPS.md §1.1 (environments), §1.3 (infra-as-config), §2.5 (migrations), §4 (secrets)
- docs/devops/CONFIGURATION_REGISTRY.md (canonical env/secret inventory)
- scripts/preflight.sh, scripts/migrate.sh, .github/workflows/cd.yml
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables
- [ ] dev + prod Supabase projects provisioned; migrations applied dev→staging→prod
- [ ] Per-environment secrets placed and documented against the registry (no secret in the repo)
- [ ] preflight.sh fails closed on required secrets, per environment; warnings reserved for optional
- [ ] CD promote-to-production gate verified as fail-closed
- [ ] A deliberately-missing-secret run proves the job now fails (evidence, not assertion)

# Success Criteria
A CD run with an unset required secret FAILS. Migrations apply cleanly to all three environments.
No environment shares a database. No secret is committed. Documentation matches reality.

# Constraints
No product/architecture change. Prod changes go through CI only — no manual dashboard edits (§1.3).
Secrets are never printed to logs or committed. Provisioning real cloud projects and placing
credentials is **owner-performed** — prepare the config, scripts, and instructions; do not ask for
or handle credential values.

# After Completion
Update DASHBOARD/PROJECT_STATUS/CURRENT_MILESTONE/IMPLEMENTATION_ROADMAP/SESSION/TASK; proceed to
**B2 — E2E verification** (replace the Maestro placeholder with real FLOW_* specs).

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B.
ℹ️ Backend: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook Edge Functions (client
contracts already coded). Add `react-native-purchases` + RC public key on the Mac (lockfile) to swap
NullPaymentAdapter for the concrete RevenueCat adapter.
