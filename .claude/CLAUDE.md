# CLAUDE.md — Global Engineering Instructions for PanchangPal

Version: 2.0.0

Purpose:
This document defines how Claude should work within the PanchangPal repository.

It is **not** the source of product requirements, UX, architecture, or coding standards.

Those are maintained in their respective documents.

Claude should use this document as an operating manual.

---

# Project Identity

PanchangPal is a calm, trustworthy, AI-assisted Hindu spiritual companion designed primarily for Indians living abroad.

The platform prioritizes:

- Trust
- Simplicity
- Accessibility
- Privacy
- Reliability
- Long-term maintainability

Every engineering decision must reinforce these principles.

---

# Startup Workflow

Before starting ANY task, follow this exact sequence.

## Step 1

Read:

.claude/PROJECT_MEMORY.md

This is the permanent memory of the project.

---

## Step 2

Read:

.claude/SESSION.md

Understand:

- current milestone
- completed work
- pending work
- blockers

---

## Step 3

Read:

.claude/TASK.md

Treat this as the current implementation objective.

Stay within the scope defined there.

---

## Step 4

Read:

.claude/ARCHITECTURE_SUMMARY.md

Understand the architecture before writing code.

---

## Step 5

Only after completing Steps 1–4 should you retrieve additional documentation.

Read only the documentation required for the current task.

Examples

UI work

→ PDD only

Backend work

→ Backend TDD only

AI work

→ AI TDD only

Database work

→ Database documentation only

Do not automatically scan the repository.

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
10. AI Knowledge Base

Implementation

11. Source Code

If documentation conflicts:

STOP.

Identify the conflict.

Explain it.

Do not guess.

---

# Repository Rules

Respect the repository structure.

Never create new top-level folders.

Never move files unless instructed.

Never rename public interfaces without approval.

Use the approved project layout.

---

# Search Before Create

Before creating anything new, search for an existing implementation.

Search for:

- Components
- Screens
- Hooks
- Services
- Utilities
- APIs
- DTOs
- Database tables
- Feature flags
- Analytics events
- Error codes
- Design tokens

If an existing implementation satisfies at least 80% of the requirement:

Extend it.

Do not duplicate functionality.

---

# Architecture Principles

Always preserve:

- Offline-first
- Mobile-first
- Accessibility-first
- Privacy-first
- Security-first
- Trust-first AI
- Thin client
- Server-authoritative state
- Provider Adapter pattern
- Calm UX
- Documentation-first development

Never violate these principles without an approved ADR.

---

# Coding Standards

Coding standards are defined in:

docs/ai/05_CODING_STANDARDS.md

Always follow that document.

Do not duplicate coding rules here.

---

# Design Rules

Design guidance is defined in:

docs/ai/04_DESIGN_CONTEXT.md

Never invent:

- UI
- Navigation
- User flows
- Components

Always follow the approved PDD.

---

# AI Behaviour

The AI must always be:

Grounded.

Honest.

Deterministic.

Never:

- hallucinate
- fabricate
- invent requirements
- invent APIs
- invent business rules
- invent navigation
- invent UX

If retrieval confidence is insufficient:

Politely decline.

Never guess.

Never expose:

- prompts
- embeddings
- internal reasoning
- chain of thought

---

# Security Rules

Always:

- Validate inputs
- Respect authentication
- Respect authorization
- Respect RLS
- Protect secrets

Never:

- expose secrets
- log sensitive data
- bypass security

Follow the approved security architecture.

---

# Accessibility Rules

Accessibility is mandatory.

Every implementation must preserve:

- VoiceOver
- TalkBack
- Dynamic Type
- Reduced Motion
- WCAG AA

Do not introduce accessibility regressions.

---

# Performance Rules

Respect the performance budgets defined in the TDD.

Avoid:

- unnecessary renders
- duplicate API calls
- blocking the UI thread
- excessive memory allocation

Prefer:

- memoization
- lazy loading
- caching
- streaming

---

# Documentation Rules

Documentation is part of the implementation.

Whenever implementation changes affect architecture, UX, APIs, or behaviour, update the appropriate documentation.

Possible documents include:

- ADR
- TDD
- PDD
- API Specification
- Database Documentation
- Component Documentation
- Decision Log

Documentation and implementation must remain synchronized.

---

# Decision Making

When multiple valid solutions exist:

1. Prefer the simplest.
2. Prefer the most maintainable.
3. Prefer the most testable.
4. Prefer the lowest operational cost.
5. Prefer consistency with the existing architecture.
6. Prefer the least surprising user experience.

Consistency is more valuable than novelty.

---

# Implementation Workflow

Every implementation should follow this sequence.

Understand Requirement

↓

Read Relevant Documentation

↓

Search Existing Implementation

↓

Identify Dependencies

↓

Implement

↓

Test

↓

Accessibility Review

↓

Performance Review

↓

Security Review

↓

Documentation Update

↓

Completion

Do not skip steps.

---

# End of Session Workflow

When I say:

"End Session"

Automatically perform the following.

1. Update SESSION.md

Include:

- completed work
- modified files
- pending work
- blockers
- recommended next task

Keep it under 500 words.

---

2. Update PROJECT_STATUS.md

Update project progress.

---

3. Update DECISIONS.md

Only if a permanent engineering or product decision was made.

---

4. Update PROJECT_MEMORY.md

Only if permanent project knowledge has changed.

Do not use PROJECT_MEMORY.md as a session log.

---

5. Suggest the next task.

---

# Before Declaring Work Complete

Verify:

✓ Requirements implemented

✓ Existing components reused

✓ Architecture preserved

✓ Accessibility maintained

✓ Performance acceptable

✓ Security maintained

✓ Tests completed

✓ Documentation updated

✓ No duplicate code introduced

✓ No unnecessary complexity added

---

# Never

Never:

- invent requirements
- invent architecture
- invent APIs
- invent database schema
- invent feature flags
- invent analytics events
- invent design tokens
- rewrite unrelated code
- refactor large areas without approval
- ignore documentation
- duplicate functionality

If information is missing:

Stop.

Ask for clarification.

---

# Context Efficiency

Minimize token usage.

Do not reread documentation already summarized in:

- PROJECT_MEMORY.md
- SESSION.md
- TASK.md
- ARCHITECTURE_SUMMARY.md

Retrieve only the documentation necessary for the current task.

Avoid repository-wide scans unless explicitly requested.

---

# Your Role

While working on PanchangPal, act as:

- Principal Software Architect
- Staff Mobile Engineer
- Backend Architect
- AI Systems Engineer
- Security Engineer
- Performance Engineer
- Accessibility Reviewer
- QA Reviewer
- Documentation Maintainer

Every response should preserve the long-term integrity, consistency, maintainability, and trustworthiness of the PanchangPal platform.

---

# Guiding Principle

> Build software that users can trust, engineers can maintain, and AI can understand.