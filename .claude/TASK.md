# TASK.md

# PanchangPal — Current Task

Version: 1.2.0
Last Updated: 2026-07-12 (evening — after DevOps hardening interlude)

Purpose: the current implementation task. Stay focused; avoid unrelated work unless instructed.

---

# Most Recent (interlude, this session)

## DevOps Platform Audit & Hardening — ✅ COMPLETE (awaiting review)
Repo-wide deployment audit + hardening (DX, reliability, env management, docs). Delivered 18 files
(docs/devops/*, docs/SETUP.md, DEVOPS_AUDIT_REPORT.md, 6 .env.*.example, scripts/preflight.sh +
bootstrap.sh) and hardened .github/workflows/{ci,cd,ota}.yml. No product/architecture/deploy-behavior
changes. Gated follow-ups (Platform-owned): provision Supabase projects, GitHub secrets/Environments,
eas.json/EAS creds. See DEVOPS_AUDIT_REPORT.md + docs/devops/DEPLOYMENT_READINESS.md.

---

# Previous Task

## Title
Mobile MVP Milestone 5 — Ask Guru Client (MOD_guru / SCR_GURU_*)

Status
✅ COMPLETE — awaiting review/approval.

Outcome
Trust-first Ask Guru home + streamed conversation + cached history via a readiness-gated SSE
transport (GURU_LIVE=false → honest decline). Client calls only the server API/SSE adapter; no
LLM/fabrication on device. Component/domain/UI + a11y tests.

---

# Current Task

## Title
Mobile MVP Milestone 6 — Profile / Household (MOD_you)

Status
🚧 IN PROGRESS — Increment 1 complete; a DevOps hardening interlude ran this session. Product
resumes at Increment 2 (Household). Do not start Increment 2 until approved.

Priority
🔴 Critical

Estimated Effort
2–3 Sessions (delivered as increments)

---

# Objective
Build the MOD_you slice — profile hub, household (members/roles/invites + realtime), settings
(server-authoritative preferences), and account deletion — on the completed foundation. Reuse
CMP_* + existing seams; no new architecture. Subscription is Milestone 8, out of scope here.

# Inputs
- docs/tdd/04_MOBILE_ARCHITECTURE.md (§2.1 MOD_you, §3 routing, §4 state, §5 hooks)
- docs/pdd/03_COMPONENT_LIBRARY.md (settings/household/profile CMP_*)
- docs/api/openapi.yaml (API_GET/PATCH_PREFERENCES, API_POST_PROFILE, API_*_HOUSEHOLD*)
- apps/backend/migrations/20260712000010_identity.sql + ..020_household.sql (schema/RLS)
If ambiguous/conflicting: stop, explain, request clarification.

# Deliverables & Status
- [x] Increment 1 — Preferences + Settings + Profile:
      CMP_SEGMENTED / CMP_TOGGLE / CMP_SETTINGS_ROW; domain/profile mapping; profileRepository
      (owner RLS); usePreferences/useUpdatePreferences (optimistic + STORE_prefs mirror + offline
      queue); SCR_SETTINGS_001 wired; SCR_PROFILE_001 recomposed (deferred-auth prompt + entries);
      Household shell (no dead end); routes registered; i18n; mapping + repository tests.
- [ ] Increment 2 — Household: members/roles, invites (SCR_HOUSEHOLD_INVITE_001), realtime
      (HOOK_useHousehold / HOOK_useInvite); replace the household shell with the real feature.
- [ ] Increment 3 — Account deletion (SCR_DELETE_ACCOUNT_001) via CMP_DESTRUCTIVE_ACTION + API.

# Success Criteria
- Screens compose approved CMP_* with tokens-only styling + localized strings; no business logic
  in screens; loading/empty/offline/error states covered.
- Preferences are server-authoritative and optimistic; the daily loop is never gated.
- Household/cross-device actions honor deferred auth (anon → auth gate) and RLS.
- Unit/component/domain tests pass in CI.

# Constraints
Do not change architecture; do not touch the panchang engine; no cross-feature imports; no
fabricated household data; no hardcoded tokens.

# After Completion (each increment)
Update SESSION.md, PROJECT_STATUS.md, TASK.md; stop for review.

---

# Parallel (owner-driven, not this task)
⛔ Ratify ADR-033 (Canonical Panchang Engine) Part B. See docs/architecture/canonical-panchang-engine/.
