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

# Interposed (2026-07-18): first-run defect fixes — `chore/expo-sdk-54-upgrade`

Status: ✅ COMPLETE — merged to main as PR #9 (squashed, `9d22f42`). All CI gates green.

A demo attempt established that **the app had never been run**. Six defects were fixed to get it
booting on a physical iPhone: three bundle-blockers (Metro/pnpm resolution, undeclared
`@babel/runtime`, workspace `.js` specifiers), two local-backend faults (`supabase start` always
rolled back; anonymous auth disabled), and one genuine product bug (three repositories reused a
fixed Realtime channel topic, crashing SCR_YOU_001). The platform was re-baselined to Expo SDK 54
along the way, because Expo Go supports only the newest SDK and an iOS dev build needs a paid Apple
Developer membership.

It re-baselines the mobile platform (RN 0.81 / React 19 / New Architecture) and is verified only by
bundling, 121 tests, and Expo Go — **no native build has exercised it**; B3 is the first real test.
Full narrative in SESSION.md and CURRENT_MILESTONE.md → Execution Gap.

Two defects found and deliberately left open (see CURRENT_MILESTONE.md → Current Risks): repositories
throwing on absent config, and `react-native-mmkv` being unavailable in Expo Go.

---

# Current Task

## Title
Beta Readiness — Slice B1: Environments & secrets

Status
🟡 IN PROGRESS on `feat/b1-bundle-gate`. Code-side work done (bundle gate; preflight `dev` target;
`SUPABASE_PROD_REF` + `REVENUECAT_WEBHOOK_SECRET` required). Remaining work is **owner-performed**:
provision the dev + prod Supabase projects and place the per-environment secrets.

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
- ~~**Make `scripts/preflight.sh` fail-closed.**~~ **PREMISE WAS FALSE (verified 2026-07-18).** The
  script already exits 1 on a missing required secret, and `cd.yml` calls it without `|| true` in
  all four jobs. Proven by running it with the secrets unset: exit 1, "Stopping deployment." The
  actual fail-open gaps were different and are fixed on `feat/b1-bundle-gate`:
  - `SUPABASE_PROD_REF` did not exist — production required only a DB URL, so a promotion could pass
    preflight with no project ref for `supabase functions deploy`. Now required + registered.
  - `REVENUECAT_WEBHOOK_SECRET` was a warning at the production tier; a live release could ship with
    webhook signatures unverifiable. Now required for production only.
  - No `dev` target existed despite §1.1 mandating three isolated environments. Added.
- **Add a CI bundle gate** (pulled forward from B2): `expo export --platform all`. Verified in both
  directions — passes on main, fails on a reintroduced `disableHierarchicalLookup` defect.
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
- [x] preflight fails closed per environment — **already did**; premise corrected. Tightened instead:
      `dev` target added, `SUPABASE_PROD_REF` and `REVENUECAT_WEBHOOK_SECRET` now required for prod
- [x] A deliberately-missing-secret run proves it fails (evidence, not assertion): `production` with
      nothing set → exit 1, 5 required items missing; all-set → exit 0; bad target → exit 2
- [x] CI bundle gate proven to fail on a reintroduced defect, not merely to pass
- [ ] CD promote-to-production gate end-to-end — blocked: the job chain depends on the placeholder
      `eas-build`, so the gate cannot be exercised for real until B3
- [ ] Two hollow CI gates (AI eval subset = `echo`; api-contract = `--passWithNoTests` with no test
      files) — implement or explicitly de-declare; a green gate that checks nothing is worse than none

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
**B2 — E2E verification** (CI bundle gate + replace the Maestro placeholder with real FLOW_* specs).

Consider pulling B2's **bundle gate** forward into B1: it is a few lines of CI (`expo export` for
ios+android) and is the control that would have caught three of the 2026-07-18 defects at M1. Every
later slice builds on the assumption that the app compiles.

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B.
ℹ️ Backend: SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook Edge Functions (client
contracts already coded). Add `react-native-purchases` + RC public key on the Mac (lockfile) to swap
NullPaymentAdapter for the concrete RevenueCat adapter.
