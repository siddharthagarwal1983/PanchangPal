# ADR-024 — Delivery & Release Strategy (GitHub Actions + EAS + Expo OTA)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Platform / Mobile

---

## Context

A solo founder needs a fast, safe path from commit to production for both a native app and a serverless backend, plus the ability to ship JavaScript-only fixes quickly for a trust-critical product. Database migrations and Edge Function deploys must move in lockstep with the app from one monorepo (ADR-014), and `main` must always be releasable.

Relevant sources: TDD Part 1 §2.4, §3 Stack row 18, §5 (branch strategy), §7.14.

---

## Decision

Use **GitHub Actions** as the CI/CD pipeline: lint/typecheck/test → apply DB migrations to Supabase → deploy Edge Functions → **EAS Build/Submit** for native binaries → store distribution, plus **Expo Updates (OTA)** for JS-only changes within store policy. Development is **trunk-based**: short-lived branches off `main`, PRs gated by required checks (lint/type/test/a11y) and CODEOWNERS review; `main` is always releasable; releases are tagged semver; hotfixes ship via OTA where JS-only. Breaking API/DB changes follow expand-then-contract migrations and the approval process; the app sends `app_version` and the backend supports N and N-1 with a minimum-supported-version force-upgrade for breaking changes.

---

## Alternatives Considered

- **Manual builds / manual store submission.** Rejected: slow and error-prone for a solo founder.
- **Store-review-only updates (no OTA).** Rejected: too slow to correct a trust-critical content/JS bug.
- **Long-lived release branches / gitflow.** Rejected: overhead unjustified for one engineer; trunk-based keeps `main` releasable.

---

## Consequences

**Positive.** Fast, repeatable releases; app, functions, and DB deploy together; OTA enables rapid policy-compliant fixes; feature flags (ADR-021) decouple deploy from release.

**Trade-offs.** OTA is limited to JS-compatible changes and must respect store policy; version-compatibility windows require disciplined, backward-compatible migrations.

**Operational.** CI fails on lint/type/test/a11y; CODEOWNERS enforces PDD §3.0A.5 ownership; store-review and build health are monitored (TRISK-10).

---

## Dependencies

**Depends on** ADR-002 (Expo/EAS/OTA), ADR-014 (monorepo).
**Related** ADR-021 (flags), ADR-029 (a11y gate in CI), ADR-006 (function deploys).

---

## Affected Documents

- TDD Part 1 §2.4 (deployment), §3 (Stack rows 18–19), §5 (branch strategy), §7.14 (version compatibility)
- TDD §9 TRISK-10 (Expo/OTA/store rejection)

---

## Review Trigger

Revisit on team growth requiring a heavier branching model, or a store-policy change affecting OTA.
