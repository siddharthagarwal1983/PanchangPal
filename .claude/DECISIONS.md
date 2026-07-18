# DECISIONS.md

# PanchangPal — AI Decision Summary

Version: 1.1.0

Purpose:
This file contains a condensed summary of permanent project decisions.

It exists to minimize context usage for AI coding agents.

For detailed rationale, see:

docs/ai/07_DECISION_LOG.md

or

docs/architecture/adr/

---

# Product Decisions

## Target Market

Primary

- Indians living abroad

Launch Markets

- United States
- Australia
- New Zealand

Expansion Markets

- Canada
- United Kingdom
- Europe

---

## Product Philosophy

Optimize for:

- Trust
- Simplicity
- Calm UX
- Daily usefulness
- Accessibility

Do NOT optimize for:

- Social engagement
- Addictive behaviour
- Endless scrolling
- Notification spam
- Gamification

---

## AI Philosophy

AI is an assistant.

Not an authority.

Responses must always be:

- Grounded
- Honest
- Transparent
- Source-backed

If confidence is insufficient:

Politely decline.

Never hallucinate.

---

# Architecture Decisions

## Mobile

Framework

- React Native
- Expo

Language

- TypeScript

Routing

- Expo Router

---

## Backend

Platform

- Supabase

Database

- PostgreSQL

Functions

- Edge Functions

Security

- Row Level Security (RLS)

---

## State Management

Client State

- Zustand

Server State

- TanStack Query

Never duplicate server state in Zustand.

---

## Offline Strategy

Application is:

Offline-first.

The server is always the source of truth.

Offline actions are synchronized when connectivity returns.

---

## AI

Provider

- OpenAI (via Provider Adapter)

Generation

- GPT-5 mini

Architecture

- Retrieval-Augmented Generation (RAG)

Retrieval is mandatory before generation.

---

## AI Rules

Always:

- Retrieve
- Ground
- Stream
- Cite sources

Never:

- Guess
- Fabricate
- Expose prompts
- Expose chain of thought

---

## Provider Pattern

All third-party services must be accessed through adapters.

Current adapters:

- AI Provider
- Analytics
- Payments
- Notifications
- Storage

Never call vendor SDKs directly from business logic.

---

## Payments

Mobile

- RevenueCat

Business logic must depend on the Payment Provider Adapter.

Never couple application logic directly to RevenueCat.

---

## API Versioning

Compatibility-first: SemVer'd `API_*` contracts in `packages/api`; backend supports current and previous minor (N and N-1).

Prefer additive evolution over new versions; version travels with the contract envelope (header-style), not the URL.

Database changes follow expand-then-contract; breaking changes require a new contract major and approval.

See ADR-032.

---

## Analytics

Use the Analytics Adapter.

Never call analytics vendors directly.

Initial storage:

- PostgreSQL

---

## Notifications

Use the Notification Adapter.

No platform-specific notification logic inside feature modules.

---

# Security Decisions

Always:

- Authenticate
- Authorize
- Validate input
- Enforce RLS
- Protect secrets

Never:

- Store secrets in clients
- Log tokens
- Log sensitive user data

---

# Accessibility Decisions

Accessibility is mandatory.

Support:

- VoiceOver
- TalkBack
- Dynamic Type
- Reduced Motion
- WCAG AA

Accessibility regressions are unacceptable.

---

# Documentation Decisions

Documentation-first development.

Architecture changes require:

- ADR update

UX changes require:

- PDD update

Implementation changes require:

- TDD update

Strategic decisions require:

- Decision Log update

---

# Repository Decisions

Repository type

- Monorepo

Do not introduce new top-level folders.

Respect module boundaries.

Migrations & seed live under `apps/backend/` (TDD §4/§6.1), not `supabase/migrations/`.
Supabase CLI config stays at `supabase/config.toml`. (DEC-022)

> ⚠️ **Documentation conflict (migrations path) — DEC-022 is authoritative.** PLAYBOOK.md
> Workflow 7 previously instructed "Save migrations to `supabase/migrations/`", which contradicts
> this decision and the actual repo layout (`apps/backend/migrations/`). Resolved 2026-07-18 by
> correcting PLAYBOOK.md Workflow 7 to point to `apps/backend/migrations/`. The authoritative
> location is **`apps/backend/migrations/`**; `supabase/` holds only `config.toml`.

Household members may read each other's ritual/streak COUNTS (F-21 = visible, DEC-022);
personal dates remain owner-only private (T7). Never expose per-item shaming data.

---

# Coding Principles

Always:

- Reuse existing code
- Extend before creating
- Keep components small
- Keep services cohesive
- Prefer composition
- Use strict typing

Never:

- Duplicate functionality
- Invent requirements
- Rewrite unrelated code
- Introduce unnecessary complexity

---

# Current Architecture

Presentation

↓

Application Layer

↓

Domain Services

↓

Adapters

↓

Supabase / OpenAI / RevenueCat

Business logic belongs in services.

Presentation components remain presentation-only.

---

# Permanent Principles

Always preserve:

- Trust
- Simplicity
- Accessibility
- Privacy
- Security
- Offline-first
- Thin client
- Server-authoritative state
- Calm UX
- Provider abstraction
- Documentation-first development

These principles must never be violated without an approved ADR.

---

# Before Every Task

Remember:

1. Read PROJECT_MEMORY.md
2. Read SESSION.md
3. Read TASK.md
4. Read ARCHITECTURE_SUMMARY.md

Only then retrieve additional documentation if required.

Do not scan the repository unnecessarily.

---

# End of Session

When instructed to end the session:

Update:

- SESSION.md
- PROJECT_STATUS.md

Update only if required:

- PROJECT_MEMORY.md
- DECISION_LOG.md

Keep permanent decisions here concise.

Do not turn this file into a session log.

Note: status/tracking files are also refreshed at each **increment or milestone boundary** — not
only at End Session — per the Increment & Milestone Completion Checkpoint in CLAUDE.md. Add a dated
convention block here whenever an increment establishes a permanent client/product decision.

---

# One-Line Reminder

> Build software that users can trust, engineers can maintain, and AI can understand.

---

# Mobile Client Conventions (M6, 2026-07-13)

## Edge Function invocation
The mobile data layer calls Supabase Edge Functions via `functions.invoke` using the **OpenAPI
operation paths** (e.g. `account/merge`, `household/member`, `invite/accept`), matching authRepository
and the panchang repositories. Not a per-function body-`action` dispatch.

## Household mutations are online-only
Household member/invite mutations require a server round-trip (tokens, one-active-household F-2) and
are **not** placed on the offline queue. The daily loop is never gated (P4); household errors surface
calm, retryable states. Preferences remain the optimistic + offline-queued path.

## Account deletion (F-3)
Deletion is a **reversible grace-window request** (returns `execute_after`), not an immediate wipe.
The client mirrors the F-3 ownership-transfer gate for early UX, but the server re-checks and stays
authoritative. Destructive confirms use a native focus-trapped Alert until CMP_DIALOG exists.

---

# Mobile Client Conventions (M7–M8, 2026-07-18)

## Notifications (M7, MOD_notifications)
Scheduling is **always server-side** (SVC_notify_scheduler); the client only registers a push token
and per-channel preferences — it never schedules locally. Preferences are server-authoritative and
stored in `user_profile.notif_prefs` (JSON). All permission / token / foreground / tap-routing work
flows through the **NotificationAdapter** port; `expo-notifications` is a deferred dependency, so a
**NullNotificationAdapter** is used until it is installed on the Mac (permission `undetermined`, no
token, nothing fabricated). Notification-tap deep links route through the existing router (incl.
`panchangpal://invite/{token}`). Sunrise/tithi-timed content stays gated by ADR-033.

## Subscription & entitlement (M8, MOD_subscription)
Entitlement is **server-authoritative, household-grain (F-4), and READ-ONLY on the device.** The
`entitlement` table denies all client writes (migration 20260712000060); the RevenueCat webhook
(SVC_revenuecat_webhook) is the sole writer. The client reads entitlements under household-member RLS
and a Realtime seam propagates webhook grant/revoke (the Realtime callback is a refetch signal only —
it carries no payload, so no cross-household data leaks even if the stream is broad).

Subscriptions flow through the **PaymentAdapter** port (offerings / purchase / restore); there is **no
receipt logic on the device** and entitlement is **never granted client-side**. `react-native-purchases`
is a deferred dependency, so a **NullPaymentAdapter** is used until it lands (reports no offerings and an
honest `unavailable` purchase outcome — never a fabricated success). Prices always come from the store,
never hardcoded.

v1 gated premium capabilities (product decision 2026-07-18): **`deep_dive_content`** and
**`extended_ask_guru`**. The **daily practice loop is NEVER gated** (P4), and Ask Guru's honest-decline
behavior is never gated. Gating is contextual and dismissible (`usePremiumGate` fails open while loading
so a paywall never flashes over cached content). The Family plan is an offering behind **FF_FAMILY_PLAN**
(M8 Increment 3), not an in-app gate. Entitlement is trusted from server-set `is_active` only — the client
never computes expiry (thin-client, server-authoritative).
