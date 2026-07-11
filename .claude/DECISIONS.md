# DECISIONS.md

# PanchangPal — AI Decision Summary

Version: 1.0.0

Purpose:
This file contains a condensed summary of permanent project decisions.

It exists to minimize context usage for AI coding agents.

For detailed rationale, see:

docs/ai/07_DECISION_LOG.md

or

docs/architecture/adr/

---

# Product Decisions

## Target Market

Primary

- Indians living abroad

Launch Markets

- United States
- Australia
- New Zealand

Expansion Markets

- Canada
- United Kingdom
- Europe

---

## Product Philosophy

Optimize for:

- Trust
- Simplicity
- Calm UX
- Daily usefulness
- Accessibility

Do NOT optimize for:

- Social engagement
- Addictive behaviour
- Endless scrolling
- Notification spam
- Gamification

---

## AI Philosophy

AI is an assistant.

Not an authority.

Responses must always be:

- Grounded
- Honest
- Transparent
- Source-backed

If confidence is insufficient:

Politely decline.

Never hallucinate.

---

# Architecture Decisions

## Mobile

Framework

- React Native
- Expo

Language

- TypeScript

Routing

- Expo Router

---

## Backend

Platform

- Supabase

Database

- PostgreSQL

Functions

- Edge Functions

Security

- Row Level Security (RLS)

---

## State Management

Client State

- Zustand

Server State

- TanStack Query

Never duplicate server state in Zustand.

---

## Offline Strategy

Application is:

Offline-first.

The server is always the source of truth.

Offline actions are synchronized when connectivity returns.

---

## AI

Provider

- OpenAI (via Provider Adapter)

Generation

- GPT-5 mini

Architecture

- Retrieval-Augmented Generation (RAG)

Retrieval is mandatory before generation.

---

## AI Rules

Always:

- Retrieve
- Ground
- Stream
- Cite sources

Never:

- Guess
- Fabricate
- Expose prompts
- Expose chain of thought

---

## Provider Pattern

All third-party services must be accessed through adapters.

Current adapters:

- AI Provider
- Analytics
- Payments
- Notifications
- Storage

Never call vendor SDKs directly from business logic.

---

## Payments

Mobile

- RevenueCat

Business logic must depend on the Payment Provider Adapter.

Never couple application logic directly to RevenueCat.

---

## API Versioning

Compatibility-first: SemVer'd `API_*` contracts in `packages/api`; backend supports current and previous minor (N and N-1).

Prefer additive evolution over new versions; version travels with the contract envelope (header-style), not the URL.

Database changes follow expand-then-contract; breaking changes require a new contract major and approval.

See ADR-032.

---

## Analytics

Use the Analytics Adapter.

Never call analytics vendors directly.

Initial storage:

- PostgreSQL

---

## Notifications

Use the Notification Adapter.

No platform-specific notification logic inside feature modules.

---

# Security Decisions

Always:

- Authenticate
- Authorize
- Validate input
- Enforce RLS
- Protect secrets

Never:

- Store secrets in clients
- Log tokens
- Log sensitive user data

---

# Accessibility Decisions

Accessibility is mandatory.

Support:

- VoiceOver
- TalkBack
- Dynamic Type
- Reduced Motion
- WCAG AA

Accessibility regressions are unacceptable.

---

# Documentation Decisions

Documentation-first development.

Architecture changes require:

- ADR update

UX changes require:

- PDD update

Implementation changes require:

- TDD update

Strategic decisions require:

- Decision Log update

---

# Repository Decisions

Repository type

- Monorepo

Do not introduce new top-level folders.

Respect module boundaries.

---

# Coding Principles

Always:

- Reuse existing code
- Extend before creating
- Keep components small
- Keep services cohesive
- Prefer composition
- Use strict typing

Never:

- Duplicate functionality
- Invent requirements
- Rewrite unrelated code
- Introduce unnecessary complexity

---

# Current Architecture

Presentation

↓

Application Layer

↓

Domain Services

↓

Adapters

↓

Supabase / OpenAI / RevenueCat

Business logic belongs in services.

Presentation components remain presentation-only.

---

# Permanent Principles

Always preserve:

- Trust
- Simplicity
- Accessibility
- Privacy
- Security
- Offline-first
- Thin client
- Server-authoritative state
- Calm UX
- Provider abstraction
- Documentation-first development

These principles must never be violated without an approved ADR.

---

# Before Every Task

Remember:

1. Read PROJECT_MEMORY.md
2. Read SESSION.md
3. Read TASK.md
4. Read ARCHITECTURE_SUMMARY.md

Only then retrieve additional documentation if required.

Do not scan the repository unnecessarily.

---

# End of Session

When instructed to end the session:

Update:

- SESSION.md
- PROJECT_STATUS.md

Update only if required:

- PROJECT_MEMORY.md
- DECISION_LOG.md

Keep permanent decisions here concise.

Do not turn this file into a session log.

---

# One-Line Reminder

> Build software that users can trust, engineers can maintain, and AI can understand.