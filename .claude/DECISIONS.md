# DECISIONS.md

# PanchangPal — AI Decision Summary

Version: 1.2.0

Purpose:
This file contains a condensed summary of permanent project decisions.

It exists to minimize context usage for AI coding agents.

For detailed rationale, see:

docs/ai/07_DECISION_LOG.md

or

docs/architecture/adr/

---

# Product Decisions

## 2026-07-28 — An SDK-pinned dependency is never bumped alone, and CI greenness does not exempt it

**Decision.** `react`, `@types/react`, `@expo/*` and `@babel/runtime` join `expo`, `expo-*`,
`react-native` and `react-native-*` in `.github/dependabot.yml`'s ignore list. All eight move only
with a deliberate Expo SDK upgrade, via `expo install --fix`, validated by a native build plus the
six Maestro flows. A proposal to bump one of them individually is closed with its peer evidence, not
evaluated on its CI result.

**Why these four specifically.** The rule already existed and only its *patterns* were short, which
is what produced PRs #64, #65 and #75 and the phantom "SDK-upgrade increment" the tracking docs had
queued. `expo-*` does not match a scoped `@expo/` name, so `@expo/metro-runtime` — the one Expo
package whose majors track SDK majors (`sdk-56`→56.x, `latest` 57.0.7→**SDK 57**) — slipped through
against `expo-router@6.0.24`'s `^6.1.2` peer. `@babel/runtime` is pinned by
`babel-preset-expo@54.0.12`'s `^7.20.0` peer. `react` is pinned by react-native shipping its **own
Fabric renderer built against React `"19.1.0"`**, hardcoded in
`Libraries/Renderer/implementations/ReactFabric-{dev,prod}.js`.

**Why CI result is explicitly not the criterion.** #64 and #65 passed **all five gates, including
the bundle gate**, while #75 — the only one that is peer-*legal* — was the sole red. `expo export`
resolves what fails natively, so for this class of package green is anti-correlated with safety.
That is the third instance here, after mmkv v2 under the New Architecture and the undeclared
`babel-preset-expo`.

**And the obvious fix can be the trap.** #75's red is
`@testing-library/react-native`'s `build/helpers/ensure-peer-deps.js` asserting `react-test-renderer`
=== `react` exactly. Moving `react-test-renderer` to 19.2.8 — which TASK.md had recorded as the
required step — would have turned CI green while leaving the renderer at 19.1.0, i.e. silenced the
one check that noticed the mismatch. **When a dependency bump fails a version assertion, satisfy the
constraint the assertion is defending, not the assertion.**

**Method, worth reusing.** The peer graph in `node_modules` answers this class of question in
minutes; the saved plan called for a native build and six flows first. Read the installed peers and
the package's dist-tags before scheduling an upgrade exercise.

---

## 2026-07-26 — The offline queue carries only the mutation kinds SVC_sync reconciles

**Decision.** `SYNCABLE_KINDS` is `ritual_complete | checklist | personal_date` — exactly the kinds
`apps/backend/functions/sync/index.ts` switches on and TDD Part 2 §6.6 defines a conflict rule for.
`preferences` and `notif_prefs`, which the queue's type carried from M2 through M8, are removed.

**Why.** Those two reached SVC_sync's `default:` branch: logged as `sync_unknown_kind` and returned
in neither `applied` nor `conflicts`. A client that dequeues on acknowledgement therefore could
never retire them, so they would retry until the attempt cap and sit in durable storage forever.
They bought the user nothing either way — the optimistic patch still reverts on the failed direct
write — so keeping them was durability theatre plus a storage leak.

**Why narrow the TYPE rather than filter at the drain.** A filter is a runtime decision someone can
regress; a narrowed union makes the two hooks fail to compile. The contract is enforced where the
mistake would be made.

**The client and server lists are pinned to each other by reading the handler's source.** A
restated constant agrees with itself forever. The test greps `case '...'` out of the Edge Function
and asserts set equality, so adding a kind on either side alone fails CI.

**What is owed.** Genuinely durable offline preference changes need an approved §6.6 conflict rule
and a matching server branch. Inventing either in the client would be inventing business rules.

## 2026-07-26 — Conflicts are acknowledgements; silence is not

**Decision.** A mutation SVC_sync returns under `conflicts` is dequeued, exactly like an applied
one. A mutation returned in neither list is retried.

**Why.** §6.3 resolves conflicts by rule — `deduped`, `superseded`, `tombstoned` all mean the server
has reached its final state — so re-sending would retry a decision already made. Conversely,
treating a 200 as blanket success is precisely how a silently dropped mutation looks from the
client, and this queue exists so a completion is never lost. When the two readings disagree, the
conservative one wins: a redundant retry is idempotent by `client_id`; a dropped completion is not
recoverable.

**Capped attempts stop silent retrying, they do not discard.** After `MAX_SYNC_ATTEMPTS` the entry
stays queued and surfaces a non-blocking "will retry" status. §6 forbids losing a completion, and
no failure blocks the daily loop (§8.2).

## 2026-07-26 — The persisted query cache is an allowlist, and entitlement is not on it

**Decision.** Only §6.1's persisted set — `today`, `calendar`, `ritual`, `checklist`, `streak`,
`preferences`, `notif_prefs` — is written to disk, and only in `success` state. `entitlement` and
`invite` stay in memory, as do Ask Guru conversations.

**Why those exclusions specifically.** §6.2 names Ask Guru, invites, auth and subscription as
network-only. Beyond that: entitlement gates paid capability, is server-authoritative and
household-grain, and the `entitlement` table denies client writes precisely so the device is never
the authority on it — restoring a stale copy from disk would grant or deny premium from a snapshot
the server has already changed. An invite is a short-lived token, so persisting it writes a
credential-shaped value to disk. And ADR-031's argument against user-content on disk applies most
strongly to what someone asked a spiritual assistant.

**Mutations are never persisted by the query cache.** STORE_offlineQueue already owns them
durably; letting TanStack persist them too would give one completion two independent replay paths.

## 2026-07-26 — CCPA export envelope is versioned because F-10 is unratified (B6.2)

**Decision.** `SVC_account.export` returns `{ format: 'panchangpal.export.v1', format_status:
'awaiting_ratification', exported_at, user_id, data }`, where `data` holds the TDD Part 2 §6.4 row
sets keyed by table name, **verbatim**.

**Why a version field at all.** §6.4 specifies WHICH rows the export contains; the shape is `F-10`,
an explicitly product-owned follow-up that has not been ratified. Shipping an unversioned envelope
would freeze an engineering guess into a contract consumers cannot tell apart from an approved one.
`format` plus `format_status` says out loud that this shape is provisional.

**Why rows are verbatim rather than reshaped.** A CCPA export is meant to be complete. A mapping
layer is precisely where a newly added column gets silently omitted as the schema grows, and the
omission would be invisible — the export would still look well-formed.

**Why the export table list differs from `OWNED_TABLES`.** Merge reassigns everything a user owns;
an export returns what is meaningfully *theirs*. `push_token` is a device credential, `notification`
is delivery bookkeeping, and `referral` concerns another party as much as this user.

**Why no UI.** PDD §5 governance lists CCPA export as outstanding and specifies no screen or
affordance. Adding a Settings row would be inventing UX. The capability is real and tested; the
affordance is owed by the PDD — recorded rather than filled in, the same treatment as
`AWAITING_APPROVED_COPY`.

---

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

**The tracking docs are a claim, not a source of truth — verify before acting on them (2026-07-19).**
Four entries across DASHBOARD/TASK/SESSION described work that had already shipped: `expo-updates`,
the orphan EAS credentials, the lazy-client generalization, and a "5 unpushed commits" branch that
was fully squash-merged. Acting on that last one would have reverted the OTA config, because a
squash merge leaves the source commits looking unmerged — `git merge-base --is-ancestor` proves
nothing about squashed work; compare content or subjects instead. Since CLAUDE.md makes these files
the session bootstrap, a stale entry does not merely misreport, it aims the next session at work that
does not exist. Open items carry a file:line where one exists, and anything unverifiable from the
repo is marked as unverified rather than asserted.

---

# 2026-07-22 — Time-zone correctness, and what a cancelled gate means

**`localDateIn(instant, timeZone)` from `@panchangpal/shared` is the ONLY sanctioned way to produce
a `local_date`.** ADR-026 mandated "a single tz-aware utility — no ad-hoc `Date` arithmetic
anywhere" before implementation began, and no such utility was ever written; two screens derived
the day with `new Date().toISOString().slice(0, 10)` instead. That is UTC by definition, while
`local_date` is the user's day by contract (`unique (user_id, local_date)`), so in New Zealand and
Australia the morning ritual was recorded against yesterday for the entire local morning. The
utility lives in `shared` because the value is written by the client and read by Edge Functions —
one definition is the only way "a single utility" survives that boundary.

**The zone is location-derived and user-correctable; the device is a fallback that fills, never
overwrites.** Per PDD `01_FOUNDATIONS.md:672-674`/`:799-800`. A traveller keeps their home
observance rather than having their day — and their streak — shift because they boarded a plane.
When no zone is usable the code throws or returns null; it never defaults. ADR-026: never India
time. A plausible wrong zone mis-dates every completion silently.

**A convention enforced only by review is the one that fails.** The defect type-checked perfectly —
a valid date string with the wrong value — and passed lint, tsc, unit tests, and a UTC CI runner.
The ADR had been correct and ignored for months. It is now an ESLint rule, added only after being
proven to fail on the reintroduced expression, per the standing `ci.yml` rule.

**No E2E flow can catch a time-zone defect.** CI runners are UTC, where the wrong answer and the
right one agree. Such things need unit tests over fixed instants and fixed zones; a test that reads
the ambient clock or zone reproduces the bug rather than catching it.

**A cancelled CI run is not a red run, and that is how a gate goes dark.** `cancel-in-progress: true`
on the 20-40 minute E2E job meant that between 2026-07-19 and 2026-07-22 — while the Android build
silently outgrew its timeout after `expo-updates` landed — six consecutive runs were cancelled and
none reported anything. The gate looked untouched rather than broken, and the tracking docs kept
citing a three-day-old success. **Cancellation is only acceptable for jobs short enough that the
next run arrives promptly**; for anything long, queue instead. Queueing costs runner minutes;
cancelling costs the signal the job exists to produce.

**Build only the ABI under test in CI.** The E2E emulator is x86_64 and can run exactly one; the
four-ABI default compiled three that were discarded, and that waste is what made the timeout
reachable. Safe only because the CI APK is explicitly not the shippable artifact — `release-build.yml`
builds that one, with every ABI.

---

# 2026-07-25 — MMKV v4 under the New Architecture, and making a build fail loudly

**Ritual sessions persist through a `KeyValueStore` port backed by react-native-mmkv v4 (Nitro).**
The device store is created via the `createMMKV()` factory (v4 replaced `new MMKV()`), resolved lazily
on first use, and `delete()`→`remove()` is adapted at the port so nothing else sees the vendor API.
**v4 is required because the app runs the New Architecture (bridgeless): mmkv v2 could not install its
JSI bindings there**, so every instance threw "React Native is not running on-device" and the store
degraded silently to memory — ritual sessions never survived a restart, in a release build. A
dependency-version bug, not a storage-logic bug. When the native module is genuinely absent (Expo Go,
off-device, jest), the port still degrades to memory with a visible warning and `getStorageBackend()`
reports `'memory'`; the ritual keeps working, it just will not persist.

**A native module that runs code at import needs a jest manual mock.** v4 eagerly imports
`react-native-nitro-modules`, whose `TurboModuleRegistry.getEnforcing` throws at module load in
node/jest and crashed every suite before a test ran. `apps/mobile/__mocks__/react-native-mmkv.js`
keeps the import side-effect-free and makes `createMMKV` throw exactly as off-device native does,
which drives the repository's memory-fallback path — the behaviour the degradation tests already
assert. The mmkv-success path is verified where it is real: the native FLOW_SESSION_PERSISTENCE build.

**A CI build must fail fast and loud, never slow and silent.** The E2E `assembleRelease` had been
failing at ~11 min, after which Gradle hung ~80 min on stuck workers until the job timeout killed it
and it reported `cancelled` — a red build wearing a timeout's costume, the same "gate goes dark"
pathology one layer down. The Build APK step is now wrapped in `timeout --kill-after=2m 40m` with
`--stacktrace`, so a stuck or failing build surfaces as a red step in minutes with the real error.

**A CI build should do only the work the test needs.** The emulator E2E APK is throwaway and
debug-signed, so release-only work is dead weight — and was the failure. Release lint (`lintVital`)
and `mergeReleaseNativeDebugMetadata` (AAB crash-symbol metadata, unused by an APK) are excluded via
`-x`. Release-specific correctness is `release-build.yml`'s job, on the real artifact.

**Verified, not assumed.** Session persistence — open and "unverifiable" for a week — was closed only
by a green FLOW_SESSION_PERSISTENCE on a real native emulator build (run 30155737941), with logcat
confirming MMKV initialised and did not fall back. A green unit suite never proved it and never could.

---

# 2026-07-25 — Telemetry leaves through one port, and reports nothing until it does

**Errors and crashes leave the app through the `TelemetryAdapter` port, never a vendor SDK.** Same
seam rule as NotificationAdapter, PaymentAdapter, and AudioAdapter (Provider Adapter pattern, TDD
Part 5 §7.1). Two call sites feed it: `ErrorBoundary.componentDidCatch` for render errors, and a
global `ErrorUtils` handler for throws that no React tree is on the stack for — a timer, a listener,
an async callback. The concrete Sentry adapter is deferred; `NullTelemetryAdapter` holds the seam.

**A port is readiness, not observability.** With the Null adapter in place nothing is reported
anywhere: the §7.2 crash-free SLO stays unmet and B4 cannot close on the seam alone. This is stated
in the code, not just here, because an app that reports nothing is indistinguishable from an app with
no errors — the same invisibility that let ritual sessions run on memory for a week.
`getTelemetryBackend()` reports `'none'`, and a configured DSN with no adapter to consume it warns
loudly: that combination means an operator believes crash reporting is on when it is not.

**No PII is enforced structurally, not by review.** §7.1 is `[MANDATORY]` about it, and the cheapest
way for user content to reach a reporter is an error message forwarded verbatim. So: `toErrorCode()`
returns `ERR_UNKNOWN` for anything outside the shared ERR_* taxonomy rather than echoing the message;
EVT_054's props are a closed four-key shape (`code`, `surface`, `recoverable`, `correlation_id`) with
no free-text field to widen; and `errorInfo.componentStack` is deliberately not forwarded, since a
component stack can carry rendered values. `correlation_id` is server-minted (ADR-022), not a user id.

**Telemetry must never replace the user's error with one of its own.** The global handler always
delegates to the previous handler (RN's default is what shows the redbox and terminates on a fatal),
swallows any failure of its own reporting, and is idempotent so a re-run composition root cannot
chain it onto itself and report every error N times. It installs in an effect rather than at module
scope — an eager side effect on import is the exact defect shape that took down the ritual screen and
nine repositories.

**EVT_054's mapping is settled before its sink exists.** `toClientErrorEvent()` builds the event id
and props now; the pseudonymous envelope and the `analytics_event` sink (ADR-013) are B4.2. The
mapping is therefore tested and identical whichever sink eventually consumes it.

---

# 2026-07-25 — The analytics sink, and how a user is identified in it

**`user_pseudo_id` is a device-minted random UUID, never derived from an identity.** No document
specified a derivation — PDD §11.1 requires only that it be stable and pseudonymous — so this is the
decision, not an implementation detail: mint a UUID on first use, persist it locally, and never
compute it from the Supabase auth uid, an email, or anything else. Nothing links an event row back
to a user row without the device, which is the strongest reading of ADR-031. **The cost is accepted
knowingly:** a reinstall mints a new id, so a returning user looks new to retention and activation,
and one person on two devices counts twice. The North Star (Weekly Household Ritual Completions)
groups EVT_017 by `household_id`, so the headline metric is unaffected. When storage has degraded to
memory the id regenerates per launch — analytics absorbs that rather than blocking events or
inventing a stable id from the user's identity.

**Props are primitives; objects and arrays are dropped at the boundary.** ADR-031 forbids PII in
analytics, and the realistic vector is not a deliberate leak but a convenience: someone passes an
error, a server response, or a form state into an event and user content lands in the store.
`sanitizeProps` keeps `string | number | boolean | null`, drops everything else, and drops
`undefined` entirely so an absent value never becomes a recorded `null`.

**An event id outside the EVT_* taxonomy is rejected.** `event_id` is a text column, so nothing
downstream would catch an invented event; PDD §11 owns that list. `buildEnvelope` throws, and the
adapter turns that into a dropped event plus a warning — a bad metric call must never take a screen
down.

**The analytics queue is in memory, and stays there.** ADR-013 wants batching; it does not want
user-behaviour data written to disk, which ADR-031 argues against. Events queued when the process
dies are lost, and that is the right trade: a lost metric costs a row, where a lost ritual session
costs a user their place — which is why *that* store persists and this one does not. The queue is
capped (200) and drops oldest-first, so a device offline for a day cannot leak memory; a failed
batch is re-queued ahead of newer events so a flaky network does not silently hollow out the
dashboards.

**The crash reporter and the error metric are separate destinations.** Every `ERR_*` is recorded as
EVT_054 in `analytics_event` (§7.1) *and* handed to the reporter. Collapsing them would have made
error-rate reporting wait on Sentry; as it stands the metric works today while the reporter is still
deferred and still reports `'none'`.

**The device key-value seam is shared, not duplicated.** `createDeviceStore` and its
degrade-to-memory fallback moved out of `ritualSessionRepository` into `src/data/keyValueStore.ts`
when the pseudonymous id needed identical behaviour, and is re-exported from its old home so
existing callers and tests are untouched.

---

# 2026-07-25 — Server telemetry, a production gate, and an upload deliberately not written

**Edge Function errors report at `errorResponse()`, the one exit they all already share.** A
`ServerTelemetry` port mirrors the client's TelemetryAdapter so both halves of §7.1 have the same
shape; `NullServerTelemetry` holds it until a DSN exists. The report carries the ERR_* code, the
function name, the correlation id, and `recoverable` — **never the error message.** On the server an
unknown error is usually a library's, and a Postgres or fetch failure will put a query, a row, or a
URL with a token in its text. The correlation id already threads the structured log line that holds
the safe detail. Reporting is wrapped so a telemetry fault cannot turn a handled 400 into an
unhandled 500.

**`SENTRY_*` is required at preflight's production tier, warn-only below it.** Same asymmetry as
`REVENUECAT_WEBHOOK_SECRET`: at dev/staging the absence costs visibility, in production it costs the
release's only health signal. Crash-free sessions is NFR-06 and the §10.1 go/no-go checks it, so a
production promotion with no DSN and no auth token would be shipping blind by construction.

**A production build is blocked when Sentry is unconfigured; staging warns.** The gate lives in
`release-build.yml` and can fail — verified in all four branches before commit — which is what
distinguishes it from the placeholders B1 and B3 removed.

**The source-map upload was deliberately not written.** Hermes maps have to be uploaded from inside
the EAS build that produced the bundle, which is what `@sentry/react-native`'s Expo config plugin
does. Maps generated by a separate `expo export` belong to a different bundle, so uploading them
would produce symbolication that is **confidently wrong** — worse than none, because it looks
authoritative. With the SDK not installed there is no correct mechanism available, so the gate states
the gap out loud rather than a step pretending to do the work.

**A false red costs what a false green costs.** Two E2E runs reported 3/3 flows failed while the app
was demonstrably healthy — an emulator ANR dialog covered the screen and Maestro asserted against it.
The first occurrence (an earlier session) was written off as transient, so the second had to be
diagnosed from scratch before it could be dismissed, and the next would have been blamed on whatever
had just merged. Fixed with `hide_error_dialogs` before the flows run, which suppresses the OS dialog
only: if our own app hangs, the flows still fail on their own assertions.

**Shell gates get exercised locally before they are committed.** The release gate's first draft used
`[ -z "$X" ] && missing=...` under `set -e`, where a test that evaluates FALSE returns non-zero and
kills the script — so the all-secrets-present case would have failed the step. A workflow is
otherwise only ever tested where being wrong is expensive.

---

# 2026-07-25 — Instrumenting the funnel the North Star sums

**Ritual analytics derive from view-model transitions, not from inline `track()` calls.** A screen
that tracks at six call sites double-fires the moment a re-render repeats a state. For most events
that is noise; for **EVT_017 it is the product's headline metric** — Weekly Household Ritual
Completions is EVT_017 grouped by `household_id` per ISO week (§11.3) — so an inflated count is worse
than no count. A pure `ritualTransitionEvents(prev, next, ctx)` also makes "fires exactly once"
testable without mounting anything, the same reasoning that put `resolveRitualScreenState` in this
screen after its check ORDER turned out to be the bug.

**Restoring is not starting, and resuming is not starting.** The first view after a session restore
emits nothing (reopening the app mid-ritual would otherwise inflate the top of the funnel every
time), and `paused → active` is not EVT_015. Both are asserted.

**EVT_020/021 come from the server's streak response.** The streak is server-derived and reconciled
in `HOOK_useCompleteRitual`; an analytics event built from a client guess could disagree with the
number the user is looking at, which would corrupt the retention analysis it exists to feed.

**Property names come from the taxonomy, not from us.** EVT_054 shipped in B4.1 with `code` and
`surface`; PDD §11.2 specifies `error_code` and `screen_id`. Nothing in the stack would have caught
that — `event_id` is a `text` column and `props` is `jsonb` — so a divergent name fails at the
dashboard months later, as a query that quietly returns nothing. When wiring an event, read §11.2
first and match it exactly.

**Only registry events fire (§11.0).** `buildEnvelope` rejects any id outside `EVENT_IDS`, so an
invented event is a dropped event and a warning rather than a row nobody can interpret.

---

# 2026-07-25 — An unauthorised write in Supabase is filtered, not refused

**Asserting that RLS blocks a write means asserting it changes NOTHING, not that it throws.**
Supabase grants `anon`/`authenticated` broad table privileges and relies on RLS for authorization, so
an UPDATE or DELETE with no matching policy simply sees no rows: nothing is modified and no error is
raised. `throws_ok` fails, and `lives_ok` passes while proving nothing. The correct assertion is
`is_empty($$ ... returning 1 $$)`, which makes the rows-affected count observable even when there is
no SELECT policy to read the table with. INSERT is the exception — a `WITH CHECK` violation does
raise 42501.

**`analytics_event` is append-only from a device, and that is now a gate.** Five pgTAP assertions
cover it with the exact envelope `buildEnvelope()` emits, including the null-household/null-session
shape an anonymous user produces, so a schema or policy change that breaks the client fails in CI
rather than at a dashboard.

**A CI database proves the migrations; only the project proves the project.** The contract was also
exercised against hosted staging with its anon key — INSERT `201`, SELECT/UPDATE/DELETE all `200 []`
— because the pgTAP suite runs on an ephemeral Postgres built from the same migration files, which
cannot detect a divergence in what is actually deployed. Probe rows carry a `user_pseudo_id` starting
`probe-` and are permanent by design: client DELETE is denied, which is the property under test.

---

# 2026-07-25 — What a contract test is for

**A contract test compares two artifacts; it does not exercise a schema against itself.** Feeding a
valid object to a zod schema and asserting it parses tests zod, restates the schema, and passes
forever regardless of whether the API still looks like that — which is what `--passWithNoTests`
already did, only shorter. `openapi-conformance.test.ts` instead compares the zod contracts to
`docs/api/openapi.yaml` and to the shared enum sources both claim to mirror, so every assertion
fails when someone edits one artifact and not the other. That is the only failure this package can
really have.

**Field sets are compared for EQUALITY, not containment.** A field the spec requires and the client
omits is a 4xx in production; a field the client sends that the spec does not document is an
undocumented dependency. Both are defects, so neither direction is allowed to drift.

**A test harness needs its own guard.** If spec loading breaks — a moved file, a rename — every
assertion would pass vacuously against `undefined`, producing exactly the confidently-green nothing
this milestone keeps removing. One assertion checks the spec parsed and has paths and schemas before
anything else runs. For the same reason, missing components resolve to `[]` rather than a non-null
assertion: an absent schema must fail, not skip.

**Prove the gate fails before trusting it.** Three perturbations were run and reverted — a dropped
required parameter, an ERR_* present in the spec but not in `packages/shared`, and a renamed
response property — each failing exactly one test. Same discipline as the ADR-026 ESLint guard,
which was proven by reintroducing the exact expression it forbids.

---

# 2026-07-25 — What a DR drill has to prove, and what it must admit

**A restore drill proves the restore, not the database engine.** Postgres can obviously restore a
dump. What is worth drilling is that OUR schema comes back *correctly*: the same invariants file runs
against the source and then against the restored database, so a lossy restore fails where a
"did pg_restore exit 0?" check would pass. The invariants target what returns subtly wrong and looks
healthy from outside — missing tables, **RLS silently disabled**, policies absent, post-v1 `FF_*`
restored as ON, `pgvector` missing, enum types gone. RLS is the dangerous one: the app works
perfectly and exposes every household's data.

**The drill runs on PRs that touch the recovery path, not only on a schedule.** Migrations, seed, and
the drill itself are the inputs that can make a schema un-restorable, so a change to them fails
review rather than the monthly run — or an incident. It also means the drill was proven on the PR
that introduced it, instead of merged unexercised.

**A runbook must state the capability it does NOT have, in its opening section.** Supabase PITR is a
paid-plan feature and the hosted projects are free-tier, so there is no point-in-time backup to
restore from and **NFR-15 (RPO ≤ 24 h / RTO ≤ 4 h) is unmet for user data** — schema and seed rebuild
in minutes, everything a user created does not. Documenting confident recovery steps around that
absence would be the same false assurance as a gate that cannot fail. The runbook therefore says
plainly: do not launch to real users on the free tier. This makes the ~$25/month Supabase plan a
reliability decision, not an environments line item.

**Label the runbooks nobody has walked.** PITR restore, region incident response, and Edge Function
rollback are documented and unexercised; §6 of the runbook says so. A runbook nobody has exercised is
a plan, not a capability, and the difference matters only at the moment it is needed.

---

# 2026-07-25 — Degradation is a table with tests, and copy is owned by the PDD

**"Each ERR_* has a defined calm behavior" (§8.2) is only true if something enforces it.** PDD §12
specifies the behaviour for 23 conditions in prose; the app encoded none of it, and the i18n bundle
carried three error strings for a taxonomy of twenty-four codes. `DEGRADATION_POLICIES` makes it
data — surface, retry, queueing, daily-loop impact, copy key, and the §12 row each entry encodes —
and an exhaustive test over the shared `ERROR_CODES` means a new code cannot join the taxonomy
without someone deciding how the app degrades for it.

**Assert the invariants, not the table.** A test that reads back each field would restate the data
and pass forever. The ones worth having are the properties §8.2 exists to protect: no failure blocks
the daily loop (P4); the honest-decline codes offer NO retry, because a decline is the correct
outcome and a retry affordance invites a user to retry their way into a fabricated answer; offline
and sync failures queue rather than lose the action; location failures redirect to manual entry
instead of showing an error at all; and only genuinely uncaught failures claim the global surface —
a second one appearing there means something stopped degrading at card level.

**Approved copy is used verbatim; missing copy stays missing.** PDD §13.5 owns user-facing error
strings, and a developer paraphrase is a silent product change — the calm, specific tone IS the
trust surface. §13.5 covers nine of twenty-four codes; the rest fall back to the approved
ERR_UNKNOWN string and are pinned in `AWAITING_APPROVED_COPY` by a test so the list cannot grow
quietly. Writing plausible replacements in code would invent UX and, worse, would erase the evidence
that PDD owes them.

---

# 2026-07-26 — A constant standing in for state

**`const ONBOARDED = true` is the same defect class as a gate that cannot fail.** The splash screen
computed a route from a value that could never change, beneath a comment asserting the flag was
persisted elsewhere. It was not. The code read as though a decision was being made; no decision was.
SCR_AUTH_001 never rendered from a cold launch across two milestones, and B2 had to record
FLOW_ONBOARDING as unwritable — a whole E2E flow blocked by one hardcoded boolean.

**When a placeholder value is unavoidable, it must fail loudly rather than default to the happy
path.** `ONBOARDED = true` chose "skip the gate", so the missing implementation was invisible.
`false` would have made every launch land in onboarding and the gap would have been found in
minutes.

**Storage failure resolves toward showing the gate, not skipping it.** The persisted flag reads
`false` when storage is unavailable: sign-in appearing twice is a small annoyance, while silently
skipping it hides the app's only auth entry point.

**Both exits from a gate must close it, and only after the work succeeds.** "Skip for now" marks
onboarding complete because under deferred auth (UX-2 / ADR-009) skipping is a legitimate
completion, not an abandonment. OTP verification marks it only AFTER the anon→auth merge resolves —
marking it earlier would strand a user in tabs with a half-merged account.

**A guard for an inlined constant has to read the source.** Once a constant is inlined there is no
runtime behaviour left to assert, which is precisely why no existing test could see this. The
regression test greps `app/index.tsx`, anchored to a line start so the explanatory comment quoting
the old constant does not trip it — its first draft did exactly that, which is fair evidence the
assertion is looking at something real.

---

# 2026-07-27 — Privacy documentation is derived, and the inventory is pinned to the code

**A store privacy label is not documentation; it is a legal disclosure.** Google Play treats an
inaccurate Data Safety form as a policy violation independent of what the app does, and Apple
measures the app against what it declared. That changes what "the inventory drifted" costs: a stale
runbook is a stale runbook, whereas a stale inventory becomes a false statement filed under someone's
name, with a paper trail saying it was checked.

**So the three documents form a one-way chain.** `DATA_INVENTORY.md` is derived from the code;
`PRIVACY_POLICY_DRAFT.md` and `STORE_PRIVACY_LABELS.md` are derived from the inventory. None is
written independently, and neither downstream document may assert a collection the inventory does
not record. The chain is stated at the top of each file so the next person does not update a label
in isolation.

**Only the first link is mechanised, and the limit is stated rather than glossed.**
`apps/backend/tests/privacy/data-inventory.test.ts` parses `create table` out of the migrations and
quoted `'EVT_*'` literals out of `apps/mobile/{app,src}`, and compares both against the inventory in
**both** directions — an unclassified table is collection nobody disclosed, and a classified table
the schema lacks is a disclosure for data the product does not hold. It cannot reach the policy or
the labels: a newly classified table still needs a human to decide what it means for a store answer.
Claiming otherwise would be the same false coverage this milestone spent B1 removing.

**Parsed from the migrations, not from the `TABLES` registry, because the registry had already
drifted** — 29 names against 32 tables, the three `ai_operational` tables never registered. A
hand-maintained list of tables fell behind the schema inside a single milestone. That is the argument
for the test, already worked, in the repo.

**Quoted literals only, for the emitted event set.** `EVT_041`, `EVT_045` and `EVT_049`–`EVT_052`
appear in `//` comments beside call sites that were never written. An inventory records collection,
not intent, so a commented intention must not read as a declared event — and equally must not be
silently dropped, so they are listed as explicitly not emitted.

**The document answers "collected today", not "collectable by the schema".** Several tables are
migrated and permanently empty because the feature that would write to them is deferred, blocked or
gated. Declaring that collection would be as wrong as omitting a real one, so every row carries the
answer as of the built app, plus the trigger that changes it. `expo-location` is not installed and
no coordinate is ever written, so **the app does not collect location** — a sentence that would have
been easy to get wrong from the schema, where `user_profile.lat`/`lng` sit in plain view.

**When a policy sentence would be false, the draft says so instead of drafting around it.**
`[UNBUILT]` markers sit where deletion, retention and backups would normally be described. The
alternative — softer wording that technically survives scrutiny — would have hidden that the CCPA
deletion right is recorded and never executed, which is the single most important thing B6.3 found.
A draft that cannot be published yet is more useful than one that can be published and is untrue.

---

# 2026-07-27 — The erasure is SQL, and the tests assert absence by content

**A deletion that half-completes is the failure you cannot have**, so the erasure is a Postgres
function rather than a sequence of supabase-js calls. It spans nine tables and there is no
transaction across `.from(...).delete()` calls — a failure midway would leave an account with its
profile gone, its auth row present, and no way to tell how far it got. A function body is one
transaction. `SVC_account.sweep` calls it and deliberately does not reimplement it; the Edge
Function's job is a schedule, a log line and a correlation id.

**The routine schedule is pg_cron calling the SQL directly, not an HTTP hop.** No secret to leak, no
dependency on the function being reachable, and one less thing between a due row and its erasure.
The Edge action exists for the operator: run it now, or run it at all where pg_cron is unavailable.

**An unconfigured sweep secret refuses everyone.** The tempting reading — "no secret set means not
protected yet, so allow it" — is how an endpoint that deletes accounts ships open to the internet.
`withHandler` proves only that *a* bearer token is present, and anonymous sign-in means anyone can
mint one for free; a user JWT can never authorize erasing other people's accounts. This is B6.2's
lesson applied before the defect rather than after it.

**`referral.referred_user_id` is nulled, not deleted, and the asymmetry is the point.** That row
belongs to the *referrer* — a different person. One user's erasure must not destroy another user's
record, so the personal link goes and their activation credit stays. The same reasoning deletes
`invite` rows outright: an invite naming a deleted user is unusable, and nulling `accepted_by`
would misrepresent a consumed invite as open, which is a live credential to a household if the
token has not expired.

**ON DELETE SET NULL is a data-retention decision disguised as a foreign key.** `household_member`
and `support_ticket` both use it, so the cascade keeps the row and drops only the link — the deleted
user's `display_name` stays in a household, their `email` and free-text `body` stay in a support
ticket. Both are now deleted outright. Two tables in this schema quietly opted out of erasure and
nothing said so.

**Assert absence by CONTENT, never by the foreign key.** A perturbation that removed the
`support_ticket` delete did not fail the suite, because the assertion counted rows
`where user_id = ...` — the very column SET NULL had just nulled. The test passed while the email
address sat in the table. The assertions now count by `email` and by `display_name`, and the same
perturbation fails. **A test written against the identifier a deletion removes cannot detect a
deletion that only removed the identifier.**

**One blocked account must not stop the sweep.** Each user is erased inside its own
BEGIN/EXCEPTION block — a subtransaction — so a household owner who never transferred ownership
rolls back alone and is retried next run, rather than aborting every other erasure. A sweep written
as a single statement fails whole.

**`account_deletion_sweep_is_scheduled()` exists because "did we enable it?" was otherwise
unanswerable.** It returns false when pg_cron is absent, when the job is missing, **and when an
operator has disabled it** — that third case looks identical to a healthy one from the migration's
point of view, and is exactly how a sweep stops running without anyone noticing. Checked by the DR
drill, because a restored database that comes back unscheduled has silently stopped honouring
deletion requests.

**The migration warns rather than failing where pg_cron is absent, and that asymmetry is
deliberate.** CI and local stacks legitimately lack the extension and must still migrate;
production must not, which is what the readiness check and the required `ACCOUNT_SWEEP_SECRET` are
for. Failing the migration would make every CI run red for a condition that is correct in CI.

---

# 2026-07-27 — What a Maestro flow owes the flows that run after it

**A test that breaks its neighbours is worse than one that fails.** `FLOW_OFFLINE_SYNC` passed while
leaving the emulator's radio dead, and the next flow that needed a server write lost a preference —
presenting as a defect in an unrelated feature, on a branch where the only change was a new test.
The failure was three flows and several minutes removed from its cause, which is the most expensive
shape a red gate can take.

So a flow that changes device state restores it **and proves the restore**, inside the flow that
changed it. `setAirplaneMode: disabled` followed by "the offline banner went away" is not proof:
NetInfo reports `isConnected` from a link-level signal that can exist with no usable route, so the
banner clearing establishes that the app *thinks* it is online. The proof is a cleared cold start
that reaches Today — no persisted cache to fall back on, so the network had to work.

**Never open a flow with `launchApp: clearState: true`.** Fusing the clear and the launch races the
previous flow's task teardown; `Destroy timeout of remove-task` fires about a second into the launch
and kills the process just created. The app never starts, and the flow fails on its first assertion
sixty seconds later looking exactly like a product defect — twice, before the artifact was read.
`stopApp` alone does not fix it, because what lingers is the **task**, not the process. Three
discrete steps do: `stopApp`, `clearState`, `launchApp`.

This is latent for the whole suite rather than a quirk of one flow: `FLOW_MORNING_RITUAL` and
`FLOW_RETURNING` end without cleanup, so any flow opening with a cleared launch can draw it
depending on the order Maestro picks. Fixed in the new flow rather than by editing flows that
currently pass — but the hazard is recorded, because the next person to add a flow will meet it.

**The evidence is in the uploaded artifact, not the run log.** The screen hierarchy and
`device-logcat.txt` exist only in the artifact; grepping the run log finds nothing and reads as
absence of evidence. Both defects above were diagnosed from the artifact — one from a hierarchy
containing nothing but the status-bar clock, the other from a kill sequence in logcat. The same
lesson the Pixel Launcher ANRs taught, now paid for a second time.

**A selector may be a rendered glyph when nothing else is stable.** This suite's rule is testIDs,
because text matching silently passes while navigating nowhere. `FLOW_OFFLINE_SYNC` asserts on ☑/☐
anyway: the checklist row's testID embeds a seed-generated uuid that is not knowable from a flow
file, and the glyph is the only stable rendered signal of the state under test. It is asserted
alongside the item's label so a passing run cannot be some other row's tick. The rule stands; the
exception is documented where it is taken.

---

# 2026-07-27 — Assert a deletion by content, never by the foreign key

A perturbation that deleted the `support_ticket` erasure from the executor **did not fail the
suite**. The assertion counted rows `where user_id = ...` — the exact column `ON DELETE SET NULL`
had just nulled — so it read zero while the user's email address and free-text body sat in the
table, intact.

**A test written against the identifier a deletion removes cannot detect a deletion that only
removed the identifier.** The assertions now count by `email` and by `display_name`, and the same
perturbation fails.

This generalises past the executor. `ON DELETE SET NULL` is a data-retention decision disguised as a
foreign key: it keeps the row and drops only the link, so two tables in this schema had quietly
opted out of erasure and nothing said so. Any future check that a record is *gone* has to name
something the record itself contains.

The same discipline applies one level up. `DATA_INVENTORY.md` §2 is pinned against the **migrations**
rather than `packages/database`'s `TABLES` registry, because that registry had already drifted — 29
names against 32 tables — inside a single milestone. Verify against the thing that is true, not
against another hand-maintained list of it.

---

# 2026-08-02 — A durable queue guarantees DELIVERY, not DISPLAY

Two defects on the same day had this shape, reached from opposite directions.

The offline **completion** was written to MMKV synchronously on every tap and never re-derived onto
the rendered read model, so the tick a user saw came from a query-cache snapshot written on a 1 s
trailing throttle and flushed from an unsubscribe handler a process kill never runs. The **preference**
write, once made durable, was delivered to the server by the drain while nothing invalidated its
query — so the screen kept showing what it fetched at launch.

**Rule: when a write path joins the offline queue, the read half belongs in the same change.** The
queue is durable; the cache is a cache; nothing re-reads on its own.

The corollary is diagnostic. "It reached disk" and "the user can see it" are separate claims, and
this repo has now spent three investigations conflating them. Check which one is actually failing
before attributing a cause.

---

# 2026-08-02 — A queued mutation carries the identity that made it, and is HELD under any other

`QueuedMutation.user_id` is stamped at enqueue; `isSendableBy` refuses to drain a mutation under a
different uid. Held, never discarded — §6 forbids discarding a completion, and "belongs to someone
else right now" is not "invalid". An absent uid (older builds) or an unresolved session is treated
as sendable, preserving prior behaviour rather than stranding a queue.

The obvious reason is that one user's pending change must not be written onto another's account,
reachable whenever a fresh anonymous uid is minted — the M1/M9 defect `secureSessionStorage.ts`
exists to prevent.

**The non-obvious reason is the one worth remembering.** `FLOW_AUTH_SESSION_PERSISTENCE` proves
identity survived a restart by reading back a tradition only that identity could have written. Once
preferences became durable, a drain that ignored identity would RECREATE that value under the new
uid — so the flow would pass at the exact moment the defect it guards occurred. **Making a kind
syncable can silently destroy an unrelated flow's ability to detect a defect. Check what reads the
value back before adding one.**

---

# 2026-08-02 — `expo/bundledNativeModules.json` is the authority on SDK-pinned packages

Not `.github/dependabot.yml`. Every key in that manifest is SDK-pinned by definition; check a
package against it — not against release notes, and never against whether CI is green — before
triaging any Dependabot PR.

Hand-enumerated patterns did not converge: the rule leaked for `@expo/*`, `@babel/runtime` and
`react` (#64/#65/#75), then again for `@react-native-community/*` (#81) and `jest`/`jest-expo` (#63,
pinned transitively — `jest-expo@54.0.17` depends on the jest 29 family). #63 spent two weeks
triaged as "red for its own unrelated reasons" because it was classified from its red CI rather than
its dependency graph.

Scanning the manifest against every declared dependency found exactly those two gaps, so the SDK 54
set is complete rather than awaiting a fourth instalment.

---

# 2026-08-02 — `preferences` sync uses last-writer-wins ⚠️ UNRATIFIED

TDD Part 2 §6.6 defines conflict rules for `ritual_complete`, `checklist` and `personal_date` and
says nothing about `preferences`. `resolvePreferences` adopts **`personal_date`'s last-writer-wins
on `local_ts`** as the nearest ratified precedent rather than inventing a novel rule.

Union and first-write-wins are both wrong for a single mutable value: the former cannot express a
change at all, and the latter would make the first tradition a user ever picked permanent. `local_ts`
rather than server-receipt time, matching `personal_date`, because the client's clock is what orders
two of the user's own offline edits.

**The TDD owes a ruling, and `resolvePreferences` is the only place a different one lands.** Recorded
here rather than left implicit because it shipped in merged code.
