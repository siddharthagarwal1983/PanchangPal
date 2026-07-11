# ADR-014 — Monorepo (pnpm + Turborepo)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

PanchangPal spans a mobile app, Supabase Edge Functions, database migrations, and shared contracts (types, API schemas, design tokens, event/error enums). These must stay in lockstep — a change to an API contract or an `EVT_*`/`ERR_*` enum must reach both client and server without drift. For a solo founder and for AI coding agents, having the whole context in one place is a significant advantage (TDD Part 1 §1.1, §4).

Relevant sources: TDD Part 1 §4, §5; Decision Log DEC-014.

---

## Decision

Maintain a **single monorepo** managed with **pnpm workspaces + Turborepo** containing `apps/mobile`, `apps/backend`, and shared `packages/*` (`ui`, `design-tokens`, `api`, `database`, `ai`, `shared`), plus `docs/`, `scripts/`, and `tests/`. Shared contracts live in `packages/api` and `packages/shared` as the single source consumed by both client and Edge Functions. No new top-level folders are added without approval.

---

## Alternatives Considered

- **Polyrepo (separate app/backend/shared repos).** Rejected: contract drift risk, more release coordination, and worse context for a solo developer and AI agents.

---

## Consequences

**Positive.** App, functions, DB, and contracts move together; one type source end-to-end; Turborepo gives fast, cached CI.

**Trade-offs.** A monorepo needs dependency-direction discipline (enforced by lint: `features → domain → data → packages`); tooling must scope builds per package.

**Operational.** CODEOWNERS enforces ownership across areas within the one repo (TDD §4/§5).

---

## Dependencies

**Related** ADR-016 (thin client / shared contracts), ADR-022 (shared `ERR_*` enums), ADR-024 (CI builds the monorepo).

---

## Affected Documents

- TDD Part 1 §4 (repository structure), §5 (import/dependency rules)
- Decision Log DEC-014 (Monorepo)

---

## Review Trigger

Revisit on large team restructuring that would benefit from independent repo lifecycles.
