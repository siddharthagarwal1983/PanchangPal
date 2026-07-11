# ADR-001 — React Native for the Mobile Client

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture

---

## Context

PanchangPal must ship a single consumer product on both iOS and Android, built and maintained by a solo founder on a tight timeline (MRD Risk §12 — solo-founder single-point-of-failure; PRD platform requirement). Building two fully native applications (Swift + Kotlin) would roughly double the engineering surface for every screen, flow, and fix — an unacceptable cost against the one-engineer constraint. The team also wants a technology whose talent pool is deep enough to hire a second engineer later without re-deriving the whole system (TDD Part 1 §1.1 "boring, legible, replaceable").

Relevant sources: TDD Part 1 §1.1 (engineering philosophy), §3 Stack row 1, §6 ADR-001.

---

## Decision

Build the mobile client with **React Native (TypeScript)**, sharing one codebase across iOS and Android. Native capabilities (audio narration, notifications, in-app purchase) are reached through Expo and vetted community modules rather than hand-written native code where a maintained module exists.

---

## Alternatives Considered

- **Native Swift + Kotlin (two codebases).** Rejected: roughly 2× the work for a solo founder; every feature, test, and bugfix implemented twice.
- **Flutter (Dart).** Rejected: a smaller diaspora/JS-developer hiring pool, weaker parity with the React Native ecosystem the rest of the stack (Expo, RevenueCat, Sentry SDKs) already targets.

---

## Consequences

**Positive.** One shared codebase and one skill set (TypeScript) across the whole client; fast iteration; a large ecosystem of libraries for audio, notifications, and IAP; easier future hiring.

**Trade-offs.** Some platform-specific polish must still be written per-OS; certain native capabilities depend on the health of community modules; the JavaScript bridge imposes performance discipline (see ADR-007, ADR-010 for the caching/compute strategy that keeps the UI fast).

**Operational.** Native modules are consumed through Expo's managed surface (ADR-002), which constrains which native code can be added without ejecting.

---

## Dependencies

**Depended on by** ADR-002 (Expo builds on the React Native choice), ADR-007, ADR-008 (client state libraries assume RN/JS).
**Related** ADR-010 (deterministic compute keeps the JS thread light), ADR-024 (delivery pipeline).

---

## Affected Documents

- TDD Part 1 §1.1, §3 (Stack row 1), §6 ADR-001
- PRD platform requirement (iOS + Android)
- MRD Risk §12 (solo-founder constraint)
- Decision Log: informs DEC-008 (thin client) delivery

---

## Review Trigger

Revisit if a required native capability lacks a maintained React Native module, or if performance NFRs (TDD §8) cannot be met on low-end Android devices.
