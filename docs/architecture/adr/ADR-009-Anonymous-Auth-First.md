# ADR-009 — Anonymous-Auth-First Identity

**Status:** Accepted (`[TECHNICAL IMPROVEMENT]`)
**Date:** 2026-07-11
**Decision Owner:** Architecture / Backend

---

## Context

The product defers sign-in: a first-time user completes onboarding and uses the daily loop without hitting an account wall (UX-2). But Row-Level Security (ADR-018) is the authorization boundary and needs a real user identity to attribute rows from the very first launch. There must be no window in which user data is unowned or unprotected, and a later sign-in must not lose the data created while anonymous.

Relevant sources: TDD Part 1 §2.8, §3 Stack row 6, §6 ADR-009.

---

## Decision

Give **every first-launch user a Supabase anonymous session** so a real `auth.uid` exists immediately and RLS applies from the start. When the user later signs in with Apple, Google, or email-OTP, `SVC_account` performs an **identity merge**: anon-owned rows are reassigned to the authenticated user, with divergence resolved by union / longer-streak and communicated to the user (`ERR_AUTH_MERGE_CONFLICT`).

---

## Alternatives Considered

- **Device-local-only profile, create account later.** Rejected: makes RLS and later migration harder, and risks an unprotected/unowned data window.

---

## Consequences

**Positive.** RLS works universally from first launch; onboarding needs no sign-in wall; no unowned data window.

**Trade-offs.** Requires a robust, well-tested merge path (`SVC_account`, F-1), including conflict resolution.

**Operational.** Anonymous accounts are an abuse vector; device attestation / rate limits are the documented mitigation.

---

## Dependencies

**Depends on** ADR-003 (Supabase Auth), ADR-018 (RLS), ADR-006 (`SVC_account`).
**Related** ADR-015 (offline data created pre-auth).

---

## Affected Documents

- TDD Part 1 §2.8, §3 (Stack row 6), §6 ADR-009
- Business rules: anon→auth merge (F-1); `ERR_AUTH_MERGE_CONFLICT`, `ERR_AUTH_EXPIRED`

---

## Review Trigger

Revisit if abuse via anonymous accounts emerges, warranting device attestation or stricter rate limits.
