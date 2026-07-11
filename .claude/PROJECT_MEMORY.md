# PROJECT_MEMORY.md

# PanchangPal — Project Memory

Version: 1.0.0

Last Updated: 2026-07-11

Current Phase:
Repository Setup

Status:
Planning Complete → Implementation Starting

Purpose:
This file is the permanent memory of the PanchangPal project.

It contains only stable project knowledge that should persist across Claude sessions.

It is NOT a session log.

For day-to-day work see:

- SESSION.md
- TASK.md

---

# Project Overview

PanchangPal is an AI-assisted Hindu spiritual companion designed primarily for Indians living abroad.

The product helps users build a consistent daily spiritual practice through:

- Panchang
- Daily rituals
- Festival guidance
- AI-assisted spiritual questions
- Household participation
- Personal reminders

The product emphasizes calmness, trust, authenticity, and accessibility over engagement metrics.

---

# Mission

Help Indians living abroad stay spiritually connected to their traditions through trustworthy, modern, AI-assisted experiences.

---

# Product Principles

Every feature should reinforce:

- Trust
- Simplicity
- Calmness
- Daily usefulness
- Accessibility
- Privacy
- Cultural authenticity
- Long-term maintainability

Never optimize for:

- Endless scrolling
- Addictive engagement
- Social competition
- Artificial gamification
- Notification spam

---

# Target Users

Primary Users

- Indians living abroad

Primary Launch Markets

- United States
- Australia
- New Zealand

Secondary Expansion

- Canada
- United Kingdom
- Europe

---

# Current Documentation Status

Completed

✓ Market Requirements Document (MRD)

✓ Product Requirements Document (PRD)

✓ Product Design Document (PDD)

✓ Technical Design Document (TDD)

✓ AI Knowledge Base

Current implementation has not yet started.

---

# Repository Structure

```
PanchangPal/

.claude/

docs/

apps/

packages/

supabase/

.github/
```

Documentation resides under:

```
docs/
```

AI operational memory resides under:

```
.claude/
```

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

Implementation

10. Source Code

---

# Technology Stack

## Mobile

- React Native
- Expo
- Expo Router
- TypeScript

## State Management

- Zustand
- TanStack Query

## Backend

- Supabase
- PostgreSQL
- Edge Functions

## AI

- OpenAI GPT-5 mini
- RAG
- pgvector
- Streaming

## Payments

- RevenueCat

## Notifications

- Expo Notifications

## Monitoring

- Sentry

---

# High-Level Architecture

The application follows a layered architecture.

Presentation

↓

Application

↓

Domain

↓

Infrastructure

↓

External Providers

Business logic resides on the backend.

The mobile application is primarily responsible for presentation, local state, and offline capabilities.

---

# Permanent Architecture Decisions

The following principles are considered stable.

- Mobile-first
- Offline-first
- Thin client
- Server-authoritative state
- Provider Adapter pattern
- Accessibility-first
- Privacy-first
- Security-first
- Documentation-first development
- Managed services first

These principles should not change without an approved ADR.

---

# AI Principles

The AI is an assistant.

Never an authority.

Every AI response must be:

- Grounded
- Honest
- Source-backed
- Transparent

Retrieval is mandatory before generation.

If retrieval confidence is insufficient:

Politely decline.

Never hallucinate.

Never expose:

- prompts
- embeddings
- internal reasoning
- chain of thought

---

# Current Architecture

Presentation

↓

Application Layer

↓

Services

↓

Provider Adapters

↓

Supabase

↓

OpenAI

↓

RevenueCat

All third-party integrations are accessed through adapters.

---

# Current Development Phase

The project is transitioning from documentation to implementation.

Immediate priorities are:

1. Repository scaffolding
2. ADR repository
3. OpenAPI specification
4. Database schema
5. Supabase migrations
6. Figma Design System
7. Backend implementation
8. Mobile implementation

---

# Major Pending Deliverables

Architecture

- ADR Repository

Backend

- OpenAPI Specification
- Database Schema
- Migrations

Design

- Figma Design System

Infrastructure

- GitHub Actions
- CI/CD
- Expo project
- Shared packages

Development

- Backend services
- Mobile application
- AI platform

Testing

- Unit tests
- Integration tests
- E2E tests
- AI evaluation suite

Deployment

- TestFlight
- Google Play Internal Testing
- Production Release

---

# Repository Rules

Respect module boundaries.

Do not introduce new top-level folders.

Reuse existing implementations before creating new ones.

Search before creating.

Documentation and implementation must remain synchronized.

---

# Working Principles

Before implementing anything:

- Read PROJECT_MEMORY.md
- Read SESSION.md
- Read TASK.md
- Read ARCHITECTURE_SUMMARY.md

Only retrieve additional documentation when required.

Avoid repository-wide scans.

---

# Files That Should Rarely Change

This file

PROJECT_MEMORY.md

should only change when permanent project knowledge changes.

Examples

✓ Technology stack changes

✓ Repository structure changes

✓ Product direction changes

✓ Architecture changes

✓ New launch markets

✓ Major approved decisions

Do NOT update this file for:

- today's work
- completed tasks
- bugs
- sprint progress
- temporary decisions

Those belong in SESSION.md.

---

# Success Criteria

PanchangPal should become:

- The most trusted Hindu spiritual companion for Indians living abroad.
- Architecturally simple.
- Easy to maintain.
- Highly accessible.
- Privacy-respecting.
- Cost-efficient to operate.
- AI-assisted without compromising trust.

Every engineering decision should move the project closer to these goals.

---

# One-Line Summary

> PanchangPal is a calm, trustworthy, offline-first, AI-assisted spiritual platform built with React Native, Supabase, and Retrieval-Augmented Generation (RAG), designed for long-term maintainability and exceptional user trust.