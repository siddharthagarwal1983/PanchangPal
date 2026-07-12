# ADR-033 — Canonical Panchang Computation Engine

**Status:** Proposed
**Date:** 2026-07-12
**Decision Owner:** Architecture + Product (astronomical/religious accuracy is joint)

> This ADR opens the decision; it is **Proposed**, not Accepted. It fixes the *provider
> architecture* (which is decidable now) and frames the *astronomical choices* (ephemeris,
> ayanamsa, traditions, methodology, validation, tolerances) that MUST be ratified with
> reviewer input before any implementation. Companion docs:
> `docs/architecture/canonical-panchang-engine/` (MRD, PRD, PDD, TDD).

---

## Context

ADR-010 mandates a **deterministic panchang engine** — a pure function of
`(instant, lat/lng, tz, tradition)`, versioned by `engine_version`, cached at CDN + client,
and validated against Drik Panchang / mPanchang plus paid reviewers. A wrong tithi or a
mistimed sunrise destroys the product's core trust (MRD Risk §1); panchang is also the
highest-volume read path (ADR-010).

However, **no MRD/PRD/PDD/TDD document specifies the actual astronomical algorithm** — the
ephemeris source, the ayanamsa (precession offset), the tithi/nakshatra/yoga/karana
derivation, sunrise/sunset conventions, muhurta/Rahu Kaal computation, or per-tradition
variant rules. These are not implementation trivia: they are accuracy-defining choices with
religious significance, and different valid conventions produce different tithis on the same
day. They cannot be guessed.

The backend has been built so that **every component depends only on an abstract
`PanchangEngine` interface** (`apps/backend/functions/panchang/engine.ts`); the only
registered implementation fails closed. This ADR is the gate that unblocks a real engine.

Relevant sources: ADR-010 (deterministic cacheable panchang); TDD Part 1 §1.4/§10.2;
TDD Part 2 §3.10 (`panchang_cache`); MRD Risk §1 (accuracy); PDD §9.8 (reviewed content).

---

## Decision

**Part A — Provider architecture (decidable now, proposed as Accepted):**
Panchang computation sits behind a **`PanchangEngine` provider interface**. Business logic
(`SVC_panchang`, `SVC_notify_scheduler`, personal-date recurrence) depends only on the
interface, never on a concrete algorithm. A concrete engine is a swappable, `engine_version`-
stamped implementation; swapping or upgrading it is a config/deploy change that invalidates
the deterministic cache but touches no callers. Output is a pure function of inputs +
`engine_version` (ADR-010), enabling CDN/client caching.

**Part B — Astronomical choices (deferred; to be ratified):** the following are **not
decided here** and are the substance of the companion MRD/PRD/PDD/TDD. Each has a
recommendation to evaluate, not a ruling:
- **Ephemeris** — recommendation: a Swiss Ephemeris-grade source (high-precision, offline,
  license-reviewed). Alternatives: NASA JPL DE440, VSOP87. Ratify precision + licensing.
- **Ayanamsa** — recommendation: **Lahiri (Chitrapaksha)** as the default (most widely used
  in Indian civil/religious calendars); allow per-tradition override. Ratify.
- **Supported traditions (v1)** — align to the seeded set (`generic`, `north_indian`,
  `south_indian_tamil`, `bengali`, F-9); define each one's sunrise convention, month scheme
  (amanta/purnimanta), and any tithi-at-sunrise vs. tithi-at-instant rule.
- **Calculation methodology** — tithi/nakshatra/yoga/karana from lunar–solar longitudes;
  sunrise/sunset per an agreed horizon/refraction convention; muhurta + Rahu Kaal per the
  agreed day-division rule.
- **Validation dataset + acceptance tolerances** — a reviewer-approved golden dataset cross-
  checked against Drik/mPanchang, with explicit tolerances (e.g. tithi-boundary time within
  ±N minutes; sunrise within ±M minutes). No engine ships until it passes.

---

## Alternatives Considered

- **Provider interface + deferred astronomy (chosen).** *Advantages:* unblocks all
  non-astronomical backend work now; keeps the accuracy decision with reviewers; zero caller
  churn when the engine lands. *Disadvantages:* panchang/notification timing stays blocked
  until ratification. *Reason chosen:* maximizes forward progress while preserving ADR-010's
  determinism and the trust bar.
- **Implement a "reasonable" engine now, refine later.** *Advantages:* faster to a working
  Today screen. *Disadvantages:* ships potentially-wrong tithis; a public accuracy error is a
  trust catastrophe (MRD Risk §1); "refine later" means silently changing users' religious
  dates. *Reason rejected:* violates ADR-010's validation mandate and the product's core
  promise. **Explicitly forbidden by this ADR until Part B is ratified.**
- **Third-party panchang API at runtime.** *Advantages:* offloads the algorithm. *Disadvantages:*
  breaks offline-first (ADR-015) and deterministic caching (ADR-010), adds a per-request
  dependency + cost + a vendor whose conventions we can't version/validate. *Reason rejected:*
  incompatible with offline-first and determinism. (May inform the validation dataset.)

---

## Consequences

**Positive.** All independent backend work proceeds; the accuracy decision is made
deliberately with reviewers; the deterministic, cacheable architecture (ADR-010) is
preserved; the engine is swappable and version-stamped.

**Trade-offs.** `SVC_panchang` (Today/calendar/detail) and sunrise/tithi-timed notifications
remain unavailable until Part B is ratified and an engine is implemented + validated. Engine-
dependent tests are pending/skipped (no fake data).

**Operational.** An `engine_version` bump re-validates against the golden dataset before
release and invalidates `panchang_cache` (ADR-010). Accuracy is a release gate (like the AI
groundedness gate).

**Future maintenance.** New regional variants or a corrected convention = a new
`engine_version` + dataset re-baseline, released as a governed change.

---

## Dependencies

**Depends on** ADR-010 (deterministic cacheable panchang — this realizes its engine).
**Related** ADR-015 (offline-first requires local determinism), ADR-020 (notification timing
consumes the engine), ADR-017 (provider-adapter pattern — same seam discipline).
**Blocks** the `SVC_panchang` compute path and sunrise/tithi notifications until Accepted.

---

## Affected Documents

- **ADR-010** — this ADR is its concrete engine decision.
- **New:** `docs/architecture/canonical-panchang-engine/{MRD,PRD,PDD,TDD}.md`.
- **TDD Part 2 §3.10** (`panchang_cache`, `engine_version`), TDD Part 1 §10.2.
- **Code:** `apps/backend/functions/panchang/engine.ts` (the interface this governs).
- **Decision Log** — add a DEC entry when this moves to Accepted.

---

## Review Trigger

Revisit when: the astronomical choices (Part B) are ratified with reviewer sign-off (→ move
to Accepted); a new tradition/region is added; a validation discrepancy against Drik/mPanchang
is found; or the ephemeris source's license/precision changes.

---

## Notes

Until this ADR is **Accepted**, do not implement astronomical calculations. The placeholder
`unimplementedPanchangEngine` must remain the only registered engine, failing closed
(`ERR_PANCHANG_UNAVAILABLE`, never fabricated output). Engine-behavior tests stay
`it.skip` with `TODO(ADR-033)` until the validated dataset exists.
