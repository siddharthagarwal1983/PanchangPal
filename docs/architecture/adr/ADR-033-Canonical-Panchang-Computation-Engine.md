# ADR-033 — Canonical Panchang Computation Engine

**Status:** Accepted **at ratified scope** (2026-08-09) — see §Ratification Record
**Date:** 2026-07-12 · **Ratified:** 2026-08-09
**Decision Owner:** Architecture + Product (astronomical/religious accuracy is joint)

> This ADR opened the decision as **Proposed**. Part A (provider architecture) was decidable
> then and matches the code. **Part B was ratified by the decision owner on 2026-08-09** for a
> deliberately narrowed scope — one ephemeris, one ayanamsa, one tradition — recorded verbatim
> in §Ratification Record below, together with what remains open.
>
> ⛔ **Acceptance does NOT authorise registering a concrete engine.** §9's rollout requires the
> golden dataset to pass first, and **that dataset does not exist** (see Residual R1). Until it
> does, `unimplementedPanchangEngine` remains the only *registered* engine. A concrete engine
> may be **written and tested**; it may not be **served**.
>
> Companion docs: `docs/architecture/canonical-panchang-engine/` (MRD, PRD, PDD, TDD).

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

## Ratification Record (2026-08-09)

Ruled by the decision owner. Each entry replaces the corresponding **recommendation** in Part B.

| # | Choice | Ruling | Note |
|---|---|---|---|
| B-1 | Ephemeris | **JPL DE440** | Public-domain; **removes the Swiss Ephemeris licence question entirely** (AGPL-3.0-or-paid), which was the MR-6 legal blocker. Cost re-appears as implementation surface — see R2. |
| B-2 | Ayanamsa | **Lahiri (Chitrapaksha)** as default, **per-tradition override allowed** | Stored in the tradition profile, versioned with `engine_version`, never hard-coded. |
| B-3 | Traditions (v1) | **`generic` ONLY** | `north_indian`, `south_indian_tamil`, `bengali` are **deferred to a pandit reviewer** and keep returning `ERR_PANCHANG_UNAVAILABLE`. ⚠️ All four are already seeded and selectable, so three become *selectable but unserved* — see R3. |
| B-4 | Tolerances | **Festival dates exact (0-day). N and M deliberately NOT set.** | Instant tolerances to be set from real cross-check data rather than guessed. ⛔ Unmeasurable today — see R1. |

### `generic` profile — ruled 2026-08-09 (B-5)

| Field | Ruling | Note |
|---|---|---|
| `ayanamsa` | **Lahiri (Chitrapaksha)** | per B-2 |
| `tithi_reference` | **`tithi-at-sunrise`** | the tithi prevailing at sunrise owns the civil day |
| `sunrise_convention` | **upper limb + standard refraction** | the civil/astronomical standard (~50′ below horizon centre: 34′ refraction + 16′ semi-diameter) |
| `day_division` | **sunrise→sunset in 8 equal parts**, with an **explicitly frozen** weekday→segment mapping | the mapping is ratified as data, never left implicit in code |
| `month_scheme` | **purnimanta** | ruled 2026-08-09; lunar month ends at the full moon |

⚠️ **`generic` NOW CARRIES A REGIONAL CONVENTION UNDER A NEUTRAL NAME, AND THE REVIEWER SHOULD KNOW
THAT.** TDD §4 describes `generic` as "a documented neutral default", and **purnimanta is the North
Indian scheme** — so the profile is no longer convention-neutral, it is North-Indian-defaulted. That
may well be the right product call given the diaspora mix, but it is a **naming honesty issue**: a
South Indian user who never opens the tradition picker gets purnimanta month names silently. Two
follow-ups for the reviewer, neither blocking: whether the label should change, and whether the
onboarding tradition suggestion (below) should be prominent rather than a default.

⚠️ **`tithi_reference` AS A SINGLE FIELD IS A KNOWN SIMPLIFICATION, RECORDED RATHER THAN DISCOVERED
LATER.** It fixes the day-labelling convention; it does **not** encode per-vrata rules, which in
practice vary — some keyed to sunrise, others to sunset, moonrise, or a midday/pradosh window. So a
festival whose own rule differs from day-labelling will resolve wrongly while every other output
looks right. Acceptable for v1 because only `generic` ships and the festival corpus does not yet
exist; **it must be reconsidered when real reviewed festival content lands**, since that is exactly
when the divergence becomes visible.

⚠️ **THE FROZEN WEEKDAY MAPPING MUST BE WRITTEN DOWN AND CONFIRMED, NOT ASSUMED.** A widely-published
mapping of Rahu Kaal to the eight sunrise→sunset segments exists, but **freezing an unconfirmed
mapping is precisely the failure this ADR guards against** — it would be a religious convention
entering the system as an engineering default.
**B-6, ruled 2026-08-09: the mapping is PROVISIONAL data and no engine may read it until the pandit
reviewer confirms it.** It is stored in the tradition profile, versioned with `engine_version`, and
carries an explicit unconfirmed marker — the same discipline as the golden values, and for the same
reason: **the system must not be able to compute a religious output from a convention nobody
approved.**

### B-5 `month_scheme` — resolved as **purnimanta**; the location proposal is recorded as rejected

A ruling of *"derive it from the user's phone location"* was proposed on 2026-08-09 and is **recorded
as rejected on product grounds**, not overridden silently:

- **The primary users are Indians living ABROAD** (MRD; launch markets US/AU/NZ). A device in
  Auckland or Chicago yields **no Hindu regional month scheme at all**. The attribute that decides
  amanta vs purnimanta is the user's **family/regional tradition**, which is exactly what they carry
  abroad and what the product exists to keep them connected to. **Phone location is the one signal
  that is systematically wrong for the target user.**
- **The mechanism already exists and is user-owned.** `tradition_code` is a seeded, user-selected
  preference (`generic`, `north_indian`, `south_indian_tamil`, `bengali` — F-9), and TDD §4 places
  `month_scheme` **inside the tradition profile** as versioned data. Deriving it from coordinates
  would move a religious convention out of reviewed profile data and into an implicit region→scheme
  lookup **that is itself an unratified convention**.
- **It would break the caching contract.** ADR-010 requires `compute` to be a pure function of
  `(instant, lat, lng, tz, tradition, engine_version)`; a scheme silently derived from coordinates
  makes two users with the same tradition disagree by geography, and `panchang_cache` is keyed on a
  coarsened `geo_bucket`.

**Location may legitimately SUGGEST a default tradition at onboarding** (as ADR-026 already does for
`timezone`: location-derived, user-correctable, never overwriting). That is a defensible onboarding
nicety and does **not** remove the requirement below.

✅ **RESOLVED: `generic.month_scheme = purnimanta`** (ruled 2026-08-09). `generic` is the profile a
user holds before choosing anything, so it needs one value, and it now has one. See the naming
caveat in the profile table above.

### Residuals — why Accepted ≠ shippable

- **R1 ⛔ The ratified acceptance gate cannot be built.** TDD §6 requires a reviewer-approved
  golden dataset cross-checked against Drik/mPanchang.
  **Phase 1 skeleton now exists — keys only, every value UNFILLED**:
  `apps/backend/functions/panchang/golden/generic-2027-phase1.csv` (46 rows), specified by
  `docs/architecture/canonical-panchang-engine/GOLDEN_DATASET.md`. Values are the reviewer's
  cross-check and **must never be produced by our own engine**. Until they are filled, nothing
  can be validated, and the seed carries **one** festival — `sample-festival`, significance
  *"Placeholder significance (reviewer content to follow)"*. A festival-date gate would run
  against one fictional row, or against nothing and pass vacuously. `ci.yml`'s standing rule is
  that **a gate is added when it can fail**. This is the same blocker as §10.1 item 2 (reviewed
  festival content), now shown to gate ADR-033's rollout step 2 as well.
- **R2 ⚠️ DE440 is a materially larger build than the option it replaced.** It ships as JPL
  binary SPK kernels (`de440s.bsp` ≈ 32 MB trimmed; `de440.bsp` ≈ 114 MB) requiring Chebyshev
  interpolation, and no mature JS/Deno SPK reader exists — the maintained MIT libraries
  (`astronomy-engine`, `astronomia`) implement VSOP87/Meeus-derived models, **not DE440**. Using
  one of those would not be this ruling. The kernel must also fit an Edge Function deployment.
- **R3 ⚠️ Three seeded traditions become selectable but unserved.** A user on `bengali` sees the
  unavailable state indefinitely while a `generic` user sees data. That is a product decision,
  not only an engineering one.

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

~~Until this ADR is **Accepted**, do not implement astronomical calculations.~~ **Superseded
2026-08-09 by the Ratification Record.** The current rule is narrower and splits *writing* from
*serving*:

- **Authorised:** implementing a concrete engine for **`generic` only**, on **DE440** with
  **Lahiri**, and **`generic`'s four profile fields are now ruled** (B-5/B-6). ⚠️ The Rahu Kaal
  weekday→segment mapping stays **provisional** — no engine may read it until the reviewer confirms it.
- ⛔ **NOT authorised:** registering it in place of `unimplementedPanchangEngine`. §9's rollout
  puts "pass golden dataset → reviewer sign-off" before registration, and **R1 records that the
  dataset does not exist**. The placeholder stays registered, failing closed
  (`ERR_PANCHANG_UNAVAILABLE`, never fabricated output).
- ⛔ **NOT authorised:** any output for `north_indian`, `south_indian_tamil` or `bengali`, which
  B-3 defers to a pandit reviewer.

Engine-behaviour tests stay `it.skip` with `TODO(ADR-033)` until the validated dataset exists —
a test asserting values nobody has checked against Drik/mPanchang would manufacture confidence
rather than measure it, which is precisely the failure this ADR was written to prevent.
