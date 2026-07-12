# Canonical Panchang Computation Engine — Architecture Work Item

**Status:** OPEN / BLOCKING — the only blocked backend component.
**Decision record:** [ADR-033 (Proposed)](../adr/ADR-033-Canonical-Panchang-Computation-Engine.md)

The astronomical algorithm behind PanchangPal's panchang is **not specified in any
MRD/PRD/PDD/TDD and must not be guessed** (a wrong tithi destroys trust — main MRD Risk §1).
This work item exists to make that decision deliberately, with reviewer input, before any
implementation. Until ADR-033 is **Accepted**, the backend runs an abstract `PanchangEngine`
interface whose only implementation fails closed (`ERR_PANCHANG_UNAVAILABLE`).

## Documents

| Doc | Purpose |
|---|---|
| [ADR-033](../adr/ADR-033-Canonical-Panchang-Computation-Engine.md) | The decision: provider architecture (proposed-accepted) + the astronomical choices to ratify |
| [MRD.md](MRD.md) | Market/accuracy requirements — agreement with Drik/mPanchang, reviewer validation |
| [PRD.md](PRD.md) | What the engine must output + the accuracy release gate |
| [PDD.md](PDD.md) | How engine outputs & edge cases present to users (unavailable/ambiguous/fallback) |
| [TDD.md](TDD.md) | Engineering: interface (decided) + ephemeris/ayanamsa/methodology/validation/tolerances (to ratify) |

## What must be ratified before implementation (ADR-033 Part B)

1. **Ephemeris** (recommended: Swiss Ephemeris-grade; legal license review required).
2. **Ayanamsa** (recommended default: Lahiri/Chitrapaksha; per-tradition overrides).
3. **Supported-tradition profiles** (month scheme, tithi reference, sunrise convention, day division).
4. **Calculation methodology** (tithi/nakshatra/yoga/karana, sunrise/sunset, muhurta, Rahu Kaal, recurrence).
5. **Validation dataset** (reviewer-approved, vs Drik/mPanchang, per tradition × dates × locations).
6. **Acceptance tolerances** (the ±minute bounds — set with the reviewer).

## Interface (implemented, engine-agnostic)

`apps/backend/functions/panchang/engine.ts` — `PanchangEngine` + `unimplementedPanchangEngine`
(fails closed). `SVC_panchang` and `SVC_notify_scheduler` depend only on the interface. When the
decision lands, add a concrete engine and inject it — no caller changes.
