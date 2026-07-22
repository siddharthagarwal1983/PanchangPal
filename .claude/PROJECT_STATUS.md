# PROJECT_STATUS.md

# PanchangPal — Project Status Dashboard

Version: 1.4.0

Last Updated: 2026-07-22 (ADR-026 date defect fixed; E2E gate found dark since 2026-07-19)

Purpose:
This document provides a high-level snapshot of the overall project.

It should answer:

- Where is the project today?
- What has been completed?
- What is currently being worked on?
- What comes next?

This is **not** a session log.

For day-to-day work see:

- SESSION.md
- TASK.md

Canonical progress metric: the **Beta Readiness & Platform Hardening** milestone percentage,
shared verbatim with DASHBOARD.md and CURRENT_MILESTONE.md. If these three disagree, DASHBOARD.md
is authoritative and the others must be reconciled to it.

---

# Overall Status

Current Phase

🚧 Beta Readiness & Platform Hardening (TDD Part 5)

Overall Progress

░░░░░░░░░░░░░░░░░░░░

**Mobile MVP — Phase 1: ✅ 100% (all 8 slices, merged)** · **Beta Readiness & Platform Hardening: 🚧 0% (0 of 8 slices)**

Project Health

🟢 On Track

Target MVP

Beta

Target Release

TBD

---

# Phase Progress

| Phase | Status | Progress |
|---------|---------|---------:|
| Idea Validation | ✅ Complete | 100% |
| Market Research | ✅ Complete | 100% |
| MRD | ✅ Complete | 100% |
| PRD | ✅ Complete | 100% |
| Product Design (PDD) | ✅ Complete | 100% |
| Technical Design (TDD) | ✅ Complete | 100% |
| AI Knowledge Base | ✅ Complete | 100% |
| Repository Foundation | ✅ Complete | 100% |
| ADR Repository | ✅ Complete | 100% |
| API Specification | ✅ Complete | 100% |
| Database Design | ✅ Complete | 100% |
| Backend Foundation (SVC_*) | ✅ Complete | 100% (panchang compute blocked by ADR-033) |
| Mobile Development (feature slices) | ✅ Complete | 100% (M1–M8 done) |
| AI Platform | 🟡 In Progress | Adapters + RAG pipeline done; corpus + eval pending |
| Testing | 🟡 In Progress | 190 unit/component/domain green in CI (176 mobile + 14 shared); 3 Maestro FLOW_* authored, but the E2E gate produced no signal 2026-07-19 → 2026-07-22 (build outgrew its timeout; cancelled runs hid it — PR #32) |
| Beta | ⏳ Pending | 0% |
| Production Launch | ⏳ Pending | 0% |

---

# Current Milestone

Beta Readiness & Platform Hardening (TDD Part 5)

Objective

Take the feature-complete Mobile MVP (M1–M8) to a shippable beta — environments, E2E,
builds/distribution, observability, DR, security/privacy, release mechanics, go/no-go. No new
product scope. Sliced B1–B8; see CURRENT_MILESTONE.md.

Current Focus

- M7 Notifications — ✅ complete (reviewed/approved 2026-07-18).
- M8 Subscription — ✅ complete (3 increments):
  - Increment 1 (household-grain entitlement read + gating) — ✅ complete, approved.
  - Increment 2 (SCR_SUBSCRIPTION_001 + plans/purchase/restore + affordance wiring) — ✅ complete, merged as PR #4.
  - Increment 3 (contextual paywall sheet + panchangpal://subscription routing + FF_FAMILY_PLAN) — ✅ complete, merged as PR #7.

Completed slices: M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru ·
M6 Profile/Household · M7 Notifications.

- **Session of 2026-07-22** — issue #30: every date in the daily loop was computed in **UTC** and
  stored as the user's local date. In New Zealand and Australia that recorded the morning ritual
  against **yesterday for the entire local morning** — two of the three primary launch markets.
  Fixed across four increments (PR #31): the tz-aware utility ADR-026 always mandated, adoption of
  the device zone into `user_profile.timezone` (which nothing had ever written), `useLocalDate` in
  the screens, and an ESLint guard proven to fail on the reintroduced expression. Separately, the
  E2E gate was found to have produced **no signal since 2026-07-19** — `expo-updates` pushed the
  Android build past its timeout and cancelled runs hid it (PR #32). iOS verified running in Expo
  Go. **Session persistence remains unverified.**
- **Beta Readiness build-out (2026-07-18/19)** — ✅ merged, 14 PRs. The MVP had never been
  executed anywhere; 12 defects fixed. Platform re-baselined to Expo SDK 54 / RN 0.81 / React 19
  and verified natively (3 Android APKs). CI now compiles the app every PR; CD migrates, seeds and
  deploys for real; dev + staging both provisioned and seeded; releases build unattended from a
  `v*` tag; two Maestro E2E flows green in CI. B1 ~85%, B2 ~75% (revised down 2026-07-22), B3 ~80% — none
  complete, every remainder gated on money, a store account, or a later slice. See CURRENT_MILESTONE.md.

See:

.claude/CURRENT_MILESTONE.md

---

# Documentation Status

| Document | Status |
|-----------|---------|
| MRD | ✅ Approved |
| PRD | ✅ Approved |
| PDD | ✅ Approved |
| TDD | ✅ Approved |
| AI Knowledge Base | ✅ Complete |
| ADR Repository | ✅ Complete |
| OpenAPI Specification | ✅ Complete |
| Database Documentation | ✅ Complete |
| Runbooks | 🟢 DevOps docs added (SETUP.md + docs/devops/*); operational runbooks partial |

---

# Architecture Status

| Area | Status |
|--------|---------|
| Mobile Architecture | ✅ Complete |
| Backend Architecture | ✅ Complete |
| AI Architecture | ✅ Complete |
| Platform Architecture | ✅ Complete |
| Security Architecture | ✅ Complete |
| Release Architecture | ✅ Complete |

Implementation: Mobile MVP Phase 1 is feature-complete (M1–M8).

---

# Repository Status

| Area | Status |
|--------|---------|
| Repository Structure | ✅ Complete |
| Shared Packages | ✅ Scaffolded |
| Expo App | ✅ App shell + all M1–M8 slices |
| Supabase Project | ⏳ Pending (migrations defined; not yet applied to a live project) |
| GitHub Actions | ✅ Complete |
| CI/CD | ✅ Defined |

---

# Backend Status

| Area | Status |
|--------|---------|
| Authentication | ✅ AuthRepository + anon-first/OAuth/OTP (backend + shell) |
| Database | ✅ Schema + RLS + repositories (migrations not yet applied live) |
| Edge Functions | 🟢 7 SVC_* wired (panchang compute blocked by ADR-033); SVC_household / SVC_notify_scheduler / SVC_revenuecat_webhook pending (client contracts coded) |
| APIs | ✅ OpenAPI (65 operations) + SVC_* handlers |
| RLS Policies | ✅ Defined across 29 tables |
| AI Provider | ✅ OpenAI adapters + RAG pipeline + rate limit/cost |
| Analytics Adapter | ⏳ Pending |
| Payment Adapter | ✅ Webhook + BillingRepository (F-4) — webhook Edge Function pending |

---

# Mobile Status

| Area | Status |
|--------|---------|
| Expo Setup | ✅ App shell |
| Navigation | ✅ Shell (splash/auth/4-tab/guards/deep links) |
| Design System | ✅ Tokens + shell/feature components (extends per slice) |
| Components | 🟢 CMP_* for M1–M8 (Subscription: PLAN_CARD/VALUE_LIST/LEGAL_FOOTNOTE; BOTTOM_SHEET added Inc 3) |
| Authentication Flow | ✅ Anon-first + OAuth/OTP (shell) |
| Today (MOD_today) | ✅ SCR_HOME_001 (panchang unavailable per ADR-033) |
| Ritual Experience | ✅ Guided player (session engine, offline restore, text-first audio seam) |
| Calendar Experience | 🟡 Month shell (grid/navigation; spiritual markers blocked by ADR-033) |
| Ask Guru | 🟢 Client complete (live answers gated, GURU_LIVE=false) |
| Settings / Preferences | ✅ SCR_SETTINGS_001 (server-authoritative prefs; optimistic + offline) |
| Profile | ✅ SCR_PROFILE_001 (account state, deferred-auth prompt, entries) |
| Household | ✅ SCR_HOUSEHOLD_001 + SCR_HOUSEHOLD_INVITE_001 (members/roles/depth, invites, realtime) |
| Account deletion | ✅ SCR_DELETE_ACCOUNT_001 (F-3 transfer gate + grace window) |
| Notifications | ✅ Opt-in priming, per-channel prefs, token registration (NotificationAdapter seam), deep-link routing; sunrise/tithi content gated by ADR-033 |
| Subscription | ✅ Complete (entitlement read + usePremiumGate + PaymentAdapter/Null; SCR_SUBSCRIPTION_001 + plans/purchase/restore; contextual paywall sheet at app/modal/paywall; panchangpal://subscription routing; FF_FAMILY_PLAN offering gate) |

---

# AI Platform Status

| Area | Status |
|--------|---------|
| RAG Pipeline | ✅ Implemented (retrieval + pgvector RPC) |
| Prompt Registry | 🟡 In Progress |
| Model Registry | 🟡 In Progress |
| Embeddings | ✅ pgvector migration + retrieval RPC |
| Content Corpus (reviewed) | ⏳ Pending — gates live Ask Guru |
| Evaluation Suite | ⏳ Pending — gates live Ask Guru |

---

# DevOps Status

| Area | Status |
|--------|---------|
| GitHub Actions | ✅ Complete + hardened (least-privilege, retries, preflight gates, summaries; YAML-validated) |
| Linting | ✅ ESLint + Prettier configured |
| Testing Pipeline | 🟢 Vitest + pgTAP suites; CI db-tests now installs psql + pg_prove (first live run pending) |
| Build Pipeline | ✅ Turborepo defined |
| OTA Strategy | ✅ Defined |
| Release Automation | 🟡 Defined + preflight validator (scripts/preflight.sh); deploy steps scaffolded until EAS/projects provisioned |

---

# Testing Status

| Area | Status |
|--------|---------|
| Unit Tests | 🟢 In place (12+ Vitest suites) |
| Integration Tests | 🟢 pgTAP integration suite |
| Component Tests | 🟢 In place for delivered slices |
| Accessibility Tests | 🟢 a11y assertions in slice tests |
| AI Evaluation | ⏳ Pending |
| E2E Tests | 🟡 3 FLOW_* authored (RETURNING, MORNING_RITUAL, SESSION_PERSISTENCE); gate dark 07-19 → 07-22, fixes in PR #32; SESSION_PERSISTENCE has never executed |

---

# Top Priorities

Priority 1

Land PR #31 (issue #30 — dates computed in UTC rather than the user's zone) and PR #32 (E2E gate
fixes), then re-run E2E and finally answer whether a ritual session survives a restart

Priority 2

⛔ Ratify ADR-033 (Canonical Panchang Engine) — unblocks Today panchang, Calendar markers, notifications

Priority 3

AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)

Priority 4

Backend Edge Functions — SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook (client contracts already coded)

Priority 5

Apply migrations to a live Supabase project + integration run

Priority 6

E2E (Maestro FLOW_*) + first live CI run

---

# Known Blockers

⛔ **Canonical Panchang Computation Engine** (ADR-033, Proposed)
- Issue: the deterministic astronomical algorithm (ephemeris, ayanamsa, per-tradition conventions, sunrise/tithi/muhurta) is not specified in any MRD/PRD/PDD/TDD and must not be guessed (a wrong tithi breaks trust, MRD Risk §1).
- Impact: SVC_panchang compute (Today/calendar/detail) and sunrise/tithi-timed notifications are blocked. Everything else is done. The whole system depends only on the abstract PanchangEngine/PanchangProvider interfaces, so no rework when it lands.
- Owner: Architecture + Product (+ pandit reviewer).
- Expected Resolution: ratify ADR-033 Part B (ephemeris/ayanamsa/traditions/methodology/validation dataset/tolerances) → implement a concrete engine → pass golden dataset. See docs/architecture/canonical-panchang-engine/.

🔒 **Ask Guru live answers gated** (GURU_LIVE = false)
- The Ask Guru client is complete but streams live answers only once a reviewed content corpus and evaluation readiness are in place (TDD Part 3 §9/§10B). Until then it honestly declines. Flipping the flag goes live.

ℹ️ **Deferred vendor dependencies** — `expo-notifications` (M7) and `react-native-purchases` (M8) are
not yet installed (offline sandbox can't regenerate the lockfile). Their adapters ship as pure ports +
Null implementations (NullNotificationAdapter / NullPaymentAdapter); the concrete adapters are one-line
swaps in the composition roots once the deps + keys land on the Mac. Entitlement READS and notification
prefs work today, so gating and prefs are real before the SDKs are wired.

---

# Next Major Deliverables

- Beta Readiness B1 (environments + fail-closed preflight), then B2 (replace the Maestro E2E placeholder with real FLOW_* specs)
- Reviewed AI content corpus + evaluation harness (unblocks live Ask Guru)
- Backend Edge Functions — SVC_household, SVC_notify_scheduler, SVC_revenuecat_webhook
- Initial Supabase Project (apply migrations) + integration run
- E2E automation (Maestro FLOW_*) + first live CI run

---

# Recently Completed

- Market Research
- MRD
- PRD
- Product Design Document
- Technical Design Document
- AI Knowledge Base
- Repository Organization
- ADR Repository (33 ADRs + template + governance guide)
- OpenAPI Specification (65 operations, docs/api/)
- Database Schema & Migrations (29 tables + RLS, apps/backend/migrations/ + docs/database/)
- Monorepo scaffold (pnpm + Turborepo; packages/api,shared,database,ui,design-tokens,ai; apps/mobile,backend)
- Expo app shell (4-tab router, providers, Zustand stores, theme, i18n) + GitHub Actions CI/CD (ci/cd/ota, CODEOWNERS, scripts)
- Backend Foundation: 7 SVC_* Edge Functions wired; OpenAI adapters + RAG pipeline; DB repositories + 2 pgvector/AI migrations; Ask Guru rate limit + cost circuit-breaker; Vitest suites + pgTAP integration suite; ADR-033 + panchang-engine work item
- Mobile Milestone 1 (Application Shell): PDD §6 design tokens; 11 CMP_* shell components (a11y-first); anon-first + OAuth/OTP auth (AuthRepository + STORE_session); splash/onboarding/4-tab navigation + guards + deep links + error boundary; i18n; 3 test suites
- Mobile Milestone 2 (Today / MOD_today): 9 Today CMP_*; client PanchangProvider abstraction + ProductionPanchangProvider + dev-only MockPanchangProvider; useToday/useChecklist/useCompleteRitual hooks (optimistic + offline queue); StreakService/RitualProgressService; SCR_HOME_001 composed (panchang unavailable per ADR-033); 2 test suites
- Mobile Milestone 3 (Guided Ritual Player / SCR_RITUAL_001): reusable RitualSession + RitualEngine; MMKV ritual-session repository; RitualRepository/query hook; NullAudioAdapter text-first seam; accessible completion state; 5 ritual CMP_* + domain/repository/UI tests
- Mobile Milestone 4 (Calendar Shell / SCR_CALENDAR_001): reusable Gregorian month layout, CalendarProvider/repository/query seam, accessible month navigation/grid/day cells + tradition switcher. Festival/vrat/panchang markers explicitly unavailable until ADR-033 is ratified
- Mobile Milestone 5 (Ask Guru Client / SCR_GURU_HOME/CHAT/HISTORY_001): trust-first home, streamed conversation, source/decline/error/offline states, cached history via a readiness-gated SSE transport. Client calls only the server API/SSE adapter — never an LLM directly and never fabricates. Live answers stay gated (GURU_LIVE=false) until corpus/eval readiness; component/domain/UI + a11y tests
- Mobile Milestone 6 (Profile/Household / MOD_you): server-authoritative preferences (owner-RLS, optimistic + offline queue); SCR_SETTINGS_001 / SCR_PROFILE_001; household domain + householdRepository (RLS read + SVC_household writes + Realtime member seam); useHousehold/useInvite; CMP_MEMBER_ROW/ROLE_PICKER/SHARE_BUTTON/INVITE_*; SCR_HOUSEHOLD_001 + SCR_HOUSEHOLD_INVITE_001; account deletion (F-3 gate + grace window, SCR_DELETE_ACCOUNT_001); domain/repository tests
- DevOps Platform Audit & Hardening (interlude, 2026-07-12): canonical env inventory (14 vars), secrets matrix, 6 .env.*.example templates, scripts/preflight.sh + bootstrap.sh, behavior-preserving workflow hardening (ci/cd/ota), docs/SETUP.md + docs/devops/*, DEVOPS_AUDIT_REPORT.md. No product/architecture/deploy-behavior changes
- **Mobile Milestone 7 (Notifications / MOD_notifications, 2026-07-18):** opt-in priming, per-channel server-authoritative prefs (user_profile.notif_prefs JSON), push-token registration behind the NotificationAdapter seam (NullNotificationAdapter until expo-notifications lands), notification-tap deep-link routing (incl. panchangpal://invite/{token}). Scheduling is always server-side (SVC_notify_scheduler); the client only registers token + prefs. Sunrise/tithi content gated by ADR-033. Reviewed/approved
- **Mobile Milestone 8 — Increment 3 (contextual paywall + routing + FF_FAMILY_PLAN, 2026-07-18):** CMP_BOTTOM_SHEET implemented to PDD §5.12 (specified since the component library but never built; four components already declared it a dependency) — SR-modal with focus trap, required-decision variant, Reduced-Motion fade-in-place. Contextual paywall composed of CMP_BOTTOM_SHEET + CMP_PLAN_CARD (no new CMP_*) as the `app/modal/paywall` route per TDD §3.1, reached by navigation intent so MOD_guru never imports MOD_you (§2.2 forbids cross-feature imports); Settings deep-dive + Ask Guru upsells now open it, replacing both inline cards. `panchangpal://subscription` → SCR_SUBSCRIPTION_001 in the linking table and in notification tap routing (both previously fell back to the You hub). FF_FAMILY_PLAN offering gate via a NEW fail-closed feature-flag read seam (featureFlagRepository + HOOK_useFeatureFlag, ADR-021 — nothing had ever read the `feature_flag` table), applied through the pure `visibleOfferings`. tsc + eslint clean; 153 tests green (mobile 120 / ui 33). Merged to main as PR #7
- **Mobile Milestone 8 — Increment 2 (SCR_SUBSCRIPTION_001 + affordance wiring, 2026-07-18):** 3 new CMP_* (PLAN_CARD as accessible radio with text-not-color best-value; VALUE_LIST with SR text equivalents; LEGAL_FOOTNOTE at min-AA); SCR_SUBSCRIPTION_001 with all states (default/skeleton/empty/offline/error/success + already-premium) + You-hub entry + route registration; usePlans/usePurchase/useRestore via the PaymentAdapter seam (no device receipt logic; entitlement never granted client-side — success only invalidates the entitlement query); usePremiumGate wired at deep-dive (Settings depth) + extended Ask Guru (contextual, dismissible). Component + hook tests; tsc-clean. Approved; merged as PR #4
- **Mobile Milestone 8 — Increment 1 (Subscription entitlement read + gating, 2026-07-18):** household-grain (F-4) entitlement READ via supabase-js RLS + realtime seam; pure mapping/rules (strict is_active; isEntitled/hasFamily/activeKind); PremiumCapability registry (deep_dive_content, extended_ask_guru) + usePremiumGate (fails open while loading; daily loop never gated); PaymentAdapter port + NullPaymentAdapter (never fabricates a purchase). Entitlement is READ-ONLY on device — the entitlement table denies all client writes (migration 20260712000060); the RevenueCat webhook is the sole writer. Domain + repository tests. Approved

Do not duplicate SESSION.md.

Only major milestones belong here.

---

# Success Metrics

Current Goal

Complete the Beta Readiness & Platform Hardening slices (B1–B8) and ship a real beta build.

Entry criteria for this milestone — status as of 2026-07-18:

- ✅ All eight mobile slices (M1–M8) implemented, reviewed, and merged.
- ✅ Every screen composes approved CMP_* with tokens-only styling and localized strings.
- ✅ Unit/component/domain tests pass in CI (153 tests; live CI runs green).
- ✅ A live staging Supabase project is provisioned and migrations applied via CD.
- ⛔ ADR-033 ratification and Ask Guru corpus/eval readiness remain outstanding — they gate a
  panchang-inclusive *launch*, not the beta-readiness work itself.

The project is considered ready for **Phased Production Release** when the §10.1 go/no-go
checklist is satisfied: all CD jobs do real work (no placeholders), FLOW_* E2E green on staging,
observability + alerting live, a DR restore drill performed, OWASP Mobile review clean, and store
compliance complete.

---

# Claude Update Rules

Update this document when:

- A project phase changes.
- A milestone **or increment** completes (see the Increment & Milestone Completion Checkpoint in
  CLAUDE.md — this file is updated at each increment boundary, not only at End Session).
- Overall progress changes significantly.
- Major deliverables are completed.

Do NOT update this file for:

- Daily work
- Small commits
- Bug fixes
- Temporary tasks

Those belong in SESSION.md.

---

# Project Roadmap

✅ Documentation → ✅ Repository Foundation → ✅ Backend Foundation → ✅ Design System →
✅ Authentication → ✅ Today's Panchang (shell; compute blocked by ADR-033) → ✅ Ritual Experience →
✅ Calendar Shell → ✅ Ask Guru AI (client; live answers gated) → ✅ Profile / Household →
✅ Notifications → ✅ Payments (M8 complete) → 🚧 Beta Readiness (B1–B8) → Beta → Production

---

# Executive Summary

The PanchangPal project has completed the product definition and architecture phases, the
repository and platform foundation, and the backend SVC_* services.

The Mobile MVP Phase 1 feature-slice milestone is **complete (100%)** and merged to main. All eight
slices — App Shell, Today, Guided Ritual, Calendar Shell, Ask Guru Client, Profile/Household,
Notifications, and Subscription (M1–M8) — are implemented, tsc/eslint clean, and green in CI.

The project is now in **Beta Readiness & Platform Hardening** (TDD Part 5), sliced B1–B8. The
milestone opens on a known gap: CD reports green while its Maestro E2E and EAS build jobs are
placeholders, and `preflight.sh` cannot fail a deploy on a missing secret. Staging migrations and
Edge Function deploys are real. B1 and B2 close that gap first.
The only architectural blocker is the Canonical Panchang Engine decision (ADR-033); Ask Guru live
answers are intentionally gated until corpus/eval readiness.

The project remains on track and architecture is considered stable.
