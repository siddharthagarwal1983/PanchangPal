# Canonical Panchang Engine — Market Requirements Document (MRD)

**Work item:** Canonical Panchang Computation Engine
**Status:** Draft (feeds ADR-033, Proposed)
**Owner:** Product + Architecture
**Date:** 2026-07-12
**Scope note:** This MRD is scoped to the *panchang computation engine* sub-project, not the
whole product (see the main PanchangPal MRD). It exists because ADR-033 requires the
astronomical decision to be made with market/accuracy evidence, not guessed.

---

## 1. Problem & why it matters

PanchangPal's core promise is a **trustworthy** daily panchang for Indians abroad. Panchang
values (tithi, nakshatra, yoga, karana, sunrise/sunset, muhurta, Rahu Kaal) are religiously
significant and time-sensitive. A wrong tithi or mistimed sunrise is not a cosmetic bug — it
causes users to observe rituals on the wrong day, which is the single fastest way to lose
trust (main MRD Risk §1). Therefore the engine that computes these values is a first-class,
accuracy-critical asset, and the choices behind it (ephemeris, ayanamsa, conventions) are
market-facing, not internal.

## 2. Target users & their expectations

Same audience as the product: Hindus living in the US, Australia, and New Zealand, across
regional traditions. Their expectation is that PanchangPal agrees with the panchang they
already trust — typically **Drik Panchang** and **mPanchang**, and the regional almanacs of
their tradition. "Agreement with my community's panchang" is the acceptance bar.

## 3. Market/reference landscape

- **Drik Panchang, mPanchang** — the de facto digital references users compare against.
- **Regional almanacs** — North Indian (purnimanta), Tamil, Bengali panchangs differ in month
  scheme, sunrise convention, and festival date resolution.
- **Ayanamsa conventions** — Lahiri (Chitrapaksha) is the Indian government / most-common civil
  standard; other ayanamsas (Raman, KP) exist and yield different results.
- **Ephemeris sources** — Swiss Ephemeris (widely used, high precision), NASA JPL DE440,
  VSOP87. These differ in precision, size, offline-suitability, and licensing.

## 4. Market requirements

- **MR-1 Agreement with trusted references.** The engine's output must match Drik/mPanchang
  and the relevant regional almanac within agreed tolerances for the supported traditions.
- **MR-2 Regional correctness.** Each supported tradition's conventions (month scheme, sunrise
  rule, tithi-at-sunrise vs. instant) must be honored — a North Indian user and a Tamil user
  may correctly see different results the same day.
- **MR-3 Determinism & offline.** Identical inputs always produce identical output, computable
  offline (no runtime third-party API) to preserve offline-first (ADR-015) and caching (ADR-010).
- **MR-4 Reviewer-validated.** A paid pandit/almanac reviewer signs off on a golden dataset
  before any engine version ships.
- **MR-5 Auditable & versioned.** Every result traces to an `engine_version`; corrections ship
  as a new version with a re-validated dataset, never a silent change to users' dates.
- **MR-6 Licensable.** The chosen ephemeris/library must be license-compatible with a
  commercial mobile app (reviewed by legal).

## 5. Non-goals (v1)

Astrology/horoscope/kundli predictions (explicitly out of scope, PDD §5); non-supported
regional variants; historical dates far outside the app's use window.

## 6. Risks

- **R-1 Accuracy error in production** → trust catastrophe. Mitigation: golden dataset +
  reviewer sign-off + tolerance gate before release (MR-4/MR-5).
- **R-2 Convention mismatch** (right math, wrong tradition rule) → regional users see "wrong"
  dates. Mitigation: per-tradition rules ratified in the PDD/TDD (MR-2).
- **R-3 Ephemeris license/precision** → legal or accuracy exposure. Mitigation: MR-6 review.
- **R-4 Scope creep into astrology.** Mitigation: hard non-goal.

## 7. Success criteria

The engine is "market-ready" when it passes the reviewer-approved golden dataset within
tolerances for all supported traditions, is fully offline/deterministic, is `engine_version`-
stamped, and has legal sign-off on the ephemeris license. Until then, ADR-033 keeps computation
blocked (fail closed, never fabricate).

## 8. Go/No-Go for implementation

**No-Go until:** ephemeris + ayanamsa + per-tradition conventions + validation dataset +
tolerances are ratified (ADR-033 Part B → Accepted). This MRD is the market input to that
decision.
