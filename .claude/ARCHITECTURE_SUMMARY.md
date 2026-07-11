# ARCHITECTURE_SUMMARY.md

# PanchangPal — Architecture Summary

**Version:** 1.0.0  
**Status:** Living Document  
**Purpose:** Fast architectural reference for AI coding agents and engineers.

---

# Purpose

This document is a concise architectural summary.

It is **not** the source of implementation details.

Before reading the complete Technical Design Document (TDD), AI coding agents should read this file to understand:

- Overall architecture
- Technology stack
- Architectural principles
- System boundaries
- Core services
- Major dependencies

For implementation details, consult the relevant TDD section.

---

# Architecture Principles

The architecture follows these permanent principles:

- Mobile-first
- Offline-first
- Thin client
- Server-authoritative state
- Accessibility-first
- Privacy-first
- Security-first
- Trust-first AI
- Provider abstraction
- Managed services first
- Documentation-first development

These principles must never be violated without an approved ADR.

---

# Technology Stack

## Mobile

- React Native
- Expo
- Expo Router
- TypeScript

## State Management

- Zustand (client state)
- TanStack Query (server state)

## Backend

- Supabase
- PostgreSQL
- Edge Functions
- Row Level Security (RLS)

## AI

- OpenAI GPT-5 mini
- RAG Architecture
- pgvector
- Streaming Responses

## Payments

- RevenueCat
- Payment Provider Adapter

## Notifications

- Expo Notifications

## Monitoring

- Sentry

## Analytics

- Analytics Adapter
- PostgreSQL Event Store (initial)

---

# High-Level Architecture

```text
                Mobile App
                     │
                     │
             API / Edge Functions
                     │
      ┌──────────────┴──────────────┐
      │                             │
 PostgreSQL                  AI Platform
      │                             │
      │                        OpenAI GPT-5 mini
      │                             │
      └──────────────┬──────────────┘
                     │
               Shared Content
```

The backend owns all business logic and persistent state.

The mobile application is primarily responsible for presentation, local cache, and offline support.

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
supabase/
.github/
```

Never introduce new top-level folders without architectural approval.

---

# Application Layers

## Presentation

Responsibilities

- Screens
- Components
- Navigation
- Accessibility

Technology

- React Native

---

## Application

Responsibilities

- State management
- Offline queue
- Synchronization
- API orchestration

Technology

- Zustand
- TanStack Query

---

## Domain

Responsibilities

- Business rules
- Ritual logic
- Subscription rules
- Household logic
- AI orchestration

---

## Infrastructure

Responsibilities

- APIs
- Storage
- Notifications
- Payments
- Analytics
- AI Provider

External services must always be accessed through adapters.

---

# Core Platforms

## Mobile Platform

Responsible for:

- UI
- Local storage
- Offline cache
- Push notifications

---

## Backend Platform

Responsible for:

- Authentication
- Authorization
- Business logic
- Database
- Synchronization

---

## AI Platform

Responsible for:

- Retrieval
- Prompt orchestration
- Generation
- Groundedness
- Source attribution

The AI must never answer without retrieval.

---

## Content Platform

Responsible for:

- Scholar-reviewed content
- Embeddings
- Metadata
- Versioning

Content is the primary product asset.

---

# Core Architectural Decisions

- Monorepo architecture
- React Native + Expo
- Supabase backend
- PostgreSQL database
- Offline-first mobile
- Server-authoritative state
- Provider Adapter pattern
- RAG-based AI
- Grounded-or-Silent policy
- RevenueCat subscriptions
- Analytics Adapter
- Documentation-first development

See `docs/architecture/adr/` for detailed ADRs.

---

# AI Request Flow

```
User Question
        │
Intent Classification
        │
Retriever
        │
Vector Search
        │
Prompt Builder
        │
GPT-5 mini
        │
Groundedness Check
        │
Streaming Response
        │
User
```

Retrieval is mandatory.

The AI must decline rather than hallucinate.

---

# Mobile Request Flow

```
User
 │
Screen
 │
Hook
 │
Service
 │
API Client
 │
Edge Function
 │
Database
 │
Response
 │
UI Update
```

Business logic must never reside in UI components.

---

# State Management

Use **Zustand** for:

- UI state
- Session state
- Temporary state

Use **TanStack Query** for:

- Server state
- Caching
- Synchronization
- Mutations

Do not duplicate server state in Zustand.

---

# Offline Strategy

The application is offline-first.

```
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

The server remains the source of truth.

---

# Provider Adapters

Every third-party dependency must be accessed through an adapter.

Current adapters:

- AI Provider Adapter
- Analytics Adapter
- Payment Provider Adapter
- Notification Adapter
- Storage Adapter

Business logic must never depend directly on vendor SDKs.

---

# Security Model

Mandatory:

- Authentication
- Authorization
- Row Level Security
- Input validation
- Secure local storage
- Least privilege
- Secrets never exposed to clients

Security is enforced at every layer.

---

# Performance Targets

Prioritize:

- Fast startup
- Smooth scrolling
- Low memory usage
- Efficient rendering
- Streaming AI responses
- Cached content
- Optimized network usage

Avoid unnecessary re-renders and redundant API calls.

---

# Documentation Map

| Topic | Document |
|--------|----------|
| Product Vision | `docs/ai/01_PROJECT_CONTEXT.md` |
| Product Behaviour | `docs/ai/02_PRODUCT_CONTEXT.md` |
| Architecture | `docs/tdd/` |
| Design | `docs/pdd/` |
| Coding Rules | `docs/ai/05_CODING_STANDARDS.md` |
| Decisions | `docs/ai/07_DECISION_LOG.md` |
| ADRs | `docs/architecture/adr/` |

---

# AI Coding Agent Instructions

Before implementing any feature:

1. Read `PROJECT_MEMORY.md`.
2. Read `SESSION.md`.
3. Read `TASK.md`.
4. Read this document.
5. Read only the relevant PDD/TDD sections required for the task.
6. Search for existing implementations before creating new ones.

Never:

- Invent architecture
- Bypass layers
- Duplicate components
- Duplicate business logic
- Ignore documentation precedence

If documentation is incomplete or conflicting:

Stop and request clarification.

---

# One-Line Summary

> **PanchangPal is a modular, offline-first, AI-assisted mobile platform built on React Native, Supabase, and RAG architecture, with trust, accessibility, and long-term maintainability as its primary architectural goals.**