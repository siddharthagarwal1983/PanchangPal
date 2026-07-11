# PanchangPal — API Specification

**Status:** Working Draft (awaiting Architecture Review Board sign-off)
**Version:** 1.0.0
**Owner:** Backend (per PDD §3.0A.5)
**Spec:** [`openapi.yaml`](openapi.yaml) — OpenAPI 3.1

---

## What this is

`openapi.yaml` is the machine-readable contract for PanchangPal's complete `API_*`
surface. It is generated from the approved documentation, not invented — the
authoritative source is **TDD Part 2 §5 — API Contracts**
(`docs/tdd/02_BACKEND_ARCHITECTURE.md`), with runtime context from **TDD Part 1 §2**,
the error envelope from **§7.4**, versioning from **§7.14**, and the governing ADRs.

Coverage: **64 operations** across 59 paths, spanning every `API_*` identifier
documented in the source docs (Identity & Profile, Today/Panchang/Ritual,
Calendar & Personal Dates, Ask Guru, Household & Referral, Subscription, and
Notifications/Sync/Account).

---

## Source-of-truth hierarchy

MRD → PRD → PDD → **TDD** → ADRs. This spec never contradicts those documents.
Where the source docs leave a field-level detail to backend ownership (`F-8`) or
overlap two identifiers, the operation is annotated with `x-prd-follow-up: F-8`
rather than being decided here.

Key governing ADRs:

- **ADR-006** — Edge Functions host computed/privileged operations (`SVC_*`).
- **ADR-009 / ADR-018** — anonymous-auth-first identity; RLS is the authorization boundary.
- **ADR-015** — offline-first: mutations carry `client_id` + `idempotency_key`, reconciled by `POST /sync`.
- **ADR-019** — Ask Guru streams (SSE).
- **ADR-022** — uniform error envelope `{ code, message, correlation_id, recoverable }`.
- **ADR-032** — SemVer contracts, N/N-1 support, header-based version negotiation.

---

## Conventions

**Transport.** Each operation carries an `x-impl` extension recording how it is
implemented:

- `SVC_*` — a Supabase Edge Function (computed, privileged, or multi-step).
- `supabase-js` — RLS-guarded direct data access (modeled here as a logical REST
  operation for documentation and client-contract purposes).
- `supabase-auth`, `supabase-storage`, `revenuecat-sdk` — platform/vendor SDK paths.

**Auth.** Every call carries a Supabase JWT (anonymous or authenticated) via
`bearerAuth`. Public/unauthenticated operations (OAuth start, onboarding config,
invite preview, RevenueCat webhook) set `security: []`; the webhook instead verifies
`X-RevenueCat-Signature`.

**Errors.** All failures return the ADR-022 envelope. Each operation lists its
documented `ERR_*` codes inline (as trailing comments on the error responses); the
full taxonomy is the `ErrorCode` enum in `components/schemas`.

**Idempotency.** Mutations accept `idempotency_key` (and offline-origin writes a
`client_id`) in the body, per TDD Part 2 §5.0; an optional transport-level
`Idempotency-Key` header parameter is also defined.

**Versioning.** The `X-PanchangPal-API-Version` request header selects the contract
version; omitting it uses the current version. The backend supports N and N-1
(ADR-032).

---

## Notes & known follow-ups

- **TDD Part 2 is the authoritative contract source.** An earlier session note said
  Part 2 was unwritten (per Part 1 §10.4); it has since been authored and contains
  the full `API_*` table, so this spec is anchored to it directly rather than derived
  from Part 1 with placeholders.
- **`x-prd-follow-up: F-8`** marks operations whose final naming/shape is backend-owned:
  `API_GET_PROFILE` (overlaps `API_GET_PREFERENCES`), `API_POST_PROFILE_TRADITION`
  (a focused profile write), `API_POST_AUTH_LOGOUT` (Supabase Auth built-in), and
  `API_POST_STREAK_ADVANCE` (normally internal to ritual completion / sync).
- **Deferred to later TDD parts (not this spec):** Ask Guru retrieval internals,
  confidence threshold `F-6`, and groundedness `F-16` (TDD Part 3); the `packages/api`
  zod schemas and `packages/shared` `EVT_*`/`ERR_*` enum generation (Part 2 §8.4
  prerequisites).

---

## Validation

The spec parses as valid YAML/OpenAPI 3.1 with unique `operationId`s, no missing
`responses`, and no broken component `$ref`s. Every documented `API_*` identifier
maps to exactly one operation, and every operation maps back to a documented
identifier (no orphan endpoints, per TDD Part 2 §5.8).

To lint locally:

```bash
npx @redocly/cli lint docs/api/openapi.yaml
# or
npx @stoplight/spectral-cli lint docs/api/openapi.yaml
```
