# CODING_STANDARDS.md

# PanchangPal — Engineering Coding Standards

**Version:** 1.0.0
**Status:** Living Document
**Owner:** Engineering

---

# Purpose

This document defines the mandatory engineering standards for PanchangPal.

It applies to:

* Frontend Engineers
* Backend Engineers
* AI Engineers
* DevOps Engineers
* QA Engineers
* Claude Code
* Cursor
* Codex
* GitHub Copilot

These standards exist to ensure the codebase remains:

* Maintainable
* Consistent
* Testable
* Performant
* Accessible
* Secure
* AI-friendly

These rules are mandatory unless an approved Architecture Decision Record (ADR) explicitly allows an exception.

---

# Engineering Philosophy

Every line of code should optimize for:

* Simplicity
* Readability
* Maintainability
* Explicitness
* Deterministic behaviour
* Testability
* Performance
* Accessibility

Never optimize for cleverness.

Code is read far more often than it is written.

---

# Source of Truth

Always follow this precedence order.

1. MRD
2. PRD
3. PDD / UX Specification
4. TDD
5. ADRs
6. API Contracts
7. Database Schema
8. Coding Standards

If documents conflict:

STOP.

Identify the conflict.

Do not guess.

---

# Technology Stack

## Mobile

* React Native
* Expo
* Expo Router
* TypeScript

## State Management

* Zustand
* TanStack Query

## Backend

* Supabase
* PostgreSQL
* Edge Functions

## AI

* OpenAI Provider Adapter
* pgvector
* RAG

## Payments

* RevenueCat

## Notifications

* Expo Notifications

## Monitoring

* Sentry

Never introduce new frameworks without architectural approval.

---

# General Coding Principles

Always:

* Prefer composition over inheritance.
* Write self-documenting code.
* Keep functions small.
* Keep files cohesive.
* Eliminate duplication.
* Fail fast.
* Handle errors explicitly.
* Make side effects obvious.

Never:

* Use magic numbers.
* Use magic strings.
* Copy business logic.
* Bypass architecture layers.
* Ignore compiler warnings.

---

# TypeScript Standards

Mandatory:

* `"strict": true`
* `"noImplicitAny": true`
* `"strictNullChecks": true`

Never use:

```typescript
any
```

Prefer:

```typescript
unknown
```

or explicit interfaces.

Always define:

* Interfaces
* Types
* Enums
* DTOs

Avoid type assertions unless unavoidable.

---

# File Organization

One responsibility per file.

Recommended order:

1. Imports
2. Constants
3. Types
4. Component/Class
5. Helper Functions
6. Exports

Avoid files larger than ~300 lines unless justified.

---

# Naming Conventions

## Components

```text
PascalCase
```

Example

```text
PrimaryButton.tsx
```

---

## Hooks

```text
useSomething()
```

Example

```text
useRitualProgress()
```

---

## Functions

camelCase

```typescript
calculateStreak()
```

---

## Variables

camelCase

---

## Constants

```text
UPPER_SNAKE_CASE
```

Example

```text
MAX_RETRY_COUNT
```

---

## Types

PascalCase

```typescript
UserProfile
```

---

## Enums

PascalCase

```typescript
SubscriptionStatus
```

---

## Database Tables

snake_case

Example

```text
household_member
```

---

## API Endpoints

Use approved identifiers.

Example

```text
API_GET_TODAY
API_POST_ASK_GURU
```

Never invent new naming patterns.

---

# Folder Structure

Respect the repository architecture.

```text
apps/
packages/
docs/
tests/
scripts/
```

Never create new top-level folders.

Feature modules should remain self-contained.

---

# Imports

Import order:

1. React
2. Third-party libraries
3. Internal packages
4. Relative imports

Avoid circular dependencies.

Prefer absolute imports where configured.

---

# React Standards

Always:

* Functional components
* Hooks
* Memoization where beneficial
* Explicit props
* Small reusable components

Never:

* Class components
* Inline business logic
* Large render methods

---

# State Management

Use:

## Zustand

For:

* Local UI state
* Session state
* Temporary state

Use:

## TanStack Query

For:

* Server state
* Caching
* Synchronization
* Pagination
* Mutations

Never duplicate server state inside Zustand.

---

# Component Standards

Before creating a component:

1. Search Component Library.
2. Search existing variants.
3. Extend existing component.
4. Create new only if necessary.

Every reusable component should:

* Be accessible
* Support loading states
* Support disabled states
* Support error states
* Support design tokens
* Be fully typed

---

# Styling Standards

Never hard-code:

* Colors
* Typography
* Radius
* Shadows
* Spacing
* Motion

Always use Design Tokens.

Example:

```typescript
spacing.md
color.surface.primary
radius.lg
motion.success.small
```

---

# Business Logic

Business logic belongs in:

* Services
* Domain modules
* Use cases

Never inside:

* Screens
* UI Components

Presentation should remain presentation-only.

---

# API Standards

Every API call must:

* Use typed DTOs
* Handle retries
* Handle timeouts
* Handle authentication
* Handle authorization
* Handle network failures

Always use approved API contracts.

Never call endpoints not defined in the TDD.

---

# Error Handling

Always return structured errors.

Use approved:

```text
ERR_*
```

Examples

```text
ERR_NETWORK_TIMEOUT

ERR_AI_TIMEOUT

ERR_AUTH_EXPIRED
```

Never display raw exceptions to users.

Log unexpected errors through Sentry.

---

# Logging

Log:

* Errors
* Warnings
* Important business events

Never log:

* Passwords
* JWTs
* API Keys
* Personal data
* AI prompts
* Sensitive religious queries

---

# Security Standards

Always:

* Validate inputs
* Escape outputs
* Enforce RLS
* Protect secrets
* Use least privilege
* Verify authentication
* Verify authorization

Never bypass security controls.

---

# Privacy Standards

Collect minimum data.

Never:

* Store unnecessary PII
* Send sensitive data to analytics
* Persist AI conversations longer than policy allows

Follow applicable privacy regulations.

---

# Accessibility Standards

Every screen must support:

* VoiceOver
* TalkBack
* Dynamic Type
* WCAG AA
* Reduced Motion
* Minimum 44×44 touch targets

Accessibility failures block release.

---

# Performance Standards

Respect performance budgets.

Always:

* Memoize expensive calculations
* Lazy-load heavy modules
* Virtualize long lists
* Cache server responses
* Debounce user input

Avoid unnecessary renders.

---

# AI Coding Standards

Never:

* Call the LLM directly from UI components.
* Embed prompts in screens.
* Duplicate prompt logic.
* Hard-code AI configuration.

Always use:

* Provider Adapter
* Prompt Builder
* Retrieval Service
* Configuration Registry

Grounded retrieval is mandatory before generation.

---

# Database Standards

Every schema change requires:

* Migration
* Rollback
* RLS update
* Documentation update
* Generated types update

Never edit production schemas manually.

---

# Testing Standards

Minimum expectations:

## Unit Tests

* Utility functions
* Services
* Hooks

## Integration Tests

* APIs
* Authentication
* Synchronization

## Component Tests

* Rendering
* States
* Accessibility

## End-to-End Tests

Critical journeys:

* Login
* Morning Ritual
* Ask Guru
* Subscription
* Household

No critical feature is complete without automated tests.

---

# Git Standards

Branch naming:

```text
feature/
bugfix/
hotfix/
refactor/
docs/
test/
```

Commit format:

```text
type(scope): summary
```

Examples:

```text
feat(ritual): add guided ritual flow

fix(ai): handle retrieval timeout

docs(tdd): update API contract
```

---

# Pull Request Standards

Every PR must include:

* Purpose
* Linked issue
* Testing performed
* Screenshots (if UI)
* Accessibility impact
* Performance impact
* Documentation impact

No self-merging to protected branches.

---

# Documentation Standards

Whenever implementation changes:

Update:

* PDD (if UX changes)
* TDD (if architecture changes)
* ADR (if architectural decision changes)
* API documentation
* Database documentation
* Component documentation

Code and documentation must remain synchronized.

---

# AI Agent Rules

Before writing code:

1. Read PROJECT_CONTEXT.md.
2. Read ARCHITECTURE_CONTEXT.md.
3. Read PRODUCT_CONTEXT.md.
4. Read DESIGN_CONTEXT.md.
5. Read the relevant PDD and TDD sections.

Before creating anything new:

* Search existing components.
* Search existing services.
* Search existing APIs.
* Search existing utilities.

Never duplicate functionality.

If documentation is unclear:

Stop.

Request clarification.

Do not invent behaviour.

---

# Code Review Checklist

Before marking work complete, verify:

* ✓ Product requirements implemented
* ✓ Architecture preserved
* ✓ Design system followed
* ✓ Design tokens used
* ✓ Accessibility verified
* ✓ Performance budgets met
* ✓ Error handling complete
* ✓ Analytics instrumented
* ✓ Security reviewed
* ✓ Privacy maintained
* ✓ Tests passing
* ✓ Documentation updated
* ✓ No duplicate code introduced

---

# Definition of Engineering Excellence

Engineering excellence is achieved when the code is:

* Easy to understand
* Easy to extend
* Easy to test
* Easy to monitor
* Secure by default
* Accessible by default
* Consistent with the architecture
* Consistent with the design system
* Cost-efficient to operate
* Safe for AI-assisted development

Every implementation should leave the codebase in a better state than it was found.
