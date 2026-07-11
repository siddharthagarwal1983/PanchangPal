# PanchangPal — Database

**Status:** Working Draft (awaiting Architecture Review Board sign-off)
**Owner:** Backend (per PDD §3.0A.5)
**Authoritative source:** TDD Part 2 — Data Model, Schema, RLS & API Contracts (`docs/tdd/02_BACKEND_ARCHITECTURE.md`)

---

## What this is

The PanchangPal database is **PostgreSQL on Supabase** (ADR-003), with **Row-Level
Security as the primary authorization boundary** (ADR-018) and **pgvector** for RAG
retrieval (ADR-004/011). This directory documents the schema; the executable
migrations live in [`supabase/migrations/`](../../supabase/migrations/) and seed data
in [`supabase/seed.sql`](../../supabase/seed.sql).

Everything here realizes the approved data model in **TDD Part 2 §1–§7**. No tables,
columns, or policies are invented.

- Full per-table reference: [`SCHEMA.md`](SCHEMA.md)
- Contracts served by this schema: [`../api/openapi.yaml`](../api/openapi.yaml)

> **Migration location note.** TASK.md and the Playbook (Workflow 7) place migrations
> in `supabase/migrations/` (used here). TDD Part 2 §6.1 refers to
> `apps/backend/migrations`. This is a repository-convention discrepancy to reconcile
> with the Backend owner; the SQL is location-independent.

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

Seed (`supabase/seed.sql`) loads the tradition set (F-9), feature-flag defaults (all
post-v1 `FF_*` off), and representative festival/ritual/checklist rows. The RAG corpus
(`content_item`/`content_chunk`) is loaded by `SVC_content_ingest` (TDD Part 3), not
raw-seeded.

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

## Open follow-ups (not decided here)

- **F-21** — whether household members may read each other's completion **counts** for
  social proof (the §3.7 RLS default assumes yes). Ratify with Product.
- **T7** — personal dates are per-user private in v1 (no household sharing).
- **RLS policy test-suite** (§4.4) — the release-gate security tests are a CI task, to
  be implemented alongside the backend.
- **pgvector index tuning** (HNSW `m`/`ef_construction`) — set with the corpus in TDD Part 3.

---

## Validation performed

Static validation (no Postgres available in the authoring sandbox — live
`supabase db reset` should be run in CI): all **29 `TBL_*` present and uniquely
created**, **RLS enabled on every table**, **54 policies** with every table covered
(except intentionally service-only `job`), balanced statements, RLS helper predicates
defined before first use, and reserved identifiers quoted.
