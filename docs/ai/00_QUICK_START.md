# QUICK_START.md

# PanchangPal — AI Engineering Quick Start Guide

**Version:** 1.0.0
**Status:** Living Document
**Audience:** Claude Code, Cursor, Codex, GitHub Copilot, Engineers

---

# Purpose

This document is the **first document every AI coding agent and engineer should read before making any changes** to the PanchangPal codebase.

Its purpose is to:

* Understand the project
* Find the correct documentation
* Follow the Source of Truth
* Avoid duplicate work
* Preserve architecture
* Preserve UX consistency

This document is intentionally short.

Read this before opening any other document.

---

# Step 1 — Understand What PanchangPal Is

Before writing code, read:

📄 `docs/ai/01_PROJECT_CONTEXT.md`

This explains:

* Product vision
* Mission
* Product principles
* Target users
* Business goals
* Success metrics

Never implement features without understanding why they exist.

---

# Step 2 — Understand the Architecture

Read:

📄 `docs/ai/03_ARCHITECTURE_CONTEXT.md`

This explains:

* Architecture layers
* System boundaries
* Data flow
* AI architecture
* Offline architecture
* Repository structure
* Adapter patterns

Never invent architecture.

---

# Step 3 — Understand the Product

Read:

📄 `docs/ai/02_PRODUCT_CONTEXT.md`

This explains:

* User journeys
* Personas
* Product philosophy
* Product scope
* Feature boundaries
* Product constraints

Never add features outside the approved scope.

---

# Step 4 — Understand the Design

Read:

📄 `docs/ai/04_DESIGN_CONTEXT.md`

This explains:

* UX principles
* Design philosophy
* Motion
* Accessibility
* Components
* Interaction rules

Never invent UI.

---

# Step 5 — Understand Engineering Rules

Read:

📄 `docs/ai/05_CODING_STANDARDS.md`

This defines:

* Folder structure
* Naming
* TypeScript rules
* Testing
* Performance
* Security
* Accessibility
* Git workflow

Follow these rules without exception.

---

# Step 6 — Learn the Project Vocabulary

Read:

📄 `docs/ai/06_GLOSSARY.md`

Never invent terminology.

Use approved:

* Screen IDs
* Component IDs
* API IDs
* Error IDs
* Event IDs
* Flow IDs

Consistency matters.

---

# Step 7 — Review Previous Decisions

Read:

📄 `docs/ai/07_DECISION_LOG.md`

Before proposing changes ask:

Has this already been decided?

If yes,

Preserve the decision.

Do not silently reverse it.

---

# Step 8 — Check Architecture Decisions

Read:

📄 **TDD Part 1 §6 (Architecture Decision Records)** — the ADRs currently live here.
📄 `docs/ai/07_DECISION_LOG.md` → **DEC ↔ ADR Cross-Reference Map** links strategic decisions to their governing ADRs.

*(If a dedicated `docs/architecture/ADR/` folder is created later, move the ADRs there and update this pointer.)*

Every architectural decision has a rationale.

Understand it before proposing alternatives.

---

# Step 9 — Determine Which Documents Apply

## Product Changes

Read:

* MRD
* PRD

---

## UX Changes

Read:

* PDD Part 1
* PDD Part 2
* PDD Part 3
* PDD Part 4
* PDD Part 5

---

## Architecture Changes

Read:

* TDD Part 1
* TDD Part 2
* TDD Part 3
* TDD Part 4
* TDD Part 5

---

## AI Changes

Read:

* TDD Part 3 (AI / RAG Subsystem)
* Prompt Registry — **TDD Part 3 §5A**
* Model Registry — **TDD Part 3 §2A**
* AI Configuration Registry — **TDD Part 3 §8A**
* AI Release Readiness Review — **TDD Part 3 §10B**

---

## Database Changes

Read:

* Database Schema
* Migration History
* RLS Policies

---

## API Changes

Read:

* API Contracts
* DTOs
* Error Registry

---

## Component Changes

Read:

* Component Library
* Design Tokens
* Component Governance

---

# Step 10 — Search Before Creating

Before creating:

## Component

Search:

```text
CMP_*
```

---

## Screen

Search:

```text
SCR_*
```

---

## Flow

Search:

```text
FLOW_*
```

---

## API

Search:

```text
API_*
```

---

## Event

Search:

```text
EVT_*
```

---

## Error

Search:

```text
ERR_*
```

---

## Service

Search:

```text
SVC_*
```

---

## Hook

Search:

```text
use*
```

Never duplicate functionality.

---

# Step 11 — Validate Dependencies

Before implementing anything verify:

* Required APIs exist.
* Database schema exists.
* Component exists.
* Design tokens exist.
* Analytics event exists.
* Error codes exist.
* Feature flag exists.
* Tests exist or are planned.

If something is missing,

Stop.

Request clarification.

---

# Step 12 — Follow the Source of Truth

Always follow this order:

1. MRD
2. PRD
3. PDD
4. TDD
5. ADR
6. Design System
7. Component Library
8. API Contracts
9. Coding Standards

If documents disagree,

Do not guess.

Raise the conflict.

---

# Implementation Workflow

Always follow this sequence:

Understand Requirement

↓

Read Relevant Documentation

↓

Search Existing Implementation

↓

Identify Dependencies

↓

Design Solution

↓

Implement

↓

Write Tests

↓

Accessibility Review

↓

Performance Review

↓

Security Review

↓

Documentation Update

↓

Submit

Never skip steps.

---

# Required Reading by Task

| Task            | Documents                                                                             |
| --------------- | ------------------------------------------------------------------------------------- |
| New Screen      | PROJECT_CONTEXT → PRODUCT_CONTEXT → DESIGN_CONTEXT → PDD Parts 1–3 → CODING_STANDARDS |
| New Component   | DESIGN_CONTEXT → PDD Part 3 → CODING_STANDARDS                                        |
| Backend API     | ARCHITECTURE_CONTEXT → TDD Parts 1–2 → CODING_STANDARDS                               |
| Database Change | ARCHITECTURE_CONTEXT → TDD Part 2 → ADRs                                              |
| AI Feature      | PROJECT_CONTEXT → ARCHITECTURE_CONTEXT → TDD Part 3                                   |
| Notification    | PRODUCT_CONTEXT → PDD Part 4 → TDD                                                    |
| Subscription    | PRODUCT_CONTEXT → TDD Payments → CODING_STANDARDS                                     |
| Analytics       | PRODUCT_CONTEXT → PDD Part 5 → TDD → Analytics Registry                               |
| Bug Fix         | Relevant feature documentation + existing implementation                              |

---

# Before Opening a Pull Request

Confirm:

✓ Product requirements satisfied

✓ UX unchanged unless approved

✓ Architecture preserved

✓ Existing components reused

✓ Design tokens used

✓ Accessibility verified

✓ Tests added or updated

✓ Performance budgets respected

✓ Analytics instrumented

✓ Error handling complete

✓ Security reviewed

✓ Documentation updated

---

# Stop Immediately If...

Stop and ask for clarification if:

* Product requirements are unclear.
* Documentation conflicts.
* API contract is missing.
* Database schema is missing.
* UX is undefined.
* Architecture must change.
* Security implications are uncertain.
* Accessibility requirements are unclear.
* Existing components cannot be found.
* Business rules are missing.

Never invent requirements.

---

# Golden Rules

Always:

* Read before coding.
* Reuse before creating.
* Search before implementing.
* Test before merging.
* Document before closing.
* Preserve architecture.
* Preserve UX.
* Preserve accessibility.
* Preserve trust.

---

# One-Line Philosophy

> **Every line of code should make PanchangPal more trustworthy, more maintainable, more accessible, and easier for both humans and AI agents to understand.**
