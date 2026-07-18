# PROJECT_MEMORY.md

# PanchangPal — Project Memory

Version: 1.5.0

Last Updated: 2026-07-18 (Mobile MVP Phase 1 feature-complete — M1–M8)

Current Phase:
Beta Readiness & Platform Hardening (TDD Part 5)

Status:
Foundation + Backend complete; Mobile MVP Phase 1 feature-complete (M1–M8). Next: Beta Readiness & Platform Hardening (TDD Part 5)

Purpose:
This file is the permanent memory of the PanchangPal project.

It contains only stable project knowledge that should persist across Claude sessions.

It is NOT a session log.

For day-to-day work see:

- SESSION.md
- TASK.md

---

# Project Overview

PanchangPal is an AI-assisted Hindu spiritual companion designed primarily for Indians living abroad.

The product helps users build a consistent daily spiritual practice through:

- Panchang
- Daily rituals
- Festival guidance
- AI-assisted spiritual questions
- Household participation
- Personal reminders

The product emphasizes calmness, trust, authenticity, and accessibility over engagement metrics.

---

# Mission

Help Indians living abroad stay spiritually connected to their traditions through trustworthy, modern, AI-assisted experiences.

---

# Product Principles

Every feature should reinforce:

- Trust
- Simplicity
- Calmness
- Daily usefulness
- Accessibility
- Privacy
- Cultural authenticity
- Long-term maintainability

Never optimize for:

- Endless scrolling
- Addictive engagement
- Social competition
- Artificial gamification
- Notification spam

---

# Target Users

Primary Users

- Indians living abroad

Primary Launch Markets

- United States
- Australia
- New Zealand

Secondary Expansion

- Canada
- United Kingdom
- Europe

---

# Current Documentation Status

Completed

✓ Market Requirements Document (MRD)

✓ Product Requirements Document (PRD)

✓ Product Design Document (PDD)

✓ Technical Design Document (TDD)

✓ AI Knowledge Base

Implementation is underway: Repository & Platform Foundation and Backend Foundation (SVC_* Edge Functions) are complete; the mobile app is being built as feature slices (App Shell, Today, Guided Ritual, Calendar Shell, Ask Guru, Profile/Household, Notifications done; Subscription in progress). Live progress lives in DASHBOARD.md / CURRENT_MILESTONE.md / SESSION.md — not here.

---

# Repository Structure

```
PanchangPal/

.claude/

docs/

apps/

packages/

supabase/

.github/
```

Documentation resides under:

```
docs/
```

AI operational memory resides under:

```
.claude/
```

Internal tooling resides under:

```
scripts/
```

`scripts/command-center/` is a repo-generated engineering dashboard (parses the .claude/ docs plus
source into command-center.json; served by serve.mjs). It is an observability/build tool, not part
of the product runtime.

---

# Documentation Hierarchy

Always follow this order.

Session Context

1. PROJECT_MEMORY.md
2. SESSION.md
3. TASK.md
4. ARCHITECTURE_SUMMARY.md

Project Documentation

5. MRD
6. PRD
7. PDD
8. TDD
9. ADRs

Implementation

10. Source Code

---

# Technology Stack

## Mobile

- React Native
- Expo
- Expo Router
- TypeScript

## State Management

- Zustand
- TanStack Query

## Backend

- Supabase
- PostgreSQL
- Edge Functions

## AI

- OpenAI GPT-5 mini
- RAG
- pgvector
- Streaming

## Payments

- RevenueCat

## Notifications

- Expo Notifications

## Monitoring

- Sentry

---

# High-Level Architecture

The application follows a layered architecture.

Presentation

↓

Application

↓

Domain

↓

Infrastructure

↓

External Providers

Business logic resides on the backend.

The mobile application is primarily responsible for presentation, local state, and offline capabilities.

---

# Permanent Architecture Decisions

The following principles are considered stable.

- Mobile-first
- Offline-first
- Thin client
- Server-authoritative state
- Provider Adapter pattern
- Accessibility-first
- Privacy-first
- Security-first
- Documentation-first development
- Managed services first

These principles should not change without an approved ADR.

---

# AI Principles

The AI is an assistant.

Never an authority.

Every AI response must be:

- Grounded
- Honest
- Source-backed
- Transparent

Retrieval is mandatory before generation.

If retrieval confidence is insufficient:

Politely decline.

Never hallucinate.

Never expose:

- prompts
- embeddings
- internal reasoning
- chain of thought

---

# Current Architecture

Presentation

↓

Application Layer

↓

Services

↓

Provider Adapters

↓

Supabase

↓

OpenAI

↓

RevenueCat

All third-party integrations are accessed through adapters.

---

# Current Development Phase

Foundation and backend are built; the current phase is the **Mobile MVP (Phase 1)** feature-slice
milestone.

Completed:
1. Repository scaffolding · ADR repository · OpenAPI spec · Database schema + migrations
2. Backend Foundation — all SVC_* Edge Functions, provider adapters, DB repositories
3. Mobile slices: M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru ·
   M6 Profile/Household · M7 Notifications
4. M8 Subscription — all 3 increments complete (entitlement read + gating; SCR_SUBSCRIPTION_001 +
   plans/purchase/restore; contextual paywall sheet + routing + FF_FAMILY_PLAN)

Remaining: Beta Readiness & Platform Hardening (TDD Part 5).

---

# Major Pending Deliverables

Done: ADR repository, OpenAPI spec, database schema + migrations, GitHub Actions CI/CD, shared
packages, Expo project, backend SVC_* services, and and all mobile slices M1–M8.

Remaining:

- AI platform — reviewed content corpus + evaluation harness (unblocks live Ask Guru)
- Testing — E2E (Maestro FLOW_*), first live CI run
- Deployment — live Supabase project, TestFlight / Play Internal, production release

---

# Standing Blockers & Frozen Abstraction Seams

Stable, cross-cutting facts (permanent until an approved decision changes them):

- **PanchangEngine** (server) + **PanchangProvider** (client) — panchang is ALWAYS accessed
  through these seams. The astronomical algorithm is undocumented and BLOCKED by ADR-033
  (Canonical Panchang Computation Engine, Proposed). Until ratified, panchang compute,
  Calendar/festival markers, and sunrise/tithi notifications surface a calm "unavailable" state;
  no astronomical calculations are implemented and no values are fabricated.
- **Ask Guru readiness gate** — the client streams only via the server SSE adapter (never an LLM
  directly, never fabricates). Live answers are gated OFF (GURU_LIVE = false) until reviewed
  corpus + evaluation readiness (TDD Part 3 §9/§10B); the client is complete behind the gate.
- **AudioAdapter** — ritual narration is behind a port with a NullAudioAdapter fallback; the
  text-guided flow is fully functional until a production audio adapter is approved.
- **NotificationAdapter** (client, M7) — permission/token/foreground/tap-routing flow through this
  port. `react-native-purchases`-style deferral: `expo-notifications` is not yet installed, so a
  NullNotificationAdapter is used (permission `undetermined`, no token; nothing fabricated).
  Scheduling is ALWAYS server-side (SVC_notify_scheduler); the client only registers token + prefs.
  Notif prefs live in `user_profile.notif_prefs` (JSON).
- **PaymentAdapter + entitlement** (M8) — subscriptions flow through a PaymentAdapter port with a
  NullPaymentAdapter (no offerings/purchase until `react-native-purchases` + RC key land; never
  fabricates a purchase). Entitlement is **household-grain (F-4), server-authoritative, READ-ONLY on
  device** — the `entitlement` table denies all client writes; the RevenueCat webhook
  (SVC_revenuecat_webhook) is the sole writer. The daily loop is NEVER gated (P4). v1 gated
  capabilities: `deep_dive_content`, `extended_ask_guru`.
- **Feature flags (client)** — `feature_flag` (public-select, ADR-021) is read through
  `featureFlagRepository` + `HOOK_useFeatureFlag` (cached at launch, Realtime-invalidated) and is
  READ-ONLY on device. Flags **fail closed**: loading, error, an absent key, or a non-boolean
  `enabled` all read `false`, so post-v1 scope can never leak on. `FF_FAMILY_PLAN` gates the Family
  OFFERING (via the pure `visibleOfferings`), never an in-app capability.
- **Shared cross-feature surfaces are ROUTES** — a feature never imports another feature (TDD §2.2);
  contextual cross-links use navigation intents. The contextual paywall lives at `app/modal/paywall`
  (CMP_BOTTOM_SHEET + CMP_PLAN_CARD composed, never a new CMP_*), opened by both MOD_you and MOD_guru.
- **MockPanchangProvider** is DEV/TEST ONLY and must never be imported by production code.
- **Backend Edge Functions pending** — SVC_household (member/invite), SVC_notify_scheduler
  (notify/schedule), and SVC_revenuecat_webhook are pending backend deliverables; the corresponding
  clients are coded to the OpenAPI/DB contracts. Household transfer + account deletion use
  SVC_account (implemented).

# Repository Rules

Respect module boundaries.

Do not introduce new top-level folders.

Reuse existing implementations before creating new ones.

Search before creating.

Documentation and implementation must remain synchronized.

---

# Working Principles

Before implementing anything:

- Read PROJECT_MEMORY.md
- Read SESSION.md
- Read TASK.md
- Read ARCHITECTURE_SUMMARY.md

Only retrieve additional documentation when required.

Avoid repository-wide scans.

---

# Files That Should Rarely Change

This file

PROJECT_MEMORY.md

should only change when permanent project knowledge changes.

Examples

✓ Technology stack changes

✓ Repository structure changes

✓ Product direction changes

✓ Architecture changes

✓ New launch markets

✓ Major approved decisions

Do NOT update this file for:

- today's work
- completed tasks
- bugs
- sprint progress
- temporary decisions

Those belong in SESSION.md.

---

# Success Criteria

PanchangPal should become:

- The most trusted Hindu spiritual companion for Indians living abroad.
- Architecturally simple.
- Easy to maintain.
- Highly accessible.
- Privacy-respecting.
- Cost-efficient to operate.
- AI-assisted without compromising trust.

Every engineering decision should move the project closer to these goals.

---

# One-Line Summary

> PanchangPal is a calm, trustworthy, offline-first, AI-assisted spiritual platform built with React Native, Supabase, and Retrieval-Augmented Generation (RAG), designed for long-term maintainability and exceptional user trust.
