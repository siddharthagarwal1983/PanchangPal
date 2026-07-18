# IMPLEMENTATION_ROADMAP.md

# PanchangPal — Implementation Roadmap

Version: 1.3.0
Last Updated: 2026-07-18 (M8 Subscription Increment 2 complete)

Purpose: the forward plan from the current state. Complements PROJECT_STATUS.md (snapshot) and
CURRENT_MILESTONE.md (active milestone). Updated when scope or sequencing changes — and at every
increment/milestone boundary per the Increment & Milestone Completion Checkpoint in CLAUDE.md.

---

## Where we are (2026-07-18)

Documentation, ADRs (33), OpenAPI, DB schema + migrations, monorepo scaffold, Expo app shell,
CI/CD, Backend Foundation, and the design system are complete. The Mobile MVP — Phase 1 feature
slices are **complete (100%)**: M1 App Shell, M2 Today, M3 Guided Ritual, M4 Calendar Shell,
M5 Ask Guru, M6 Profile/Household, M7 Notifications, and M8 Subscription. M8 closed with
Increment 3 (contextual paywall sheet at app/modal/paywall, panchangpal://subscription routing,
FF_FAMILY_PLAN offering gate), merged to main as PR #7.

The **Beta Readiness & Platform Hardening** milestone (TDD Part 5) is now open, sliced B1–B8:
environments & secrets · E2E · build/distribution · observability · reliability & DR ·
security & privacy · release management · go/no-go. Current slice: **B1 — Environments & secrets
(fail-closed)**, gated on reviewing `chore/expo-sdk-54-upgrade` first.

**Correction to "complete" (2026-07-18):** M1–M8 are feature-complete as written, but none of that
code had ever been executed — the first attempt to run the app found three bundle-blocking defects,
two local-backend faults, and one crashing product bug. They are fixed on
`chore/expo-sdk-54-upgrade` (unmerged), which also re-baselines the platform to Expo SDK 54 /
RN 0.81 / React 19. The app now boots on a physical iPhone against a local Supabase stack. Read
"feature-complete" as "written and unit-tested", not "known to run", for anything predating this.

Verified starting position: staging migrations and Edge Function deploys are real, but the Maestro
E2E and EAS build CD jobs are placeholders and `preflight.sh` warns-then-exits-0 on missing secrets,
so CD's green status currently overstates what is verified. B1/B2 address that before anything is
layered on top.

One blocker: the Canonical Panchang Engine (ADR-033, Proposed) — astronomical algorithm
undocumented; the whole system depends only on the abstract PanchangEngine/PanchangProvider
interfaces, so this blocks ONLY panchang compute + sunrise/tithi notifications, with zero rework
when it lands.

---

## Track A — Product build (unblocked, proceed now)

1. ✅ Design System & Component Library — tokens (PDD Part 3 §6) + CMP_* (a11y-first).
2. Mobile feature slices (MOD_*) — ✅ complete.
   - ✅ M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru ·
     M6 Profile/Household · M7 Notifications.
   - ✅ M8 Subscription — all 3 increments (entitlement read + gating; SCR_SUBSCRIPTION_001,
     CMP_PLAN_CARD/VALUE_LIST/LEGAL_FOOTNOTE, plans/purchase/restore via the PaymentAdapter;
     CMP_BOTTOM_SHEET + the contextual paywall route, panchangpal://subscription routing, and the
     FF_FAMILY_PLAN offering gate on a new fail-closed feature-flag seam).
   - Note: the Today panchang view and Calendar markers render "temporarily unavailable" until the
     engine lands; ritual completion / streak / checklist / Ask Guru / household / notifications
     prefs all work now. Live Ask Guru answers stay gated (GURU_LIVE=false).
3. Backend Edge Functions (client contracts already coded) — SVC_household (member/invite),
   SVC_notify_scheduler (notify/schedule), SVC_revenuecat_webhook (entitlement grant/revoke).
4. AI corpus ingestion + eval harness — run SVC_content_ingest on the reviewed corpus; calibrate
   F-6/F-16 on the eval sets; refusal test set in CI (needs the corpus, PDD §9.8).
5. Backend DB wiring hardening — flesh repository upserts vs a live Supabase test project; green
   the pgTAP integration suite; add per-endpoint contract tests.

## Track B — Canonical Panchang Engine (owner-driven, unblocks the rest)

1. Ratify ADR-033 Part B (Architecture + Product + pandit reviewer): ephemeris, ayanamsa,
   per-tradition profiles, methodology, validation dataset, acceptance tolerances.
2. Implement the concrete engine behind PanchangEngine (e.g. Swiss Ephemeris-grade) — only after
   ratification. Legal review of the ephemeris license.
3. Golden-dataset validation gate (vs Drik/mPanchang, per tradition) in CI; reviewer sign-off.
4. Register the engine + set engine_version; un-skip the engine tests; enable SVC_panchang compute
   + sunrise/tithi notifications. No caller changes (interface unchanged).

## Track C — Platform hardening (parallel, TDD Part 5)

- ✅ DevOps platform audit + hardening (2026-07-12): canonical env inventory, secrets matrix,
  6 `.env.*.example` templates, `scripts/preflight.sh` (fail-fast) + `scripts/bootstrap.sh`,
  workflow hardening (least-privilege, retries, `db-tests`/`security-scan` toolchain, preflight
  gates, summaries), `docs/SETUP.md`, `docs/devops/*`, `DEVOPS_AUDIT_REPORT.md`, and the canonical
  `docs/devops/CONFIGURATION_REGISTRY.md`. No deploy behavior changed. See DEVOPS_AUDIT_REPORT.md.
- ⏳ Install deferred vendor deps on the Mac (`expo-notifications`, `react-native-purchases`) + keys;
  swap NullNotificationAdapter / NullPaymentAdapter for the concrete adapters (one-line composition-root
  changes).
- ⏳ Provision dev/staging/prod Supabase projects + secrets; apply migrations via CD. (Pipeline +
  preflight ready; infra/credentials not yet configured — see DEPLOYMENT_READINESS.md.)
- ⏳ Add `eas.json` + EAS credentials; flip CD deploy scaffolds to real.
- ⏳ Stand up Sentry + AI/analytics dashboards + alerts; DR restore drill.
- ⏳ Rate-limit/cost-ceiling values tuned from real usage; OWASP Mobile review + pen test pre-launch.

---

## Milestone sequence

Repository & Platform Foundation (done) -> Backend Foundation (independent done; engine blocked)
-> Design System (done) -> Mobile Features (M1–M8 done) -> AI corpus + eval ->
Beta (§10.1 go/no-go) -> Launch (US/AU/NZ phased). Track B runs alongside and must complete before
a launch that includes panchang.

## Remaining blockers (single source: PROJECT_STATUS.md "Known Blockers")

Canonical Panchang Engine (ADR-033). Ask Guru live answers gated (GURU_LIVE) until corpus/eval.
Deferred vendor deps (expo-notifications, react-native-purchases) shipped as Null seams. Nothing
else is blocking; all other tracks proceed.
