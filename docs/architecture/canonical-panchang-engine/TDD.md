# Canonical Panchang Engine — Technical Design Document (TDD)

**Work item:** Canonical Panchang Computation Engine
**Status:** Draft (feeds ADR-033, Proposed) — **astronomical choices are RECOMMENDATIONS to
ratify, not decisions.**
**Owner:** Architecture · **Reviewers:** Backend, AI/Content, Security/Legal, pandit reviewer
**Date:** 2026-07-12
**Depends on:** ADR-010, ADR-033; this work item's MRD/PRD/PDD; main TDD Part 2 §3.10.

> This document engineers the engine *behind the `PanchangEngine` interface*. The interface,
> caching, versioning, and validation harness are decidable now. The ephemeris/ayanamsa/
> methodology are presented as recommendations with the evidence needed to ratify them.

---

## 1. Provider architecture (decided — matches the code)

```
PanchangEngine (interface, apps/backend/functions/panchang/engine.ts)
  ├─ engineVersion: string
  ├─ compute(PanchangInput): PanchangResult
  └─ nextTithiOccurrence(TithiRecurrenceInput): { next_occurrence, candidates? }

Registered implementations:
  - unimplementedPanchangEngine   (current; fails closed — ADR-033 blocked)
  - SwissEphemerisPanchangEngine  (proposed; added only after ADR-033 → Accepted)
```

Callers (`SVC_panchang`, `SVC_notify_scheduler`, personal-date recurrence) depend ONLY on the
interface. The concrete engine is injected; swapping it is a config/deploy change that bumps
`engine_version` and invalidates `panchang_cache` (ADR-010). Determinism is a hard requirement:
`compute` is a pure function of `(instant, lat, lng, tz, tradition, engine_version)`.

## 2. Ephemeris (RECOMMENDATION — ratify)

- **Recommended:** a **Swiss Ephemeris-grade** source — high precision, offline, deterministic,
  battle-tested for panchang. Runs server-side (WASM/native in the Edge/compute layer).
- **Alternatives:** NASA JPL DE440 (highest precision, larger data), VSOP87 (analytic, lighter,
  lower precision).
- **To ratify:** precision target vs. data size/offline footprint; **license compatibility with
  a commercial app (legal sign-off, MR-6)** — Swiss Ephemeris has specific licensing terms that
  must be reviewed before adoption.

## 3. Ayanamsa (RECOMMENDATION — ratify)

- **Recommended default:** **Lahiri (Chitrapaksha)** — the Indian civil/most-common standard,
  matching what most users' references use.
- **Per-tradition override** allowed (some communities use different ayanamsas). Store the
  ayanamsa in the tradition profile so it is explicit and versioned.
- **To ratify:** the default + the per-tradition overrides, with the reviewer.

## 4. Supported traditions & conventions (RECOMMENDATION — ratify per tradition)

For each of `generic`, `north_indian`, `south_indian_tamil`, `bengali`, ratify a **tradition
profile**:

| Profile field | Meaning | Example values to ratify |
|---|---|---|
| `ayanamsa` | precession model | Lahiri (default) |
| `month_scheme` | lunar month reckoning | amanta / purnimanta |
| `tithi_reference` | which tithi "counts" for the day | tithi-at-sunrise vs. tithi-at-instant |
| `sunrise_convention` | horizon/refraction model | e.g. upper-limb, standard refraction |
| `day_division` | muhurta/Rahu Kaal division | sunrise-to-sunset eighths, etc. |

`generic` is a documented neutral default. Profiles are data (versioned with `engine_version`),
not code branches.

## 5. Calculation methodology (RECOMMENDATION — ratify)

- **Tithi** = f(lunar longitude − solar longitude) in 12° steps; report the active tithi at the
  tradition's `tithi_reference` and the boundary instants.
- **Nakshatra** = lunar longitude in 13°20′ steps; **Yoga** = f(sun+moon longitude); **Karana**
  = half-tithi. All from the ephemeris longitudes + the ratified ayanamsa.
- **Sunrise/sunset** = per the tradition's `sunrise_convention` at lat/lng, in the user's IANA tz
  (ADR-026). **Muhurta/Rahu Kaal/Yamaganda/Gulika** = per `day_division` over the sunrise→sunset
  span.
- **Festival/personal-date recurrence** = solve tithi→calendar-date under the tradition profile;
  on skipped/repeated tithi, return **dual candidates** (`ERR_TITHI_AMBIGUOUS`, PRD PR-4).

## 6. Validation dataset & acceptance tolerances (RECOMMENDATION — ratify with reviewer)

- **Golden dataset:** a reviewer-approved set spanning each supported tradition × a year of
  dates × representative launch-market locations (US/AU/NZ cities), cross-checked against **Drik
  Panchang and mPanchang**. Stored under version control; versioned with `engine_version`.
- **Acceptance tolerances (to ratify — placeholders, NOT decided):** e.g. tithi/nakshatra/yoga/
  karana **boundary instants within ±N minutes**; **sunrise/sunset within ±M minutes**;
  festival dates **exact** (0-day error) for the supported traditions. N and M are set with the
  reviewer based on what "agreement" means for users.
- **Gate:** a CI/pre-release job runs the engine against the golden dataset; **any out-of-
  tolerance result blocks release** (PRD PR-8). Mirrors the AI eval gate discipline.

## 7. Caching, versioning & determinism (decided, per ADR-010)

- Output cached in `panchang_cache` keyed by `hash(local_date, geo_bucket, tradition, engine_version)`
  + CDN/client caching. `geo_bucket` coarsens coordinates for hit rate (already implemented:
  `apps/backend/functions/panchang/cacheKey.ts`).
- **`engine_version`** is bumped on any ephemeris/ayanamsa/profile/methodology change; a bump
  re-runs the golden dataset and invalidates the cache. Corrections never silently change a
  user's historical dates — they ship as a new version.

## 8. Security, licensing & ops

- Engine runs server-side (or as a vetted WASM module); no secrets involved. **Ephemeris license
  reviewed by legal before adoption (MR-6).** Data files are reproducible from a pinned source.
- Observability: log `engine_version`, cache hit/miss, uncached compute latency (NFR-12).

## 9. Rollout & rollback

- **Rollout:** implement `SwissEphemerisPanchangEngine` (or the ratified choice) → pass golden
  dataset → reviewer sign-off → register as the engine (replacing the placeholder) → deploy;
  `engine_version` set to the first real version.
- **Rollback:** re-point to the prior `engine_version` (cache retained per version) — a config
  change, no app release; because output is deterministic + version-keyed, rollback is exact.

## 10. Explicitly out of scope until ADR-033 → Accepted

No astronomical implementation, no golden values, no tolerance numbers are committed here.
Engine-behavior tests remain `it.skip` with `TODO(ADR-033)`; the placeholder engine fails closed.
This document is the input to the ratification, not the ratification itself.
