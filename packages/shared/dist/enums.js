/**
 * Domain enumerations — mirror the Postgres enums in TDD Part 2 §2.3 exactly.
 * Generated-equivalent source consumed by app, API contracts, and DB types so no
 * layer diverges (TDD Part 1 §1.3).
 */
export const TRADITION_CODES = ['generic', 'north_indian', 'south_indian_tamil', 'bengali'];
export const CONTENT_DEPTHS = ['quick', 'deep'];
export const MEMBER_ROLES = ['anchor', 'parent', 'elder', 'youth', 'other'];
export const DATE_BASES = ['tithi', 'gregorian'];
export const REMINDER_LEADS = ['same_day', 'one_day', 'custom'];
export const MESSAGE_ROLES = ['user', 'assistant'];
export const MESSAGE_OUTCOMES = ['grounded', 'declined', 'refused', 'error'];
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
];
export const NOTIF_CHANNELS = [
    'daily',
    'festival',
    'personal',
    'household',
    'growth',
    'lifecycle',
];
export const ENTITLEMENT_KINDS = ['individual', 'family'];
export const SUB_STATUSES = ['active', 'in_grace', 'expired', 'cancelled', 'paused'];
export const APPEARANCE_MODES = ['system', 'light', 'dark'];
/** Post-v1 feature flags (FF_*, TDD Part 1 §7.3 / ADR-021). */
export const FEATURE_FLAGS = [
    'FF_GREETING_CARD',
    'FF_JAIN_MODE',
    'FF_FAMILY_PLAN',
    'FF_LIFECYCLE_EMAIL',
];
//# sourceMappingURL=enums.js.map