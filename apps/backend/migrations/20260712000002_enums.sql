-- =============================================================================
-- 20260712000002_enums.sql
-- PanchangPal — enumerated types
-- Source: TDD Part 2 §2.3 (enumerated types).
-- `error_code` / `event_id` are NOT hard Postgres enums: they are generated from
-- packages/shared (TDD Part 2 §2.2/§2.3) and stored as text to avoid DB/app drift.
-- =============================================================================

create type member_role      as enum ('anchor', 'parent', 'elder', 'youth', 'other');            -- PDD A3
create type content_depth    as enum ('quick', 'deep');                                           -- PDD A3
create type tradition_code   as enum ('generic', 'north_indian', 'south_indian_tamil', 'bengali'); -- F-9 (extensible via ALTER TYPE)
create type date_basis       as enum ('tithi', 'gregorian');                                      -- PERSONAL_DATE (C2)
create type reminder_lead    as enum ('same_day', 'one_day', 'custom');
create type message_role     as enum ('user', 'assistant');
create type message_outcome  as enum ('grounded', 'declined', 'refused', 'error');                -- EVT_030/033/034/054
create type notif_type       as enum ('morning', 'festival', 'evening', 'streak', 'household', 'personal', 'household_invite', 'subscription', 'winback');
create type notif_channel    as enum ('daily', 'festival', 'personal', 'household', 'growth', 'lifecycle'); -- PDD §8.0
create type entitlement_kind as enum ('individual', 'family');                                    -- SCR_SUBSCRIPTION_001
create type sub_status       as enum ('active', 'in_grace', 'expired', 'cancelled', 'paused');
create type appearance_mode  as enum ('system', 'light', 'dark');
create type job_type         as enum ('notify_schedule', 'winback_segment', 'content_ingest', 'analytics_rollup', 'entitlement_reconcile');
create type job_status       as enum ('pending', 'running', 'done', 'failed');

-- error_code / event_id: text columns generated from packages/shared enums (PDD §3.0A.3).
--   error_code mirrors PDD §3.0.2 (ERR_*); event_id mirrors PDD §3.0.1 (EVT_*).
