# ADR-030 — Security Model (Least Privilege, No Secrets on Device)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Security / Architecture

---

## Context

PanchangPal handles personal data and money (subscriptions) and depends on third-party secrets (OpenAI, service-role, webhook keys). Trust and security are core principles (TDD Part 1 §1.5). A leaked key or an over-privileged component is a critical risk (TRISK-08). Because the client is untrusted and talks directly to the datastore, the security model must assume the device can be inspected.

This ADR covers secrets handling and least privilege; the authorization boundary itself is ADR-018 (RLS), and data minimization is ADR-031 (privacy).

Relevant sources: TDD Part 1 §1.5, §7.2, §8 (NFR-18), §9 TRISK-08; Decision Log DEC-018, DEC-019.

---

## Decision

Enforce **least privilege by default and no secrets on the device**. Every service receives the minimum permissions required. Server-only secrets (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `EXPO_ACCESS_TOKEN`) live only in Edge Function/CI/EAS secret stores; the app holds only public keys (`EXPO_PUBLIC_*`). Privileged operations run only in Edge Functions with the service role, never on the client. All inputs are validated (zod) at every boundary; outputs never leak internals or stack traces (ADR-022); store receipts are validated server-side (RevenueCat). Dependency and secret scanning run in CI, following OWASP Mobile guidance.

---

## Alternatives Considered

- **Embedding third-party keys or service-role access in the client.** Rejected: trivially extractable from a mobile binary; a critical exposure.
- **Broad/shared service permissions.** Rejected: violates least privilege and widens blast radius.

---

## Consequences

**Positive.** Secrets cannot leak from the device; compromised components have minimal reach; server-side receipt validation resists IAP fraud.

**Trade-offs.** All privileged paths must be routed through Edge Functions; secret management spans Supabase, CI, and EAS and must be maintained carefully.

**Operational.** Zero secrets on device and clean dependency scans are NFRs (NFR-18), verified in security review and CI.

---

## Dependencies

**Depends on** ADR-006 (privileged ops server-side), ADR-018 (RLS authorization).
**Related** ADR-022 (no leaked internals), ADR-031 (privacy), ADR-005 (server-side receipt validation).

---

## Affected Documents

- TDD Part 1 §1.5, §7.2 (env/secrets), §8 (NFR-18), §9 TRISK-08
- Decision Log DEC-018 (Least Privilege), DEC-019 (No Secrets in Client)

---

## Review Trigger

Revisit at every security audit, or on any secret-exposure/fraud incident.
