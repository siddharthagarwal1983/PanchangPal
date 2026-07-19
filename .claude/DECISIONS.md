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

## Staging and signing material (2026-07-19)

**Stage files by explicit path. Never `git add -A`.** A `git add -A` swept an Android keystore that
`eas credentials` had just downloaded into `apps/mobile/` into commit `3357884`, pushing the signing
identity for `com.panchangpal.app` to a public repository. Every other commit that session named its
paths; the one that did not is the one that leaked. This is the second secret exposure in two days —
a staging DB password went the same way on 2026-07-18 — and both were mechanical, not conceptual.

**A leaked credential is rotated, not merely removed.** Deleting the file and gitignoring the family
(`*.jks`, `*.keystore`, `*.p12`, `*.p8`, `*.mobileprovision`, `*.cer`) does nothing about the copy
already published. The key was rotated on EAS the same day; nothing had shipped to Play, which is the
only reason it was cheap.

**Rewriting history does not un-publish a secret on GitHub.** `git filter-repo` plus a force-push
cleaned `main` at the cost of 30 changed SHAs and the permanent loss of GPG Verified badges — and did
not remove the key, because `refs/pull/24/head` still serves it and PR refs are server-side and
undeletable. Assume anything pushed to a public repo is public forever. Rotate; do not rewrite.
See issue #25.

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

---

## Overlays, cross-feature surfaces & client feature flags (M8 Increment 3, 2026-07-18)

**A surface shared by two features is a ROUTE, not a shared component.** The contextual paywall is
opened from both MOD_you (Settings → deep-dive) and MOD_guru (post-answer upsell). TDD §2.2 forbids
cross-feature imports and prescribes navigation intents for contextual cross-links, and TDD §3.1
designates `app/modal/*` for "bottom sheets, dialogs, paywall". The paywall therefore lives at
**`app/modal/paywall`** (a `transparentModal` route taking `?capability=`), and callers reach it with
`router.push`. Promoting such a surface into `packages/ui` would have created a new CMP_*, which the
PDD §3 "no orphans / no duplicates" rule and the paywall composition note both forbid. Apply this
pattern to any future surface two features must share.

**The paywall is a composition, never a component:** CMP_BOTTOM_SHEET + CMP_PLAN_CARD. CMP_BOTTOM_SHEET
itself (PDD §5.12) was implemented in this increment — it had been specified since the component library
was written and declared as a dependency by four components, but never built. It is presentational and
takes `reduceMotion` as a prop (fade-in-place instead of slide) so `packages/ui` stays a leaf that knows
only tokens.

**Client feature flags FAIL CLOSED.** `feature_flag` (public-select, ADR-021) is read once at launch
through `featureFlagRepository` + `HOOK_useFeatureFlag`, cached, and invalidated via Realtime. A flag
reads `false` while loading, on error, when the key is absent, and when `enabled` is any non-boolean —
only a real boolean `true` enables. Post-v1 scope must never leak on through a failed read. Flags are
read-only on the device; the app never writes one.

**FF_FAMILY_PLAN is an OFFERING gate, not a capability gate.** It controls whether the Family plan is
purchasable (applied through the pure `visibleOfferings`), with Individual as the default. It never
affects what an already-granted family entitlement unlocks — entitlement remains server-authoritative.

---

## Mobile platform baseline & the execution gap (Demo session, 2026-07-18)

**The mobile platform baseline is Expo SDK 54 / RN 0.81.5 / React 19.1, New Architecture default.**
Forced, not chosen: Expo Go ships support only for the newest SDK, and an iOS development build
requires a paid Apple Developer membership that is not held — so SDK 54 was the only way to run the
app on a device at all. `expo install --fix` is the mechanism for SDK-managed deps; `packages/ui`
must be aligned in the same change or its stale peers drag a second copy of react-native into the
type graph.

**Metro must keep hierarchical lookup ENABLED under pnpm.** `disableHierarchicalLookup = true` is a
safe optimization only on npm/yarn's hoisted layout. pnpm nests each package's dependencies under
`node_modules/.pnpm/<pkg>/node_modules/`, so Metro must walk up from a module's real path. Disabling
it made expo-router's own dependencies unresolvable and the app unbuildable.

**Workspace packages are consumed as TypeScript source, so every consumer needs a `.js` specifier
remap.** `packages/*/package.json` point `exports` at `src/index.ts`, and that source uses NodeNext
`.js` specifiers. tsc resolves them natively and jest via `moduleNameMapper`; Metro needs an explicit
`resolveRequest` shim. Do not "fix" this by repointing `exports` at `dist/` — Edge Functions consume
the same contract through the Deno import map.

**Realtime channel topics must be unique per subscription.** supabase-js keys channels by topic and
returns the existing instance when that topic is still registered; because `removeChannel()` is
async and fired un-awaited from effect cleanup, a remount otherwise receives an already-subscribed
channel and `.on()` throws. Any new repository opening a channel must suffix its topic via
`nextChannelId()` (`src/data/realtimeChannelId.ts`).

**Verification that does not execute the app does not count.** M1–M8 all shipped green on lint,
typecheck, and jest — none of which invoke Metro — while three bundle-blocking defects, two
local-backend faults, and one crashing product bug accumulated. A CI bundle gate (`expo export`) is
the cheapest control that would have caught the build-breaking class at M1, and is now part of B2.
Local `supabase start` is likewise part of the definition of a working repo: seeding must stay off
while migrations live outside the CLI path, and `[auth] enable_anonymous_sign_ins` must stay true
because the app bootstraps an anonymous session before any screen renders (UX-2 / ADR-009).

---

## Verification, environments, and the pnpm/native build seams (2026-07-19)

**A gate is added when it can fail.** Recorded in ci.yml and applied throughout: four placeholder
jobs were removed rather than left green, because a job that cannot fail reads as coverage. The
asymmetry that goes with it — automatic gates are REMOVED, manual deploy jobs are KEPT AND MADE TO
FAIL. A missing job hides a capability; a silently-succeeding deploy job tells an operator that
production was promoted when nothing happened.

**Verification that does not execute the app does not count.** M1–M8 shipped green on lint,
typecheck, and jest, none of which invoke Metro, while the app could not be built at all. CI now
runs `expo export` per PR and Maestro flows on an emulator; both were proven to FAIL on
reintroduced defects, not merely to pass.

**E2E asserts against a CI-built APK, never the latest EAS artifact.** An E2E gate answers "does
THIS change behave correctly", which requires the binary to contain the change. The shippable EAS
artifact is verified separately by release-build.yml. Two questions, two mechanisms.

**Maestro selects by testID for anything tapped.** `tapOn: 'Begin'` matches the enclosing card
rather than the button and reports COMPLETED while navigating nowhere — a green step testing
nothing. Text assertions are fine; text taps are not.

**Native builds happen in the cloud, not on the dev machine.** A local Gradle build OOM-killed an
8 GB laptop mid-run and destroyed the build tree. EAS builds what ships; CI builds what E2E tests;
the local emulator only installs and runs an APK (tuned to ~1.5 GB, headless).

**A database password never leaves its CI secret.** scripts/resolve-db-url.sh derives and probes
the session-pooler URL inside the workflow rather than having a human fetch, paste, and re-set it —
the exact sequence that leaked a staging password on 2026-07-18 and forced a rotation. Anything
derived from a secret must be `::add-mask::`ed, because Actions masks the secret's exact value and
nothing else.

**Supabase gives new projects an IPv6-only direct endpoint.** GitHub runners are IPv4-only, so
`db.<ref>.supabase.co` is unreachable from CI; the session pooler is not. Its hostname prefix
varies per project (staging is aws-1, dev is aws-0) and no CLI exposes it, so it is probed.

**Two pnpm seams that fail far from where they are written.** First, an eager side effect in a
DEFAULT PARAMETER runs at construction — `getSupabase()` across nine repositories and `new MMKV()`
in the session store both detonated at import or first use, one of them synchronously past a
`.catch()`. Second, a package used at build time but never DECLARED is not linked: `@babel/runtime`,
`@expo/metro-runtime`, and `babel-preset-expo` each broke a different build path while the others
kept working. `expo export` and Gradle resolve differently — a green bundle gate does not imply a
working native build.

**`pnpm exec`, not `pnpm dlx`, for project tooling.** dlx fetches the latest CLI; Expo 57's config
loader cannot parse this project's TypeScript app.config.ts.

**Seed inserts must name their conflict target.** A bare `on conflict do nothing` suppresses nothing
without a matching constraint, so CD duplicated checklist rows on every deploy until a unique index
existed. Verified by reproducing the exact row state in a throwaway Postgres container before
shipping the DELETE.
