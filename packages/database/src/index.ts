/**
 * @panchangpal/database — generated Postgres types + RLS helper references.
 *
 * `generated.ts` is produced in CI from the live schema:
 *   supabase gen types typescript --local > src/generated.ts
 * against the migrations in apps/backend/migrations (TDD Part 2 §3). It is a build
 * artifact and is not hand-edited. Until first generation, only the table-name
 * registry and RLS predicate references below are exported.
 */

/** Registry of TBL_* table names (TDD Part 2 §1.3). Keeps queries traceable. */
export const TABLES = [
  'app_user',
  'user_profile',
  'household',
  'household_member',
  'invite',
  'referral',
  'tradition',
  'festival',
  'ritual',
  'ritual_completion',
  'streak',
  'checklist_item',
  'checklist_completion',
  'personal_date',
  'panchang_cache',
  'content_item',
  'content_chunk',
  'conversation',
  'message',
  'message_source',
  'subscription',
  'entitlement',
  'push_token',
  'notification',
  'feature_flag',
  'analytics_event',
  'job',
  'account_deletion',
  'support_ticket',
] as const;
export type TableName = (typeof TABLES)[number];

/**
 * RLS predicate references (implemented in apps/backend/migrations). Documented
 * here so services and tests reference stable names (TDD Part 2 §2.2/§4).
 */
export const RLS_HELPERS = [
  'current_household_id',
  'is_household_member',
  'is_household_owner',
] as const;
