/**
 * Domain enumerations — mirror the Postgres enums in TDD Part 2 §2.3 exactly.
 * Generated-equivalent source consumed by app, API contracts, and DB types so no
 * layer diverges (TDD Part 1 §1.3).
 */
export const TRADITION_CODES = ['generic', 'north_indian', 'south_indian_tamil', 'bengali'] as const;
export type TraditionCode = (typeof TRADITION_CODES)[number];

export const CONTENT_DEPTHS = ['quick', 'deep'] as const;
export type ContentDepth = (typeof CONTENT_DEPTHS)[number];

export const MEMBER_ROLES = ['anchor', 'parent', 'elder', 'youth', 'other'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const DATE_BASES = ['tithi', 'gregorian'] as const;
export type DateBasis = (typeof DATE_BASES)[number];

export const REMINDER_LEADS = ['same_day', 'one_day', 'custom'] as const;
export type ReminderLead = (typeof REMINDER_LEADS)[number];

export const MESSAGE_ROLES = ['user', 'assistant'] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const MESSAGE_OUTCOMES = ['grounded', 'declined', 'refused', 'error'] as const;
export type MessageOutcome = (typeof MESSAGE_OUTCOMES)[number];

export const NOTIF_TYPES = [
  'morning',
  'festival',
  'evening',
  'streak',
  'household',
  'personal',
  'household_invite',
  'subscription',
  'winback',
] as const;
export type NotifType = (typeof NOTIF_TYPES)[number];

export const NOTIF_CHANNELS = [
  'daily',
  'festival',
  'personal',
  'household',
  'growth',
  'lifecycle',
] as const;
export type NotifChannel = (typeof NOTIF_CHANNELS)[number];

export const ENTITLEMENT_KINDS = ['individual', 'family'] as const;
export type EntitlementKind = (typeof ENTITLEMENT_KINDS)[number];

export const SUB_STATUSES = ['active', 'in_grace', 'expired', 'cancelled', 'paused'] as const;
export type SubStatus = (typeof SUB_STATUSES)[number];

export const APPEARANCE_MODES = ['system', 'light', 'dark'] as const;
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];

/** Post-v1 feature flags (FF_*, TDD Part 1 §7.3 / ADR-021). */
export const FEATURE_FLAGS = [
  'FF_GREETING_CARD',
  'FF_JAIN_MODE',
  'FF_FAMILY_PLAN',
  'FF_LIFECYCLE_EMAIL',
] as const;
export type FeatureFlag = (typeof FEATURE_FLAGS)[number];
