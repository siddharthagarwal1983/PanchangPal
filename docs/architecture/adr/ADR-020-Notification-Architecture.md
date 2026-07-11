# ADR-020 — Notification Architecture (Expo Push + pg_cron Scheduler)

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Platform / Mobile

---

## Context

PanchangPal's daily loop depends on well-timed, respectful notifications: morning ritual reminders at the user's local sunrise-relative time, festival and personal-date reminders, delivered within tight timing tolerances and respecting quiet hours, frequency caps, and completion suppression (PDD §8; TDD §2.9). Notifications must span iOS and Android from one implementation and must never carry engagement-bait or, for grief-aware personal dates, streak/promo content.

Relevant sources: TDD Part 1 §2.9, §3 Stack row 11, §7.10, §8 (NFR-11); Decision Log DEC-002 (no engagement-only notifications).

---

## Decision

Deliver notifications via **Expo Notifications / Expo Push (APNs/FCM)**, scheduled by a server-side `SVC_notify_scheduler` Edge Function driven by a **`pg_cron` scheduled trigger**. The scheduler computes due notifications from user-local time, sunrise, festivals, and personal-date tithi recurrences, then applies quiet hours, frequency caps, and completion suppression before sending with deep-link payloads (`panchangpal://…`). The scheduler is idempotent; personal-date reminders are grief-aware and never carry streak/promo content.

---

## Alternatives Considered

- **A dedicated push vendor / custom APNs+FCM integration.** Rejected: Expo Push gives one API over both stores with no extra vendor, matching the managed-first philosophy (ADR-028).
- **Client-scheduled local notifications only.** Rejected: server scheduling is needed for sunrise/festival/personal-date logic, caps, and suppression that must be consistent and auditable.

---

## Consequences

**Positive.** One cross-platform push path; server-side timing logic is consistent and testable; deep links land users on a valid back-stack.

**Trade-offs.** Delivery depends on APNs/FCM and Expo receipts; timing accuracy requires careful tz/quiet-hours handling (ADR-026).

**Operational.** Delivery ≥95% and morning timing within ±2 min are SLOs (NFR-11); delivery/open emit `EVT_040/041`.

---

## Dependencies

**Depends on** ADR-002 (Expo), ADR-006 (scheduler function), ADR-025 (pg_cron jobs), ADR-026 (timezone-local timing).
**Related** ADR-017 (notification adapter seam).

---

## Affected Documents

- TDD Part 1 §2.9, §3 (Stack row 11), §7.10, §8 (NFR-11)
- Decision Log DEC-002 (Trust Before Engagement); PDD §8, UX-7
- `EVT_040/041`; deep-link scheme `panchangpal://`

---

## Review Trigger

Revisit on push delivery/timing NFR misses, or a store/OS change to notification capabilities.
