# PanchangPal — Data Collection Inventory

**Version:** 1.0.0
**Last Updated:** 2026-07-27
**Owner:** Security / Privacy
**Source of truth:** TDD Part 5 §6.1–§6.2 · ADR-031 (Privacy & Data-Minimization) · PDD §11.1
**Slice:** B6.3 (Beta Readiness & Platform Hardening)

---

## 1. What this document is, and how it was built

This is the inventory the privacy policy (`PRIVACY_POLICY_DRAFT.md`) and the store privacy labels
(`STORE_PRIVACY_LABELS.md`) are derived from. Both of those are downstream of this file; neither
should assert a collection this document does not record.

It was built **from the code**, not from the documentation, because B6 has now found three separate
cases in this repository where a documented control was never implemented and nothing asserted it.
The sources are:

| Section | Derived from |
|---|---|
| Database tables | `apps/backend/migrations/*.sql` — `create table` statements |
| Analytics events | quoted `'EVT_*'` literals in `apps/mobile/{app,src}`, excluding tests |
| On-device storage | key constants in `apps/mobile/src/{data,store}` |
| Third-party processors | declared dependencies in `apps/mobile/package.json` + Edge Function egress |
| Permissions | `apps/mobile/app.config.ts` plugins + installed native modules |

Sections 2 and 4 are **pinned by a test** — `apps/backend/tests/privacy/data-inventory.test.ts`
parses the migrations and the mobile source and fails if either drifts from the tables below. A new
table or a new analytics event cannot enter the system without a privacy classification here. That
is deliberate: an inventory nothing checks is exactly the artifact that goes stale between the day it
is written and the day a store label is filled in from it.

### 1.1 The distinction this document keeps

The schema anticipates more collection than the app performs. Several tables exist, are migrated,
and are empty — because the feature that would write to them is deferred (`expo-notifications`,
`react-native-purchases`), blocked (ADR-033, panchang), or gated (`GURU_LIVE=false`, Ask Guru).

**Store privacy labels must describe actual collection at the moment of submission**, so every row
below carries a *Collected today* column that is answered against the built app, not the schema.
Where the answer changes at launch, it says so.

---

## 2. Database tables

All 32 tables in `apps/backend/migrations`. Classification:

- **Identifying** — contains or resolves to an identifier for a specific person.
- **Personal** — describes a person, reachable only through their `user_id`.
- **Pseudonymous** — carries `user_pseudo_id` or no subject at all (ADR-031 / PDD §11.1).
- **Non-personal** — reference content, configuration, or operational data about no user.

| Table | Class | Holds | Written by | Collected today |
|---|---|---|---|---|
| `app_user` | Identifying | uid (FK to `auth.users`), `is_anonymous` | DB trigger on signup | Yes |
| `user_profile` | Personal | tradition, ritual time, depth, city, lat/lng, timezone, appearance, locale, `notif_prefs` | Client (upsert) | Partly — see §3.1 |
| `household` | Personal | household name (user-chosen, ≤40 chars), owner uid | SVC_household (unimplemented) | No |
| `household_member` | Identifying | `display_name` of a household member, role, member uid | SVC_household (unimplemented) | No |
| `invite` | Identifying | opaque invite token, inviter uid, accepting uid | SVC_household (unimplemented) | No |
| `referral` | Identifying | referral code, referrer uid, referred uid | Not implemented | No |
| `ritual_completion` | Personal | which ritual, which local date, completion time | Client → SVC_sync | Yes |
| `streak` | Personal | current/best streak, grace remaining, last completed date | Server (SVC_sync) | Yes |
| `checklist_completion` | Personal | which checklist item, which local date | Client (upsert) → SVC_sync | Yes |
| `personal_date` | **Personal — sensitive** | free-text name of a person, date or tithi, reminder prefs | Client → SVC_sync | Yes |
| `conversation` | Personal | Ask Guru thread, optional title | SVC_ask-guru | No — `GURU_LIVE=false` |
| `message` | **Personal — free text** | user's question and the AI's answer, verbatim | SVC_ask-guru | No — `GURU_LIVE=false` |
| `message_source` | Non-personal | citation back to a content chunk | SVC_ask-guru | No — `GURU_LIVE=false` |
| `subscription` | Personal | RevenueCat ids, plan kind, status, period end, store | SVC_revenuecat_webhook (unimplemented) | No |
| `entitlement` | Personal | household entitlement, active flag, expiry | SVC_revenuecat_webhook (unimplemented) | No |
| `push_token` | Identifying | Expo push token (a device credential), platform | Client (upsert) | No — `expo-notifications` not installed |
| `notification` | Personal | notification type, schedule/send/open times, deep link, payload | SVC_notify_scheduler (unimplemented) | No |
| `account_deletion` | Personal | uid, deletion request time, grace expiry | SVC_account | Yes — **but never executed, see §8.2** |
| `support_ticket` | Identifying | email, subject, free-text body | Not implemented | No |
| `analytics_event` | Pseudonymous | `EVT_*` id, `user_pseudo_id`, household id, session id, props | Client (insert-only) | Yes — see §4 |
| `ai_cost_ledger` | Pseudonymous | model, cost, correlation id, `user_pseudo_id` | SVC_ask-guru | No — `GURU_LIVE=false` |
| `ai_rate_limit` | Pseudonymous | rate-limit subject (`u:<uid>` or `ip:<addr>`), window, count | SVC_ask-guru | No — `GURU_LIVE=false` |
| `job` | Non-personal | background job type, status, payload | Not implemented — no runner, see §8.2 | No |
| `feature_flag` | Non-personal | `FF_*` key, enabled, rollout | Operator (SQL) | n/a |
| `ai_config` | Non-personal | AI tuning keys | Operator (SQL) | n/a |
| `tradition` | Non-personal | reference content | Seed / migration | n/a |
| `ritual` | Non-personal | reference content | Seed / migration | n/a |
| `festival` | Non-personal | reference content | Seed / migration | n/a |
| `checklist_item` | Non-personal | reference content | Seed / migration | n/a |
| `content_item` | Non-personal | reviewed corpus | SVC_content-ingest | n/a |
| `content_chunk` | Non-personal | corpus chunks + embeddings | SVC_content-ingest | n/a |
| `panchang_cache` | Non-personal | computed panchang by location/date | SVC_panchang (blocked, ADR-033) | No |

### 2.1 A registry that has already drifted

`packages/database/src/index.ts` exports a `TABLES` registry of **29** names against the migrations'
**32**: `ai_config`, `ai_rate_limit` and `ai_cost_ledger` were added by
`20260712000090_ai_operational.sql` and never registered. Nothing consumed the registry closely
enough to notice.

That is why §2 is pinned against the **migrations** rather than against `TABLES`. It is also a small
worked example of this document's own risk: a hand-maintained list of tables drifted from the schema
within one milestone.

---

## 3. Fields that carry personal data

### 3.1 `user_profile` — what the client actually writes

`profileRepository.ts` reads and upserts a fixed column list:

```
tradition_code, content_depth, appearance, ritual_time, timezone, city
```

- **`timezone`** is written — location-derived only in the sense that it comes from the device's own
  zone setting (ADR-026). It is a zone name, not a position.
- **`city`** is in the read/write set, but the app has **no city-entry screen built**, so no value
  reaches it today.
- **`lat` / `lng` are never written.** `expo-location` is not an installed dependency, and the only
  consumer of coordinates — `useToday`, which would send them to the panchang endpoint — is defined
  and never called, because panchang is blocked behind ADR-033.
- **`notif_prefs`** (jsonb) is written by `notificationRepository`, but the notification opt-in path
  is inert while `expo-notifications` is uninstalled.

**Consequence for the store labels: PanchangPal does not collect location today.** It will when
ADR-033 is ratified and panchang ships. See `STORE_PRIVACY_LABELS.md` §4.

### 3.2 `personal_date` — the most sensitive field in the product

`personal_date.name` is free text the user types to label a remembrance — in practice the name of a
relative, frequently a deceased one (UX-7 requires grief-aware handling; PDD treats this as the
product's most delicate surface). It is:

- stored in plain text, protected by RLS (`pd_*_own`: owner-only for select/insert/update/delete),
- **never** sent to analytics, logs, or AI prompts (ADR-031),
- included in the CCPA export (§8.1),
- soft-deleted with a `deleted_at` tombstone for offline reconciliation (TDD Part 2 §6.6) — meaning
  a user-deleted personal date **remains in the row** until the account is hard-deleted.

That last point is a real disclosure obligation: "delete" in the UI is a tombstone, not an erasure.
The privacy policy says so in plain words rather than implying otherwise.

### 3.3 `message.content` — free text, and the only egress to a third-party LLM

The user's question and the model's answer are stored verbatim. The question is also sent to OpenAI
(§6). Neither happens today: `GURU_LIVE=false` gates live answers, and the reviewed corpus that
would lift the gate does not exist yet. **This is the single largest change to the privacy posture
between now and launch**, and the policy is drafted to cover it explicitly rather than needing a
revision the day the flag flips.

ADR-031 forbids cross-session AI memory in v1: context does not survive a thread.

### 3.4 Identifiers

| Identifier | Where | Notes |
|---|---|---|
| Auth uid | `auth.users`, `app_user.id` | Anonymous by default (ADR-009). Most users never supply PII at all. |
| Email address | `auth.users` (Supabase-managed) | Only if the user upgrades via email OTP. **No application table stores it** — `support_ticket.email` exists but nothing writes it. |
| `user_pseudo_id` | `analytics_event`, `ai_cost_ledger` | Device-minted random UUID, **never derived from the auth uid**. A reinstall mints a new one. |
| Expo push token | `push_token.expo_token` | A device credential. Not collected today. |
| `client_id` | `ritual_completion`, `checklist_completion`, `personal_date` | Client-minted idempotency key for offline sync. Not an identity. |

---

## 4. Analytics events actually emitted

Nine `EVT_*` ids reach `AnalyticsService.track()` in the built app. This is **not** the full PDD §11
registry — the registry is the permitted vocabulary; this is the emitted subset.

| Event | Meaning | Props sent |
|---|---|---|
| `EVT_012` | Today viewed | `screen_id`, `local_date` |
| `EVT_015` | Ritual started | `ritual_id`, `tradition`, `depth`, `audio_used`, `offline` |
| `EVT_016` | Ritual step advanced | base props + `step_number`, `total_steps` |
| `EVT_017` | Ritual completed (North Star input) | base props + `duration_ms` |
| `EVT_018` | Ritual abandoned | base props + `step_number`, `total_steps` |
| `EVT_019` | Checklist item completed | `screen_id`, `item_id` |
| `EVT_020` | Streak advanced | `streak_len`, `grace_remaining` |
| `EVT_021` | Streak grace used | `streak_len`, `grace_remaining` |
| `EVT_054` | Client error | `error_code` (`ERR_*`), `screen_id`, `recoverable`, `correlation_id` |

Every envelope additionally carries `app_version` and `platform` (from `contextProps()`), plus
`user_pseudo_id`, optional `household_id`, optional `session_id`, and a timestamp.

**Events named in source comments but not emitted:** `EVT_041` (notification opened), `EVT_045`
(anon→auth merge), `EVT_049`–`EVT_052` (subscription funnel). Each sits beside a `//` comment
marking where it will fire; none reaches `track()`. They are excluded here because this inventory
records collection, not intent.

### 4.1 Why no PII can reach analytics

Three structural properties, each asserted by a test rather than by convention:

1. **Props are primitives only.** Objects and arrays are dropped at the boundary — that is the route
   by which an error object or a server response would carry user content into the store.
2. **An event id outside the PDD §11 taxonomy is rejected**, not inserted. `event_id` is only a text
   column, so nothing downstream would catch an invented event.
3. **An unrecognised error maps to `ERR_UNKNOWN`, never to its message**, and `componentStack` is
   never forwarded (TDD Part 5 §7.1 `[MANDATORY]`).

`analytics_event` is **insert-only for clients** — policy `analytics_ins_own`, no select policy at
all. The device cannot read back what it wrote. Rollups run service-side (ADR-025). Verified against
hosted staging: INSERT `201`, SELECT `200 []`, UPDATE `200 []`, DELETE `200 []`.

---

## 5. On-device storage

| Key | Backend | Contents | Encrypted at rest |
|---|---|---|---|
| Supabase auth session | `expo-secure-store` (Keychain / Keystore) | access + refresh tokens, chunked across numbered keys | **Yes** |
| `offline-queue:v1` | MMKV | pending `ritual_complete` / `checklist` / `personal_date` mutations | No |
| `query-cache:v1` | MMKV | cached server reads (allowlisted, §6.1) | No |
| `analytics:user_pseudo_id` | MMKV | the pseudonymous device id | No |
| `onboarding:completed` | MMKV | onboarding gate flag | No |
| ritual session | MMKV | in-progress ritual step index | No |

The auth session is deliberately **not** in MMKV: MMKV is unencrypted at rest and a refresh token is
a bearer credential (OWASP M9). Everything else is app-scoped, non-credential data on a
sandboxed filesystem.

The persisted query cache is an **allowlist**, not a mirror. `entitlement` and `invite` are excluded
(§6.2 network-only — the device is never the authority on paid access), and Ask Guru conversations
are excluded per ADR-031. Mutations are not persisted here; `STORE_offlineQueue` already owns them.

---

## 6. Third-party processors

| Processor | Receives | Status today |
|---|---|---|
| **Supabase** (US region, ADR-012) | everything in §2 — it is the database, auth provider and function host | **Active** |
| **Expo / EAS Update** | OTA update check: install id, runtime version, platform, channel | **Active** (`expo-updates` installed, `u.expo.dev`) |
| **OpenAI** | the user's Ask Guru question + retrieved corpus text; server-side only, never from the device | Inactive — `GURU_LIVE=false` |
| **RevenueCat** | purchase receipts, store transaction ids | Inactive — `react-native-purchases` not installed |
| **Expo Push Service** | push token, notification payload | Inactive — `expo-notifications` not installed |
| **Sentry** | crash reports and `ERR_*` telemetry | Inactive — SDK not installed, no DSN provisioned |

**Data residency:** a single US Supabase region for launch (ADR-012, resolving F-18). Launch markets
are the US, Australia and New Zealand, so AU/NZ user data is stored in the United States. The policy
must disclose this; APP 8 (Australia) and the NZ Privacy Act's IPP 12 both govern disclosure of
personal information overseas. `[LEGAL REVIEW REQUIRED]`

The OpenAI API key is server-only (`OPENAI_API_KEY`, read inside Edge Functions). No secret and no
third-party SDK key that authorizes anything ships on the device (ADR-030).

---

## 7. Device permissions

**None are requested today.** `app.config.ts` declares three config plugins — `expo-localization`,
`expo-router`, `expo-secure-store` — none of which prompts the user.

At launch the app will request:

| Permission | Purpose | Gating |
|---|---|---|
| Notifications | ritual reminders, festival and personal-date alerts | `expo-notifications`, deferred (M7 adapter is a Null impl) |
| Location (approximate) | sunrise/tithi accuracy for panchang | `expo-location`, not installed; blocked on ADR-033 |

Both are subject to value-first priming (UX-4/UX-5): the rationale is shown before the OS prompt.
Neither is required for the daily loop, which is never gated (P4).

---

## 8. Data rights

### 8.1 Export — implemented, unverified against a live backend

`POST /account/export` returns the caller's owned rows as JSON under a versioned envelope
(`panchangpal.export.v1`, `format_status: awaiting_ratification` — F-10 is product-owned and
unratified). The caller is derived from the JWT; a uid in the body is ignored.

Row set: `user_profile`, `personal_date`, `conversation`, `streak`, `ritual_completion`,
`checklist_completion`.

Deliberately excluded, and the reasoning is worth preserving: `push_token` is a device credential,
`notification` is delivery bookkeeping, and `referral` concerns another party as much as this user.
Reassigning those on an account merge is right; handing them back as "your data" is not.

**Two gaps, stated rather than implied:**
- `message` rows (the actual Ask Guru text) are **not** in the export — only the `conversation`
  header is. Once Ask Guru is live this is an incomplete export and must be fixed.
- **No UI consumes this endpoint.** PDD specifies no screen, so building one would invent UX. The
  affordance is owed by the PDD; until it exists, a user cannot exercise the right in-app.

### 8.2 ⛔ Deletion — scheduled, and never executed

**This is a launch blocker found while building this inventory.**

`POST /account/delete` gates the request (F-3: an owner with other members must transfer ownership
first), then writes a row to `account_deletion` with `requested_at` and `execute_after`
(now + 30 days) and returns the grace date.

**Nothing ever reads that row back.** Across the entire repository:

- no Edge Function queries `account_deletion`;
- no job runner processes the `job` table — `analytics_rollup` and friends are enum values with no
  consumer;
- `pg_cron` is **commented out** in `20260712000001_extensions.sql`, so no scheduled work runs at
  all;
- `account_deletion.executed_at` is never set by any code path.

TDD Part 5 §6.2 specifies that deletion "hard-deletes owned rows". That hard delete **does not exist
anywhere in the codebase.** The system records an intention to delete and then keeps the data
indefinitely.

This matters beyond the code: a privacy policy that promises deletion, and a store Data Safety
answer of "users can request that their data be deleted", would both be inaccurate today. CCPA
§1798.105 gives a right to deletion, not a right to have a deletion request logged.

**What closing it requires:** an executor for `account_deletion` rows past `execute_after` that hard-
deletes the `OWNED_TABLES` set, sets `executed_at`, and deletes the `auth.users` row — plus something
to invoke it (pg_cron, or a scheduled GitHub Action calling an Edge Function). It is ordinary
engineering, not an owner purchase, but it is out of B6.3's documentation scope and is tracked as its
own blocker.

### 8.3 Correction / access

No mechanism beyond the profile screens. CCPA's right to correct is satisfied for profile fields the
user can edit; there is no path to correct a `ritual_completion` or a `streak`. `[LEGAL REVIEW
REQUIRED]` — whether that is sufficient for the launch markets.

---

## 9. Retention

**There is no retention policy in force, because nothing deletes anything.**

| Data | Intended retention | Actual |
|---|---|---|
| Account data on deletion request | hard delete after a 30-day grace window | **Never deleted** (§8.2) |
| `personal_date` deleted by the user | tombstone for offline reconcile, then removal | Tombstone only; never removed |
| `analytics_event` | rollup then prune (ADR-025) | No rollup job exists; rows accumulate |
| `ai_rate_limit` | window buckets, prunable | No pruning; not written today |
| `panchang_cache` | cache with TTL | Not written today (ADR-033) |

All five gaps have the same root cause: **no scheduled execution exists in this project.** That is
one fix, not five.

**Additionally: there is no point-in-time backup.** Supabase PITR is a paid-plan feature and both
hosted projects are free-tier, so user data is not recoverable after an incident (NFR-15 unmet,
recorded in `DR_RUNBOOKS.md`). A privacy policy should not describe safeguards that do not exist.

---

## 10. Findings

| # | Finding | Severity | Owner |
|---|---|---|---|
| 1 | **Account deletion is never executed** — the request is recorded and the data is kept indefinitely (§8.2) | ⛔ Launch blocker | Engineering |
| 2 | **No scheduled execution exists at all** — `pg_cron` commented out, no job runner; this is also the cause of finding 1 and of every retention gap (§9) | ⛔ Launch blocker | Engineering |
| 3 | **The CCPA export omits `message` rows**, so it is incomplete the moment Ask Guru goes live (§8.1) | 🟡 Before `GURU_LIVE` | Engineering |
| 4 | **No in-app affordance for export or deletion** — the endpoints exist and no screen calls them (§8.1) | 🟡 Before launch | PDD (product) |
| 5 | **A user-deleted personal date is a tombstone, not an erasure** — must be disclosed (§3.2) | 🟢 Disclosure | Policy |
| 6 | **AU/NZ user data is stored in the US** — APP 8 / IPP 12 disclosure obligations | 🟢 Disclosure | `[LEGAL REVIEW]` |
| 7 | `packages/database` `TABLES` registry has drifted from the schema (29 vs 32) (§2.1) | 🟢 Hygiene | Engineering |

Findings 1 and 2 are the same defect this milestone keeps finding, in its fourth instance: a control
that is documented, has a table backing it, and was never implemented — with nothing asserting it.
The deletion path is more pointed than its predecessors, because the row it writes makes the system
*look* like it is honouring the request.

---

## 11. Derived documents

- `PRIVACY_POLICY_DRAFT.md` — user-facing draft, `[LEGAL REVIEW REQUIRED]`
- `STORE_PRIVACY_LABELS.md` — Google Play Data Safety + Apple App Privacy answers

Both are derived from this file. If this file changes, regenerate them — and re-check the store
answers before any submission, because labels must be accurate to collection **at submission time**,
not to this document's publication date.
