/**
 * Account-deletion rules (MOD_you; TDD Part 2 §6.5, F-3; mirrors SVC_account `canDeleteAccount`).
 * Pure, side-effect-free, unit-tested. The client evaluates the SAME gate the server enforces so
 * the UI can show the correct consequences + block the destructive CTA early — but the server
 * remains authoritative (it re-checks on API_POST_ACCOUNT_DELETE). Deletion is a grace-window
 * request (not immediate), and an owner of a household with other members must transfer first.
 */
import { activeMemberCount, canManage, type Household } from '../household';

/** Which consequences copy to show; owner-with-members also gates the CTA (transfer first). */
export type DeletionVariant = 'standard' | 'owner-with-members';

export interface DeletionGate {
  variant: DeletionVariant;
  /** Owner of a household with ≥1 other active member → must transfer ownership first (F-3). */
  needsOwnershipTransfer: boolean;
  /** Number of OTHER active members (excludes the owner's own membership row). */
  otherActiveMembers: number;
}

/** Count active members other than the owner (local, user_id-null members included). */
export function otherActiveMemberCount(household: Household | null | undefined, ownerId: string): number {
  if (!household) return 0;
  return household.members.filter((m) => m.isActive && m.userId !== ownerId).length;
}

/**
 * Evaluate the deletion gate for `userId` given their household (or null). Owners with other
 * active members must transfer ownership before deletion (AC-DEL-01); everyone else may proceed
 * straight to the grace-window request.
 */
export function evaluateDeletion(household: Household | null | undefined, userId: string | null): DeletionGate {
  const isOwner = canManage(household, userId);
  const others = isOwner && userId ? otherActiveMemberCount(household, userId) : 0;
  const needsOwnershipTransfer = isOwner && others > 0;
  return {
    variant: needsOwnershipTransfer ? 'owner-with-members' : 'standard',
    needsOwnershipTransfer,
    otherActiveMembers: others,
  };
}

/** Convenience: is the account safe to delete right now (no transfer required)? */
export function canRequestDeletion(household: Household | null | undefined, userId: string | null): boolean {
  return !evaluateDeletion(household, userId).needsOwnershipTransfer;
}

export { activeMemberCount };
</content>
