# TASK.md

# PanchangPal — Current Task

Version: 1.0.0

Last Updated: 2026-07-11 19:40

Purpose:
This document defines the current implementation task.
Claude should stay focused on this task and avoid expanding into unrelated work unless explicitly instructed.

---

# Previous Task

## Title

Generate Architecture Decision Records (ADRs)

Status

✅ Complete

Outcome

32 ADRs (ADR-001…ADR-032), ADR_TEMPLATE.md, README index, and an ADR governance guide (CONTRIBUTING.md) created under docs/architecture/adr/. Decision Log cross-referenced. No architecture changed.

---

# Current Task

## Title

Generate the OpenAPI Specification

Status

🟡 Ready to Start

Priority

🔴 Critical

Estimated Effort

1–2 Sessions

---

# Objective

Produce the OpenAPI 3.1 specification for PanchangPal's approved API surface by extracting the API_* contracts implied by the approved documentation.

Document only approved APIs. Do **not** invent endpoints, DTOs, or behaviour.

---

# Inputs

Use only approved documentation:

- docs/tdd/ (especially Part 1 §1.2/§1.3 contracts, §7.14 versioning; Part 2 API annexes when available)
- docs/pdd/ (API_* references in Part 2 annexes / §3.0A.3)
- docs/architecture/adr/ (ADR-022 error envelope, ADR-032 versioning, ADR-006 Edge Functions, ADR-018 RLS/auth)
- docs/ai/07_DECISION_LOG.md

If documentation is ambiguous or conflicting:
- Stop.
- Explain the issue.
- Request clarification.

Do not make assumptions.

---

# Deliverables

Create:

docs/api/

Including:

- OpenAPI 3.1 specification
- DTO/schema definitions (aligned to packages/api intent)
- Authentication scheme (Supabase JWT / anonymous → authenticated)
- Request/response validation rules
- Standard error responses (ERR_* envelope, per ADR-022)
- Version negotiation per ADR-032
- Examples

---

# Success Criteria

This task is complete when:

- Every approved API_* endpoint has a documented contract.
- Auth, validation, and error responses are specified.
- Versioning aligns with ADR-032; errors align with ADR-022.
- No undocumented endpoints or behaviour introduced.
- Spec is internally consistent and references approved identifiers.

---

# Constraints

Do not:
- Change architecture.
- Modify MRD, PRD, PDD, or TDD.
- Implement code or Edge Functions.
- Create database schema (separate task).
- Build application features.

This task is documentation only.

---

# After Completion

1. Update SESSION.md.
2. Update PROJECT_STATUS.md.
3. Update TASK.md with the next task.
4. Recommend the next task.

The next planned task is:

Generate the Database Schema and Supabase migrations.
