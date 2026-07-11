# ADR-027 — Documentation-First Development

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Product / Architecture

---

## Context

PanchangPal is built by a solo founder with AI coding agents, where the single largest structural risk is loss of context (MRD Risk §12; TRISK-11). The product also depends on strict traceability — screens, flows, APIs, tables, and events share identifiers so an incident can be followed end-to-end. Both concerns require that intent be captured in documentation before code, and that a source-of-truth hierarchy govern conflicts.

Relevant sources: TDD Part 1 §1.1, §5, §10; Decision Log DEC-020, DEC-021.

---

## Decision

Adopt **documentation-first development**: product, UX, and architecture documentation (MRD → PRD → PDD → TDD → ADRs → Design System → Issues → Tasks) are completed before implementation, and this precedence is the source-of-truth hierarchy. Requirements, business rules, navigation, schema, API contracts, analytics events, error codes, and identifiers are never invented in code; where documentation is ambiguous or documents conflict, work stops and clarification is requested rather than guessed. Material technical decisions are recorded as ADRs, and code and documentation are kept synchronized.

---

## Alternatives Considered

- **Code-first, document-later.** Rejected: loses context for a solo founder and AI agents, breaks traceability, and invites invented requirements.

---

## Consequences

**Positive.** Preserved institutional memory; end-to-end traceability; AI agents and future hires can extend the system without re-deriving context; conflicts are surfaced, not guessed.

**Trade-offs.** Upfront documentation effort and the discipline to keep docs synchronized with code as architecture changes.

**Operational.** ADRs (this record set) are part of that documentation; the Decision Log is the institutional memory it references.

---

## Dependencies

**Related** ADR-014 (docs live in the monorepo), all ADRs (this is the process that produces them).

---

## Affected Documents

- TDD Part 1 §1.1, §5 (comments/documentation), §10
- Decision Log DEC-020 (Documentation-First), DEC-021 (AI must never invent requirements)
- Project CLAUDE.md (source-of-truth hierarchy)

---

## Review Trigger

Never as a principle; reassess only if the team scales to a size where a different governance model is warranted.
