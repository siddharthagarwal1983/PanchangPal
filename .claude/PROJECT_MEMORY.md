# PROJECT_MEMORY.md

# PanchangPal — Project Memory

Version: 2.6.0

Last Updated: 2026-07-28 (JDK 26 breaks local Gradle; ADR-034; the SDK 54 pin as a seam; deletion seam)

Current Phase:
Beta Readiness & Platform Hardening (TDD Part 5)

Status:
Foundation + Backend complete; Mobile MVP Phase 1 feature-complete (M1–M8). Next: Beta Readiness & Platform Hardening (TDD Part 5)

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

Implementation is underway: Repository & Platform Foundation and Backend Foundation (SVC_* Edge Functions) are complete; the mobile app is being built as feature slices (App Shell, Today, Guided Ritual, Calendar Shell, Ask Guru, Profile/Household, Notifications done; Subscription in progress). Live progress lives in DASHBOARD.md / CURRENT_MILESTONE.md / SESSION.md — not here.

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

Internal tooling resides under:

```
scripts/
```

`scripts/command-center/` is a repo-generated engineering dashboard (parses the .claude/ docs plus
source into command-center.json; served by serve.mjs). It is an observability/build tool, not part
of the product runtime.

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

Foundation and backend are built; the current phase is the **Mobile MVP (Phase 1)** feature-slice
milestone.

Completed:
1. Repository scaffolding · ADR repository · OpenAPI spec · Database schema + migrations
2. Backend Foundation — all SVC_* Edge Functions, provider adapters, DB repositories
3. Mobile slices: M1 App Shell · M2 Today · M3 Guided Ritual · M4 Calendar Shell · M5 Ask Guru ·
   M6 Profile/Household · M7 Notifications
4. M8 Subscription — all 3 increments complete (entitlement read + gating; SCR_SUBSCRIPTION_001 +
   plans/purchase/restore; contextual paywall sheet + routing + FF_FAMILY_PLAN)

Remaining: Beta Readiness & Platform Hardening (TDD Part 5).

---

# Major Pending Deliverables

Done: ADR repository, OpenAPI spec, database schema + migrations, GitHub Actions CI/CD, shared
packages, Expo project, backend SVC_* services, and and all mobile slices M1–M8.

Remaining:

- AI platform — reviewed content corpus + evaluation harness (unblocks live Ask Guru)
- Testing — E2E (Maestro FLOW_*), first live CI run
- Deployment — live Supabase project, TestFlight / Play Internal, production release

---

# Standing Blockers & Frozen Abstraction Seams

Stable, cross-cutting facts (permanent until an approved decision changes them):

- **PanchangEngine** (server) + **PanchangProvider** (client) — panchang is ALWAYS accessed
  through these seams. The astronomical algorithm is undocumented and BLOCKED by ADR-033
  (Canonical Panchang Computation Engine, Proposed). Until ratified, panchang compute,
  Calendar/festival markers, and sunrise/tithi notifications surface a calm "unavailable" state;
  no astronomical calculations are implemented and no values are fabricated.
- **Ask Guru readiness gate** — the client streams only via the server SSE adapter (never an LLM
  directly, never fabricates). Live answers are gated OFF (GURU_LIVE = false) until reviewed
  corpus + evaluation readiness (TDD Part 3 §9/§10B); the client is complete behind the gate.
- **AudioAdapter** — ritual narration is behind a port with a NullAudioAdapter fallback; the
  text-guided flow is fully functional until a production audio adapter is approved.
- **NotificationAdapter** (client, M7) — permission/token/foreground/tap-routing flow through this
  port. `react-native-purchases`-style deferral: `expo-notifications` is not yet installed, so a
  NullNotificationAdapter is used (permission `undetermined`, no token; nothing fabricated).
  Scheduling is ALWAYS server-side (SVC_notify_scheduler); the client only registers token + prefs.
  Notif prefs live in `user_profile.notif_prefs` (JSON).
- **PaymentAdapter + entitlement** (M8) — subscriptions flow through a PaymentAdapter port with a
  NullPaymentAdapter (no offerings/purchase until `react-native-purchases` + RC key land; never
  fabricates a purchase). Entitlement is **household-grain (F-4), server-authoritative, READ-ONLY on
  device** — the `entitlement` table denies all client writes; the RevenueCat webhook
  (SVC_revenuecat_webhook) is the sole writer. The daily loop is NEVER gated (P4). v1 gated
  capabilities: `deep_dive_content`, `extended_ask_guru`.
- **Feature flags (client)** — `feature_flag` (public-select, ADR-021) is read through
  `featureFlagRepository` + `HOOK_useFeatureFlag` (cached at launch, Realtime-invalidated) and is
  READ-ONLY on device. Flags **fail closed**: loading, error, an absent key, or a non-boolean
  `enabled` all read `false`, so post-v1 scope can never leak on. `FF_FAMILY_PLAN` gates the Family
  OFFERING (via the pure `visibleOfferings`), never an in-app capability.
- **Shared cross-feature surfaces are ROUTES** — a feature never imports another feature (TDD §2.2);
  contextual cross-links use navigation intents. The contextual paywall lives at `app/modal/paywall`
  (CMP_BOTTOM_SHEET + CMP_PLAN_CARD composed, never a new CMP_*), opened by both MOD_you and MOD_guru.
- **Local dates go through ONE seam** — `localDateIn(instant, timeZone)` in
  `packages/shared/src/time.ts` is the only sanctioned way to produce a `local_date`/`localDate`
  value (ADR-026). It lives in `shared` because the client writes that column and Edge Functions
  read it. The zone comes from `user_profile.timezone` (location-derived, user-correctable) with
  the device zone as a fill-when-absent fallback that NEVER overwrites; when neither is usable the
  code throws or returns null rather than defaulting — never India time. Screens read the day from
  `useLocalDate`, which refreshes at the real local midnight and on foreground. An ESLint rule
  fails the build on `toISOString().slice/substring/substr/split`, exempting only the shared test
  that must demonstrate the wrong pattern. Established by issue #30, where UTC dates recorded the
  AU/NZ morning ritual against yesterday.
- **Ritual sessions persist through ONE seam** — `ritualSessionRepository` writes local ritual
  sessions through a `KeyValueStore` port (never a vendor SDK directly). The device backend is
  **react-native-mmkv v4** (the Nitro-based line), created via the `createMMKV()` factory and resolved
  lazily on first use. v4 is REQUIRED because the app runs the **New Architecture (bridgeless)**, and
  mmkv v2 could not install its JSI bindings there — it degraded silently to memory and sessions never
  survived a restart (caught by FLOW_SESSION_PERSISTENCE on a native build; fixed 2026-07-25, PR #36).
  When the native module is unavailable (Expo Go, or off-device), the port degrades to an in-memory
  store with a visible warning and `getStorageBackend()` reports `'memory'` — the ritual still works,
  it just will not survive a restart. Persistence is verified end-to-end in CI, not assumed.
- **TelemetryAdapter** (client, B4.1) — errors and crashes leave the app through this port and
  nowhere else (TDD Part 5 §7.1); no feature, screen, or repository imports a crash-reporting SDK.
  Two call sites feed it: `ErrorBoundary.componentDidCatch` and a global `ErrorUtils` handler. The
  concrete Sentry adapter is DEFERRED, like NotificationAdapter's: `@sentry/react-native` is not
  installed and no DSN is provisioned, so `NullTelemetryAdapter` drops every report and the §7.2
  crash-free SLO cannot be measured. That state is inspectable, not silent —
  `getTelemetryBackend()` reports `'none'` and a DSN configured with no adapter warns at startup.
  **No PII is structural** (§7.1 `[MANDATORY]`): unrecognised errors map to `ERR_UNKNOWN` rather than
  echoing a message, EVT_054's props are a closed four-key shape, and `componentStack` is never
  forwarded. Every ERR_* maps to EVT_054; its sink is the analytics adapter (ADR-013).
- **AnalyticsService** (client, B4.2) — every `EVT_*` goes through this port (ADR-013); the launch
  sink is the Postgres `analytics_event` table, which is INSERT-ONLY for clients (policy
  `analytics_ins_own`, no select policy — rollups run service-side under pg_cron, ADR-025). Events
  are batched in memory (20 per batch, capped at 200, oldest dropped first, flushed on
  backgrounding); the queue is deliberately NOT persisted, since writing user-behaviour data to disk
  is what ADR-031 argues against and a lost metric costs a row. `user_pseudo_id` is a **device-minted
  random UUID, never derived from the auth uid or any identity** — a reinstall mints a new one, and
  the North Star (Weekly Household Ritual Completions) is unaffected because it groups EVT_017 by
  `household_id`. Props are **primitives only** (objects/arrays are dropped at the boundary — that is
  how an error or a server response would carry PII in), and an event id outside the PDD §11 EVT_*
  taxonomy is rejected rather than inserted. Every `ERR_*` is recorded as EVT_054 here, separately
  from the crash reporter, so error rates do not wait on Sentry.
- **The device key-value seam** lives in `src/data/keyValueStore.ts` — `createDeviceStore()` with the
  degrade-to-memory fallback and `getStorageBackend()`. Both the ritual session store and the
  analytics pseudonymous id use it; it is re-exported from `ritualSessionRepository`, its original
  home, so existing callers are unchanged.
- **The onboarding gate is real state, not a constant** — `app/index.tsx` routes on a flag persisted
  through the shared `KeyValueStore` seam (`isOnboarded()` / `setOnboarded()`), NOT the hardcoded
  `ONBOARDED = true` it carried through M1–M8. Both exits close the gate: "Skip for now" (deferred
  auth means skipping is a legitimate completion, UX-2 / ADR-009) and OTP verification, the latter
  only AFTER the anon→auth merge succeeds. When storage is unavailable the flag reads `false`, so the
  gate is shown again rather than silently skipped. A regression test greps the source, because an
  inlined constant leaves no runtime behaviour to assert.
- **DR runbooks live at `docs/devops/DR_RUNBOOKS.md`** and are exercised by a monthly restore drill
  (`.github/workflows/dr-drill.yml`) that also runs on any PR touching migrations or seed. **NFR-15
  is NOT met**: Supabase PITR is a paid-plan feature and the hosted projects are free-tier, so schema
  and seed rebuild from the repo in minutes while user data is unrecoverable. Do not launch to real
  users in that state.
- **The auth session lives in the device KEYSTORE, never in the KeyValueStore seam** —
  `src/data/secureSessionStorage.ts` backs supabase-js's `storage` option with `expo-secure-store`
  (Keychain / Keystore-backed encrypted prefs). MMKV is deliberately NOT used: it is unencrypted at
  rest and a refresh token is a bearer credential (OWASP M9). Values are chunked across numbered
  keys because SecureStore warns above 2048 bytes and a session exceeds it; the count key is written
  LAST and deleted FIRST, so a torn write or interrupted sign-out can never leave a partially
  readable session. An unavailable keystore degrades to memory with a loud warning and an
  inspectable `getSessionStorageBackend()`.
  **`persistSession: true` alone is a no-op in React Native** — there is no `localStorage`, so
  auth-js silently falls back to memory. That was the state through M1–M8: because the app is
  anon-first, every cold start minted a NEW anonymous uid and orphaned the user's profile,
  household, streak, completions, personal dates and conversations. Nothing caught it —
  FLOW_RETURNING asserts seeded content a stranger sees identically. Guarded now by
  `FLOW_AUTH_SESSION_PERSISTENCE`, which was proven to fail without the adapter.
- **Edge Functions derive identity from the JWT, NEVER from the request body** — `withHandler`
  proves only that a bearer token is PRESENT, and functions run with the SERVICE ROLE, so RLS is
  **not** a backstop. Every action resolves the caller via `currentUserId(ctx.jwt)`
  (`auth.getUser`). Anonymous sign-in is enabled, so any attacker can mint a valid JWT for free and
  `verify_jwt` proves only that a token is *a* valid token, never *whose*.
  Established by B6.2, where `SVC_account` took `body.user_id` / `body.auth_uid`: any caller could
  delete any account, or reassign a victim's rows across every owned table to themselves and read
  them under ordinary RLS — with household member lists exposing `user_id`, so co-members were
  directly targetable. `merge` is the one case where the target is legitimately not the caller's
  current uid; it therefore requires the anonymous session's **access token** as proof of ownership,
  because a uid is a claim, not proof. Guarded by `account/authorization.test.ts`, proven to fail.
- **Offline writes leave the device through ONE seam** — `STORE_offlineQueue` → `syncService` →
  `syncRepository` → API_POST_SYNC (SVC_sync). The queue is persisted through the shared
  `KeyValueStore` seam (never a vendor SDK directly), resolved lazily; the drain RULES are pure and
  live in `src/domain/sync` (FIFO batching, exponential backoff with half-range jitter, capped
  attempts, reconciliation), so the effects layer decides nothing. **`SYNCABLE_KINDS` is the
  server's contract, not a wish**: `ritual_complete | checklist | personal_date`, exactly what
  SVC_sync switches on and TDD Part 2 §6.6 gives a conflict rule for, pinned by a test that reads
  the kinds out of the handler's source. A conflict counts as ACKNOWLEDGED and is dequeued;
  anything returned in neither `applied` nor `conflicts` is retried. Attempts are capped to stop
  silent retrying, **never to discard a mutation** — §6 forbids losing a completion, and no sync
  failure blocks the daily loop (§8.2). Established 2026-07-26: through M1–M8 the queue was an
  in-memory zustand slice beneath a header claiming MMKV persistence, was never drained or
  dequeued, and **nothing bound API_POST_SYNC at all**, so a fully implemented SVC_sync was
  unreachable from the app. NOT yet exercised against a live backend, and no Maestro flow covers it.
- **The persisted query cache is an allowlist** (`src/data/queryPersistence.ts`, §6.1) — the READ
  half of offline-first, without which a cold start offline is empty and §6.2's `[MANDATORY]`
  cached daily loop cannot hold. Only §6.1's set plus `checklist` is written to disk, only in
  `success` state; `entitlement` and `invite` are excluded (§6.2 network-only — and the device is
  never the authority on paid access), as are Ask Guru conversations (ADR-031). Mutations are never
  persisted here, since STORE_offlineQueue already owns them durably and two replay paths for one
  completion is how a ritual gets recorded twice. Built on `dehydrate`/`hydrate` from the declared
  `@tanstack/react-query`, NOT `persistQueryClient` — that lives in an undeclared package, and
  reaching into the pnpm store is the defect `@babel/runtime` and `babel-preset-expo` already cost
  this repo twice.
- **A local Android build + emulator now works on the dev Mac** (established 2026-07-26). The
  standing note that "no Android SDK, Java, or Xcode is available locally" — the reason B2 was
  scoped as depending on B3 — is out of date for Android. Present: SDK cmdline-tools, an AOSP
  arm64 API-34 system image, AVD `ppal_aosp34`, and a working `expo prebuild` + Gradle build.
  ⛔ **BUT THE GRADLE BUILD IS BROKEN AGAIN AS OF 2026-07-28, AND THE JDK CLAIM BELOW IS FALSE.**
  The note that "Gradle auto-provisions JDK 17 regardless of `JAVA_HOME`" no longer holds: only
  **JDK 26** is installed (Homebrew), `/usr/libexec/java_home` finds no registered JVM, and Kotlin's
  embedded `JavaVersion.parse` throws `IllegalArgumentException: 26.0.1`, so `./gradlew` dies
  resolving `com.facebook.react.settings` before compiling anything. **Install a JDK 17 to restore
  local builds.** This is the same class of toolchain drift as pnpm losing corepack under Node 26 —
  the dev Mac moves underneath these notes, so verify a toolchain claim before relying on it.
  Three further facts worth not rediscovering:
  build with `-PreactNativeArchitectures=arm64-v8a` (the default builds four ABIs and throws three
  away — the same waste PR #32 removed from CI); a **debug APK embeds no JS bundle**, so it needs
  Metro plus `adb reverse tcp:8081 tcp:8081`, while `assembleRelease` embeds the bundle, signs with
  the checked-in debug keystore and runs standalone; and `apps/mobile/android/` is GENERATED and
  gitignored, so `expo prebuild` is safe to re-run (it does rewrite `package.json`'s `android`/`ios`
  scripts, which should be reverted). **iOS is unchanged — still unbuilt, still needs an Apple
  membership.** This matters mainly because Maestro flows can now be iterated locally instead of
  through 20-minute CI runs.
- **THE EXPO SDK 54 PIN IS A SEAM, AND EIGHT PACKAGE PATTERNS ARE FROZEN BEHIND IT** (established
  2026-07-28). `react`, `@types/react`, `@expo/*` and `@babel/runtime` are pinned by the SDK exactly
  as `expo`, `expo-*`, `react-native` and `react-native-*` are; all eight are ignored in
  `.github/dependabot.yml` and move ONLY with a deliberate SDK upgrade via `expo install --fix`,
  validated by a native build plus the six Maestro flows. The four specific pins, each read out of
  the installed peer graph rather than release notes: `expo-router@6.0.24` peer-requires
  `@expo/metro-runtime ^6.1.2`, and that package's dist-tags map its majors to **SDK majors**
  (`sdk-56`→56.x, `latest` 57.0.7→SDK 57), so a "6.1.2 → 57.0.7" bump is an SDK 57 package;
  `babel-preset-expo@54.0.12` peer-requires `@babel/runtime ^7.20.0`; and **react-native ships its
  own Fabric renderer built against React `"19.1.0"`**, hardcoded in
  `Libraries/Renderer/implementations/ReactFabric-{dev,prod}.js`, which is why `react` is pinned
  exactly even though RN's declared peer `^19.1.0` would accept 19.2.x.
  **Two things make this worth remembering rather than rederiving.** First, **CI greenness is
  anti-correlated with safety here**: PRs #64 and #65 passed all five gates *including the bundle
  gate* while proposing SDK-crossing changes, and #75 — the only peer-legal one — was the sole red,
  because `expo export` resolves what fails natively. Third instance, after mmkv v2 under the New
  Architecture and the undeclared `babel-preset-expo`. Second, **the obvious fix was the trap**:
  #75's red is `@testing-library/react-native`'s `ensure-peer-deps.js` asserting `react-test-renderer`
  === `react` exactly, and satisfying it (the step TASK.md had recorded as required) would have
  turned CI green while leaving the renderer mismatched. When a bump fails a version assertion,
  satisfy the constraint the assertion defends, not the assertion.
- **ALMOST NOTHING SCHEDULED RUNS IN THIS PROJECT** (established 2026-07-27). The deletion sweep is
  the **only** scheduled work that exists, and only where `pg_cron` has been enabled — which is a
  Supabase **dashboard** action a migration cannot perform. Nothing processes the `job` table:
  `analytics_rollup`, `notify_schedule`, `winback_segment`, `content_ingest` and
  `entitlement_reconcile` are enum values with no consumer, so ADR-025's worker pattern is unbuilt.
  Anything the documentation describes as happening "periodically" or "in the background" — the
  analytics rollup and prune, personal-date tombstone removal, `panchang_cache` TTL — **does not
  happen.** Check this before believing any claim about deferred or recurring work.
- **Account erasure goes through ONE seam, and it is SQL** — `execute_account_deletion(uuid)`
  (atomic, per user) and `sweep_due_account_deletions()` (due rows, each in its own subtransaction),
  in `20260727000110_account_deletion_executor.sql`. Deliberately not TypeScript: the erasure spans
  nine tables and supabase-js has no transaction across calls, so a failure midway would leave an
  account half-erased with no way to tell how far it got. `SVC_account.sweep` **calls** it and must
  never reimplement it.
  **Six foreign keys need explicit handling** and any rewrite must preserve all six:
  `household.owner_id`, `invite.inviter_id`, `invite.accepted_by` and `referral.referred_user_id`
  RESTRICT, so a bare `delete from auth.users` errors; `household_member` and `support_ticket` use
  **ON DELETE SET NULL**, which keeps the row and drops only the link — leaving the deleted user's
  `display_name` in a household and their `email` and free-text `body` in a support ticket.
  `referral.referred_user_id` is **nulled, not deleted**, because that row belongs to the referrer
  and one user's erasure must not destroy another person's record. Analytics are untouched by
  design (§6.5: pseudonymous already, and deleting them would corrupt the household North Star).
  **Tests must assert by CONTENT, not by `user_id`** — a `where user_id = ...` assertion passes
  against the SET NULL leak, because that is precisely the column being nulled.
  Established after `SVC_account.delete` spent the whole project writing `account_deletion` rows
  that nothing ever read back (found by B6.3).
- **`account_deletion.executed_at` is unwritable, and that is a documented contradiction, not an
  oversight** (2026-07-27; opened as **ADR-034**, Proposed, 2026-07-28). The row cascades with
  `app_user`, so a successful erasure removes the request row along with its subject and there is
  nothing left to stamp. **TDD Part 5 §5.1** names `TBL_ACCOUNT_DELETION` as the **deletion audit**
  mitigating repudiation, which requires the row to survive; **TDD Part 2 §3.15**'s schema declares
  the cascade, which requires it not to. **The conflict spans two Parts** — and was mis-cited as
  "Part 2 §5.1" in seven places until 2026-07-28, which is *Identity, Onboarding & Profile*, API
  contracts with no threat model. Reviewing either Part alone cannot surface it.
  **The resolution, so far as engineering can settle it:** a deletion *request* and a deletion
  *audit* have **opposite lifetimes and cannot be the same row**. `account_deletion` is a correct
  request table (pending intent, F-3 grace window, owner-readable, cascading as state about a live
  account); the audit must be a separate service-role-only record that no cascade reaches, holding
  the *fact* of erasure and never content recovered from the deleted rows. `executed_at` is dead
  schema — its only reader is a `where executed_at is null` predicate that is unconditionally true.
  **What is NOT engineering's to decide, and is owed:** what identifies the subject of a completed
  erasure — raw `user_id`, a one-way digest, or nothing. That determines whether the system keeps a
  permanent list of identifiers belonging to people who asked to be forgotten. Security/Privacy owns
  it, Legal confirms the retention obligation, the digest form is recommended. **No schema change
  before ratification.** Today a completed deletion still leaves no record.
- **Privacy documentation is DERIVED, and the inventory is pinned to the code** —
  `docs/devops/DATA_INVENTORY.md` is built from `apps/backend/migrations` and `apps/mobile/{app,src}`,
  and `PRIVACY_POLICY_DRAFT.md` and `STORE_PRIVACY_LABELS.md` are derived from it. None of the three
  is written independently, because a store privacy label that overstates or understates collection
  is an inaccurate legal disclosure rather than a stale document.
  `apps/backend/tests/privacy/data-inventory.test.ts` enforces the first link: it parses `create
  table` out of the migrations and quoted `'EVT_*'` literals out of the mobile source and compares
  both against the document **in both directions**, so a new table cannot enter the schema without a
  privacy classification and a removed one cannot linger as a disclosure. It deliberately does NOT
  read `packages/database`'s `TABLES` registry, which had already drifted (29 names against 32
  tables). The test cannot reach the policy or the labels — those still need a human to decide what
  a newly classified table means.
- **The CCPA export reaches `message` through `conversation_id`, never `user_id`** — it is the one
  exported row set that cannot be fetched like the others, and omitting it returned conversation
  headers with none of their content, silently, because an empty row set and an unreachable one look
  identical in the output. The second query is scoped to the caller's own conversation ids; an
  unscoped fetch would turn a data-rights feature into a data breach. `message_source` is
  deliberately excluded — it references the reviewed corpus, not anything the user wrote.
- **Writing a Maestro flow: three facts that cost four CI cycles to learn** (established 2026-07-27
  while adding `FLOW_OFFLINE_SYNC`).
  **Rule 1 was proven suite-wide on 2026-07-28 and every flow now complies.** It fired on
  FLOW_AUTH_SESSION_PERSISTENCE, whose failure mimics identity loss exactly, and it cost a real
  investigation because a `@supabase/auth-js` bump had landed the same hour. **Discriminating a
  harness race from a regression takes one re-run of the identical commit**: a deterministic break
  cannot pass on attempt 2. That is the cheapest experiment available and should be the first move
  whenever a red follows a dependency change — but it rules out only a deterministic cause, never a
  probabilistic one.
  1. **Never open a flow with `launchApp: clearState: true`.** Fusing the clear and the launch races
     the previous flow's TASK teardown: Android's `Destroy timeout of remove-task` fires ~1.1s into
     the launch and kills the process it has just created (`failed to attach`), the app never
     starts, and the flow fails 60s later on its first assertion looking exactly like a product
     defect. `stopApp` alone does NOT fix it — what lingers is the task, not the process. Use three
     discrete steps: `stopApp`, `clearState`, `launchApp`.
     **This is latent for the whole suite**: `FLOW_MORNING_RITUAL` and `FLOW_RETURNING` end without
     cleanup, so any flow opening with a cleared launch can draw it depending on Maestro's ordering.
  2. **A cleared offline banner is not proof of connectivity.** NetInfo reports `isConnected` from a
     link-level signal that can exist with no usable route, so a flow that toggles airplane mode
     must make the app PROVE the network came back — a cleared cold start that reaches Today has no
     cache to fall back on. Without it, `FLOW_OFFLINE_SYNC` left the radio dead and a later flow lost
     a server-written preference, presenting as a defect in an unrelated feature. **A flow that
     breaks its neighbours is worse than one that fails**: restore-and-verify inside the flow that
     changed the device.
  3. **The evidence is in the uploaded ARTIFACT, not the run log.** The screen hierarchy and
     `device-logcat.txt` exist only there; grepping the run log finds nothing and reads as absence of
     evidence. Both defects above were diagnosed from the artifact. Same lesson the Pixel Launcher
     ANRs taught.
- **Assert a deletion by CONTENT, never by the foreign key** — restated here because it generalises
  past the deletion executor: a test written against the identifier a deletion removes cannot detect
  a deletion that only removed the identifier. `ON DELETE SET NULL` keeps the row and drops the link,
  so `where user_id = ...` reads zero either way.
- **MockPanchangProvider** is DEV/TEST ONLY and must never be imported by production code.
- **Backend Edge Functions pending** — SVC_household (member/invite), SVC_notify_scheduler
  (notify/schedule), and SVC_revenuecat_webhook are pending backend deliverables; the corresponding
  clients are coded to the OpenAPI/DB contracts. Household transfer + account deletion use
  SVC_account (implemented).

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
