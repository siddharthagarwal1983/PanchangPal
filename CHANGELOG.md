# Changelog — PanchangPal

All notable changes to the **app** are recorded here. Governed documents (PDD/TDD parts, ADRs) carry
their own change logs under `docs/`; this file is about what ships.

**Versioning is Semantic Versioning per PDD §3.0A.4**, and the bump is chosen by the *nature* of the
change, not its size:

| Bump | Triggered by |
|---|---|
| **MAJOR** | A breaking change — an altered or removed flow, a navigation-model change, a removed/renamed screen or `API_*` contract, an incompatible data-model change, a changed business rule |
| **MINOR** | Additive and backward-compatible — a new screen/flow/component, a new feature behind an `FF_*` flag, a new `API_*` (non-breaking), new `EVT_*` analytics events, new optional fields |
| **PATCH** | Non-structural — copy fixes, design-token tweaks, clarifications, bug fixes with no contract change |

## How a release is cut (TDD Part 5 §3.1)

`main` is always releasable. Cut a build when a shippable increment is ready — weekly or on demand,
not on a fixed calendar. Hotfix via **OTA** where the change is JS-only (§2.4); anything touching
native code or config plugins needs a new build, and the OTA will not reach existing installs anyway
because the runtime-version fingerprint changes.

1. Move the entry from `[Unreleased]` into a new `## [X.Y.Z] — YYYY-MM-DD` heading.
2. Set the same `X.Y.Z` in `apps/mobile/app.config.ts` (`version`).
3. Tag `vX.Y.Z` and push it — `release-build.yml` triggers on `v*`.

⚠️ **All three must agree, and CI enforces it.** `apps/backend/tests/release/version-consistency.test.ts`
fails if `app.config.ts`'s version has no entry here; `release-build.yml` fails if the pushed tag does
not match `app.config.ts`. The mismatch matters beyond tidiness: **Sentry files crashes under the
native app version**, so a `v0.2.0` release built from an `app.config.ts` still saying `0.1.0` puts
that release's crash data under the previous version's name — and the crash-free SLOs (NFR-06/07)
are read per release.

**Build numbers are not tracked here.** `eas.json` sets `cli.appVersionSource: "remote"` with
`autoIncrement` on the staging and production profiles, so EAS allocates them and they cannot collide
through a hand edit.

---

## [Unreleased]

### Added

- **Release management (B7.1)** — `ota.yml` publishes and rolls back Expo Updates for real; the
  publish job reports how many finished builds actually match the update's runtime version, because
  a successful publish can otherwise reach nobody. `docs/devops/RELEASE_RUNBOOK.md` documents §3.4's
  rollback paths and which of them have ever been performed.

### Fixed

- **The E2E suite's device log was ~85% missing** — `adb logcat -d` captured only the last ~20s of a
  ~2m20s run; it is now streamed for the whole run.
- **A Maestro flow race** — flows ended with a `clearState` while the next flow cleared at its start,
  putting two `pm clear` calls ~0.5s apart on every boundary and hanging the suite.
- **The mobile jest suite leaked timers** — TanStack Query's default 5-minute `gcTime` kept worker
  processes alive; three suites hung indefinitely when run alone.

### Changed

- `@testing-library/react-native` 13 → 14 (its API is now async), Node 20 → 22, and the routine
  dependency queue.

> Nothing in `[Unreleased]` has shipped to a user. There is no store presence yet.

---

## [0.1.0] — 2026-07-19

The first tagged version, cut when `release-build.yml` became a real tag-triggered Android build
(`763190c`). **It has never been distributed**: there is no App Store or Play presence, and the tag
exists to exercise the release pipeline rather than to deliver anything.

### Added

- **The daily loop** — Today, the guided ritual with a persisted session, and the daily checklist.
- **Calendar shell**, **Profile/You**, and **Household** screens.
- **Anonymous-first identity** (UX-2 / ADR-009) with an optional OTP sign-in that merges the
  anonymous account.
- **Offline-first behaviour** — a durable mutation queue drained to `SVC_sync`, and a persisted read
  cache so a cold start with no network still renders the daily loop.
- **Subscription surfaces** behind a `PaymentAdapter` port, and the contextual paywall.
- **Backend** — the `SVC_*` Edge Functions, the 32-table schema with RLS, and CCPA export plus an
  account-deletion executor.

### Not included, deliberately

- **Panchang values and festival markers** are gated off pending **ADR-033**; the screens show a calm
  "temporarily unavailable" state rather than a fabricated tithi.
- **Ask Guru answers** are gated off (`GURU_LIVE = false`) pending a reviewed corpus and the
  evaluation harness (TDD Part 3 §9/§10B); the client is complete behind the gate.
- **Push notifications** — `expo-notifications` is not installed; the `NotificationAdapter` resolves
  to a null implementation rather than pretending to hold a token.
- **In-app purchases** — `react-native-purchases` is not installed; no purchase can be made.
