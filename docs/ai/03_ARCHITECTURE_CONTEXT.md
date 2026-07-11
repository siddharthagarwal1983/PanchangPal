# ARCHITECTURE_CONTEXT.md

# PanchangPal Architecture Context

Version: 1.0.0

Status: Living Document

Owner: Engineering

---

# Purpose

This document provides a high-level architectural overview of PanchangPal.

It is intended for:

* Claude Code
* Cursor
* Codex
* GitHub Copilot
* Engineers
* Architects

It explains **how the system is organized**, **how major subsystems interact**, and **which architectural principles must never be violated**.

This document is **not** the source of implementation details.

Implementation details belong in the Technical Design Document (TDD).

---

# Source of Truth

Architecture decisions must follow:

1. MRD
2. PRD
3. PDD / UX Specification
4. TDD
5. ADRs

If any conflict exists:

Stop.

Raise the conflict.

Do not guess.

---

# System Overview

PanchangPal consists of six major architectural domains:

1. Mobile Application
2. Backend Platform
3. AI Platform
4. Content Platform
5. Observability Platform
6. DevOps Platform

Each domain is independently evolvable but follows shared governance rules.

---

# High-Level Architecture

```text
                    Mobile App (React Native)
                             │
                ┌────────────┴────────────┐
                │                         │
          Supabase Backend          AI Platform
                │                         │
         PostgreSQL + Storage      OpenAI + pgvector
                │                         │
                └────────────┬────────────┘
                             │
                      Shared Content Layer
```

The mobile application remains intentionally thin.

Business logic belongs on the backend.

The backend remains authoritative.

---

# Architectural Principles

Always preserve:

* Offline-first
* Mobile-first
* Thin client
* Server-authoritative state
* Provider abstraction
* Accessibility-first
* Trust-first AI
* Deterministic behaviour
* Explicit contracts
* Modular architecture

Never violate these principles.

---

# Architecture Layers

## Presentation Layer

Responsibilities

* Screens
* Navigation
* Components
* State presentation
* Accessibility
* Animations

Technology

* React Native
* Expo
* Expo Router

Never perform business logic here.

---

## Application Layer

Responsibilities

* State management
* Business workflows
* API orchestration
* Offline queue
* Synchronization

Technology

* Zustand
* TanStack Query

Application state must remain deterministic.

---

## Domain Layer

Responsibilities

* Ritual rules
* Household rules
* Subscription rules
* Notification rules
* AI orchestration

Business logic belongs here.

Never duplicate domain logic.

---

## Infrastructure Layer

Responsibilities

* API calls
* Storage
* Authentication
* Analytics
* Notifications
* AI provider

All external integrations must use adapters.

Never call third-party SDKs directly from screens.

---

# Core Platforms

## Mobile Platform

Responsibilities

* User interface
* Local cache
* Offline queue
* Push notifications
* Accessibility
* Deep links

Never become the source of truth.

---

## Backend Platform

Responsibilities

* Authentication
* Authorization
* API
* Business rules
* Database
* Synchronization
* Subscription validation

Backend always owns persistent state.

---

## AI Platform

Responsibilities

* Retrieval
* Prompt orchestration
* Streaming
* Groundedness
* Safety
* Source attribution

The AI never bypasses retrieval.

The AI never invents information.

---

## Content Platform

Responsibilities

* Religious content
* Scholar-reviewed knowledge
* Embeddings
* Metadata
* Versioning

Content is the product's competitive moat.

---

## Observability Platform

Responsibilities

* Logging
* Metrics
* Tracing
* Analytics
* Crash reporting

All critical flows must be observable.

---

## DevOps Platform

Responsibilities

* CI/CD
* Secrets
* Releases
* Monitoring
* Feature flags

Infrastructure must be reproducible.

---

# Data Flow

The standard request lifecycle is:

```text
User Action
      │
Presentation Layer
      │
Application Layer
      │
Backend API
      │
Database / AI
      │
Response
      │
Application Layer
      │
Presentation Layer
```

No screen should communicate directly with external services.

---

# AI Request Flow

```text
User Question
      │
Classifier
      │
Retriever
      │
Confidence Gate
      │
Prompt Builder
      │
OpenAI Provider
      │
Groundedness Check
      │
Streaming Response
      │
User
```

Retrieval always precedes generation.

Groundedness always precedes delivery.

---

# Offline Architecture

The application is offline-first.

Offline changes follow:

```text
User Action
      │
Local Store
      │
Offline Queue
      │
Connectivity Restored
      │
Synchronization
      │
Conflict Resolution
      │
Server
```

The server remains authoritative.

---

# Adapter Pattern

Every third-party integration must be isolated behind an adapter.

Examples:

* AI Provider Adapter
* Analytics Adapter
* Notification Adapter
* Payment Adapter
* Storage Adapter

Business logic must never depend directly on external SDKs.

---

# Repository Structure

```
apps/
    mobile/
    backend/

packages/
    ui/
    shared/
    api/
    database/
    ai/
    design-tokens/

docs/
tests/
scripts/
.github/
```

Do not create new top-level folders without architectural approval.

---

# Cross-Cutting Concerns

Every subsystem must support:

* Logging
* Error handling
* Accessibility
* Analytics
* Security
* Privacy
* Performance
* Localization
* Feature flags

These are mandatory.

---

# Error Handling

All failures must:

* Return structured errors
* Use approved ERR_* identifiers
* Preserve context
* Avoid leaking implementation details
* Be observable

No raw exceptions should reach the UI.

---

# Security Architecture

Security principles:

* Least privilege
* Row Level Security
* Encrypted transport
* Secure local storage
* Input validation
* Output encoding
* Authentication before authorization

Never bypass RLS.

---

# Performance Budgets

Architecture decisions must respect:

* Fast cold start
* Low memory usage
* Efficient rendering
* Streaming AI responses
* Cached content
* Optimized database queries

Performance regressions require architectural review.

---

# Scalability Strategy

Expected growth path:

MVP

↓

10K Users

↓

100K Users

↓

1M Users

The architecture should scale horizontally where possible.

Avoid premature complexity.

---

# Architecture Decision Records

Every significant architectural decision must be documented as an ADR.

Examples:

* Framework changes
* Database changes
* AI provider changes
* Storage changes
* Authentication changes

Never change architecture without recording the rationale.

---

# AI Agent Rules

Before generating code:

1. Read the relevant PDD sections.
2. Read the relevant TDD sections.
3. Identify dependencies.
4. Check for existing components.
5. Verify API contracts.
6. Verify database contracts.
7. Preserve architecture.

Never invent architecture.

Never bypass established layers.

Never duplicate existing functionality.

If documentation is incomplete, stop and request clarification.

---

# Definition of Architectural Success

The architecture is considered successful when it is:

* Simple
* Predictable
* Maintainable
* Observable
* Secure
* Accessible
* Cost-efficient
* Provider-agnostic
* AI-ready
* Easy for humans and AI agents to understand

Every implementation decision should reinforce these qualities.
