# GLOSSARY.md

# PanchangPal — Project Glossary

**Version:** 1.0.0
**Status:** Living Document
**Owner:** Product & Engineering

---

# Purpose

This glossary defines the canonical terminology used across the PanchangPal project.

It serves as the common vocabulary for:

* Product
* Design
* Engineering
* AI
* QA
* DevOps
* Documentation
* Claude Code
* Cursor
* Codex

Every document should use the terminology defined here.

Do not invent synonyms when an approved term already exists.

---

# Naming Conventions

The following prefixes are reserved.

| Prefix   | Purpose                      | Example             |
| -------- | ---------------------------- | ------------------- |
| `MRD`    | Market Requirements          | MRD-001             |
| `PRD`    | Product Requirements         | PRD-001             |
| `PDD`    | Product Design Document      | PDD Part 3          |
| `TDD`    | Technical Design Document    | TDD Part 2          |
| `ADR`    | Architecture Decision Record | ADR-004             |
| `EPIC`   | Product Epic                 | EPIC_RITUALS        |
| `US`     | User Story                   | US_012              |
| `FLOW`   | User Flow                    | FLOW_MORNING_RITUAL |
| `SCR`    | Screen                       | SCR_HOME_001        |
| `CMP`    | Component                    | CMP_PRIMARY_BUTTON  |
| `API`    | API Contract                 | API_GET_TODAY       |
| `DTO`    | Data Transfer Object         | RitualDTO           |
| `TBL`    | Database Table (TDD Part 2)  | TBL_HOUSEHOLD       |
| `REL`    | Database Relationship        | REL_001             |
| `RLS`    | Row Level Security           | RLS_HOUSEHOLD       |
| `EVT`    | Analytics Event              | EVT_014             |
| `ERR`    | Error Code                   | ERR_NETWORK_TIMEOUT |
| `SVC`    | Backend service / Edge Function (TDD Part 1–2) | SVC_ask_guru |
| `JOB`    | Background Job               | JOB_EMBEDDINGS      |
| `QUEUE`  | Queue                        | QUEUE_SYNC          |
| `CACHE`  | Cache Layer                  | CACHE_PANCHANG      |
| `FF`     | Feature Flag                 | FF_GREETING_CARD    |
| `PROMPT` | Prompt Registry (TDD Part 3 §5A) | PROMPT_SYSTEM_001 |
| `MODEL`  | AI Model — Model Registry (TDD Part 3 §2A); covers generation + embedding | MODEL_GEN_PRIMARY · MODEL_EMBED_PRIMARY |
| `AISET`  | AI version bundle (TDD Part 3 §10A) | AISET-2026.07 |
| `STORE`  | Client state store — Zustand (TDD Part 4) | STORE_session |
| `HOOK`   | Data/query hook (TDD Part 4) | HOOK_useToday       |
| `MOD`    | Mobile feature module (TDD Part 4) | MOD_today     |
| `EXP`    | AI Experiment                | EXP_001             |
| `TEST`   | Test Case                    | TEST_LOGIN_001      |

**Reconciliation notes (2026-07-11):** `TBL_*` replaces the earlier `DB_*` for database tables (aligns with TDD Part 2). AI models — including embeddings — are registered under the `MODEL_*` prefix in the Model Registry (TDD Part 3 §2A); the earlier `EMB_*` prefix is deprecated in favor of `MODEL_EMBED_PRIMARY`. `SVC_`, `STORE_`, `HOOK_`, `MOD_`, and `AISET` are approved prefixes introduced by TDD Parts 1–4.

Never introduce new prefixes without architectural approval.

---

# Product Terms

## Panchang

The Hindu calendar used to determine auspicious timings and religious observances.

---

## Tithi

A lunar day used in the Hindu calendar.

---

## Nakshatra

The lunar mansion or constellation associated with the Moon.

---

## Muhurat

An auspicious time for performing religious activities.

---

## Ritual

A guided spiritual activity presented by the application.

A ritual should be:

* Practical
* Beginner-friendly
* Time-bound

---

## Festival

A significant Hindu religious observance.

Includes:

* Meaning
* Timing
* Preparation
* Ritual guidance

---

## Ask Guru

The AI-powered question-and-answer experience.

Rules:

* Grounded
* Source-backed
* Honest
* Non-speculative

---

## Household

A group of users sharing:

* Rituals
* Reminders
* Settings
* Family participation

---

## Streak

A measure of consecutive ritual completion.

Used to encourage consistency rather than competition.

---

## Premium

The paid subscription tier.

Unlocks additional functionality while preserving a meaningful free experience.

---

# User Types

## Guest

User without authentication.

Limited access.

---

## Registered User

Authenticated user.

Can save preferences and history.

---

## Premium User

Subscribed user with premium entitlements.

---

## Household Owner

Primary administrator of a household.

Can manage members and settings.

---

## Household Member

User invited into a household.

Permissions are limited by household role.

---

# Design Terms

## Screen

A complete application page.

Identifier:

```text
SCR_*
```

---

## Component

A reusable UI building block.

Identifier:

```text
CMP_*
```

---

## Design Token

A reusable design value.

Examples:

* Colors
* Typography
* Radius
* Motion
* Spacing

Tokens are the only approved source of visual values.

---

## Variant

An approved visual or behavioral modification of a reusable component.

---

## State

A component condition.

Examples:

* Default
* Loading
* Disabled
* Error
* Success

---

## Skeleton

Placeholder UI shown while content loads.

---

## Empty State

A meaningful experience shown when data does not yet exist.

---

# Engineering Terms

## Edge Function

Backend serverless function executed by Supabase.

---

## DTO

Data Transfer Object.

Defines API request and response payloads.

---

## Repository

Persistent data access layer.

Repositories never contain business logic.

---

## Service

Contains business logic.

Services coordinate multiple repositories and external providers.

---

## Adapter

Abstraction around third-party services.

Examples:

* AI Provider Adapter
* Analytics Adapter
* Payment Adapter
* Notification Adapter

Business logic must depend on adapters rather than vendor SDKs.

---

## Domain

Business rules independent of infrastructure.

---

## Offline Queue

Stores mutations while the device has no network connectivity.

Synchronizes automatically when connectivity returns.

---

## Sync Engine

Coordinates reconciliation between local data and server state.

---

# Database Terms

## RLS

Row Level Security.

Controls data visibility per user.

Mandatory for all user-owned tables.

---

## Migration

Version-controlled database schema change.

Manual schema changes are prohibited.

---

## Foreign Key

Relationship between tables.

---

## Index

Database optimization structure.

Indexes must be justified and documented.

---

## Soft Delete

Logical deletion using a timestamp or status field instead of permanent removal.

---

# API Terms

## API Contract

Formal definition of:

* Request
* Response
* Validation
* Errors
* Authentication
* Authorization

---

## Idempotency

A repeated request produces the same result as a single request.

Required for retry-safe mutations.

---

## Pagination

Controlled retrieval of large datasets.

---

## Rate Limit

Maximum request frequency allowed for a client.

---

# AI Terms

## RAG

Retrieval-Augmented Generation.

Retrieval always occurs before generation.

---

## Retrieval

Selecting relevant content from the knowledge base.

---

## Chunk

A semantically meaningful unit of content stored for retrieval.

---

## Embedding

Vector representation of text used for semantic search.

---

## Vector Search

Similarity search performed against embeddings.

---

## Groundedness

Degree to which an AI response is supported by retrieved content.

Groundedness is mandatory.

---

## Hallucination

An unsupported AI-generated statement.

Hallucinations are unacceptable.

The AI should decline rather than guess.

---

## Prompt

Structured instructions provided to the language model.

Prompt text belongs in the Prompt Registry.

---

## Context Window

Maximum information sent to the language model for one request.

---

## Confidence Threshold

Minimum retrieval confidence required before generating an answer.

---

## Streaming

Incremental delivery of AI responses to the user.

---

# Analytics Terms

## Event

A measurable user or system action.

Identifier:

```text
EVT_*
```

---

## Property

Additional metadata attached to an event.

---

## Funnel

Ordered sequence of user actions.

---

## KPI

Key Performance Indicator.

Measures business or product success.

---

## North Star Metric

Primary metric representing long-term product value.

For PanchangPal:

**Weekly Household Ritual Completions (WHRC)**

A composite habit-loop metric across a household (authoritative per MRD §14 / PDD §11.3 / TDD Part 1). "Weekly Active Households" is a supporting engagement indicator, not the North Star.

---

# Security Terms

## Authentication

Verifying user identity.

---

## Authorization

Determining permitted actions after authentication.

---

## Least Privilege

Grant only the permissions required.

---

## Secret

Sensitive credential such as:

* API Keys
* Tokens
* Certificates

Secrets must never be committed to source control.

---

# Accessibility Terms

## VoiceOver

Apple screen reader.

---

## TalkBack

Android screen reader.

---

## Dynamic Type

User-controlled font scaling.

---

## Reduced Motion

Accessibility preference limiting animations.

---

## WCAG AA

Minimum accessibility compliance target.

---

# DevOps Terms

## CI

Continuous Integration.

---

## CD

Continuous Delivery / Deployment.

---

## Feature Flag

Controlled rollout mechanism.

Identifier:

```text
FF_*
```

---

## Rollback

Restoring a previously working release.

---

## Observability

Ability to understand system health through:

* Logs
* Metrics
* Traces
* Alerts

---

# Documentation Terms

## ADR

Architecture Decision Record.

Documents significant technical decisions.

---

## Living Document

A document expected to evolve through controlled versioning.

---

## Source of Truth

The authoritative document for a specific subject.

If multiple documents disagree, follow the project's Source of Truth hierarchy.

---

# AI Coding Agent Rules

When encountering unfamiliar terminology:

1. Search this glossary first.
2. Search the PDD and TDD.
3. Search the ADRs.
4. Ask for clarification if the term remains ambiguous.

Never invent new terminology where an approved definition already exists.

---

# Glossary Governance

This glossary is the canonical vocabulary for PanchangPal.

Any new:

* Product term
* Engineering term
* AI term
* Design term
* Database term
* Analytics term
* Security term
* Documentation identifier

must be added here before being adopted elsewhere in the project.

Consistency of language is a core architectural principle and is essential for effective collaboration between humans and AI coding agents.
