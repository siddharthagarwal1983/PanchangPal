/**
 * MOD_you — household domain types (TDD Part 4 §2.1; openapi Household/HouseholdMember).
 * Client-facing shapes of the server-authoritative household + membership. The server (RLS,
 * ADR-018) remains the source of truth; these types never carry secrets or server internals.
 * Full field contracts live in @panchangpal/api / OpenAPI.
 */
import type { ContentDepth, MemberRole, TraditionCode } from '@panchangpal/shared';

export interface HouseholdMember {
  id: string;
  householdId: string;
  /** null = a local (uninvited) member the owner tracks; non-null once a real user joins. */
  userId: string | null;
  displayName: string;
  role: MemberRole;
  depth: ContentDepth;
  isActive: boolean;
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  tradition: TraditionCode;
  members: HouseholdMember[];
}

/** New/updated member fields the owner may write (PATCH semantics for updates). */
export interface MemberInput {
  displayName: string;
  role: MemberRole;
  depth: ContentDepth;
}

export type MemberPatch = Partial<MemberInput>;

/** Preview shown on the accept card before a user joins (openapi API_GET_INVITE). */
export interface InvitePreview {
  householdName: string;
  inviter: string;
}

/** A freshly created invite (openapi API_POST_HOUSEHOLD_INVITE). */
export interface Invite {
  token: string;
  url: string;
  expiresAt: string; // ISO-8601
}

/** Documented defaults for a new member (PDD CMP_ROLE_PICKER: self defaults to Anchor). */
export const DEFAULT_MEMBER_INPUT: MemberInput = {
  displayName: '',
  role: 'other',
  depth: 'quick',
};
