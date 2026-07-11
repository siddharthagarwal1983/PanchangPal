# ADR-002 — Expo (Managed Workflow) + EAS

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

React Native (ADR-001) still leaves a large operational burden: native toolchains, signing, CI for two platforms, and store submission. For a solo founder that undifferentiated work is pure risk and time cost (TDD Part 1 §1.1 "managed-first, build-least"). The team also wants the ability to ship JavaScript-only fixes quickly without waiting for a full store review, which matters for a trust-critical product where a wrong ritual detail must be correctable fast.

Relevant sources: TDD Part 1 §1.1, §2.4 (deployment), §3 Stack rows 1 & 18, §6 ADR-002.

---

## Decision

Use the **Expo managed workflow** with **EAS Build/Submit** for native binaries and **Expo Updates (OTA)** for JavaScript-only changes. The app stays within Expo's supported native surface; anything custom is added via Expo config plugins rather than a bare eject.

---

## Alternatives Considered

- **Bare React Native.** Rejected for the solo-founder timeline: more control at the cost of owning native build/CI operations that Expo otherwise removes.

---

## Consequences

**Positive.** No native toolchain to operate; faster delivery; OTA enables rapid, policy-compliant JS fixes (ADR-024); EAS handles build and store submission.

**Trade-offs.** The app must remain within Expo's supported native capabilities; custom native needs are met with config plugins, and a genuinely unsupported dependency could force a dev-client or bare eject.

**Operational.** OTA updates are limited to JS-compatible changes and must respect store policy (TRISK-10).

---

## Dependencies

**Depends on** ADR-001 (React Native).
**Related** ADR-024 (CI/CD & OTA delivery pipeline).

---

## Affected Documents

- TDD Part 1 §1.1, §2.4, §3 (Stack rows 1, 18, 19), §6 ADR-002
- TDD Part 1 §9 (TRISK-10 Expo/OTA/store-rejection risk)

---

## Review Trigger

Revisit if a needed native dependency is incompatible with Expo config plugins, requiring a move to a dev-client or bare workflow.
