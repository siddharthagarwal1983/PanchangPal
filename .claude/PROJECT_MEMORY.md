# PROJECT_MEMORY.md

# PanchangPal — Project Memory

Version: 3.3.0

Last Updated: 2026-08-07 (Maestro rules 5 and 6 — the emulator action runs one `sh -c` PER LINE; a
flow owns its own preconditions and never cleans up for its successor; and the artifact's logcat held
only the last ~20s of every run until it was streamed)

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
  concrete Sentry adapter is **LIVE as of 2026-08-02** (`@sentry/react-native` ~7.2.0, PR #79),
  provisioned against org `panchang` / project `panchangpal-mobile`, and **verified on device**:
  `[telemetry] reporter=sentry` appears once per launch in the E2E artifact (12/12) where it read
  `reporter=none` before. The native SDK installs `UncaughtExceptionHandlerIntegration`,
  `NdkIntegration`, `AnrV2Integration` and `AppLifecycleIntegration` — the last is what crash-free
  sessions (NFR-06 / §7.2) is computed from, and **none of them installed under the original
  defect**, where `Sentry.init` ran only after the FIRST JS error. The adapter is therefore resolved
  once in AppProviders' mount effect, guarded by a test that fails if that resolution is removed.
  **It still degrades honestly**: with no DSN the adapter resolves to Null, `getTelemetryBackend()`
  reports `'none'`, and `isUsableDsn()` rejects placeholders — so a local or CI build without one
  behaves as before rather than half-initialising.
  ⚠️ **CI IS NOT A BUILD WITHOUT A DSN — IT PULLS A REAL ONE**, via
  `eas-cli env:pull --environment preview` in `e2e.yml`. Every E2E launch reaches the live
  `panchangpal-mobile` project, and **until 2026-08-02 it did so tagged `environment: production`**:
  `sentryEnvironment()` read `extra.eas.channel`, which only **EAS Build** stamps, and the CI build
  is `expo prebuild` + `gradlew assembleRelease` on the runner, where `__DEV__` is also false. So the
  fallback resolved to production and the crash-free SLO was measuring an emulator — essentially all
  91 sessions at the time of discovery. An `environment:production` alert would have paged on every
  CI run. Fixed by an explicit `EXPO_PUBLIC_SENTRY_ENVIRONMENT` override (#98) that **wins over the
  channel**, because the build that knows it is not production is the build itself.
  **Historical sessions are NOT relabelled** — the crash-free number is untrustworthy until real
  traffic accrues, which matters at a go/no-go.
  **`[telemetry] reporter=<backend> env=<environment>` is the one observable**, and the `env=` half
  exists because answering "which environment did that build report as?" took a four-file deduction
  and still could not be read from an artifact — Sentry's own logs print the DSN and never the
  environment. **An SLO scoped by a value nobody can observe is the same defect shape as a gate that
  cannot fail.**
  **BUILD-TIME CONFIG REACHES THE APP THROUGH `app.config.ts`'s `extra`, NOT `process.env`.**
  Reading `process.env.EXPO_PUBLIC_*` in app code relies on Babel inlining it into the bundle, and
  **the gradle-driven `export:embed` path does not deliver it** — a value present in `.env` still
  read as `undefined` on device. `extra` is evaluated by Expo CLI in Node where the `.env` is loaded;
  it is how `supabaseUrl`, `supabaseAnonKey`, `revenueCatKey` and `sentryDsn` already work. **The
  `process.env`-only version passed its unit test**, because jest sets `process.env` directly and
  never exercises the bundler: a test can only prove the layer it touches.
  **Appending to `.env` in CI needs an explicit leading newline.** `eas env:pull` does not guarantee
  a trailing one, so `echo "K=V" >> .env` concatenates onto the **last variable's value** —
  `EXPO_PUBLIC_SUPABASE_URL=https://real.supabase.coEXPO_PUBLIC_SENTRY_ENVIRONMENT=ci`. The name
  still parses, so the file looks valid while the value is garbage; a corrupted Supabase URL failed
  four of six flows and read as a product defect. Use `printf '\nK=V\n'`. **The tell is the job's own
  `env: export ...` line**, which lists the parsed names — if the new variable is missing from it,
  the append silently did the wrong thing.
  **No PII is structural** (§7.1 `[MANDATORY]`): unrecognised errors map to `ERR_UNKNOWN` rather than
  echoing a message, EVT_054's props are a closed four-key shape, and `componentStack` is never
  forwarded. Every ERR_* maps to EVT_054; its sink is the analytics adapter (ADR-013).
- **SVC_health IS THE ONLY UNAUTHENTICATED SURFACE IN THE SYSTEM** (`apps/backend/functions/health/`,
  added 2026-08-02 for NFR-14). Every other Edge Function relies on `verify_jwt` defaulting to true;
  this one sets it **false**, because an anonymous uptime probe against any of the others measures
  the auth layer returning 401 rather than availability — which is why NFR-14 had no instrument.
  **Two invariants are pinned by tests, and neither should be relaxed to make something pass.**
  `tests/rls/unauthenticated-surface.test.ts` fails if a **second** function goes anonymous — Edge
  Functions run with the SERVICE ROLE, so RLS is not a backstop (the B6.2 finding), and a second one
  is that hole again, shipping green. `functions/health/probe.test.ts` pins the response body as a
  closed `{status, checked}` shape: anything this endpoint returns is public to the internet, and a
  health endpoint that echoes its dependency error hands out Postgres versions and table names.
  **`evaluateHealth()` takes a BOOLEAN**, so no parameter exists through which an error could reach
  the body — structural, not conventional.
  **It does a REAL database read** (`feature_flag`, `head: true` so no rows return), because a
  liveness-only probe reports 99.9% straight through a total outage: a monitor that cannot go red.
  ⚠️ **Declaring a function in `supabase/config.toml` does NOT deploy it.** `cd.yml` passes an
  explicit name list to `supabase functions deploy`, and `health` was missing from it — the PR would
  have merged green and served nothing. Pinned both ways by
  `tests/rls/edge-function-deploy-list.test.ts`.
- **OBSERVABILITY IS PROVEN, NOT CONFIGURED — AND ONLY TWO SLOs QUALIFY** (B4, closed 2026-08-02).
  §7.2 names seven; `docs/devops/SLO_ALERTS.md` records each one's instrument, threshold, alert and
  named blocker, pinned by `apps/backend/tests/observability/slo-alerts.test.ts` — which fails when
  an instrument **appears** while the doc still calls it missing, because a doc that keeps saying
  "blocked" after the instrument lands makes the gap invisible.
  **NFR-06** (crash-free sessions, mobile) and **NFR-14** (availability, via SVC_health) are live and
  were each **watched to open an issue and deliver mail to a human**.
  ⚠️ **THERE ARE TWO DENOMINATORS HERE AND MERGING THEM IS HOW THE TRACKING DOCS DRIFTED** (found
  and reconciled 2026-08-02). **§7.2 names SEVEN SLOs and NFR-07 is NOT one of them** — crash-free
  users comes from the **Part 1 §8 NFR table**, and `SLO_ALERTS.md` tracks it deliberately because it
  reuses NFR-06's session data and **binds tighter** (99.8% against a structurally lower metric), so
  it is the page that arrives first. **"Two of §7.2's seven are proven" and "three SLOs are proven"
  are BOTH TRUE.** Five tracking documents said two while SESSION.md said three, and neither was
  wrong; `SLO_ALERTS.md` §1 now states why its table has eight rows. When a count in this project
  disagrees across documents, check whether the denominators match before correcting either.
  ⚠️ **NFR-06's first drill detected perfectly and notified NOBODY**: both alert rows targeted
  *Suggested Assignees*, which Sentry resolves from suspect commits, and a **metric-monitor issue has
  no stack trace and no suspect commit** — the recipient set was empty. The issue was still assigned,
  via the monitor's separate `Assign` field, which is what made it look correct. **Always set an
  explicit Member.** The three questions are not one: did the data land · did DETECTION fire · did
  NOTIFICATION reach a human. Only the third settles it, and the first two passed while it failed.
  ⛔ **AN OPEN ISSUE SUPPRESSES THE NEXT ALERT** (confirmed 2026-08-02). Sentry folds new
  occurrences into an existing open period and does **not** notify again — so an issue left open
  means **the next real incident of that kind pages nobody.** Confirmed when a drill crossed both
  the NFR-06 and NFR-07 thresholds and only NFR-07 emailed, because NFR-06's earlier issue was still
  open. It is the inverse of alert fatigue: nothing looks wrong, and the alert simply does not
  arrive. **Resolve issues, including drill issues — never ARCHIVE, which mutes outright.** And a
  silent alert is not evidence the threshold held; check whether the issue is already open.
  ⛔ **AND A METRIC-MONITOR ISSUE CANNOT BE CLEARED BY HAND** — no Resolve button, Delete disabled;
  only Archive (which mutes), Mark reviewed, Bookmark. Its lifecycle belongs to the monitor, and it
  closes **only on a healthy reading** (`>= 99.8%`), never on time passing or on the bad data ageing
  out. Regular ERROR issues do offer Resolve; the two types differ. **The only lever is to recreate
  the monitor.** Harmless pre-launch — no traffic means nothing to suppress — but it becomes a
  launch-day trap: if the FIRST real traffic is unhealthy, the metric never recovers, the drill issue
  never closes, and a genuine incident never pages. **Pre-launch checklist: confirm no metric monitor
  has an open issue.**
  **`scripts/slo-alert-drill.mjs`** makes the crash-free drill repeatable, guarded behind `--confirm`
  because it writes unremovable synthetic crashes into production session data — cheap before launch,
  permanently expensive after.
  **The five unproven SLOs are not unfinished engineering:** three sit behind the Ask Guru gate, one
  behind uninstalled `expo-notifications`, and **NFR-10 behind a PDD decision** — PDD §11's registry
  (EVT_001-EVT_055) contains **no sync event**, `events.ts` forbids inventing one, and
  `AnalyticsService` rejects unknown ids at runtime. Either PDD adds sync events or a server-side
  metrics sink is chosen; neither is typing.
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
- **A DURABLE QUEUE GUARANTEES DELIVERY, NOT DISPLAY — and this cost two separate defects in one
  day** (2026-08-01). Both had the same shape and were reached from opposite directions.
  (1) The offline COMPLETION was written to disk synchronously every time and simply never
  re-derived onto the rendered read model, so the tick came from a throttled cache snapshot that
  raced the process kill. (2) The PREFERENCE write, once made durable, was delivered to the server
  by the drain while `useOfflineSync` invalidated only `['streak']` and `['checklist']` — so the
  screen kept showing what it fetched at launch and the change looked lost at the moment it landed.
  **When you add a write path to the queue, add the read half in the same change**: the queue is
  durable, the cache is a cache, and nothing re-reads on its own.
- **A QUEUED MUTATION CARRIES THE IDENTITY THAT MADE IT, AND IS HELD — NEVER DROPPED — UNDER ANY
  OTHER** (`isSendableBy`, 2026-08-01). Two reasons, and the second is the subtle one. A pending
  change must not drain onto another account after a fresh anonymous uid is minted (the M1/M9
  defect `secureSessionStorage.ts` exists to prevent). And because
  `FLOW_AUTH_SESSION_PERSISTENCE` proves identity by reading back a tradition only that identity
  could have written, a drain that ignored identity would RECREATE that value under the new uid —
  **the flow would pass at the exact moment the defect it guards occurred.** Making a kind syncable
  can therefore break an unrelated flow's ability to detect a defect; check what reads the value
  back before adding one. Held rather than discarded, because §6 forbids discarding a completion
  and "belongs to someone else right now" is not "invalid".
- **A LOST WRITE AND A LOST IDENTITY LOOK IDENTICAL ON THE SETTINGS SCREEN** (established
  2026-08-01, after FOUR misattributions). `FLOW_AUTH_SESSION_PERSISTENCE` reverting to Generic was
  blamed twice on the launch race, once on a Sentry regression, and once on an unexplained flake.
  The real cause each time was that `useUpdatePreferences` wrote **directly to the server with no
  durable path**, so an app kill inside the request window silently reverted the setting. The flow's
  own header asserted only the identity reading and sent every investigation down the wrong path.
  **When a flow's failure has two candidate causes, its header must name both** — a diagnostic that
  names one is worse than none, because it is trusted.
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
  **The restored snapshot is CORRECTED from the durable queue before anything renders**
  (`reapplyPendingMutations`, 2026-08-01). On its own the snapshot is a stale read model that races
  the user's own action: it is written on a 1 s trailing throttle and flushed from an unsubscribe
  handler a process kill never runs, so a completion made offline and then killed inside that
  window is simply absent. The projection writes only to keys already in the cache — seeding one
  would render a completion against rows the screen cannot name — and server truth still wins the
  moment the drain invalidates. See the offline-completion entry below for what this cost to find.
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
- **THE EXPO SDK 54 PIN IS A SEAM, AND THE AUTHORITATIVE LIST IS A FILE, NOT A PATTERN SET**
  (established 2026-07-28, corrected 2026-08-01 after the rule leaked a THIRD time).
  **`node_modules/expo/bundledNativeModules.json` is the authority: every key in it is SDK-pinned by
  definition.** Check a package against that manifest — `node -e "console.log(require('expo/bundledNativeModules.json')['<pkg>'])"` —
  never against its release notes, and never against whether CI is green. Hand-enumerating patterns
  in `.github/dependabot.yml` did **not** converge: it leaked for `@expo/*`, `@babel/runtime`,
  `react` (#64/#65/#75), then again for **`@react-native-community/*`** (#81 — netinfo, pinned at
  exactly the installed 11.4.1) and **`jest`/`jest-expo`** (#63 — `jest-expo@54.0.17` depends on the
  jest 29 family: `@jest/globals`, `babel-jest`, `jest-environment-jsdom`, `jest-snapshot`, all
  `^29.2.1`). **#63 spent two weeks triaged as "red for its own unrelated reasons"** because it was
  classified from its red CI rather than its dependency graph — the exact mistake #78 documented.
  Scanning the manifest against every declared dependency found those two gaps and no others.
  ⛔ **"SO THE SDK 54 SET IS NOW COMPLETE" WAS WRONG, AND WAS FALSIFIED WITHIN A WEEK** (2026-08-02,
  by PR #89 proposing `babel-preset-expo` 54.0.12 → **57.0.5**). **`bundledNativeModules.json` lists
  NATIVE modules.** It is authoritative in one direction only — a hit means SDK-pinned — and says
  nothing about SDK-pinned **build** packages, which are not native and never appear in it.
  `babel-preset-expo` is pinned by **`expo@54.0.36`'s own direct dependency range, `~54.0.12`**, and
  its majors track SDK majors exactly as `@expo/metro-runtime`'s do. It is not in the manifest, and
  no ignore pattern matches it — `expo-*` does not match a `babel-preset-` prefix, the same shape as
  the `@expo/` and `@react-native-community/` misses. **Fourth leak of this rule.**
  So the check is **two-sided**: the manifest for native modules, plus
  `node -e "console.log(require('expo/package.json').dependencies['<pkg>'])"` for anything the SDK
  itself depends on. A tilde or caret range there is an SDK pin.
  That `babel-preset-expo` is the leak is pointed: it is one of the two undeclared transitive
  dependencies that broke bundling during the Execution Gap, which is why this file already says it
  **gets extra care, not less**.
  **Two further packages are SDK-pinned by mechanisms NEITHER side of the check reports, found in
  the same batch (#91, #92) and now also ignored.** They are worth knowing by name, because the
  general lesson is that a pin can live in a *transitive* graph or in a *vendored exact version*:
  **`@babel/core`** is pinned by the **babel 7 plugin family** the SDK's toolchain is built from,
  with no declared peer anywhere — `@babel/core` 8 is **ESM-only** and every babel-7 plugin
  `require()`s it (`ERR_REQUIRE_ESM` from `@babel/plugin-transform-object-rest-spread`, plus the
  bundle gate dying inside `react-native-worklets`' plugin). **`@sentry/cli`** is pinned because
  `@sentry/react-native@7.2.0` depends on it at **exactly `"2.55.0"`**, not a range; the top-level
  `^2.55.0` declaration exists only so `sentry.gradle`'s flat-`node_modules` fallback resolves under
  pnpm (added by #79).
  **A SIXTH mechanism, found 2026-08-02 by the RNTL 14 migration, and the first where the constraint
  lives in a TRANSITIVE dependency's peer rather than anywhere in this repo's graph:
  `test-renderer`.** RNTL 14 replaced the `react-test-renderer` peer with `test-renderer@^1.0.0`, and
  that range is not the constraint — the reconciler beneath it is:
  `test-renderer@1.1.0 → react-reconciler@~0.32.0 → peer react ^19.1.0` (satisfied) versus
  `test-renderer@1.2.0 → react-reconciler@~0.33.0 → peer react ^19.2.0` (**not** satisfiable against
  the exactly-pinned 19.1.0). So it is **pinned by the REACT MINOR** — `1.1.0` in both
  `apps/mobile` and `packages/ui` — and moves only with `react`, which moves only with the SDK.
  ⚠️ **1.2.0 is peer-LEGAL as far as RNTL is concerned**, so Dependabot has every reason to propose
  it and **pnpm records the unmet transitive peer and installs anyway** (the #82 mechanism): green
  CI, with a reconciler built for a React the app does not run. **Read the reconciler's peer, not
  RNTL's.** Neither side of the two-sided check reports this — `test-renderer` is not in
  `bundledNativeModules.json` and is not an `expo` dependency; **RNTL's own migration guide is the
  only place the coupling is written down** (React 19.1 → test-renderer 1.1, 19.2 → 1.2).
  `react-test-renderer` nonetheless stays in the tree, because **`jest-expo@54.0.17` depends on it
  directly** — it is simply no longer what RNTL renders with, and this repo never declared it.
  **RNTL 14's breaking change is not the renderer swap: the API went ASYNC.** `render`, `renderHook`,
  `fireEvent`, `act`, `rerender` and `unmount` all return Promises (React 19's rendering model);
  queries stay synchronous. The bump alone fails every component test with "`render` function has not
  been called", because `screen` is populated only after the awaits resolve — which reads like a
  broken install and is not one.
  ⚠️ **#91 IS THE CLEAREST CASE THAT A GREEN GATE CAN BE VACUOUS RATHER THAN REASSURING.** It passed
  all five gates and *had to*: `e2e.yml` sets `SENTRY_DISABLE_AUTO_UPLOAD: 'true'` and **no gate runs
  `sentry.gradle` at all**, so the only consumer of `@sentry/cli` is never exercised. Before reading
  a green as evidence, **ask which gate would have to fail** — if no gate touches the package's
  consumer, the colour carries no information. That is now the **third distinct mechanism** behind
  the same signature, after native resolution (mmkv v2, #64/#65) and unmet peers pnpm does not
  enforce (#82).
  `react`, `@types/react`, `@expo/*` and `@babel/runtime` are pinned by the SDK exactly
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
- **AN UNMET PEER DOES NOT FAIL CI, SO THE PEER GRAPH IS A TRIAGE INPUT AND NOT A CONSEQUENCE OF
  ONE** (established 2026-08-02). **pnpm records an unmet peer dependency and installs anyway.** PR
  #82 (`react-i18next` 15→17) therefore passed **all five gates** while violating its own declared
  peer, `i18next >= 26.2.0`, against the installed 23.16.8 — and its lockfile stated both facts
  side by side: `react-i18next@17.0.11(i18next@23.16.8)`.
  **Read the proposed package's declared peers against the installed graph BEFORE looking at CI.**
  A PR whose peer is unsatisfiable alone is not a PR; it is half of a coupled change. #82 and #62
  (`i18next` 23→26) sat in the queue for a week as two independent items, one green and one red,
  and #62's red — a *type* error about `compatibilityJSON` — pointed nowhere near #82.
  **This is a DIFFERENT mechanism from the SDK-pin rule below, with the same signature.** Neither
  package appears in `bundledNativeModules.json`, so the SDK rule never applied; green was still not
  the criterion. Fourth instance overall, after mmkv v2, `babel-preset-expo`, and #64/#65. The
  generalisation worth keeping: **a red PR and a green PR in the same queue can be two halves of one
  change, and the error message will not say so.**
- **THE i18n BUNDLE MUST DEFINE NO PLURAL-SUFFIXED KEY, AND THAT IS LOAD-BEARING** (established
  2026-08-02, when i18next moved 23 → 26 and removed `compatibilityJSON`). No `_one` / `_other` /
  `_plural` (or other CLDR-category) variants in `apps/mobile/src/i18n/en-US.ts`. Pinned by
  `apps/mobile/src/i18n/__tests__/pluralization.test.ts`, which runs the real bundle with
  `Intl.PluralRules` **deleted** to simulate a partial-Intl Hermes.
  **The safety condition is narrower than "pluralization is unused."** Two call sites DO pass
  `count` — `t('streak.label', { count })` and `t('household.memberCount', { count })` — so i18next's
  plural path is genuinely reached. What makes it harmless is that both use `count` only as an
  **interpolation variable** (`'{{count}} day streak'`) and no suffixed variants exist, so the
  suffixed lookup **misses and falls back to the base key** whichever rule produced the suffix.
  `household.tsx` additionally branches on `n === 1` itself.
  **So the invalidating condition is a plural-suffixed KEY, not a `count` call site.** Add one and
  the rendered form starts depending on the plural rule; where `Intl.PluralRules` is absent,
  i18next's `getRule` catches and substitutes a dummy `one`/`other` rule. For en-US that dummy agrees
  with the real rule, so **the first locale with more than two categories (Polish, Arabic, Russian)
  renders the wrong form outright — silently**: no crash, nothing reaching the telemetry seam, just
  incorrect copy. Verify `Intl.PluralRules` on device first and add `@formatjs/intl-pluralrules` if
  it is absent.
  **Whether Hermes ships Intl.PluralRules is still UNANSWERED** — Android's Intl lives in the
  prebuilt AAR, not the npm package, so it cannot be settled from the repo. The test makes the
  question moot rather than answering it; the first plural key restores the dependence.
  Two method notes worth not rediscovering. The old `compatibilityJSON: 'v3'` setting carried a
  runtime justification in a comment, and **flipping it to `'v4'` to clear the type error would have
  been the #75 `react-test-renderer` trap** — green CI, changed device behaviour. And the first guard
  written for this asserted "no call site passes `count`" and **failed on its first run**, which is
  how the narrower invariant was found: test the property, do not grep for a pattern that
  legitimately exists.
- **⛔ AN OFFLINE COMPLETION WAS LOST ON APP KILL — AND THE QUEUE WAS NEVER THE PROBLEM** (found
  2026-07-28/29, root cause corrected 2026-08-01; fix implemented, **not yet device-verified**).
  `FLOW_OFFLINE_SYNC` failed ~50% at **line 131** — the `☑` assertion AFTER `stopApp` / `launchApp`,
  the one its own header calls "THE ASSERTION THIS FLOW EXISTS FOR". Losing a completion is what
  **TDD Part 4 §6 forbids**, so it is a launch blocker.
  **THE RECORDED CAUSE WAS WRONG.** This entry previously said "an asynchronous or batched MMKV
  write of `STORE_offlineQueue` can be beaten by the kill". It cannot: `keyValueStore`'s `set` maps
  straight onto MMKV's **synchronous** JSI call and runs inside the tap handler, logcat shows the
  library loading natively in every launch, and no `[sync]` persistence warning is ever emitted.
  **The pending mutation reached disk every time.**
  **The real defect is that nothing RENDERED it.** `STORE_offlineQueue` was consumed by exactly two
  things — `enqueue` calls and the drain in `syncService` — so the checklist tick after a cold start
  came *only* from the persisted query cache, which is written on a **1 s trailing throttle**
  (`queryPersistence`'s `WRITE_THROTTLE_MS`) and flushed from an unsubscribe handler **a process
  kill never runs**. Offline it was additionally poisoned: the direct write always fails with no
  network, and `useChecklist`'s `onError` reverted the optimistic tick even though the mutation was
  durably queued. The ~50% was simply whether the process died before or after the revert-plus-
  throttle write landed — **the passing runs passed by luck of timing.**
  **The rule this establishes: a durable queue guarantees DELIVERY, not DISPLAY.** Pending state
  must be re-derived from the queue onto the read model at startup, or the user is shown a snapshot
  that races their own action. Now done by `domain/sync/pendingProjection.ts` +
  `reapplyPendingMutations`, with `onError` reverting only when nothing is left in the queue to
  deliver the completion (keyed on the app's own state, never on a vendor's network message, which
  changes between supabase-js releases).
  **Do not fix it by adding settle time to the flow**; that hides a race real users can hit.
  **It masqueraded as a Sentry regression** for most of a session. It was never Sentry: main flaked
  **3 green / 3 red on 2026-07-28** with an identical three-flow signature, and one of the reds was
  `4fdaf10` (#78), a commit that changed **only** `.github/dependabot.yml` and ADR markdown and
  therefore cannot have introduced a runtime race.
  **Related structural defect, now fixed:** `FLOW_OFFLINE_SYNC` restored the radio as its LAST step,
  so ANY earlier failure left airplane mode enabled and failed FLOW_SESSION_PERSISTENCE and
  FLOW_RETURNING as collateral — **one defect presenting as three**, which is why it took most of a
  session to isolate. The restore is now an `onFlowComplete` teardown, which Maestro runs whether
  the flow passed or failed.
- **A RE-RUN DISCRIMINATES FLAKE FROM DETERMINISM ONLY ACROSS ENOUGH SAMPLES TO BEAT THE FAILURE
  RATE** (established 2026-07-29, correcting the rule recorded on 2026-07-28). The earlier note said
  "discriminating a harness race from a regression takes one re-run of the identical commit: a
  deterministic break cannot pass on attempt 2." **That reasoning assumes the two runs are
  independent trials, and they are not** — runs minutes apart share an emulator profile, a staging
  backend and a timing environment. A ~50% race presents as two identical failures and reads as
  determinism. The offline-persistence defect above went **3/6, 3/6, 6/6, 5/6, 6/6, 3/6** across six
  runs on one commit; any single re-run would have "proved" whichever answer you happened to draw.
  When a red follows a change, compare against a **baseline of the same flow count on main**, not
  against one re-run.
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
     ⛔ **AND UNTIL 2026-08-07 THAT ARTIFACT HELD ONLY THE LAST ~20 SECONDS OF A ~2m20s RUN.**
     `adb logcat -d` dumps the ring buffer, and something clears it during a run, so the dump held
     about **one flow's worth** — 1471 lines out of ~12,500. Every logcat diagnosis this repo has
     made (the launch race, the `Destroy timeout of remove-task` hang, MMKV's memory fallback)
     concerned a failure near the END of the suite, where the tail still held it. **That was luck.**
     A flow failing early — FLOW_MORNING_RITUAL runs first, ~2 minutes before the dump — would have
     produced an artifact with no relevant log, and the absence would have read as "nothing wrong in
     the log", which is exactly what this rule warns against.
     **Fixed by STREAMING**: `scripts/run-maestro-flows.sh` attaches `adb logcat -v threadtime` to
     the output file before the suite starts and stops it after, so a mid-run clear cannot take back
     what is already on disk. Result: **12,508 lines spanning the full 148 s**, beginning before the
     APK is even installed. The script echoes the captured line count and warns under 100 lines, so a
     silently empty log is visible in the job output.
     ⚠️ **THE FIRST DIAGNOSIS WAS WRONG AND SHIPPED GREEN.** It was read as the 256K default buffer
     overflowing, because 1471 lines × ~150 bytes ≈ 220K sits suspiciously close to it.
     `adb logcat -G 16M` was applied, went green, and **changed nothing** (1444 lines/21 s) —
     `adb logcat -g` then showed `16 MiB (701 KiB consumed)`, i.e. the buffer was **never full** and
     nothing was ever evicted. The coincidence had been read as causation. **A green run proves a
     change did not break anything; it says nothing about whether the change did what it claimed.**
     Measure the thing the change was supposed to move.
  4. **A CLEAR RACES THE NEIGHBOUR'S TEARDOWN, NOT JUST ITS OWN LAUNCH — AND THE FLOWS STEP HAS NO
     TIMEOUT, SO THE HANG GOES DARK** (established 2026-08-06, E2E `31120798108`). Rule 1's three
     discrete steps are necessary and **not sufficient**. FLOW_SESSION_PERSISTENCE hung on
     `Launch app "com.panchangpal.app"` — the command itself never returning, rather than Rule 1's
     ~60 s assertion failure — 0.5 s after its own `clearState`, which itself followed
     **FLOW_OFFLINE_SYNC's `onFlowComplete` teardown doing `stopApp` + `clearState`**. Two clear-states
     ~0.5 s apart, with logcat showing `Destroy timeout of remove-task, attempt to kill
     Task{... com.panchangpal.app}` 11 s earlier. So the hazard is **any** clear racing a
     neighbouring flow's teardown, not only a fused `launchApp: clearState: true`.
     ⛔ **`e2e.yml`'s `maestro test tests/flows/` was NOT wrapped in `timeout`** (fixed same day on
     `fix/e2e-flow-timeout`: `timeout --kill-after=1m 25m`, exit 124/137 annotated as a HANG rather
     than a flow failure), while `Build APK` already was
     (`timeout --kill-after=2m 40m`, added 2026-07-25 after a hung Gradle burned to the job budget and
     reported **`cancelled`** — "a red build wearing a timeout's costume"). The guard was applied to
     one step and not the other, so a hung flow consumes all 90 minutes and reports `cancelled`, which
     **is not read as red and tells nobody**. Same defect shape, one step over.
     ⚠️ **The run still proved something**, and separating the two halves is the point: two flows
     passed **completely** first (FLOW_MORNING_RITUAL 18/18, FLOW_OFFLINE_SYNC 39/39) on a green
     `Build APK`, so a hang late in a suite is not evidence against the change under test. Read the
     per-flow `commands.json` statuses before attributing anything.
  6. **A FLOW ESTABLISHES ITS OWN PRECONDITIONS AND NEVER CLEANS UP FOR ITS SUCCESSOR** (established
     2026-08-07, PR #110 — the fix for rule 4's race). **One `clearState` per boundary, owned by the
     flow that needs it.**
     Several flows used to END with a trailing `clearState` "so the next flow inherits nothing",
     while every flow needing a clean device already cleared at its own START. Both sides of each
     boundary cleared, so a boundary carried **two `pm clear` calls ~0.5 s apart** — and the second
     raced the task teardown the first had begun. **The cause was the DUPLICATE, not the clear.**
     The fix deletes the duplicated work rather than waiting for it: a settle would have masked a
     race real users can hit, which this repo forbids.
     ⚠️ **Removing a trailing clear can STRAND the flow that was relying on it.**
     `FLOW_MORNING_RITUAL` opened `launchApp: clearState: false` and depended on *inheriting* a clean
     device — a hidden precondition that held only because it happens to run first. It now clears for
     itself. A completed ritual session restores as `completed` and renders CompletionMoment, so it
     would have failed at its first tap, nowhere near the cause.
     **`FLOW_RETURNING` deliberately does not clear**, and is safe because it never opens the ritual
     screen and Today's card reads "Begin" from a hardcoded `completedToday: false`
     (`app/(tabs)/today/index.tsx`) — verified in the source, not taken from the comment asserting
     it.
     ⛔ **MAESTRO'S EXECUTION ORDER IS NOT ALPHABETICAL.** Read from the run log it is
     **MORNING_RITUAL → OFFLINE_SYNC → SESSION_PERSISTENCE → AUTH_SESSION_PERSISTENCE → ONBOARDING →
     RETURNING**. `FLOW_SESSION_PERSISTENCE`'s header claimed alphabetical ordering put it last; it
     runs **third**, immediately after OFFLINE_SYNC — precisely the adjacency that hung. **Treat the
     order as arbitrary**; the invariant above is deliberately order-independent for that reason.
     Pinned by `apps/backend/tests/e2e/flow-lifecycle.test.ts` (19 assertions, four perturbations).
     It lives under `apps/backend/tests/` because that is the only place the root vitest config
     would actually RUN it — a test beside the flows would never execute, which is a gate that
     cannot fail.
  5. **THE EMULATOR ACTION RUNS ITS `script:` BLOCK ONE LINE AT A TIME, EACH IN ITS OWN `sh -c`**
     (established 2026-08-07, E2E `31145793824`; fixed in `610bf12`). This is a property of
     `reactivecircus/android-emulator-runner`, and the job log states it literally
     (`[command]/usr/bin/sh -c set -e`). Two consequences, both of which bit:
     **a multi-line shell construct is a SYNTAX ERROR** (`if` never sees its `fi`), and **a variable
     assigned on one line is gone by the next**, so `set +e` / `flows_status=$?` are per-line no-ops.
     The first attempt at the flows-step timeout guard therefore **failed a run in which all six
     flows PASSED** — "6/6 Flows Passed in 2m 23s", step red with exit 2.
     ⛔ **The second consequence is the dangerous one: the action ABORTS at the failing line**, so
     `adb logcat -d > maestro-logcat.txt` never ran. The failed run's artifact holds the six
     `commands.json` and **no `maestro-logcat.txt`**; the green run's holds it. **The device log
     disappeared from exactly the runs that need it** — and rule 3 above says the artifact is where
     the evidence lives, so this silently removed the project's main diagnostic.
     It also means the **pre-existing** `set +e` / `exit $flows_status` plumbing had never worked:
     failures propagated only because a non-zero line fails the action directly, while `e2e.yml`'s
     comment claimed "the flows' exit status is preserved". A documented control, never implemented,
     with nothing asserting it.
     **The rule: any logic beyond a single command goes in a script file** (`scripts/run-maestro-flows.sh`)
     invoked as one line. One shell parses one program, which makes the whole class unreachable
     rather than avoided by careful one-lining — the same structural preference as `evaluateHealth()`
     taking a boolean so no parameter exists through which an error could leak.
     ⚠️ **And the verification lesson, which is the transferable half.** The guard had been "proven"
     against a local GNU-`timeout` shim. That test was not wrong — **it tested the wrong layer**,
     establishing the exit-code semantics while being structurally unable to see the per-line
     `sh -c` execution. Identical shape to the `process.env` unit test that passed while the
     gradle `export:embed` path delivered nothing. **When a change's whole purpose is how CI behaves,
     the only sufficient test is running it in CI.**
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
