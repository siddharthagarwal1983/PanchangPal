# ADR-029 — Accessibility-First (WCAG 2.1 AA, Release-Blocking)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Accessibility / Mobile

---

## Context

PanchangPal serves a broad, multi-generational audience, including older household members, and holds trust and inclusion as core values. Accessibility that is bolted on late is typically incomplete. The PDD sets a WCAG 2.1 AA gate, and engineering must uphold it as a first-class, testable, release-blocking property rather than a best-effort afterthought (TDD Part 1 §1.8; PDD §10).

Relevant sources: TDD Part 1 §1.8, §8 (NFR-17); PDD §10, §15.4.

---

## Decision

Treat **accessibility as a release-blocking gate at WCAG 2.1 AA**. Every component and screen provides semantic roles/labels/values, focus order equal to visual order, minimum touch targets (≥44/48), Dynamic Type reflow, Reduced-Motion fallbacks, color-independence, screen-reader support (VoiceOver/TalkBack), and correct audio-focus management (ritual narration vs. screen reader). Accessibility is enforced in per-component required test coverage and the QA plan, and a build failing the accessibility gate does not ship.

---

## Alternatives Considered

- **Best-effort / post-launch accessibility.** Rejected: excludes part of the target audience, contradicts the trust/inclusion values, and is costlier to retrofit.

---

## Consequences

**Positive.** An inclusive product for all household members; accessibility regressions are caught in CI, not in the field.

**Trade-offs.** Every component carries accessibility implementation and test cost; the release gate can block shipping until issues are fixed.

**Operational.** WCAG 2.1 AA pass is an NFR (NFR-17); a11y checks run in CI (ADR-024) and the QA plan (PDD §15.4).

---

## Dependencies

**Related** ADR-024 (a11y gate in CI), ADR-008/ADR-007 (component/state layers that render accessible UI).

---

## Affected Documents

- TDD Part 1 §1.8, §8 (NFR-17)
- PDD §10 (accessibility), §15.4 (QA gates); per-component required test coverage (PDD Part 3)

---

## Review Trigger

Revisit if the accessibility standard is raised (e.g., WCAG 2.2/3.0) or new interaction modalities are added.
