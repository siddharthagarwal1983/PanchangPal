# PROJECT_STATUS.md

# PanchangPal — Project Status Dashboard

Version: 1.1.3

Last Updated: 2026-07-13 (M6 Profile/Household complete)

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

---

# Overall Status

Current Phase

🚧 Mobile MVP — Phase 1 (Feature Slices)

Overall Progress

██████████████████░░

**88% Complete**

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
| Mobile Development (feature slices) | 🚧 In Progress | ~75% (M1–M6 done; M7–M8 remain) |
| AI Platform | 🟡 In Progress | Adapters + RAG pipeline done; corpus + eval pending |
| Testing | 🟡 In Progress | Unit/component/domain in place; E2E pending |
| Beta | ⏳ Pending | 0% |
| Production Launch | ⏳ Pending | 0% |

---

# Current Milestone

Mobile MVP — Phase 1 (Feature Slices)

Objective

Build the mobile application as a sequence of vertical, production-quality feature slices
(M1–M8) on top of the completed foundation and backend.

Current Focus

- M6 Profile / Household — ✅ complete (Increment 1 Preferences/Settings/Profile; Increment 2
  Household members/roles/invites/realtime; Increment 3 Account deletion). Awaiting review.
- M7 Notifications (next)
- M8 Subscription (pending)

Completed slices: M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru · M6 Profile/Household.

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

Implementation is underway (Mobile MVP Phase 1; M1–M5 complete).

---

# Repository Status

| Area | Status |
|--------|---------|
| Repository Structure | ✅ Complete |
| Shared Packages | ✅ Scaffolded |
| Expo App | ✅ App shell + M1–M5 slices |
| Supabase Project | ⏳ Pending (migrations defined; not yet applied to a live project) |
| GitHub Actions | ✅ Complete |
| CI/CD | ✅ Defined |

---

# Backend Status

| Area | Status |
|--------|---------|
| Authentication | ✅ AuthRepository + anon-first/OAuth/OTP (backend + shell) |
| Database | ✅ Schema + RLS + repositories (migrations not yet applied live) |
| Edge Functions | 🟢 7 SVC_* wired (panchang compute blocked by ADR-033) |
| APIs | ✅ OpenAPI (65 operations) + SVC_* handlers |
| RLS Policies | ✅ Defined across 29 tables |
| AI Provider | ✅ OpenAI adapters + RAG pipeline + rate limit/cost |
| Analytics Adapter | ⏳ Pending |
| Payment Adapter | ✅ Webhook + BillingRepository (F-4) |

---

# Mobile Status

| Area | Status |
|--------|---------|
| Expo Setup | ✅ App shell |
| Navigation | ✅ Shell (splash/auth/4-tab/guards/deep links) |
| Design System | ✅ Tokens + shell/feature components (extends per slice) |
| Components | 🟢 CMP_* for M1–M6 (+ Member/RolePicker/Share/Invite/Consequences/DestructiveAction); Notifications/Subscription pending |
| Authentication Flow | ✅ Anon-first + OAuth/OTP (shell) |
| Today (MOD_today) | ✅ SCR_HOME_001 (panchang unavailable per ADR-033) |
| Ritual Experience | ✅ Guided player (session engine, offline restore, text-first audio seam) |
| Calendar Experience | 🟡 Month shell (grid/navigation; spiritual markers blocked by ADR-033) |
| Ask Guru | 🟢 Client complete (live answers gated, GURU_LIVE=false) |
| Settings / Preferences | ✅ SCR_SETTINGS_001 (server-authoritative prefs; optimistic + offline) |
| Profile | ✅ SCR_PROFILE_001 (account state, deferred-auth prompt, entries) |
| Household | ✅ SCR_HOUSEHOLD_001 + SCR_HOUSEHOLD_INVITE_001 (members/roles/depth, invites, realtime) |
| Account deletion | ✅ SCR_DELETE_ACCOUNT_001 (F-3 transfer gate + grace window) |
| Notifications | ⏳ Pending (M7) |
| Subscription | ⏳ Pending (M8) |

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
| Unit Tests | 🟢 In place (10+ Vitest suites) |
| Integration Tests | 🟢 pgTAP integration suite |
| Component Tests | 🟢 In place for delivered slices |
| Accessibility Tests | 🟢 a11y assertions in slice tests |
| AI Evaluation | ⏳ Pending |
| E2E Tests | ⏳ Pending (Maestro FLOW_*) |

---

# Top Priorities

Priority 1

Mobile Milestone 7 — Notifications

Priority 2

Mobile Milestone 8 — Subscription

Priority 3

Backend SVC_household Edge Function (member/invite endpoints; client contract coded in M6)

Priority 4

⛔ Ratify ADR-033 (Canonical Panchang Engine) — unblocks Today panchang, Calendar markers, notifications

Priority 5

AI corpus ingestion + eval readiness — unblocks live Ask Guru (GURU_LIVE)

Priority 6

Apply migrations to a live Supabase project + integration run

---

# Known Blockers

⛔ **Canonical Panchang Computation Engine** (ADR-033, Proposed)
- Issue: the deterministic astronomical algorithm (ephemeris, ayanamsa, per-tradition conventions, sunrise/tithi/muhurta) is not specified in any MRD/PRD/PDD/TDD and must not be guessed (a wrong tithi breaks trust, MRD Risk §1).
- Impact: SVC_panchang compute (Today/calendar/detail) and sunrise/tithi-timed notifications are blocked. Everything else in Backend Foundation is done. The whole backend depends only on the abstract PanchangEngine interface, so no rework when it lands.
- Owner: Architecture + Product (+ pandit reviewer).
- Expected Resolution: ratify ADR-033 Part B (ephemeris/ayanamsa/traditions/methodology/validation dataset/tolerances) → implement a concrete engine → pass golden dataset. See docs/architecture/canonical-panchang-engine/.

🔒 **Ask Guru live answers gated** (GURU_LIVE = false)
- The Ask Guru client is complete but streams live answers only once a reviewed content corpus and evaluation readiness are in place (TDD Part 3 §9/§10B). Until then it honestly declines. Flipping the flag goes live.

---

# Next Major Deliverables

- Mobile feature slices M6–M8 (Profile/Household, Notifications, Subscription)
- Reviewed AI content corpus + evaluation harness (unblocks live Ask Guru)
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
- ADR Repository (32 ADRs + template + governance guide)
- OpenAPI Specification (65 operations, docs/api/)
- Database Schema & Migrations (29 tables + RLS, apps/backend/migrations/ + docs/database/)
- Monorepo scaffold (pnpm + Turborepo; packages/api,shared,database,ui,design-tokens,ai; apps/mobile,backend)
- Expo app shell (4-tab router, providers, Zustand stores, theme, i18n) + GitHub Actions CI/CD (ci/cd/ota, CODEOWNERS, scripts)
- Backend Foundation: 7 SVC_* Edge Functions wired; OpenAI adapters + RAG pipeline; DB repositories + 2 pgvector/AI migrations; Ask Guru rate limit + cost circuit-breaker; 10 Vitest suites + pgTAP integration suite; ADR-033 + panchang-engine work item
- Mobile Milestone 1 (Application Shell): PDD §6 design tokens; 11 CMP_* shell components (a11y-first); anon-first + OAuth/OTP auth (AuthRepository + STORE_session); splash/onboarding/4-tab navigation + guards + deep links + error boundary; i18n; 3 test suites
- Mobile Milestone 2 (Today / MOD_today): 9 Today CMP_* (panchang/ritual/streak/checklist/rotating/festival cards + primary button/location chip/card); client PanchangProvider abstraction + ProductionPanchangProvider + dev-only MockPanchangProvider; useToday/useChecklist/useCompleteRitual hooks (optimistic + offline queue); StreakService/RitualProgressService; SCR_HOME_001 composed (panchang shows unavailable per ADR-033); 2 test suites
- Mobile Milestone 3 (Guided Ritual Player / SCR_RITUAL_001): reusable RitualSession +
  RitualEngine; MMKV ritual-session repository; RitualRepository/query hook; NullAudioAdapter
  text-first seam; dedicated accessible completion state; 5 ritual CMP_* and domain/repository/UI
  tests. Playback is intentionally deferred to a separately approved AudioAdapter.
- Mobile Milestone 4 (Calendar Shell / SCR_CALENDAR_001): reusable Gregorian month layout,
  CalendarProvider/repository/query seam, accessible month navigation/grid/day cells and
  tradition switcher. Festival, vrat, and panchang markers remain explicitly unavailable until
  ADR-033 is ratified.
- Mobile Milestone 5 (Ask Guru Client / SCR_GURU_HOME/CHAT/HISTORY_001): trust-first home,
  streamed conversation, source/decline/error/offline states, and cached history via a
  readiness-gated SSE transport. The client calls only the server API/SSE adapter — never an LLM
  directly and never fabricates. Live answers stay gated (GURU_LIVE=false) until corpus/eval
  readiness; component/domain/UI + a11y tests included.
- Mobile Milestone 6 — Increment 1 (Profile/Household / MOD_you): server-authoritative
  preferences (profileRepository owner-RLS + usePreferences/useUpdatePreferences: optimistic,
  STORE_prefs mirror, offline queue); SCR_SETTINGS_001 (appearance/tradition/depth/sign-out) and
  SCR_PROFILE_001 (account state, deferred-auth prompt, Settings/Household entries); new settings
  CMP_* (Segmented/Toggle/SettingsRow); Household shell (no dead end); mapping + repository tests.
  (Increments 2 and 3 below complete the slice.)
- Mobile Milestone 6 — Increment 2 (Household): household/member domain (pure, safe fallbacks);
  householdRepository (RLS read + SVC_household writes via OpenAPI paths + Realtime member seam);
  HOOK_useHousehold/useInvite (optimistic, auth-gated, idempotent); CMP_MEMBER_ROW/ROLE_PICKER/
  SHARE_BUTTON/INVITE_*; SCR_HOUSEHOLD_001 recomposed + SCR_HOUSEHOLD_INVITE_001; domain/repo tests.
- Mobile Milestone 6 — Increment 3 (Account deletion): account domain (F-3 gate mirroring
  SVC_account); accountRepository (reauth/delete/transfer); useAccountDeletion (reauth→request→anon);
  CMP_CONSEQUENCES_PANEL/DESTRUCTIVE_ACTION; SCR_DELETE_ACCOUNT_001 + Settings entry; tests. Deletion
  is a reversible grace-window request; server stays authoritative.
- DevOps Platform Audit & Hardening (interlude, 2026-07-12): canonical env inventory (14 vars),
  secrets matrix, 6 .env.*.example templates, scripts/preflight.sh + bootstrap.sh, behavior-
  preserving workflow hardening (ci/cd/ota), docs/SETUP.md + docs/devops/*, DEVOPS_AUDIT_REPORT.md;
  fixed .gitignore ignoring env templates. No product/architecture/deploy-behavior changes.

Do not duplicate SESSION.md.

Only major milestones belong here.

---

# Success Metrics

Current Goal

Complete the Mobile MVP Phase 1 feature slices (M6–M8) and reach Beta Readiness.

The project is considered ready for Beta Readiness & Platform Hardening when:

- All eight mobile slices (M1–M8) are implemented and reviewed.
- Every screen composes approved CMP_* with tokens-only styling and localized strings.
- Unit/component/domain tests pass in CI (first live CI run completed).
- A live Supabase project is provisioned and migrations applied.
- ADR-033 is ratified and Ask Guru corpus/eval readiness is met for a panchang-inclusive launch.

---

# Claude Update Rules

Update this document only when:

- A project phase changes.
- A milestone completes.
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

✅ Documentation

↓

✅ Repository Foundation

↓

✅ Backend Foundation

↓

✅ Design System

↓

✅ Authentication

↓

✅ Today's Panchang (shell; compute blocked by ADR-033)

↓

✅ Ritual Experience

↓

✅ Calendar Shell

↓

✅ Ask Guru AI (client; live answers gated)

↓

🚧 Household

↓

Notifications

↓

Payments

↓

Testing

↓

Beta

↓

Production

---

# Executive Summary

The PanchangPal project has completed the product definition and architecture phases, the
repository and platform foundation, and the backend SVC_* services.

The current focus is the Mobile MVP Phase 1 feature-slice milestone: App Shell, Today, Guided
Ritual, Calendar Shell, and Ask Guru Client (M1–M5) plus
Profile/Household (M6) are complete; Notifications and Subscription (M7–M8) remain. The only architectural blocker is the Canonical
Panchang Engine decision (ADR-033); Ask Guru live answers are intentionally gated until
corpus/eval readiness.

The project remains on track and architecture is considered stable.
