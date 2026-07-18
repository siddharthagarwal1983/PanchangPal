# SESSION.md

# PanchangPal — Current Session

Version: 1.5.0
Last Updated: 2026-07-18

Date/Time: 2026-07-18.

---

# Session Objective

M7 (Notifications) reviewed/approved. Begin Mobile MVP Milestone 8 — Subscription
(MOD_subscription). Implement Increment 1: server-authoritative, household-grain (F-4) entitlement
read + the premium-gating mechanism. No purchase UI yet. No architecture changes; reuse existing
seams + the Provider Adapter pattern.

---

# Work Completed (M8 Increment 1 — client-side, awaiting review)

- **Entitlement domain (`domain/subscription`):** `types` (Entitlement, EntitlementKind, SubStatus,
  `PREMIUM_CAPABILITIES` = deep_dive_content + extended_ask_guru, GateResult); `entitlement` (strict
  row -> Entitlement mapping — only a real boolean `true` is active, never coerced; rules: isEntitled
  / hasFamily / activeKind / isCapabilityUnlocked); `PaymentAdapter` port + `NullPaymentAdapter`
  (mirrors Audio/Notification adapters — no vendor import; never fabricates a purchase/entitlement).
- **Data layer:** `subscriptionRepository` (household-member entitlement READ via supabase-js RLS +
  `subscribeEntitlements` realtime seam for webhook grant/revoke propagation); `paymentAdapter`
  composition root (Null); `HOOK_useEntitlement` (query + realtime invalidate) + `usePremiumGate`
  (fails open while loading; daily loop never gated, P4).
- **Tests:** domain (mapping/rules/capability gating) + subscriptionRepository (read + realtime seam).

Entitlement is READ-ONLY on the client — the `entitlement` table denies all client writes
(migration 20260712000060); the RevenueCat webhook (SVC_revenuecat_webhook) is the sole writer.

---

# Files Created (9)
domain/subscription/{types,entitlement,PaymentAdapter,index}.ts ·
data/{subscriptionRepository,paymentAdapter}.ts · data/hooks/useEntitlement.ts ·
__tests__: domain/subscription.test.ts · data/subscriptionRepository.test.ts

# Files Modified (0)
None. `guards.isEntitled` (raw-row splash predicate) left untouched; the domain
`isEntitled(Entitlement[])` is the feature-grain equivalent used by the hook.

---

# Important Observations
- **Entitlement is server-authoritative + household-grain (F-4), read-only on device.** Client never
  writes entitlements; realtime propagates webhook-driven grant/revoke.
- `react-native-purchases` is NOT yet a dependency (offline sandbox can't regenerate the lockfile).
  PaymentAdapter is a pure port + Null impl (Audio/Notification precedent) so tsc/CI stay green; the
  concrete `RevenueCatPaymentAdapter` is a one-line swap in `data/paymentAdapter.ts` once the dep +
  RC public key land. Entitlement READS work today, so gating is real before the SDK is wired.
- v1 gated capabilities (product decision 2026-07-18): **deep_dive_content, extended_ask_guru**.
  Family plan = an offering behind FF_FAMILY_PLAN (Increment 3), not an in-app gate.
- **Sequencing adjustment:** affordance wiring (deep-dive in Settings; extended Ask Guru) moves to
  Increment 2 alongside SCR_SUBSCRIPTION_001, so the upgrade CTA has a destination.
- Static verification clean: shared enums resolve, no hardcoded hex, no cross-domain imports, all 9
  files brace/paren-balanced. tsc/jest run in CI (sandbox has no installed deps).

---

# Blockers (unchanged)
Canonical Panchang Engine (ADR-033). Ask Guru GURU_LIVE gate. Backend SVC_revenuecat_webhook +
entitlement/subscription tables/RLS are the server contract this client targets. Cannot commit/push
from the session (Cowork GitHub connector read-only; push from Mac).

---

# Pending Work
M8 Increment 1 review. Then **Increment 2** — SCR_SUBSCRIPTION_001 (CMP_PLAN_CARD / CMP_VALUE_LIST /
CMP_LEGAL_FOOTNOTE), plans/purchase/restore via the PaymentAdapter, and wire the two gated affordances
to `usePremiumGate`. Then **Increment 3** — contextual paywall sheet, `panchangpal://subscription`
routing, FF_FAMILY_PLAN gating of the Family plan.

---

# Recommended Next Task
Review M8 Increment 1. On approval, begin **M8 Increment 2** (subscription screen + affordance wiring).
Do not start Increment 2 until approved.
