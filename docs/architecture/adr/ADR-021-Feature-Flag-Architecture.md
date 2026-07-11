# ADR-021 — Feature-Flag Architecture (Postgres-backed)

**Status:** Accepted (`[TECHNICAL IMPROVEMENT]`)
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

Post-v1 scope (greeting card, Jain mode, family plan, lifecycle email) must be shippable and cuttable without branching, so the team can "cut scope, don't slip" under timeline pressure (MRD Risk §14). This requires runtime flags that are simple, auditable, and free of an extra vendor.

Relevant sources: TDD Part 1 §1.3, §3 Stack row 16, §7.3.

---

## Decision

Use a **PostgreSQL `feature_flags` table** (`FF_*`) read at launch and cached on the client, with Realtime invalidation for near-immediate updates. Flags gate post-v1 features — `FF_GREETING_CARD`, `FF_JAIN_MODE`, `FF_FAMILY_PLAN`, `FF_LIFECYCLE_EMAIL` — so scope can be enabled/disabled without code branches.

---

## Alternatives Considered

- **A managed flag vendor (e.g., LaunchDarkly).** Rejected: overkill and added cost/vendor at v1 scale.
- **Build-time constants.** Rejected: cannot toggle without a release; defeats "cut scope without branching."

---

## Consequences

**Positive.** Simple, auditable flags with no extra vendor; Realtime invalidation avoids stale gating; scope is decoupled from release branches.

**Trade-offs.** Flag values themselves are product follow-ups (F-9/F-11/F-15/F-17); flags must be cleaned up once features graduate.

**Operational.** Flags are read at launch and cached; the same table is a natural home for lightweight remote config.

---

## Dependencies

**Depends on** ADR-003 (PostgreSQL + Realtime).
**Related** ADR-024 (release strategy — flags decouple deploy from release).

---

## Affected Documents

- TDD Part 1 §1.3, §3 (Stack row 16), §7.3
- MRD Risk §14 (cut scope, don't slip); `FF_*` identifiers

---

## Review Trigger

Revisit if flag volume or targeting needs (per-user/segment rollout, experiments) outgrow a simple table.
