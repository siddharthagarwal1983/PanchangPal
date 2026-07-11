# PanchangPal — Schema Reference

**Authoritative source:** TDD Part 2 §2–§3 (`docs/tdd/02_BACKEND_ARCHITECTURE.md`).
This document mirrors the migrations in `supabase/migrations/`. Every table lists its
purpose, key columns, indexes, and RLS summary. Conventions per TDD Part 2 §2.1: UUID v4
PKs (except identity-mirroring tables keyed by `auth.uid`), `created_at`/`updated_at`
(the latter maintained by `set_updated_at()`), soft-delete via `deleted_at` where
retention matters, all times stored **UTC**.

---

## Enumerated types (§2.3)

| Type | Values |
|---|---|
| `member_role` | anchor, parent, elder, youth, other |
| `content_depth` | quick, deep |
| `tradition_code` | generic, north_indian, south_indian_tamil, bengali (extensible) |
| `date_basis` | tithi, gregorian |
| `reminder_lead` | same_day, one_day, custom |
| `message_role` | user, assistant |
| `message_outcome` | grounded, declined, refused, error |
| `notif_type` | morning, festival, evening, streak, household, personal, household_invite, subscription, winback |
| `notif_channel` | daily, festival, personal, household, growth, lifecycle |
| `entitlement_kind` | individual, family |
| `sub_status` | active, in_grace, expired, cancelled, paused |
| `appearance_mode` | system, light, dark |
| `job_type` | notify_schedule, winback_segment, content_ingest, analytics_rollup, entitlement_reconcile |
| `job_status` | pending, running, done, failed |

`error_code` (ERR_*) and `event_id` (EVT_*) are **text** columns generated from
`packages/shared` (PDD §3.0A.3), not hard Postgres enums, to avoid DB/app drift.

## Functions & triggers (§2.1–§2.2)

- `set_updated_at()` — BEFORE UPDATE trigger on every table with `updated_at`.
- `handle_new_user()` — AFTER INSERT on `auth.users`; creates the `app_user` row.
- `current_household_id()` — caller's active household (RLS helper).
- `is_household_member(hid)` / `is_household_owner(hid)` — RLS predicates
  (`security definer`, `stable`, fixed `search_path`).

---

## Identity & Profile

### `app_user` — TBL_APP_USER
1:1 with `auth.users`; app-level non-auth fields (`is_anonymous`). PK `id` references
`auth.users(id)`. **RLS:** select/update where `id = auth.uid()`; inserted by
`handle_new_user()` on signup.

### `user_profile` — TBL_USER_PROFILE
Owner prefs: `tradition_code`, `ritual_time`, `content_depth`, location (`city/lat/lng`),
`timezone` (IANA), `appearance`, `locale`, `notif_prefs` (jsonb). PK `user_id`.
Index `(user_id)`. **RLS:** owner-only (`user_id = auth.uid()`). Serves
`API_GET/PATCH_PREFERENCES`, `API_POST_PROFILE`.

## Household, Invite, Referral

### `household` — TBL_HOUSEHOLD
`name` (1–40 chars), `owner_id`, `tradition_code`. Index `(owner_id)`. **RLS:** members
select; owner update/delete; any authenticated user inserts their own.

### `household_member` — TBL_HOUSEHOLD_MEMBER
`household_id`, `user_id` (null = local/uninvited member), `display_name`, `role`,
`depth`, `is_active`. `unique(household_id, user_id)`; **partial unique index
`one_active_household(user_id) where is_active` enforces F-2**. Index `(household_id)`.
**RLS:** same-household members select; owner and self manage.

### `invite` — TBL_INVITE
`household_id`, opaque `token` (unique), `inviter_id`, `expires_at`, `accepted_by/at`.
Indexes `(token)`, `(household_id)`. **RLS:** household members read; accept path runs
service-role (`SVC_household`). `ERR_INVITE_EXPIRED` when past expiry.

### `referral` — TBL_REFERRAL
`referrer_id`, `code` (unique), `referred_user_id`, `activated_at`. Index `(referrer_id)`.
**RLS:** owner-read/insert.

## Content (public-read; service-role writes)

### `tradition` — TBL_TRADITION
`code` (PK, `tradition_code`), `name`, `description`, `is_active`. **RLS:** public select.

### `ritual` — TBL_RITUAL
`slug` (unique), `tradition_code`, `title`, `intro`, `steps` (jsonb: text/audio_key/
duration), `audio_bucket_path`, `depth`. Index `(tradition_code)`. **RLS:** public select.

### `festival` — TBL_FESTIVAL
`slug` (unique), `tradition_code`, `name`, `significance`, `how_to`, `depth_quick`,
`depth_deep`, `ritual_id`. Index `(tradition_code)`. **RLS:** public select. Festival
date resolution is computed via the panchang engine (not stored Gregorian) to honor
`ERR_FESTIVAL_CONFLICT`.

### `checklist_item` — TBL_CHECKLIST_ITEM
Curated 3–5/day: `tradition_code`, `festival_id`, `label`, `"order"`, `type`.
Index `(tradition_code)`. **RLS:** public select.

### `panchang_cache` — TBL_PANCHANG_CACHE
Deterministic compute cache (ADR-010): `cache_key` (unique = hash of local_date,
geo_bucket, tradition_code, engine_version), `payload` (jsonb: tithi, nakshatra, yoga,
karana, sunrise/sunset, muhurta, rahu kaal), `engine_version`, `expires_at`. Indexes
`(cache_key)`, `(local_date, geo_bucket, tradition_code)`. **RLS:** public select;
service-role writes. CDN `Cache-Control` layered on top; invalidated on `engine_version`.

### `content_item` — TBL_CONTENT_ITEM
Reviewed library items: `slug`, `title`, `source_ref`, `tradition_code`, `topic`,
`content_version`, review fields, `is_active`. **RLS:** public select; service-role writes.

### `content_chunk` — TBL_CONTENT_CHUNK
`content_item_id`, `chunk_index`, `text`, `embedding vector(1536)` (ADR-011),
`token_count`, `content_version`. **HNSW index** `(embedding vector_cosine_ops)` for ANN
retrieval; index `(content_item_id)`. **RLS:** public select; service-role writes
(`SVC_content_ingest`). Chunking/embedding/eval spec is TDD Part 3.

## Habit data (owner-write; household-read counts)

### `ritual_completion` — TBL_RITUAL_COMPLETION
`user_id`, `ritual_id`, `local_date` (user-tz, client-authoritative PDD A4),
`completed_at`, `source`, `client_id`. `unique(user_id, local_date)` = one/day. Index
`(user_id, local_date)`. **RLS:** owner writes; owner + same-household members read.

### `streak` — TBL_STREAK
PK `user_id`; `current_len`, `best_len`, `grace_remaining` (1/rolling-7-day, PDD P0#5),
`last_completed_date`. **RLS:** owner writes; household read. Streak is derived
server-side (never client-set) so it cannot be gamed.

### `checklist_completion` — TBL_CHECKLIST_COMPLETION
`user_id`, `item_id`, `local_date`, `client_id`. `unique(user_id, item_id, local_date)`.
Index `(user_id, local_date)`. **RLS:** owner write, household read.

### `personal_date` — TBL_PERSONAL_DATE
Grief-sensitive: `user_id`, `name`, `basis`, `gregorian_date`, `tithi` (jsonb),
`reminder_lead/time`, `next_occurrence` (tithi-engine cache), `is_active`, `client_id`,
`deleted_at` (tombstone). Indexes `(user_id, is_active)`, `(next_occurrence)`. **RLS:**
owner-only private (T7). Ambiguity → dual candidates (`ERR_TITHI_AMBIGUOUS`).

## Ask Guru (owner-only)

### `conversation` — TBL_CONVERSATION
`user_id`, `title`, `deleted_at`. Index `(user_id, updated_at desc)`. **RLS:** owner-only.

### `message` — TBL_MESSAGE
`conversation_id`, `role`, `content`, `outcome`, `first_token_ms`, `error_code` (ERR_*).
Index `(conversation_id, created_at)`. **RLS:** scoped through owning conversation.
`outcome`/`error_code`/`first_token_ms` feed AI analytics (§9.9).

### `message_source` — TBL_MESSAGE_SOURCE
Citations (EVT_031): `message_id`, `content_chunk_id`, `title`, `score`. Index
`(message_id)`. **RLS:** scoped through owning message → conversation.

## Subscription (household-grain; service-role writes)

### `subscription` — TBL_SUBSCRIPTION
`household_id`, `rc_app_user_id`, `rc_original_txn_id` (unique, webhook idempotency),
`kind`, `status`, `current_period_end`, `store`. Index `(household_id)`. **RLS:** members
read; writes service-role (`SVC_revenuecat_webhook`).

### `entitlement` — TBL_ENTITLEMENT
Household-grain (F-4): `household_id`, `kind`, `is_active`, `granted_at`, `expires_at`,
`source`. Index `(household_id, is_active)`. **RLS:** members read; explicit
deny-all-client-write guard; service-role writes only.

## Notifications (owner-only)

### `push_token` — TBL_PUSH_TOKEN
`user_id`, `expo_token` (unique), `platform`, `last_seen_at`. Index `(user_id)`.
**RLS:** owner-only.

### `notification` — TBL_NOTIFICATION
`user_id`, `notif_type`, `channel`, `scheduled_for`, `sent_at`, `opened_at`, `deep_link`,
`payload`, `dedupe_key`. `unique(user_id, dedupe_key)` = idempotent scheduling. Indexes
`(user_id, scheduled_for)`, `(sent_at)`. **RLS:** owner select; scheduling/sends by
`SVC_notify_scheduler` (service role).

## Platform

### `feature_flag` — TBL_FEATURE_FLAG
`key` (PK, FF_*), `enabled`, `rollout` (jsonb). **RLS:** public select. (ADR-021)

### `analytics_event` — TBL_ANALYTICS_EVENT
Envelope §11.1, **no PII**: `event_id` (EVT_*), `user_pseudo_id`, `household_id`,
`session_id`, `ts`, `props` (jsonb). Indexes `(event_id, ts)`, `(household_id, ts)` for
the North Star rollup. **RLS:** insert-only by client; no client read (rollups
service-side).

### `job` — TBL_JOB
Background queue: `type`, `status`, `run_at`, `payload`, `attempts`, `last_error`. Index
`(status, run_at)`. **RLS:** enabled, **service-only** (no client policy → client denied).

### `account_deletion` — TBL_ACCOUNT_DELETION
Grace window (F-3): PK `user_id`, `requested_at`, `execute_after`, `executed_at`.
**RLS:** owner-read.

### `support_ticket` — TBL_SUPPORT_TICKET
`user_id` (nullable), `email`, `subject`, `body`. **RLS:** owner-insert.

---

## Indexing & performance highlights (§7)

- Hot read path (Today/Calendar) served from `panchang_cache` + CDN; near-zero DB load.
- RAG retrieval via HNSW on `content_chunk.embedding` (cosine), filtered by `is_active`
  + latest `content_version`.
- Habit writes: single-row streak update + `(user_id, local_date)` unique.
- Household: `(household_id)` and partial `(user_id) where is_active` (also enforces F-2).
- Analytics: `(event_id, ts)` + `(household_id, ts)`; monthly partitioning is a
  documented future trigger (TRISK-07).
- Every FK is indexed; no unbounded scan on a hot path.
