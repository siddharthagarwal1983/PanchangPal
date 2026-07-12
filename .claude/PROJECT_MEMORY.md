# PROJECT_MEMORY.md

# PanchangPal — Project Memory

Version: 1.1.0

Last Updated: 2026-07-12

Current Phase:
Mobile MVP — Phase 1 (Feature Slices)

Status:
Foundation + Backend complete; mobile feature slices in progress (M1–M5 done)

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

Implementation is underway: Repository & Platform Foundation and Backend Foundation (SVC_* Edge Functions) are complete; the mobile app is being built as feature slices (App Shell, Today, Guided Ritual, Calendar Shell, Ask Guru done). Live progress lives in DASHBOARD.md / CURRENT_MILESTONE.md / SESSION.md — not here.

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
3. Mobile slices: M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru

Remaining mobile slices: M6 Profile/Household · M7 Notifications · M8 Subscription.
Then: Beta Readiness & Platform Hardening (TDD Part 5).

---

# Major Pending Deliverables

Done: ADR repository, OpenAPI spec, database schema + migrations, GitHub Actions CI/CD, shared
packages, Expo project, backend SVC_* services, and mobile slices M1–M5.

Remaining:

- Mobile — Profile/Household (M6), Notifications (M7), Subscription (M8)
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
- **MockPanchangProvider** is DEV/TEST ONLY and must never be imported by production code.

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