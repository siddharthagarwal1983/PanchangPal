/**
 * Pure mapping + rules between the household/household_member rows (API/DB shape) and the
 * client domain types. Side-effect-free and unit-tested (no network). Unknown/invalid enum
 * values fall back to DOCUMENTED defaults rather than being fabricated or trusted blindly —
 * a corrupt row must never surface an invalid role/depth/tradition to the UI.
 */
import {
  CONTENT_DEPTHS,
  MEMBER_ROLES,
  TRADITION_CODES,
  type ContentDepth,
  type MemberRole,
  type TraditionCode,
} from '@panchangpal/shared';
import { DEFAULT_MEMBER_INPUT, type Household, type HouseholdMember, type MemberInput } from './types';

/** Raw shape of the household_member row this feature reads. */
export interface HouseholdMemberRow {
  id?: unknown;
  household_id?: unknown;
  user_id?: unknown;
  display_name?: unknown;
  role?: unknown;
  depth?: unknown;
  is_active?: unknown;
}

/** Raw shape of the household row (with optional embedded members). */
export interface HouseholdRow {
  id?: unknown;
  name?: unknown;
  owner_id?: unknown;
  tradition_code?: unknown;
  members?: unknown;
}

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableId(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** household_member row → HouseholdMember, with safe enum fallbacks. */
export function rowToMember(row: HouseholdMemberRow): HouseholdMember {
  return {
    id: str(row.id),
    householdId: str(row.household_id),
    userId: nullableId(row.user_id),
    displayName: str(row.display_name),
    role: oneOf<MemberRole>(MEMBER_ROLES, row.role, DEFAULT_MEMBER_INPUT.role),
    depth: oneOf<ContentDepth>(CONTENT_DEPTHS, row.depth, DEFAULT_MEMBER_INPUT.depth),
    isActive: row.is_active !== false, // default active unless explicitly false
  };
}

/** household row (optionally with embedded members) → Household. */
export function rowToHousehold(row: HouseholdRow | null | undefined): Household | null {
  if (!row || typeof row.id !== 'string') return null;
  const members = Array.isArray(row.members) ? (row.members as HouseholdMemberRow[]).map(rowToMember) : [];
  return {
    id: row.id,
    name: str(row.name),
    ownerId: str(row.owner_id),
    tradition: oneOf<TraditionCode>(TRADITION_CODES, row.tradition_code, 'generic'),
    members: sortMembers(members),
  };
}

/** MemberInput/patch → column patch (only provided keys), for a server write. */
export function memberInputToRow(patch: Partial<MemberInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.depth !== undefined) row.depth = patch.depth;
  return row;
}

/** Owner-first, then active members, then by display name — a calm, stable order. */
export function sortMembers(members: HouseholdMember[]): HouseholdMember[] {
  const rank = (r: MemberRole): number => (r === 'anchor' ? 0 : 1);
  return [...members].sort(
    (a, b) =>
      Number(b.isActive) - Number(a.isActive) ||
      rank(a.role) - rank(b.role) ||
      a.displayName.localeCompare(b.displayName),
  );
}

/** Up-to-two-letter initials for a decorative avatar (names still carried in the a11y label). */
export function memberInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Only the household owner may add/remove/edit members (RLS enforces this server-side too). */
export function canManage(household: Household | null | undefined, userId: string | null): boolean {
  return !!household && !!userId && household.ownerId === userId;
}

/** A "solo" household (only the owner) shows the invite-prompt variant (PDD CMP_HOUSEHOLD_SUMMARY). */
export function isSolo(household: Household | null | undefined): boolean {
  return !household || household.members.filter((m) => m.isActive).length <= 1;
}

/** Count of active members, for the summary/header ("{n} members"). */
export function activeMemberCount(household: Household | null | undefined): number {
  return household ? household.members.filter((m) => m.isActive).length : 0;
}
</content>
