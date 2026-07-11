# ADR-032 — API Versioning Strategy

**Status:** Accepted
**Date:** 2026-07-11
**Decision Owner:** Backend / Architecture

---

## Context

PanchangPal ships a mobile client that users update on their own schedule — or not at all — against a backend that must keep evolving. Because store-distributed app versions linger in the field and the daily loop is offline-first (ADR-015), the backend cannot assume every caller is current: at any moment it serves version N and version N-1 of the app, plus queued offline mutations authored by an even older build. The `API_*` contract surface is the seam between the thin client (ADR-016) and the server-authoritative Edge Functions (ADR-006), and "contracts before code" is an architecture principle (TDD Part 1 §1.2/§1.3): every `API_*` has a typed, zod-validated contract in `packages/api` shared by client and functions. What has been missing is a single, documented policy for how that contract surface is versioned, evolved, deprecated, and retired without breaking older installs or losing offline work.

The constraints are specific: a solo founder cannot maintain many parallel API versions; correctness and trust forbid silently changing response meaning under a client; OTA (ADR-024) can fix JavaScript fast but cannot change a native binary already in a user's hands; and DB migrations (ADR-003) must not break in-flight clients. This ADR records the approved versioning strategy consistent with the existing architecture; it introduces no new technology.

Relevant sources: TDD Part 1 §1.2/§1.3 (contracts before code), §4 (`packages/api`/`packages/shared`), §5 (branch/release standards, expand-then-contract), §7.14 (version compatibility), §2.8/§2.11 (auth/offline sync); Decision Log DEC-008/DEC-010.

---

## Decision

Adopt a **compatibility-first, minimal-surface API versioning strategy** anchored on the existing `packages/api` contract source and TDD §7.14:

- **Versioning philosophy.** Prefer *evolution over versioning*: extend contracts backward-compatibly (additive change) rather than minting new versions. A new explicit version is created only for a genuinely breaking change that cannot be expressed additively. The backend supports the **current and previous minor** (**N and N-1**) of the `API_*` contract at all times.

- **Semantic Versioning.** The `API_*` contract surface is versioned with **SemVer**. *Patch* = non-contractual fixes; *minor* = backward-compatible additions (new optional fields, new endpoints, new enum members handled tolerantly); *major* = a breaking change. The app sends its `app_version`; contracts carry a schema version so client and server negotiate capability. This mirrors the semver release tagging already mandated in TDD §5.

- **Edge Function versioning.** `SVC_*` Edge Functions implement one or more `API_*` contract versions behind a stable invocation path; a function accepts N and N-1 request shapes and responds in the shape the caller's version expects. Breaking logic lives behind a version branch inside the function (or a `-v2` handler) rather than mutating the existing contract in place. Functions remain stateless and idempotent (ADR-006), so multiple contract versions coexist without shared-state hazards.

- **Mobile application compatibility.** The client validates every request/response against its bundled contract (zod, TDD §5). The backend guarantees N and N-1; a **minimum-supported-version flag** (server-driven) can force-upgrade clients older than the supported window, degrading them to a read-only cached state with an upgrade prompt rather than a broken call (TDD §7.14; error path consistent with `ERR_AUTH_EXPIRED`/`ERR_OFFLINE` handling, ADR-022).

- **Backward compatibility & the breaking-change policy.** Within a supported window, changes are **additive-only**: never remove or repurpose a field, never tighten a type, never change the meaning of an existing value. A breaking change requires a new contract major, a migration path, and owner + Architecture Review Board approval (PDD §3.0A.5). This is the same discipline TDD §5 states for "breaking API/DB changes."

- **URL vs. header versioning.** Because clients reach the backend through `supabase-js` and typed Edge Function invocations rather than a hand-built REST base URL, **the version travels with the request as contract metadata (a version field/header on the `API_*` envelope), not as a path segment**. URL-path versioning is not adopted as the primary mechanism (see Alternatives); a stable path with negotiated version keeps deep-link schemes and function routes stable and avoids URL churn across the offline queue.

- **API & DTO evolution.** DTOs evolve by adding optional fields with safe defaults and by treating unknown fields tolerantly (readers ignore what they don't understand; writers never depend on a field a peer may not send). Enum-typed fields (`EVT_*`, `ERR_*`, status enums in `packages/shared`) are extended additively, and consumers handle unknown members via the exhaustive-switch default rather than crashing. This preserves the single-source-of-types rule (TDD §1.3/§4).

- **Database migration compatibility.** Schema changes follow **expand-then-contract** (TDD §7.14): expand (add columns/tables, backfill) → deploy code that reads/writes both shapes → contract (remove the old shape) only after the supported client window no longer references it. Migrations are backward-compatible within the supported window so N-1 clients and queued offline mutations continue to apply. RLS policies (ADR-018) are updated in lockstep and never loosened by a migration.

- **Feature flags during API evolution.** New or changed API behavior is gated with `FF_*` flags (ADR-021) so a contract can be deployed dark, enabled progressively, and disabled instantly without a client release — decoupling deploy from release and giving a fast kill-switch during evolution.

- **Rollout strategy.** Contract changes roll out backend-first (expand), then client (OTA for JS-compatible changes via ADR-024, or a store build for native changes), with the new path flag-gated and progressively enabled. Because the backend already speaks N-1, clients adopt the new version on their own update cadence.

- **Rollback strategy.** Rollback is flag-off first (instant), then function redeploy to the prior handler if needed; because changes are additive and expand-then-contract defers destructive steps, rollback never strands data. Offline mutations authored against N-1 still reconcile (`SVC_sync`, ADR-015) because N-1 remains supported.

- **Deprecation & sunset policy.** A version is marked **deprecated** when its successor is stable, announced via the minimum-supported-version mechanism and documentation, and **sunset** only after telemetry shows adoption below an agreed threshold *and* the version is outside the N/N-1 support window. Sunsetting a version force-upgrades the remaining clients rather than breaking them silently.

- **Testing strategy.** Contract tests assert N and N-1 request/response compatibility; migration tests assert expand-then-contract safety against N-1 fixtures; offline-replay tests assert that mutations queued under N-1 reconcile under the current backend; refusal/guardrail and RLS tests are unaffected but re-run. These map to the Part 3 required-test-coverage and the CI gates (TDD §5, ADR-024).

- **Monitoring version adoption.** The backend records the caller's `app_version` and contract version on requests (no PII, ADR-031) so dashboards (ADR-023) show version-adoption curves; this data drives deprecation and sunset timing and alerts if N-2 traffic (unsupported) appears.

- **Documentation versioning.** The `API_*` specification is versioned alongside the contracts in `packages/api`; each contract change updates the spec and, when it reflects a decision, this ADR set and the Decision Log. Documentation-first applies (ADR-027): the contract change is specified before it is implemented.

---

## Alternatives Considered

- **Header versioning (chosen mechanism).** *Advantages:* keeps routes/paths and deep-link schemes stable; version travels with the typed `API_*` envelope, fitting the `supabase-js`/Edge Function invocation model and the offline queue; enables graceful N/N-1 negotiation. *Disadvantages:* slightly less obvious than a URL segment; requires discipline to set/read the version field. *Reason chosen:* best fit for PanchangPal's contract-metadata transport and offline-first reality — this is the adopted approach.

- **URL versioning (`/v1/…`, `/v2/…`).** *Advantages:* explicit, cache- and human-friendly, easy to route. *Disadvantages:* clients don't build REST base URLs here (they invoke functions / use `supabase-js`), so a path version adds churn to function routes and to queued offline requests; encourages whole-surface version bumps rather than additive evolution. *Reason rejected:* poor fit for the invocation model and heavier for a solo founder than negotiated evolution.

- **Content negotiation (Accept/media-type versioning).** *Advantages:* standards-based, fine-grained per-representation versioning. *Disadvantages:* more machinery than a small, typed contract surface needs; awkward across `supabase-js` and Edge Functions; more to test and document. *Reason rejected:* disproportionate complexity for v1's surface — the version field on the contract envelope achieves the same negotiation minimally.

- **GraphQL-style versionless schema evolution.** *Advantages:* a single evolving schema with field-level deprecation and no explicit versions. *Disadvantages:* would introduce a GraphQL layer the stack does not use (REST/RPC over Supabase Edge Functions + `supabase-js`), contradicting the managed-first, no-new-technology posture (ADR-028) and this task's constraints. *Reason rejected:* out of scope and architecturally inconsistent — though its *additive, deprecate-don't-remove* ethos is exactly what this ADR adopts for DTO evolution.

---

## Consequences

**Positive.** Older installs and queued offline work keep functioning (N/N-1 guarantee), protecting the trust-critical daily loop; additive evolution keeps the maintenance surface small for a solo founder; flags + expand-then-contract make rollout and rollback low-risk; adoption telemetry makes deprecation evidence-based rather than guesswork.

**Trade-offs.** Additive-only discipline means the schema accumulates optional fields and deprecated paths until sunset; supporting N-1 imposes a compatibility burden on every change; the version-negotiation field must be set and honored everywhere.

**Operational impact.** Version adoption becomes a monitored dashboard (ADR-023); deprecation/sunset are operational decisions gated on adoption thresholds and the support window; the minimum-supported-version flag is an operational lever that force-upgrades stranded clients calmly.

**Technical impact.** `packages/api` carries versioned contracts and the version field on the envelope; `SVC_*` functions handle N and N-1 shapes; migrations follow expand-then-contract with RLS updated in lockstep; consumers handle unknown enum members via exhaustive-switch defaults.

**Future maintenance implications.** Deprecated fields/paths must be tracked and removed at sunset (contract phase) once outside the support window; contract, API spec, this ADR, and the Decision Log map must stay synchronized; each new breaking change is a new major with ARB approval, never an in-place mutation.

---

## Dependencies

**Depends on** ADR-006 (Edge Functions host versioned contracts), ADR-016 (thin-client/server-authoritative contract seam), ADR-003 (Supabase/PostgreSQL migrations & RLS), ADR-024 (delivery/OTA + expand-then-contract release discipline).
**Related** ADR-014 (`packages/api` single contract source), ADR-015 (offline queue replays across versions), ADR-009 (auth/`app_version` context, anon→auth merge), ADR-018 (RLS updated with migrations), ADR-021 (feature flags gate evolution), ADR-022 (versioning error/force-upgrade paths), ADR-023 (version-adoption monitoring), ADR-013 (analytics contract/DTO evolution follows the same additive rules), ADR-027 (documentation-first), ADR-028 (no new technology).

---

## Affected Documents

- **TDD** — Part 1 §1.2/§1.3 (contracts before code), §4 (`packages/api`), §5 (release standards, breaking-change process), §7.14 (version compatibility); Part 2 (`API_*` contracts, `TBL_*` migrations) will formalize the concrete schemas.
- **Decision Log** — relates to DEC-008 (thin client) and DEC-010 (provider adapter pattern); no decision changed.
- **API Specification** — versioned alongside `packages/api`; each `API_*` contract carries its SemVer and version field.
- **Database Documentation** — expand-then-contract migration policy; RLS updated in lockstep (TDD Part 2).
- **PDD** — §3.0A.5 (ownership/approval for breaking changes), error/upgrade UX consistent with §12/§13.5.
- **Architecture Summary** — references this ADR for the API compatibility model.

---

## Review Trigger

- Major API redesign or a move away from the Supabase Edge Function / `supabase-js` invocation model.
- Platform migration that changes how contracts are transported.
- Public/third-party API exposure (external consumers would raise the compatibility bar and may justify URL versioning).
- Major mobile compatibility changes (e.g., a shift in the N/N-1 support window or store-update dynamics).

---

## Notes

Concrete parameters are deferred to implementation docs, not decided here: the exact minimum-supported-version threshold, the sunset adoption cutoff, and the length of the N-1 support window are set with field data in TDD Part 2/Part 5. The version-negotiation field name and envelope placement are specified in `packages/api` when the `API_*` inventory is frozen (`F-8`). This ADR fixes the *strategy*; it does not fix those tunables.
