# PROJECT_CONTEXT.md

# PanchangPal — AI Project Context

Version: 1.0.0

Status: Living Document

---

# Project Overview

PanchangPal is an AI-powered Hindu spiritual companion designed primarily for Indians living outside India.

Its mission is to make it effortless for Hindu families abroad to preserve, practice, and pass on their traditions in a calm, trustworthy, and modern way.

PanchangPal is **not** a social network, marketplace, astrology platform, horoscope application, or content aggregation app.

It is a daily spiritual companion built around trust, education, ritual guidance, and family participation.

---

# Product Vision

Help every Hindu family living abroad stay connected with their traditions through simple daily experiences powered by trustworthy technology.

---

# Product Mission

Reduce the friction involved in practicing Hindu traditions by providing:

* Accurate Panchang
* Daily rituals
* Festival guidance
* AI-assisted explanations
* Household coordination
* Personalized reminders

The application should reduce anxiety—not create it.

---

# Product Principles

Always optimize for:

* Trust
* Simplicity
* Calmness
* Family
* Accessibility
* Privacy
* Reliability
* Educational value

Never optimize for:

* Engagement addiction
* Doom scrolling
* Endless feeds
* Clickbait
* Fear-based messaging
* Artificial urgency

---

# Primary Users

Primary Persona

First-generation Indian professionals living in:

* United States
* Australia
* New Zealand

Secondary Expansion

* Canada
* United Kingdom
* Germany
* Netherlands

Future versions may support additional communities, but the initial product is designed specifically around this primary audience.

---

# Business Goals

Primary objective

Create a trusted daily habit.

Secondary objectives

* Subscription conversion
* Household adoption
* Retention
* AI engagement

Trust always takes precedence over short-term monetization.

---

# Source of Truth Hierarchy

Always follow this precedence order:

1. MRD
2. PRD
3. PDD / UX Specification
4. TDD
5. ADRs
6. Design System
7. Sprint Backlog
8. GitHub Issues

If documents disagree:

Stop.

Identify the conflict.

Do not guess.

---

# Product Scope

Included

* Panchang
* Festivals
* Daily Rituals
* AI Ask Guru
* Household
* Notifications
* Streaks
* Settings
* Subscription

Excluded from MVP

* Horoscope
* Astrology
* Kundli
* Marketplace
* Community
* User Generated Content
* Live Temple Streaming
* Video Calls
* Donations
* E-commerce

---

# Core User Journey

Morning

↓

Notification

↓

Open App

↓

Today's Panchang

↓

Today's Ritual

↓

Complete Ritual

↓

Maintain Streak

↓

Close App

The ideal session lasts only a few minutes.

The application should encourage completion, not prolonged usage.

---

# Technical Stack

Frontend

* React Native
* Expo
* Expo Router
* TypeScript
* Zustand
* TanStack Query

Backend

* Supabase
* PostgreSQL
* Edge Functions

AI

* OpenAI Provider Adapter
* GPT-5 mini (initial)
* RAG
* pgvector

Payments

* RevenueCat

Notifications

* Expo Notifications

Monitoring

* Sentry

Analytics

* Analytics Adapter
* PostgreSQL (initial implementation)

---

# AI Philosophy

The AI exists to educate and guide.

Never preach.

Never persuade.

Never speculate.

Never fabricate.

Always retrieve trusted content first.

If sufficient evidence is unavailable:

Politely acknowledge uncertainty rather than inventing an answer.

Grounded responses are preferred over complete responses.

---

# Design Philosophy

The experience should feel similar to:

* Calm
* Headspace
* Duolingo

The application should never resemble:

* Social media
* News feeds
* Shopping apps
* Clickbait portals

---

# Engineering Principles

Always prefer:

* Simple architecture
* Deterministic behavior
* Reusable components
* Strong typing
* Provider abstraction
* Offline-first behavior
* Accessibility-first design
* Explicit contracts
* Small composable modules

Avoid unnecessary complexity.

---

# Security Principles

Security is mandatory.

Always:

* Validate inputs
* Enforce RLS
* Encrypt sensitive data
* Minimize data collection
* Protect secrets
* Use least privilege
* Follow OWASP Mobile guidance

Never bypass authentication or authorization.

---

# Privacy Principles

Collect only the information required to provide the service.

Do not retain unnecessary personal information.

Never include sensitive user data in analytics.

Never expose AI prompts or embeddings.

Respect regional privacy regulations.

---

# Accessibility Principles

Accessibility is a product requirement.

Every feature should support:

* VoiceOver
* TalkBack
* Dynamic Type
* Reduced Motion
* WCAG AA
* Screen Readers
* Minimum Touch Targets
* High Contrast

Accessibility should never be treated as optional.

---

# Repository Overview

The repository follows a modular monorepo architecture.

Key directories include:

* /apps/mobile
* /apps/backend
* /packages/ui
* /packages/shared
* /packages/design-tokens
* /packages/api
* /packages/database
* /packages/ai
* /docs
* /tests
* /.github

Developers and AI agents should respect this structure.

---

# Documentation Map

Core documentation includes:

* MRD
* PRD
* PDD (Parts 1–5)
* TDD (Parts 1–5)
* ADRs
* API Specification
* Database Specification
* Design System
* Sprint Backlog

Before implementing a feature, consult the relevant documentation.

---

# Naming Conventions

Use existing identifiers consistently.

Examples:

Screens

SCR_HOME_001

Components

CMP_PRIMARY_BUTTON

Flows

FLOW_MORNING_RITUAL

APIs

API_GET_TODAY

Events

EVT_001

Errors

ERR_NETWORK_TIMEOUT

Never invent new naming patterns.

---

# AI Coding Rules

Before generating code:

1. Read relevant architecture documentation.
2. Identify dependencies.
3. Verify assumptions.
4. Preserve existing conventions.

Never:

* invent business rules
* invent UX
* invent APIs
* invent database schema
* duplicate components
* bypass design tokens
* bypass accessibility

If documentation is ambiguous:

Stop and request clarification.

---

# Definition of Done

A feature is complete only when:

* Product requirements are satisfied.
* UX matches the PDD.
* Architecture follows the TDD.
* Accessibility requirements are met.
* Analytics are instrumented.
* Errors are handled.
* Documentation is updated.
* Tests pass.
* Performance budgets are respected.
* Security review passes.

---

# Long-Term Vision

PanchangPal should evolve into the most trusted AI-powered spiritual companion for Hindu families worldwide.

Growth should never come at the expense of trust.

Every engineering, design, AI, and business decision should reinforce this principle.
