# README.md

# PanchangPal AI Knowledge Base

**Version:** 1.0.0
**Status:** Living Document

---

# Welcome

Welcome to the PanchangPal AI Knowledge Base.

This directory contains the foundational documentation that enables both engineers and AI coding agents (Claude Code, Cursor, Codex, GitHub Copilot, etc.) to understand the project before making any implementation decisions.

The goal of this knowledge base is to ensure that:

* Every implementation follows the approved architecture.
* Every feature aligns with the product vision.
* Every design remains consistent.
* Every AI-generated change is grounded in documented requirements.
* Documentation and code evolve together.

This knowledge base should be treated as the primary onboarding resource for all contributors.

---

# Reading Order

Read the documents in the following order.

| Order | Document                     | Purpose                                        |
| ----- | ---------------------------- | ---------------------------------------------- |
| 00    | `00_QUICK_START.md`          | Entry point for every task                     |
| 01    | `01_PROJECT_CONTEXT.md`      | Vision, mission, business context              |
| 02    | `02_PRODUCT_CONTEXT.md`      | Users, journeys, product principles            |
| 03    | `03_ARCHITECTURE_CONTEXT.md` | System architecture and engineering principles |
| 04    | `04_DESIGN_CONTEXT.md`       | UX philosophy and design principles            |
| 05    | `05_CODING_STANDARDS.md`     | Engineering rules and implementation standards |
| 06    | `06_GLOSSARY.md`             | Canonical terminology and identifiers          |
| 07    | `07_DECISION_LOG.md`         | Strategic project decisions                    |
| 08    | `08_SYSTEM_MAP.md`           | High-level architecture diagrams               |

Always begin with **Quick Start**.

---

# Relationship to the Main Documentation

This folder provides context.

Detailed implementation specifications remain in the core project documentation.

| Document               | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| MRD                    | Market strategy and validation            |
| PRD                    | Product requirements                      |
| PDD (Parts 1–5)        | UX specification and design system        |
| TDD (Parts 1–5)        | Technical architecture and implementation |
| ADRs                   | Architecture decisions                    |
| API Specification      | Backend contracts — **TDD Part 2 §5 (API_* contracts)**            |
| Database Specification | Schema, migrations, RLS — **TDD Part 2 §1–4**                      |
| Prompt Registry        | AI prompt metadata — **TDD Part 3 §5A**                           |
| Model Registry         | AI model lifecycle — **TDD Part 3 §2A**                           |
| AI Configuration Registry | Operational AI parameters — **TDD Part 3 §8A**                 |
| AI Version Compatibility / Release Gate | **TDD Part 3 §10A / §10B**                       |

The files in this directory summarize and connect these documents—they do not replace them.

---

# Source of Truth Hierarchy

When multiple documents discuss the same topic, follow this order of precedence:

1. Market Requirements Document (MRD)
2. Product Requirements Document (PRD)
3. Product Design Document (PDD / UX Specification)
4. Technical Design Document (TDD)
5. Architecture Decision Records (ADRs)
6. AI Knowledge Base (`docs/ai`)
7. Source Code
8. Comments and Examples

If a conflict exists:

* Stop implementation.
* Document the conflict.
* Request clarification.
* Do not make assumptions.

---

# Directory Structure

```text
docs/
└── ai/
    ├── README.md
    ├── 00_QUICK_START.md
    ├── 01_PROJECT_CONTEXT.md
    ├── 02_PRODUCT_CONTEXT.md
    ├── 03_ARCHITECTURE_CONTEXT.md
    ├── 04_DESIGN_CONTEXT.md
    ├── 05_CODING_STANDARDS.md
    ├── 06_GLOSSARY.md
    ├── 07_DECISION_LOG.md
    └── 08_SYSTEM_MAP.md
```

Future additions may include the KB summaries below. Their substantive content **already exists** in the TDD and should be summarized here (not duplicated) when authored:

```text
09_API_GUIDELINES.md      → source: TDD Part 2 §5 (API_* contracts) + §5.0 conventions
10_SECURITY_CONTEXT.md    → source: TDD Part 5 §5 (threat model, DevSecOps) + §4 (secrets) + TDD Part 2 §4 (RLS)
11_TESTING_CONTEXT.md     → source: TDD Part 4 §10.3 + TDD Part 5 §2.2 (CI gates) + PDD §15.4
12_RELEASE_PLAYBOOK.md    → source: TDD Part 5 §3 (release mgmt) + §10 (launch plan) + TDD Part 3 §10B (AI release gate)
```

---

# How to Use This Knowledge Base

## Product Questions

Read:

* Project Context
* Product Context
* Decision Log

---

## UX Questions

Read:

* Design Context
* PDD
* Component Library

---

## Engineering Questions

Read:

* Architecture Context
* Coding Standards
* TDD

---

## AI Questions

Read:

* Architecture Context
* TDD Part 3
* Model Registry
* Prompt Registry

---

## Terminology

Read:

* Glossary

---

## Historical Decisions

Read:

* Decision Log
* ADRs

---

# Principles for AI Coding Agents

Before writing any code:

1. Read `00_QUICK_START.md`.
2. Determine which feature is being modified.
3. Read the relevant product, design, and architecture context.
4. Review the applicable PDD and TDD sections.
5. Search for existing implementations before creating new ones.
6. Verify dependencies and contracts.
7. Implement the change.
8. Update documentation if required.

Never skip documentation review.

---

# Documentation Maintenance

This knowledge base is a **living system**.

Update it whenever:

* Product direction changes.
* UX principles change.
* Architecture changes.
* Coding standards evolve.
* Terminology changes.
* Strategic decisions are made.

Documentation should evolve together with the codebase.

---

# Contribution Guidelines

When adding new documentation:

* Follow the existing naming convention.
* Keep documents focused on a single responsibility.
* Cross-reference related documents instead of duplicating content.
* Use consistent terminology from the Glossary.
* Record strategic changes in the Decision Log.
* Record architectural changes in ADRs.

Avoid creating overlapping documentation.

---

# Guiding Principles

Every contributor—human or AI—should strive to:

* Preserve trust.
* Preserve simplicity.
* Preserve accessibility.
* Preserve architectural consistency.
* Preserve product intent.
* Reuse existing solutions before creating new ones.
* Keep documentation synchronized with implementation.

The objective is not simply to build software—it is to build a product that remains understandable, maintainable, and trustworthy throughout its lifetime.

---

# First Rule

> **If you have not read the documentation, you are not ready to write code.**

Every successful implementation begins with understanding the product, the users, the architecture, and the decisions that shaped the system.
