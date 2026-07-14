-- =============================================================================
-- 20260712000002_enums.sql
-- PanchangPal — enumerated types
-- Source: TDD Part 2 §2.3 (enumerated types).
-- `error_code` / `event_id` are NOT hard Postgres enums: they are generated from
-- packages/shared (TDD Part 2 §2.2/§2.3) and stored as text to avoid DB/app drift.
-- =============================================================================

DO $$
BEGIN
  BEGIN
    CREATE TYPE member_role AS ENUM (
      'anchor',
      'parent',
      'elder',
      'youth',
      'other'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type member_role already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE content_depth AS ENUM (
      'quick',
      'deep'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type content_depth already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE tradition_code AS ENUM (
      'generic',
      'north_indian',
      'south_indian_tamil',
      'bengali'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type tradition_code already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE date_basis AS ENUM (
      'tithi',
      'gregorian'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type date_basis already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE reminder_lead AS ENUM (
      'same_day',
      'one_day',
      'custom'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type reminder_lead already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE message_role AS ENUM (
      'user',
      'assistant'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type message_role already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE message_outcome AS ENUM (
      'grounded',
      'declined',
      'refused',
      'error'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type message_outcome already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE notif_type AS ENUM (
      'morning',
      'festival',
      'evening',
      'streak',
      'household',
      'personal',
      'household_invite',
      'subscription',
      'winback'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type notif_type already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE notif_channel AS ENUM (
      'daily',
      'festival',
      'personal',
      'household',
      'growth',
      'lifecycle'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type notif_channel already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE entitlement_kind AS ENUM (
      'individual',
      'family'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type entitlement_kind already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE sub_status AS ENUM (
      'active',
      'in_grace',
      'expired',
      'cancelled',
      'paused'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type sub_status already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE appearance_mode AS ENUM (
      'system',
      'light',
      'dark'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type appearance_mode already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE job_type AS ENUM (
      'notify_schedule',
      'winback_segment',
      'content_ingest',
      'analytics_rollup',
      'entitlement_reconcile'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type job_type already exists, skipping.';
  END;

  BEGIN
    CREATE TYPE job_status AS ENUM (
      'pending',
      'running',
      'done',
      'failed'
    );
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Type job_status already exists, skipping.';
  END;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- error_code / event_id
-- These are intentionally stored as TEXT and generated from packages/shared
-- to avoid database/application drift (TDD Part 2 §2.2/§2.3).
-- =============================================================================