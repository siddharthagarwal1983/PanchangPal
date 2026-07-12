/**
 * SVC_account logic (TDD Part 2 §4.3/§5.1/§6.5). Pure rules for the anon→auth merge
 * (F-1) and deletion gating (F-3). DB reassignment happens in the handler transaction;
 * these functions decide the conflict outcomes. Vitest-testable.
 */
import { reconcileStreak } from '../sync/logic.ts';

export interface MergeInputs {
  anonStreak: number;
  authStreak: number;
  anonHouseholdId: string | null;
  authHouseholdId: string | null;
}

export interface MergeResult {
  keptStreak: number;
  keptHouseholdId: string | null;
  conflicts: string[];
}

/**
 * Merge rule (F-1): keep the longer streak; household = union with one-active-household
 * (F-2) — if both exist and differ, keep the auth user's and flag the conflict for the
 * user to resolve (ERR_AUTH_MERGE_CONFLICT surfaced only if user-meaningful, AC-AUTH-02).
 */
export function resolveMerge(inp: MergeInputs): MergeResult {
  const conflicts: string[] = [];
  const keptStreak = reconcileStreak(inp.anonStreak, inp.authStreak);

  let keptHouseholdId = inp.authHouseholdId ?? inp.anonHouseholdId;
  if (inp.anonHouseholdId && inp.authHouseholdId && inp.anonHouseholdId !== inp.authHouseholdId) {
    keptHouseholdId = inp.authHouseholdId; // authenticated identity's household wins (F-2)
    conflicts.push('household_divergence');
  }
  return { keptStreak, keptHouseholdId, conflicts };
}

/**
 * Deletion gate (F-3): an owner with other members must transfer ownership first.
 */
export function canDeleteAccount(isHouseholdOwner: boolean, otherActiveMembers: number): {
  allowed: boolean;
  reason?: string;
} {
  if (isHouseholdOwner && otherActiveMembers > 0) {
    return { allowed: false, reason: 'transfer_ownership_first' };
  }
  return { allowed: true };
}

/** Grace window: deletion executes after N days (F-3). Default 30d unless config overrides. */
export function executeAfter(requestedAtIso: string, graceDays = 30): string {
  const d = new Date(requestedAtIso);
  d.setUTCDate(d.getUTCDate() + graceDays);
  return d.toISOString();
}
