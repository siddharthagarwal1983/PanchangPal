# Architecture Decision Records (ADR) — Index

This directory holds the Architecture Decision Records for PanchangPal, in Michael Nygard's format (Context · Decision · Alternatives · Consequences · Dependencies · Affected Documents · Review Trigger).

**Scope.** These ADRs document architecture decisions **already approved** in the source documentation — they do not introduce new architecture. Source-of-truth hierarchy: MRD → PRD → PDD → TDD → ADRs → Design System → GitHub Issues → Sprint Tasks (project CLAUDE.md).

**Numbering note.** ADR-001 through ADR-013 preserve the exact numbering already established in **TDD Part 1 §6** and cross-referenced throughout the TDD and the Decision Log (`docs/ai/07_DECISION_LOG.md`). Renumbering them would break existing references and violate "never reuse an ADR number," so this set keeps them stable and extends with ADR-014+ for decisions documented in the Decision Log and TDD prose that were not previously written up as standalone ADRs. ADR numbers are permanent and never reused.

**Primary sources.** TDD Part 1 (`docs/tdd/01_SYSTEM_ARCHITECTURE.md`), §6 in particular; the Decision Log (`docs/ai/07_DECISION_LOG.md`); and the PDD/PRD/MRD where referenced within each ADR.

---

| ADR | Title | Status | Date | Summary |
|---|---|---|---|---|
| [ADR-001](ADR-001-React-Native.md) | React Native for the Mobile Client | Accepted | 2026-07-11 | One TypeScript codebase for iOS + Android, matching the solo-founder constraint. |
| [ADR-002](ADR-002-Expo-Managed-Workflow.md) | Expo (Managed Workflow) + EAS | Accepted | 2026-07-11 | Managed Expo + EAS Build/Submit + OTA removes native build/CI toil and enables fast JS fixes. |
| [ADR-003](ADR-003-Supabase.md) | Supabase as the Backend Platform | Accepted | 2026-07-11 | One managed platform: Auth, Postgres+RLS+pgvector, Storage, Edge Functions, Realtime. |
| [ADR-004](ADR-004-RAG-pgvector-OpenAI.md) | RAG with pgvector + OpenAI (Grounded-or-Silent) | Accepted | 2026-07-11 | Answer only from a reviewed corpus via pgvector retrieval; decline when confidence is low. |
| [ADR-005](ADR-005-RevenueCat.md) | RevenueCat for Billing & Entitlements | Accepted | 2026-07-11 | RevenueCat orchestrates native IAP as the cross-platform entitlement source of truth. |
| [ADR-006](ADR-006-Edge-Functions.md) | Edge Functions (Deno) for Privileged & Compute Logic | Accepted | 2026-07-11 | Stateless, secret-holding server units for panchang, RAG, webhooks, sync, account ops. |
| [ADR-007](ADR-007-TanStack-Query.md) | TanStack Query for Server State | Accepted | 2026-07-11 | Cached-first, offline-persistent server-cache layer powering the sub-500ms Today render. |
| [ADR-008](ADR-008-Zustand.md) | Zustand for Client / UI State | Accepted | 2026-07-11 | Minimal store for session, offline queue, and prefs, kept separate from server state. |
| [ADR-009](ADR-009-Anonymous-Auth-First.md) | Anonymous-Auth-First Identity | Accepted | 2026-07-11 | Every first-launch user gets an anon session so RLS works before sign-in; merge on auth. |
| [ADR-010](ADR-010-Deterministic-Panchang.md) | Deterministic, Cacheable Panchang Engine | Accepted | 2026-07-11 | Pure, versioned panchang function cached at CDN + client for accuracy, scale, and cost. |
| [ADR-011](ADR-011-LLM-Provider-Adapter.md) | LLM Provider Adapter (GPT-5 mini + text-embedding-3-small) | Accepted | 2026-07-11 | All model access behind an adapter; GPT-5 mini + 1536-dim embeddings as launch impl. |
| [ADR-012](ADR-012-Single-US-Region.md) | Single US Supabase Region for Launch | Accepted | 2026-07-11 | One US region; AU/NZ served by CDN + optimistic writes. Resolves F-18. |
| [ADR-013](ADR-013-Analytics-Adapter.md) | Analytics Adapter with Postgres Sink | Accepted | 2026-07-11 | Events behind an adapter into a Postgres sink; migratable to PostHog/Amplitude. Resolves F-19. |
| [ADR-014](ADR-014-Monorepo.md) | Monorepo (pnpm + Turborepo) | Accepted | 2026-07-11 | One repo for app, backend, and shared contracts to keep client and server in lockstep. |
| [ADR-015](ADR-015-Offline-First.md) | Offline-First Architecture | Accepted | 2026-07-11 | Core loop is offline-complete; optimistic writes + durable queue reconciled on reconnect. |
| [ADR-016](ADR-016-Thin-Client-Server-Authoritative.md) | Thin Client / Server-Authoritative State | Accepted | 2026-07-11 | Server owns truth; the client renders/caches, with daily completion the one offline exception. |
| [ADR-017](ADR-017-Provider-Adapter-Pattern.md) | Provider Adapter Pattern (Hexagonal Boundaries) | Accepted | 2026-07-11 | Every external vendor (AI, analytics, payments, notifications) sits behind a swappable adapter. |
| [ADR-018](ADR-018-Row-Level-Security.md) | Row-Level Security as the Authorization Boundary | Accepted | 2026-07-11 | RLS on every user-owned table is the primary, release-blocking authorization boundary. |
| [ADR-019](ADR-019-Streaming-AI-Responses.md) | Streaming AI Responses | Accepted | 2026-07-11 | Token-streamed Ask Guru answers for first-token < 2s and calm error recovery. |
| [ADR-020](ADR-020-Notification-Architecture.md) | Notification Architecture (Expo Push + pg_cron) | Accepted | 2026-07-11 | Server-scheduled, tz-local, quiet-hours-aware pushes over one cross-platform API. |
| [ADR-021](ADR-021-Feature-Flag-Architecture.md) | Feature-Flag Architecture (Postgres-backed) | Accepted | 2026-07-11 | A `feature_flags` table + Realtime invalidation gates post-v1 scope without branching. |
| [ADR-022](ADR-022-Error-Envelope.md) | Standard Error Envelope & ERR_* Taxonomy | Accepted | 2026-07-11 | Typed `{code,message,correlation_id,recoverable}` envelope; no leaked internals; mapped to copy. |
| [ADR-023](ADR-023-Observability.md) | Observability (Sentry + Correlation IDs) | Accepted | 2026-07-11 | Sentry + structured logs + one correlation ID for end-to-end tracing; AI audited, no PII. |
| [ADR-024](ADR-024-Delivery-Release-OTA.md) | Delivery & Release Strategy (GitHub Actions + EAS + OTA) | Accepted | 2026-07-11 | Trunk-based CI/CD: lint/test → migrations → functions → EAS build → stores, with OTA fixes. |
| [ADR-025](ADR-025-Background-Jobs.md) | Background Jobs (pg_cron + Jobs Table) | Accepted | 2026-07-11 | Scheduling and idempotent workers inside Supabase; no external queue at v1. |
| [ADR-026](ADR-026-Time-Zone-Correctness.md) | Time-Zone Correctness (UTC Store, IANA Compute) | Accepted | 2026-07-11 | Store UTC, compute/display in the user's IANA tz via one utility; never default to India time. |
| [ADR-027](ADR-027-Documentation-First.md) | Documentation-First Development | Accepted | 2026-07-11 | Docs precede code under a source-of-truth hierarchy; never invent requirements. |
| [ADR-028](ADR-028-Managed-Services-First.md) | Managed-Services-First | Accepted | 2026-07-11 | Buy managed platforms, build only differentiating logic; bound lock-in with adapters. |
| [ADR-029](ADR-029-Accessibility-First.md) | Accessibility-First (WCAG 2.1 AA, Release-Blocking) | Accepted | 2026-07-11 | WCAG 2.1 AA is a release-blocking, test-enforced gate on every component and screen. |
| [ADR-030](ADR-030-Security-Model.md) | Security Model (Least Privilege, No Secrets on Device) | Accepted | 2026-07-11 | Least privilege everywhere; server-only secrets; validated inputs; server-side receipt checks. |
| [ADR-031](ADR-031-Privacy-Data-Minimization.md) | Privacy & Data-Minimization Model | Accepted | 2026-07-11 | Minimize collection; no PII in analytics/logs/prompts; no cross-session AI memory; export/delete. |
| [ADR-032](ADR-032-API-Versioning-Strategy.md) | API Versioning Strategy | Accepted | 2026-07-11 | Compatibility-first SemVer contracts; support N & N-1; additive evolution + expand-then-contract. |
| [ADR-033](ADR-033-Canonical-Panchang-Computation-Engine.md) | Canonical Panchang Computation Engine | Proposed | 2026-07-12 | Panchang behind an abstract `PanchangEngine` provider; astronomical choices (ephemeris/ayanamsa/methodology/validation/tolerances) to ratify. Only blocked backend component. |

---

*33 ADRs (ADR-033 is **Proposed** — the canonical panchang engine decision; all others `Accepted` for v1). Two are marked `[TECHNICAL IMPROVEMENT]` in their source (ADR-009, ADR-010; ADR-021 improves an implied approach). ADR-011/012/013 resolve TDD follow-ups F-20/F-18/F-19; ADR-033 realizes ADR-010's engine. See `ADR_TEMPLATE.md` for the official template and authoring guidelines. Companion docs for ADR-033: `docs/architecture/canonical-panchang-engine/`.*
