# CONTRIBUTING.md

# Contributing to PanchangPal

**Version:** 1.0.0
**Status:** Living Document
**Owner:** Engineering

---

# Welcome

Thank you for contributing to PanchangPal.

PanchangPal is a long-term product built around **trust**, **simplicity**, **accessibility**, and **maintainability**.

Whether you are:

* a human developer,
* an AI coding agent,
* a designer,
* a product manager,
* or a QA engineer,

your responsibility is **not simply to write code**, but to preserve the integrity of the platform.

---

# Engineering Philosophy

Every contribution should improve at least one of the following:

* Simplicity
* Maintainability
* Reliability
* Accessibility
* Performance
* Security
* Trust

Never sacrifice long-term quality for short-term convenience.

---

# Before You Write Code

Every contributor must complete the following checklist.

## Read the AI Knowledge Base

Read in order:

```text
docs/ai/
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

---

## Read the Relevant Specifications

Depending on your task:

### Product

* MRD
* PRD

### UX

* PDD Parts 1–5

### Backend

* TDD Parts 1–5

### Architecture

* ADRs

### Database

* Database Specification
* Migration History

### AI

* AI Architecture — **TDD Part 3**
* Model Registry — **TDD Part 3 §2A**
* Prompt Registry — **TDD Part 3 §5A**
* AI Configuration Registry — **TDD Part 3 §8A**
* AI Version Compatibility Matrix / Release Gate — **TDD Part 3 §10A / §10B**

Never begin implementation without understanding the relevant documentation.

---

# Development Workflow

Every feature follows the same lifecycle.

```text
Idea
↓

Requirements Review

↓

Architecture Review

↓

Implementation Plan

↓

Development

↓

Testing

↓

Documentation Update

↓

Code Review

↓

Merge

↓

Release
```

Skipping stages is not permitted.

---

# Branching Strategy

Create feature branches from `main`.

Use the following naming convention:

```text
feature/<feature-name>
bugfix/<issue-name>
hotfix/<issue-name>
refactor/<module-name>
docs/<topic>
test/<feature-name>
chore/<task>
```

Examples:

```text
feature/ask-guru-streaming
bugfix/offline-sync
refactor/api-adapter
docs/tdd-part4
```

Never commit directly to `main`.

---

# Commit Message Convention

Use Conventional Commits.

Format:

```text
type(scope): summary
```

Examples:

```text
feat(ai): add groundedness validation

fix(sync): resolve offline conflict handling

refactor(api): extract payment adapter

docs(pdd): update component governance

test(auth): add session refresh tests
```

Allowed types:

* feat
* fix
* refactor
* docs
* test
* chore
* perf
* build
* ci
* revert

---

# Pull Request Requirements

Every Pull Request must include:

## Summary

What changed?

---

## Motivation

Why was this change required?

---

## Linked Requirement

Reference:

* MRD
* PRD
* PDD
* TDD
* Issue

---

## Testing

Include:

* Unit tests
* Integration tests
* Manual verification

---

## Accessibility Impact

Document:

* VoiceOver
* TalkBack
* Dynamic Type
* Reduced Motion

---

## Performance Impact

Explain:

* Render performance
* API performance
* Memory usage

---

## Documentation Impact

Specify which documents were updated.

---

## Screenshots

Required for all UI changes.

---

# Code Review Checklist

Reviewers must verify:

* Product requirements implemented
* Architecture preserved
* Existing components reused
* Design tokens used
* Accessibility maintained
* Security preserved
* Performance budgets respected
* Analytics instrumented
* Error handling complete
* Tests passing
* Documentation updated

No pull request should be approved until every item is verified.

---

# Documentation Requirements

Documentation is part of the implementation.

Update documentation whenever changes affect:

* Product behaviour
* UX
* Architecture
* Database
* API contracts
* AI behaviour
* Design System
* Analytics
* Security

Never allow documentation to drift from implementation.

---

# Testing Standards

Every feature should include appropriate automated tests.

## Unit Tests

Required for:

* Utilities
* Hooks
* Services
* Business logic

---

## Component Tests

Required for reusable UI components.

---

## Integration Tests

Required for:

* APIs
* Authentication
* Database
* Synchronization

---

## End-to-End Tests

Required for critical journeys:

* Sign In
* Today's Panchang
* Ritual Completion
* Ask Guru
* Subscription
* Household

Critical features should not be released without end-to-end coverage.

---

# Security Requirements

Every contribution must:

* Validate inputs
* Escape outputs
* Respect RLS
* Protect secrets
* Follow least privilege
* Avoid exposing sensitive data

Never commit:

* API keys
* Tokens
* Passwords
* Certificates
* Secrets

---

# Accessibility Requirements

Accessibility is mandatory.

Every feature must support:

* VoiceOver
* TalkBack
* Dynamic Type
* WCAG AA
* Reduced Motion
* Minimum touch targets
* Screen reader labels

Accessibility regressions block release.

---

# Performance Requirements

Every contribution should:

* Minimize re-renders
* Optimize bundle size
* Respect API budgets
* Cache appropriately
* Lazy-load where appropriate
* Avoid blocking the UI thread

Performance regressions require review.

---

# AI Development Guidelines

AI-generated code is subject to the same quality standards as human-written code.

AI coding agents must:

* Read documentation before coding.
* Search for existing implementations.
* Reuse components.
* Preserve architecture.
* Preserve accessibility.
* Preserve security.
* Preserve design consistency.

AI must never:

* Invent business logic
* Invent APIs
* Invent database schema
* Invent UX
* Duplicate components
* Bypass architecture layers

If documentation is ambiguous:

Stop and request clarification.

---

# Decision Making

When multiple valid implementations exist:

Prefer the option that is:

1. Simpler
2. More maintainable
3. Easier to test
4. More accessible
5. More secure
6. Lower operational cost
7. More consistent with existing architecture

Consistency is more valuable than novelty.

---

# Definition of Done

A task is complete only when:

* Product requirements satisfied
* UX matches the PDD
* Architecture follows the TDD
* Tests pass
* Accessibility verified
* Performance acceptable
* Security reviewed
* Analytics implemented
* Documentation updated
* Code reviewed
* CI pipeline passes

Incomplete work should never be merged.

---

# Release Readiness

Before a release:

* All critical bugs resolved
* All required tests passing
* Crash-free build verified
* Accessibility audit completed
* Security review completed
* Documentation synchronized
* Monitoring configured
* Rollback plan available

For **AI changes** (models, prompts, thresholds, corpus), additionally pass the **AI Release Readiness Review (TDD Part 3 §10B)** and promote a validated **AISET version bundle (§10A)** with a verified rollback.

---

# Reporting Issues

When reporting a bug, include:

* Summary
* Expected behaviour
* Actual behaviour
* Steps to reproduce
* Device
* OS version
* App version
* Screenshots or recordings
* Logs (if available)

Good bug reports reduce resolution time.

---

# Communication Principles

When reviewing code:

* Be respectful.
* Explain reasoning.
* Focus on the code, not the person.
* Suggest improvements with context.
* Encourage learning.

The goal is a better product, not winning arguments.

---

# Guiding Principles

Every contributor should leave the project in a better state than they found it.

Small improvements compound over time.

If a change makes the code:

* simpler,
* clearer,
* safer,
* faster,
* more accessible,
* or easier to maintain,

it is almost always the right change.

---

# Project Motto

> **Build software that users can trust, engineers can maintain, and AI can understand.**
