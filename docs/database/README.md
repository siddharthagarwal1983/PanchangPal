# PanchangPal — Database

**Status:** Working Draft (awaiting Architecture Review Board sign-off)
**Owner:** Backend (per PDD §3.0A.5)
**Authoritative source:** TDD Part 2 — Data Model, Schema, RLS & API Contracts (`docs/tdd/02_BACKEND_ARCHITECTURE.md`)

---

## What this is

The PanchangPal database is **PostgreSQL on Supabase** (ADR-003), with **Row-Level
Security as the primary authorization boundary** (ADR-018) and **pgvector** for RAG
retrieval (ADR-004/011). This directory documents the schema; the executable
migrations live in [`apps/backend/migrations/`](../../apps/backend/migrations/) and
seed data in [`apps/backend/seed/seed.sql`](../../apps/backend/seed/seed.sql).

Everything here realizes the approved data model in **TDD Part 2 §1–§7**. No tables,
columns, or policies are invented.

- Full per-table reference: [`SCHEMA.md`](SCHEMA.md)
- Contracts served by this schema: [`../api/openapi.yaml`](../api/openapi.yaml)

> **Migration location — RESOLVED (2026-07-12, DEC-022).** Migrations and seed live
> under `apps/backend/` per the authoritative repo layout (TDD Part 1 §4 + Part 2 §6.1),
> which outranks the Playbook/TASK convention in the source-of-truth hierarchy. The
> Supabase CLI config remains at `supabase/config.toml` (a CLI requirement) and points
> its seed path at `apps/backend/seed/seed.sql`; CI applies the migrations from
> `apps/backend/migrations/` (TDD Part 1 §2.4). The empty `supabase/migrations/`
> directory carries a pointer README.

---

## Design principles (TDD Part 2 §1.1)

The schema is **household-centric, RLS-guarded, and traceable**. `APP_USER` (1:1 with
`auth.users`) is the identity root; `HOUSEHOLD` is the collaboration + billing unit and
the North Star grain. Every user-owned table carries an explicit ownership column so
RLS is simple and total — **no table ships without RLS** (release gate, NFR-18).

Supporting decisions: deferred/anonymous identity with merge (F-1, ADR-009),
one-active-household membership (F-2), grief-aware private personal dates,
household-grain entitlements reconciled from RevenueCat (F-4), offline sync with
idempotency (ADR-015), deterministic cacheable panchang (ADR-010), and the
pseudonymous analytics envelope (ADR-013/031).

---

## Migration order

Forward-only, timestamped (TDD Part 2 §6.1). RLS policies ship in the same migration
as their table. Order matters because RLS helper predicates depend on the household
tables.

| # | File | Contents |
|---|---|---|
| 1 | `20260712000001_extensions.sql` | `pgcrypto`, `vector`, `pg_trgm` |
| 2 | `20260712000002_enums.sql` | Enumerated types (§2.3) |
| 3 | `20260712000003_functions.sql` | `set_updated_at()`, `handle_new_user()` |
| 4 | `20260712000010_identity.sql` | `app_user`, `user_profile` + RLS |
| 5 | `20260712000020_household.sql` | `household`, `household_member`, `invite`, `referral`; RLS predicates `current_household_id()` / `is_household_member()` / `is_household_owner()`; F-2 partial unique index |
| 6 | `20260712000030_content.sql` | `tradition`, `ritual`, `festival`, `checklist_item`, `panchang_cache`, `content_item`, `content_chunk` (HNSW) + RLS |
| 7 | `20260712000040_habits.sql` | `ritual_completion`, `streak`, `checklist_completion`, `personal_date` + RLS |
| 8 | `20260712000050_ai.sql` | `conversation`, `message`, `message_source` + RLS |
| 9 | `20260712000060_billing.sql` | `subscription`, `entitlement` + RLS |
| 10 | `20260712000070_notifications.sql` | `push_token`, `notification` + RLS |
| 11 | `20260712000080_platform.sql` | `feature_flag`, `analytics_event`, `job`, `account_deletion`, `support_ticket` + RLS |

Seed (`apps/backend/seed/seed.sql`) loads the tradition set (F-9), feature-flag
defaults (all post-v1 `FF_*` off), and representative festival/ritual/checklist rows.
The RAG corpus (`content_item`/`content_chunk`) is loaded by `SVC_content_ingest`
(TDD Part 3), not raw-seeded.

---

## Authorization model (TDD Part 2 §4)

RLS is the boundary. The mobile client uses the anon/authenticated key and can only
touch rows its policies allow; privileged writes run in Edge Functions with the service
role (which bypasses RLS by design) and enforce business rules in code.

| Tier | Who | Access |
|---|---|---|
| **Self** | `auth.uid()` | own profile, personal dates, conversations, referral, push token, notification; own habit-row writes |
| **Household** | `is_household_member(hid)` | `select` on household, members, subscription/entitlement, and household members' completion/streak **counts** |
| **Owner** | `is_household_owner(hid)` | `update`/`delete` household; manage members; transfer/delete |
| **Public content** | any authenticated (incl. anonymous) | `select` on tradition, festival, ritual, checklist_item, content_item/chunk, panchang_cache, feature_flag |
| **Service** | Edge Functions (service role) | entitlement writes, invite accept, sync reconcile, notifications, content ingest, deletion execution, merge |

Service-only tables (`job`, and writes to `entitlement`, `panchang_cache`, content,
`notification` scheduling) have RLS enabled with no client write policy, so client
writes are denied while the service role proceeds.

---

## Business-rule enforcement (schema + service)

- **F-2 one active household/user** — partial unique index `one_active_household` on
  `household_member(user_id) where is_active`, plus explicit switch in `SVC_household`.
- **F-1 anon→auth merge** — transactional in `SVC_account`; schema keeps stable UUID PKs
  so ownership can be reassigned.
- **F-3 deletion** — `account_deletion` grace window; owner-with-members must transfer
  first; executed by a scheduled `SVC_account` job.
- **F-4 family entitlement** — entitlement stored at household grain → all members
  inherit; no per-member rows.
- **Idempotency** — unique constraints `ritual_completion(user_id, local_date)`,
  `notification(user_id, dedupe_key)`, `subscription(rc_original_txn_id)` plus
  `client_id` guarantee retries/redeliveries never double-apply.

---

## Follow-ups

**Resolved (2026-07-12):**

- **F-21 — RESOLVED (visible counts), DEC-022.** Household members may read each other's
  completion/streak **counts** (no per-item shaming detail) to power the North Star and
  positive social proof (PDD §8.5). The §3.7 RLS default stands; asserted by the RLS
  test-suite (test 8, both positive and negative controls).
- **RLS policy test-suite (§4.4) — RESOLVED.** Implemented as pgTAP at
  [`apps/backend/tests/rls/rls_policies.test.sql`](../../apps/backend/tests/rls/rls_policies.test.sql),
  covering cross-user/cross-household denial, service-only write denial, anonymous
  public-read, own-row writes, and F-21. Wired as a CI security gate (NFR-18).
- **Migration location — RESOLVED (DEC-022).** See the note above.

**Still deferred (intentionally, not blockers for this stage):**

- **pgvector index tuning** (HNSW `m` / `ef_construction`) — requires the actual corpus;
  set in **TDD Part 3** (documented deferral, TDD Part 2 §8.4). The index exists; only
  its parameters are tuned later.
- **T7** — personal dates remain per-user private in v1 (no household sharing).

---

## Validation performed

Static validation (no Postgres available in the authoring sandbox — live
`supabase db reset` + `pg_prove` should be run in CI): all **29 `TBL_*` present and
uniquely created**, **RLS enabled on every table**, **54 policies** with every table
covered (except intentionally service-only `job`), balanced statements, RLS helper
predicates defined before first use, and reserved identifiers quoted.

The **RLS policy test-suite** (`apps/backend/tests/rls/rls_policies.test.sql`, pgTAP,
11 assertions) encodes the §4.4 security gate and runs in CI against a freshly migrated
database.
