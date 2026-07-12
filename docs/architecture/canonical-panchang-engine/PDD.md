# Canonical Panchang Engine — Product Design Document (PDD)

**Work item:** Canonical Panchang Computation Engine
**Status:** Draft (feeds ADR-033, Proposed)
**Owner:** Design + Content · **Reviewers:** Product, Architecture, pandit reviewer
**Date:** 2026-07-12

> The engine is a backend computation, but its *outputs and failure modes* are user-facing.
> This PDD specifies how engine results and edge cases present to users, so the design is fixed
> before the algorithm is chosen. It defers to the main PDD for the actual screens
> (`SCR_HOME_001`, `SCR_PANCHANG_DETAIL_001`, `SCR_CALENDAR_*`, personal dates).

---

## 1. What the user sees (engine → UI mapping)

| Engine output | Surface | Trust treatment |
|---|---|---|
| Tithi (+ start/end) | Today card, panchang detail | Show the active tithi and its transition time; explain with a glossary tooltip |
| Nakshatra / yoga / karana | Panchang detail | Secondary detail; plain-language explainers |
| Sunrise / sunset | Today, detail | Local time (user tz); labeled by convention where relevant |
| Muhurta / Rahu Kaal | Detail | Clearly labeled auspicious/inauspicious windows |
| Festival date (tithi→date) | Calendar, festival detail | Per the user's tradition; a "why this date" affordance |
| Personal-date recurrence | Personal dates | Grief-aware; dual candidates on ambiguity (never a silent guess) |

## 2. Trust & transparency design

- **Show provenance.** Panchang is computed by a named, versioned engine; where a value could
  differ by tradition, the UI states the tradition/convention in use (supports MR-2).
- **Agreement-first.** Because users cross-check against Drik/mPanchang, the design favors
  matching those references; discrepancies within tolerance are acceptable, larger ones are
  release-blocking (PRD PR-7/PR-8).
- **Explain, don't assert.** Tithi/nakshatra terms carry glossary explainers (main PDD §13.8).

## 3. Edge cases & failure modes (design)

- **Engine unavailable (current state, ADR-033 blocked).** Panchang surfaces show a calm
  "temporarily unavailable" state (`ERR_PANCHANG_UNAVAILABLE`) — never fabricated values, never
  a dead end. Cached values (once the engine exists) still render offline.
- **Tithi ambiguity** (skipped/repeated tithi, DST edges). Present **both candidate dates** and
  let the user choose (`ERR_TITHI_AMBIGUOUS`), consistent with personal-dates UX. No silent pick.
- **Location/timezone missing or coarse.** Fall back gracefully; never default to India time
  (ADR-026); prompt for location where accuracy needs it.
- **Regional variant absent** for a tradition → fall back to `generic` with a note, rather than
  showing a wrong regional value.

## 4. Accessibility & tone

Engine-derived values follow the main PDD accessibility gate (§10): semantic labels, Dynamic
Type, screen-reader-friendly time announcements. Tone is calm and factual; no alarming language
around inauspicious windows (households include children and grieving users).

## 5. Content/reviewer surface

The reviewer (pandit/almanac expert) validates not just numbers but **presentation**: that the
tradition labels, festival-date rationale, and muhurta descriptions are correct and respectful.
This review is part of the release gate (PRD PR-8).

## 6. Design acceptance

The engine's UI/edge-case design is accepted when: unavailable/ambiguous/fallback states are
specified and calm; provenance/tradition is visible where it matters; and the reviewer confirms
the presentation is accurate and respectful for each supported tradition.
