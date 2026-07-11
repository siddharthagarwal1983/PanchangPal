# ADR-026 — Time-Zone Correctness (UTC Store, IANA Compute)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Backend / Architecture

---

## Context

Time-zone handling is a correctness pillar for a product serving a diaspora across the US, Australia, and New Zealand (MRD §7). Panchang, sunrise, notification timing, and personal-date tithi recurrence are all local-time-sensitive; defaulting to India time — or doing ad-hoc `Date` math — would silently produce wrong tithis and mistimed reminders, the exact failures that destroy trust.

Relevant sources: TDD Part 1 §7.12; §2.6/§2.9/§2.10; §9 TRISK-04/06.

---

## Decision

**Store instants in UTC; compute and display in the user's IANA time zone** (derived from location). Panchang, sunrise, and notification timing are all computed tz-local; personal-date tithi recurrence is computed per-tz; DST is handled via IANA rules. Never default to India time. All date logic goes through a **single tz-aware utility** — no ad-hoc `Date` arithmetic anywhere in the codebase (mandatory).

---

## Alternatives Considered

- **Fixed/India-default time zone.** Rejected: wrong for the entire diaspora target market.
- **Ad-hoc per-call date math.** Rejected: error-prone and inconsistent; DST and recurrence bugs are near-certain without a single utility.

---

## Consequences

**Positive.** Correct local tithis, sunrise, and reminder timing everywhere; a single, testable code path for all date logic.

**Trade-offs.** Location→tz derivation must be reliable; every date operation must route through the utility (enforced by convention/review).

**Operational.** Timezone/quiet-hours correctness is covered by tests; mistimed pushes and panchang errors are tracked risks (TRISK-04/06).

---

## Dependencies

**Related** ADR-010 (deterministic panchang takes tz as input), ADR-020 (notification timing).

---

## Affected Documents

- TDD Part 1 §7.12 (time-zone handling), §2.6/§2.9/§2.10
- TDD §9 TRISK-04 (panchang error), TRISK-06 (notification timing)

---

## Review Trigger

Revisit if a new locale/region introduces calendar or DST rules the current IANA-based utility does not cover.
