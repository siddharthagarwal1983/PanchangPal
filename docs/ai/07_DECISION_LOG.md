# DECISION_LOG.md

# PanchangPal — Project Decision Log

**Version:** 1.0.0
**Status:** Living Document
**Owner:** Product & Architecture

---

# Purpose

This document is the canonical log of all significant decisions made throughout the PanchangPal project.

It exists to answer:

* Why was this decision made?
* What alternatives were considered?
* What assumptions were made?
* When should this decision be revisited?
* What documentation is affected?

Unlike Architecture Decision Records (ADRs), this document captures **all major project decisions**, including:

* Product
* UX
* Engineering
* AI
* Infrastructure
* Security
* Monetization
* Operations

Every significant decision should be recorded here.

---

# Decision Status

Every decision must have one of the following statuses:

| Status     | Meaning                                 |
| ---------- | --------------------------------------- |
| Proposed   | Under discussion                        |
| Approved   | Accepted and implemented                |
| Superseded | Replaced by another decision            |
| Deprecated | No longer recommended                   |
| Rejected   | Evaluated but intentionally not adopted |

---

# Decision Template

Every new decision should follow this template.

```markdown
Decision ID:
Category:
Title:
Status:
Date:
Owner:

Context

Decision

Alternatives Considered

Rationale

Benefits

Trade-offs

Risks

Dependencies

Affected Documents

Review Trigger

Superseded By
```

---

# Product Decisions

---

## DEC-001

**Category**

Product

**Title**

Target Indians Living Abroad

**Status**

Approved

**Owner**

Product

### Context

The initial target market needed a clear focus.

### Decision

Launch exclusively for Indians living outside India.

Primary launch markets:

* United States
* Australia
* New Zealand

Secondary expansion:

* Canada
* United Kingdom
* Europe

### Alternatives Considered

* India-first
* Global launch
* Temple-first

### Rationale

Higher willingness to pay.

Clear user pain.

Lower competition.

### Review Trigger

Expansion beyond current launch markets.

---

## DEC-002

**Category**

Product

**Title**

Trust Before Engagement

**Status**

Approved

### Decision

The product optimizes for:

* Trust
* Daily usefulness
* Habit formation

The product will not optimize for:

* Endless scrolling
* Notifications for engagement only
* Addictive behavior

### Review Trigger

Never.

This is a permanent product principle.

---

# UX Decisions

---

## DEC-003

**Category**

UX

**Title**

Calm Interface

**Status**

Approved

### Decision

The application should feel:

* Calm
* Respectful
* Focused

Avoid:

* Excessive animations
* Gamification
* Bright promotional UI
* Visual clutter

### Review Trigger

Major redesign.

---

## DEC-004

**Category**

UX

**Title**

Three-Tap Navigation Rule

**Status**

Approved

### Decision

Users should reach every major feature within three interactions or fewer.

### Review Trigger

Navigation redesign.

---

# AI Decisions

---

## DEC-005

**Category**

AI

**Title**

Grounded-or-Silent AI

**Status**

Approved

### Decision

The AI must never invent answers.

If sufficient evidence cannot be retrieved:

Politely decline.

### Alternatives Considered

* Best-effort generation
* Open-ended conversational AI

### Rationale

Trust is more valuable than answer rate.

### Review Trigger

Never.

Core product principle.

---

## DEC-006

**Category**

AI

**Title**

Provider-Agnostic AI Layer

**Status**

Approved

### Decision

All LLMs are accessed through a Provider Adapter.

Initial provider:

* OpenAI

Future providers may include:

* Anthropic
* Google Gemini
* Azure OpenAI

### Review Trigger

New provider adoption.

---

## DEC-007

**Category**

AI

**Title**

GPT-5 Mini as Default Generation Model

**Status**

Approved

### Decision

Use GPT-5 mini as the default production model.

### Rationale

Balanced:

* Quality
* Latency
* Cost

### Review Trigger

Annual model evaluation or significant provider updates.

---

# Architecture Decisions

---

## DEC-008

**Category**

Architecture

**Title**

Thin Client

**Status**

Approved

### Decision

Business logic belongs on the backend.

The mobile application remains a presentation layer.

### Review Trigger

Never.

---

## DEC-009

**Category**

Architecture

**Title**

Offline-First

**Status**

Approved

### Decision

User actions should continue without network connectivity.

Synchronization occurs when connectivity returns.

### Review Trigger

Major synchronization redesign.

---

## DEC-010

**Category**

Architecture

**Title**

Provider Adapter Pattern

**Status**

Approved

### Decision

Every external dependency is isolated through adapters.

Examples:

* AI
* Analytics
* Payments
* Notifications

### Review Trigger

New third-party integrations.

---

# Database Decisions

---

## DEC-011

**Category**

Database

**Title**

PostgreSQL + Supabase

**Status**

Approved

### Decision

Use PostgreSQL hosted on Supabase.

### Alternatives

* Firebase
* MongoDB
* DynamoDB

### Review Trigger

Scalability constraints.

---

## DEC-012

**Category**

Database

**Title**

Mandatory Row Level Security

**Status**

Approved

### Decision

Every user-owned table requires RLS.

No exceptions.

### Review Trigger

Never.

---

# Infrastructure Decisions

---

## DEC-013

**Category**

Infrastructure

**Title**

Single Launch Region

**Status**

Approved

### Decision

Launch using a single primary Supabase region.

### Rationale

Lower operational complexity.

Lower cost.

### Review Trigger

International scaling requirements.

---

## DEC-014

**Category**

Infrastructure

**Title**

Monorepo

**Status**

Approved

### Decision

Maintain one repository containing:

* Mobile
* Backend
* Shared Packages
* Documentation

### Review Trigger

Large team restructuring.

---

# Monetization Decisions

---

## DEC-015

**Category**

Monetization

**Title**

RevenueCat for Mobile Subscriptions

**Status**

Approved

### Decision

Use RevenueCat for App Store and Google Play subscriptions.

### Review Trigger

Platform policy changes.

---

## DEC-016

**Category**

Monetization

**Title**

Payment Provider Adapter

**Status**

Approved

### Decision

Business logic depends on a Payment Provider Adapter.

Possible providers:

* RevenueCat
* Stripe
* Future providers

### Review Trigger

New payment channels.

---

# Analytics Decisions

---

## DEC-017

**Category**

Analytics

**Title**

Analytics Adapter

**Status**

Approved

### Decision

Application code never communicates directly with analytics vendors.

### Initial Implementation

PostgreSQL-backed event store.

### Future Options

* PostHog
* Amplitude

### Review Trigger

Growth beyond current analytics capabilities.

---

# Security Decisions

---

## DEC-018

**Category**

Security

**Title**

Least Privilege by Default

**Status**

Approved

### Decision

Every service receives the minimum permissions required.

### Review Trigger

Security audit.

---

## DEC-019

**Category**

Security

**Title**

No Secrets in Client Applications

**Status**

Approved

### Decision

API keys, service credentials, and secrets must remain server-side.

### Review Trigger

Never.

---

# Documentation Decisions

---

## DEC-020

**Category**

Documentation

**Title**

Documentation-First Development

**Status**

Approved

### Decision

Product, UX, and architecture documentation are completed before implementation.

### Review Trigger

Never.

---

# AI Coding Decisions

---

## DEC-021

**Category**

AI Development

**Title**

AI Must Never Invent Requirements

**Status**

Approved

### Decision

AI coding agents must:

* Read documentation first.
* Follow the Source of Truth hierarchy.
* Request clarification when documentation is ambiguous.

### Review Trigger

Never.

---

# Decision Review Schedule

Review decisions according to category:

| Category       | Review Frequency                 |
| -------------- | -------------------------------- |
| Product        | Every 12 months                  |
| UX             | Every 12 months                  |
| Architecture   | Every 12 months or major release |
| AI             | Every 6 months                   |
| Infrastructure | Every 6 months                   |
| Security       | Every security review            |
| Monetization   | Every 6 months                   |
| Analytics      | Every 6 months                   |

Core product principles marked "Never" are considered foundational and should not be revisited without executive-level approval.

---

# Decision Governance

A new decision should be recorded whenever any of the following changes:

* Product strategy
* User experience
* Architecture
* Database
* AI platform
* Security model
* Payment architecture
* Analytics platform
* Deployment architecture
* Technology stack

Minor implementation details should not be added.

Only strategic decisions belong here.

---

# Relationship to ADRs

The Decision Log and ADRs complement each other.

| Document     | Scope                                                        |
| ------------ | ------------------------------------------------------------ |
| Decision Log | Product, UX, AI, Engineering, Security, Operations, Business |
| ADR          | Technical architecture decisions only                        |

Every ADR should reference its corresponding Decision Log entry where applicable.

## DEC ↔ ADR Cross-Reference Map

The technical ADRs live in **TDD Part 1 §6**. This map links strategic decisions here to their governing ADR(s):

| Decision Log | Title | Governing ADR (TDD Part 1 §6) |
|---|---|---|
| DEC-006 | Provider-Agnostic AI Layer | ADR-011 (LLM provider adapter) |
| DEC-007 | GPT-5 mini as Default Generation Model | ADR-011 (initial impl: GPT-5 mini + `text-embedding-3-small` 1536) |
| DEC-008 | Thin Client | ADR-001/002 + TDD Part 1 §1.2 |
| DEC-009 | Offline-First | TDD Part 1 §1.7 + Part 4 §6 |
| DEC-010 | Provider Adapter Pattern | ADR-004/011/013 (AI/analytics), ADR-005 (payments) |
| DEC-011 | PostgreSQL + Supabase | ADR-003 |
| DEC-012 | Mandatory Row Level Security | TDD Part 2 §4 (RLS model) |
| DEC-013 | Single Launch Region | ADR-012 (single US region, resolves F-18) |
| DEC-014 | Monorepo | TDD Part 1 §4 |
| DEC-015 | RevenueCat for Mobile Subscriptions | ADR-005 |
| DEC-017 | Analytics Adapter (Postgres initial) | ADR-013 (resolves F-19) |

*Note (2026-07-11): DEC-006/007/013/017 correspond to the three architectural decisions formally resolved as ADR-011/012/013 — closing follow-ups F-20, F-18, and F-19 respectively.*

## Standalone ADR Cross-Reference (`docs/architecture/adr/`)

*Added 2026-07-11. The technical ADRs originally embedded in TDD Part 1 §6 have been extracted into standalone Michael Nygard-format records under `docs/architecture/adr/`, preserving the §6 numbering (ADR-001…013) and extending it (ADR-014…031) for decisions previously captured only in this Decision Log or in TDD prose. This table adds ADR cross-references only; it does not change any decision.*

| Decision Log | Title | Standalone ADR(s) |
|---|---|---|
| DEC-005 | Grounded-or-Silent AI | ADR-004 |
| DEC-006 | Provider-Agnostic AI Layer | ADR-011, ADR-017 |
| DEC-007 | GPT-5 mini as Default Generation Model | ADR-011 |
| DEC-008 | Thin Client | ADR-016 |
| DEC-009 | Offline-First | ADR-015 |
| DEC-010 | Provider Adapter Pattern | ADR-017 (+ ADR-005/011/013/020 instances) |
| DEC-011 | PostgreSQL + Supabase | ADR-003 |
| DEC-012 | Mandatory Row Level Security | ADR-018 |
| DEC-013 | Single Launch Region | ADR-012 |
| DEC-014 | Monorepo | ADR-014 |
| DEC-015 | RevenueCat for Mobile Subscriptions | ADR-005 |
| DEC-016 | Payment Provider Adapter | ADR-017 (RevenueCat impl: ADR-005) |
| DEC-017 | Analytics Adapter (Postgres initial) | ADR-013 |
| DEC-018 | Least Privilege by Default | ADR-030 |
| DEC-019 | No Secrets in Client Applications | ADR-030 |
| DEC-020 | Documentation-First Development | ADR-027 |
| DEC-021 | AI Must Never Invent Requirements | ADR-027 |

*Additional ADRs without a one-to-one Decision Log entry (extracted from TDD prose): ADR-001 (React Native), ADR-002 (Expo/EAS), ADR-006 (Edge Functions), ADR-007 (TanStack Query), ADR-008 (Zustand), ADR-009 (anonymous-auth-first), ADR-010 (deterministic panchang), ADR-019 (streaming AI), ADR-020 (notifications), ADR-021 (feature flags), ADR-022 (error envelope), ADR-023 (observability), ADR-024 (delivery/OTA), ADR-025 (background jobs), ADR-026 (time-zone correctness), ADR-028 (managed-services-first), ADR-029 (accessibility-first), ADR-031 (privacy/data-minimization). See `docs/architecture/adr/README.md` for the full index.*

---

# AI Coding Agent Instructions

Before proposing architectural or product changes:

1. Review this Decision Log.
2. Determine whether an existing decision already governs the topic.
3. Preserve approved decisions.
4. If proposing a change, create a new **Proposed** decision rather than modifying an existing **Approved** decision.
5. Never silently reverse or invalidate an approved decision.

The Decision Log represents the institutional memory of the PanchangPal project and should be treated as an authoritative source for understanding why the system is designed the way it is.
