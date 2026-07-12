/**
 * Domain enumerations — mirror the Postgres enums in TDD Part 2 §2.3 exactly.
 * Generated-equivalent source consumed by app, API contracts, and DB types so no
 * layer diverges (TDD Part 1 §1.3).
 */
export declare const TRADITION_CODES: readonly ["generic", "north_indian", "south_indian_tamil", "bengali"];
export type TraditionCode = (typeof TRADITION_CODES)[number];
export declare const CONTENT_DEPTHS: readonly ["quick", "deep"];
export type ContentDepth = (typeof CONTENT_DEPTHS)[number];
export declare const MEMBER_ROLES: readonly ["anchor", "parent", "elder", "youth", "other"];
export type MemberRole = (typeof MEMBER_ROLES)[number];
export declare const DATE_BASES: readonly ["tithi", "gregorian"];
export type DateBasis = (typeof DATE_BASES)[number];
export declare const REMINDER_LEADS: readonly ["same_day", "one_day", "custom"];
export type ReminderLead = (typeof REMINDER_LEADS)[number];
export declare const MESSAGE_ROLES: readonly ["user", "assistant"];
export type MessageRole = (typeof MESSAGE_ROLES)[number];
export declare const MESSAGE_OUTCOMES: readonly ["grounded", "declined", "refused", "error"];
export type MessageOutcome = (typeof MESSAGE_OUTCOMES)[number];
export declare const NOTIF_TYPES: readonly ["morning", "festival", "evening", "streak", "household", "personal", "household_invite", "subscription", "winback"];
export type NotifType = (typeof NOTIF_TYPES)[number];
export declare const NOTIF_CHANNELS: readonly ["daily", "festival", "personal", "household", "growth", "lifecycle"];
export type NotifChannel = (typeof NOTIF_CHANNELS)[number];
export declare const ENTITLEMENT_KINDS: readonly ["individual", "family"];
export type EntitlementKind = (typeof ENTITLEMENT_KINDS)[number];
export declare const SUB_STATUSES: readonly ["active", "in_grace", "expired", "cancelled", "paused"];
export type SubStatus = (typeof SUB_STATUSES)[number];
export declare const APPEARANCE_MODES: readonly ["system", "light", "dark"];
export type AppearanceMode = (typeof APPEARANCE_MODES)[number];
/** Post-v1 feature flags (FF_*, TDD Part 1 §7.3 / ADR-021). */
export declare const FEATURE_FLAGS: readonly ["FF_GREETING_CARD", "FF_JAIN_MODE", "FF_FAMILY_PLAN", "FF_LIFECYCLE_EMAIL"];
export type FeatureFlag = (typeof FEATURE_FLAGS)[number];
//# sourceMappingURL=enums.d.ts.map