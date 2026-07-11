# CONTRIBUTING.md

# Architecture Decision Record (ADR) Contribution Guide

**Version:** 1.0.0  
**Status:** Approved  
**Owner:** Architecture Team

---

# Purpose

This document defines the governance process for creating, reviewing, approving, modifying, and retiring Architecture Decision Records (ADRs) within the PanchangPal project.

The objective is to ensure that all significant architectural decisions are:

- Documented
- Reviewable
- Traceable
- Consistent
- Maintainable

ADRs form the permanent architectural memory of the project.

---

# Scope

This document applies to:

- Software Architecture
- Mobile Architecture
- Backend Architecture
- AI Architecture
- Infrastructure
- Security
- Privacy
- DevOps
- Data Architecture
- Platform Engineering

It does **not** apply to:

- Product requirements
- UX decisions
- UI design
- Bug fixes
- Feature implementation
- Sprint planning

Those belong in their respective documentation.

---

# What is an ADR?

An Architecture Decision Record documents an important architectural decision that has long-term impact on the project.

Each ADR should explain:

- Why the decision was needed
- What decision was made
- Alternatives considered
- Consequences
- Trade-offs
- Dependencies
- Review triggers

An ADR should remain valuable years after it was written.

---

# When to Create an ADR

Create an ADR whenever a decision significantly affects:

## Architecture

Examples:

- Mobile framework
- Backend platform
- State management
- Repository structure
- Module boundaries
- Offline strategy

---

## Infrastructure

Examples:

- Cloud provider
- Hosting
- CDN
- Monitoring
- CI/CD

---

## AI

Examples:

- Model provider
- Prompt strategy
- RAG architecture
- Embedding strategy
- Safety architecture

---

## Security

Examples:

- Authentication
- Authorization
- Encryption
- Secrets management
- Identity provider

---

## Database

Examples:

- Database engine
- Multi-tenancy
- Migration strategy
- Data ownership
- Synchronization

---

## External Services

Examples:

- Payment provider
- Analytics provider
- Push notifications
- Email provider
- Search engine

---

## Development Process

Examples:

- Monorepo
- Release strategy
- Versioning
- Feature flags
- Documentation standards

---

# When NOT to Create an ADR

Do **not** create an ADR for:

- Bug fixes
- Refactoring
- Component implementation
- UI changes
- Screen design
- API implementation
- SQL queries
- Performance tuning
- Small library upgrades
- Internal helper utilities

If the decision is reversible with minimal effort and has no long-term architectural impact, it does not require an ADR.

---

# ADR Lifecycle

Every ADR follows the lifecycle below.

```
Draft
    │
    ▼
Proposed
    │
    ▼
Accepted
    │
    ▼
Implemented
    │
    ├─────────────► Deprecated
    │
    └─────────────► Superseded
```

## Draft

Initial document under discussion.

Not yet reviewed.

---

## Proposed

Architecture review has begun.

Feedback is expected.

---

## Accepted

Approved as the official architectural direction.

Implementation may not yet have started.

---

## Implemented

Decision has been fully reflected in the codebase.

---

## Deprecated

Decision remains historically important but should no longer be used for new development.

---

## Superseded

A newer ADR replaces this decision.

The original ADR must remain in the repository for historical traceability.

Never delete superseded ADRs.

---

# Approval Process

Every new ADR should be reviewed before becoming Accepted.

Recommended review sequence:

1. Architecture Review
2. Technical Review
3. Security Review (if applicable)
4. Product Review (if applicable)
5. Final Approval

For this project, the project owner is the final approver.

---

# Naming Convention

Use sequential numbering.

Examples:

```
ADR-001-Monorepo.md

ADR-002-React-Native-Expo.md

ADR-003-Supabase.md

ADR-004-Offline-First.md
```

Never renumber existing ADRs.

If an ADR is removed, its number remains permanently reserved.

---

# File Location

All ADRs must be stored in:

```
docs/architecture/adr/
```

No ADRs should exist elsewhere.

---

# Required Structure

Every ADR must contain:

- Title
- Status
- Date
- Decision Owner
- Context
- Decision
- Alternatives Considered
- Consequences
- Dependencies
- Affected Documents
- Review Trigger

Optional sections may include:

- Implementation Notes
- Security Considerations
- Migration Strategy
- Future Work

---

# Writing Guidelines

Every ADR should:

- Explain **why**, not just **what**
- Focus on architecture, not implementation
- Be technology-agnostic where possible
- Document trade-offs honestly
- Be concise
- Be understandable without reading source code

Avoid implementation details that belong in the TDD.

---

# Cross References

Whenever possible, reference related documentation.

Examples:

- MRD
- PRD
- PDD
- TDD
- Decision Log
- Architecture Summary
- Other ADRs

Cross-references improve traceability.

---

# Versioning Rules

ADRs are immutable records.

Do not rewrite historical decisions.

If the architecture changes:

1. Create a new ADR.
2. Mark the previous ADR as Superseded.
3. Reference both ADRs.

Never edit history to match the present.

---

# Numbering Rules

ADR numbers are:

- Sequential
- Unique
- Permanent

Examples:

```
ADR-001

ADR-002

ADR-003
```

Never reuse a number.

Never change an existing number.

---

# Relationship with Other Documentation

## MRD

Defines market requirements.

---

## PRD

Defines product behaviour.

---

## PDD

Defines user experience.

---

## TDD

Defines implementation architecture.

---

## ADR

Explains why architectural decisions exist.

---

## Decision Log

Chronological record of major project decisions.

---

# AI-Assisted Development

When AI coding agents create ADRs they must:

- Use approved project documentation.
- Never invent architecture.
- Never create ADRs from assumptions.
- Preserve repository formatting.
- Follow numbering rules.
- Update the ADR README index.
- Cross-reference related ADRs where appropriate.

If documentation is ambiguous:

Stop.

Request clarification.

---

# Pull Request Checklist

Before submitting an ADR:

- [ ] Decision has long-term architectural impact.
- [ ] Existing ADRs have been reviewed.
- [ ] Alternatives are documented.
- [ ] Trade-offs are explained.
- [ ] Dependencies are listed.
- [ ] Related documents are referenced.
- [ ] Review trigger is defined.
- [ ] README index is updated.
- [ ] Numbering is correct.
- [ ] Formatting matches repository standards.

---

# Repository Maintenance

Review the ADR repository periodically to ensure:

- Superseded ADRs are correctly marked.
- Cross-references remain valid.
- README index is current.
- Broken links are fixed.
- New architecture decisions are documented.

Do not remove historical ADRs.

Architectural history is valuable.

---

# Guiding Principle

> **An ADR captures why the architecture exists—not how it is implemented. The implementation belongs in the TDD; the rationale belongs in the ADR.**