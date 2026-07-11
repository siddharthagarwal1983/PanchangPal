# ADR-005 — RevenueCat for Billing & Entitlements

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Architecture / Monetization

---

## Context

PanchangPal monetizes through subscriptions on the App Store and Google Play. Mobile store policy requires native in-app purchase for digital goods (PDD A12 "native IAP only"). Implementing StoreKit and Play Billing directly means per-platform receipt validation and entitlement logic — significant code and edge cases for a solo founder — and the product needs a single cross-platform source of truth for entitlements, including family-plan propagation (F-4).

Relevant sources: TDD Part 1 §2.1, §3 Stack row 12, §6 ADR-005; Decision Log DEC-015, DEC-016.

---

## Decision

Use **RevenueCat to orchestrate native IAP** (StoreKit / Play Billing). RevenueCat is the cross-platform entitlement source of truth, performs receipt validation, and notifies the backend of entitlement changes via webhook (`SVC_revenuecat_webhook`), which reconciles them into PostgreSQL. Business logic depends on a **Payment Provider Adapter** (see ADR-017), so RevenueCat is the concrete implementation behind a swappable seam.

---

## Alternatives Considered

- **Raw StoreKit + Play Billing.** Rejected: per-platform receipt/entitlement code is a large surface for the solo timeline.
- **Stripe (or other web billing).** Rejected: not permitted for digital IAP on the mobile stores.

---

## Consequences

**Positive.** Fast, robust cross-platform entitlements including family-plan propagation via webhook; store-compliant.

**Trade-offs.** A billing-vendor dependency, mitigated by the payment adapter (ADR-017).

**Operational.** The webhook handler is idempotent (dedupe by event id) so redeliveries never double-apply entitlements (TDD §7.7).

---

## Dependencies

**Depends on** ADR-006 (webhook runs in an Edge Function), ADR-017 (payment provider adapter seam).
**Related** ADR-003 (entitlements persisted in PostgreSQL).

---

## Affected Documents

- TDD Part 1 §2.1, §3 (Stack row 12), §6 ADR-005, §7.7 (idempotency)
- Decision Log DEC-015 (RevenueCat), DEC-016 (Payment Provider Adapter)
- API: `API_POST_SUB_VALIDATE` reconciliation; `SVC_revenuecat_webhook`

---

## Review Trigger

Revisit on pricing/margin pressure, or a monetization need RevenueCat cannot serve.
