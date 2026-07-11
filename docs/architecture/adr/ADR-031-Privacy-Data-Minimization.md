# ADR-031 — Privacy & Data-Minimization Model

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Security / Privacy

---

## Context

PanchangPal is privacy-first, serving users in markets with regimes such as CCPA. The product touches sensitive contexts — personal dates that may commemorate the deceased, household relationships, spiritual practice — where over-collection or leakage of personal data would be both a compliance failure and a trust failure (TDD Part 1 §1.5). Analytics, logs, and AI prompts are common places PII leaks, so the model must constrain them explicitly.

Relevant sources: TDD Part 1 §1.5, §1.9 (no cross-session AI memory), §7.4; PDD §11.1, F-3/F-10.

---

## Decision

Adopt **data minimization with privacy by default**. Collect the minimum data necessary and retain no unnecessary user data. **No PII in analytics, logs, or AI prompts**: analytics use the PDD §11.1 pseudonymous envelope (`user_pseudo_id`, `household_id`, no PII); logs carry no PII/secrets/PII-bearing prompts. The AI keeps **no cross-session memory** in v1 — conversational context is not persisted beyond a thread. Users can **export and delete** their data with a grace window (CCPA), and sensitive information enters AI prompts only when explicitly required and approved.

---

## Alternatives Considered

- **Collect-broadly / retain-by-default analytics.** Rejected: unnecessary risk and a compliance/trust liability.
- **Persistent cross-session AI memory in v1.** Rejected as a deliberate privacy and trust decision (AI non-goal).

---

## Consequences

**Positive.** Smaller privacy attack surface; CCPA-aligned export/delete; grief-aware handling of personal dates; trust reinforced.

**Trade-offs.** No PII in analytics/prompts constrains some personalization and analysis; export/delete and grace-window logic must be built and tested.

**Operational.** Export/delete run in `SVC_account`; deletion ownership/grace rules are product follow-ups (F-3/F-10); telemetry is PII-free (ADR-023).

---

## Dependencies

**Depends on** ADR-018 (RLS ownership), ADR-030 (secrets/least privilege), ADR-006 (`SVC_account` export/delete).
**Related** ADR-013/ADR-023 (no PII in analytics/logs), ADR-004/ADR-019 (no PII in prompts; no cross-session memory).

---

## Affected Documents

- TDD Part 1 §1.5 (PII minimization + CCPA), §1.9 (no cross-session memory), §7.4
- PDD §11.1 (event envelope), F-3/F-10 (deletion grace/ownership)

---

## Review Trigger

Revisit on new privacy regulation in a launch/expansion market, or a product need to persist additional personal data (which requires an approved decision).
