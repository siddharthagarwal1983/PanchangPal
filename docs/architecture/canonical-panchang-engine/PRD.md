# Canonical Panchang Engine — Product Requirements Document (PRD)

**Work item:** Canonical Panchang Computation Engine
**Status:** Draft (feeds ADR-033, Proposed)
**Owner:** Product · **Reviewers:** Architecture, AI/Content, pandit reviewer
**Date:** 2026-07-12
**Depends on:** this work item's MRD; main PanchangPal PRD; ADR-010; ADR-033.

---

## 1. Objective

Define *what* the panchang engine must produce and to what standard, so Architecture can
choose the ephemeris/methodology (TDD) and Product can gate the release on accuracy. This PRD
does not choose the algorithm; it sets the product requirements the algorithm must satisfy.

## 2. In scope (v1 outputs)

For a given `(instant, lat/lng, tz, tradition)` the engine returns:

- **Tithi** (with start/end instants and the tithi active at the tradition's reference time).
- **Nakshatra**, **Yoga**, **Karana** (active + transitions for the day).
- **Sunrise / sunset** (per the tradition's convention).
- **Muhurta** set (e.g. Brahma, Abhijit) and **Rahu Kaal / Yamaganda / Gulika** windows.
- **Festival/vrat date resolution** hooks (tithi→calendar-date, feeding `TBL_FESTIVAL`).
- **Personal-date tithi recurrence** (next occurrence + dual candidates on ambiguity →
  `ERR_TITHI_AMBIGUOUS`).

## 3. Supported traditions (v1)

Align with the seeded set (F-9): `generic`, `north_indian`, `south_indian_tamil`, `bengali`.
Each tradition specifies: month scheme (amanta vs. purnimanta), the tithi reference rule
(tithi-at-sunrise vs. tithi-at-instant), and the sunrise convention. `generic` is a documented
default profile. Additional traditions are post-v1 (new `engine_version` + dataset).

## 4. Functional requirements

- **PR-1** Deterministic pure function of inputs + `engine_version` (ADR-010).
- **PR-2** Offline-computable (no runtime external API) — supports offline-first (ADR-015).
- **PR-3** Per-tradition conventions applied correctly (MR-2).
- **PR-4** Ambiguity is surfaced, never guessed: skipped/repeated tithis return dual candidates
  (`ERR_TITHI_AMBIGUOUS`), consistent with the personal-dates UX (main PDD C2).
- **PR-5** Output shape matches the `PanchangEngine` interface + `API_GET_TODAY` contract
  (TDD Part 2 §5.2) — no contract change required when the engine lands.
- **PR-6** Timezone-correct: all local values derived via the single tz-aware utility
  (ADR-026); never default to India time.

## 5. Accuracy requirements (the product gate)

- **PR-7** For each supported tradition, engine output matches the **reviewer-approved golden
  dataset** (cross-checked vs Drik/mPanchang) within the acceptance tolerances defined in the
  TDD (e.g. tithi-boundary within ±N min; sunrise within ±M min). *N/M are ratified with the
  reviewer, not assumed here.*
- **PR-8** A failing accuracy gate **blocks release** (like the AI groundedness gate). No engine
  version ships without a green dataset run + reviewer sign-off.

## 6. Non-functional requirements

- **PR-9** Compute latency small enough that an uncached compute stays within the panchang NFR
  (TDD Part 1 NFR-12: p95 < 400 ms uncached); cache-first keeps the hot path near-zero (ADR-010).
- **PR-10** Result payload is CDN/client-cacheable, keyed by inputs + `engine_version`.

## 7. Success metrics

- Golden-dataset pass rate = 100% within tolerance for all supported traditions.
- Zero production accuracy complaints attributable to the engine in the first release window
  (tracked via support tickets + the hallucination-audit-style panchang audit).

## 8. Open decisions (to Architecture/TDD + reviewer)

Ephemeris source, ayanamsa default + overrides, exact per-tradition conventions, the golden
dataset composition, and the numeric tolerances (N/M). These are ratified before ADR-033 → Accepted.
