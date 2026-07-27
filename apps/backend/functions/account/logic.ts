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

/**
 * May this caller run the deletion sweep?
 *
 * A pure rule so it can be tested exhaustively, because getting it wrong is unrecoverable: the
 * sweep erases accounts, and `withHandler` proves only that SOME bearer token is present.
 * Anonymous sign-in is enabled (config.toml), so anyone can mint a valid JWT for free — the exact
 * gap B6.2 found when SVC_account trusted the request body for identity. A user JWT therefore
 * cannot authorize this; a separately provisioned secret must.
 *
 * **An unconfigured secret refuses everyone.** The tempting alternative — treat "no secret set" as
 * "not protected yet" and allow the call — is how an endpoint ships open. Refusing means an
 * operator must provision `ACCOUNT_SWEEP_SECRET` before the sweep can be triggered over HTTP,
 * while the scheduled path (pg_cron calling the SQL function directly) is unaffected either way.
 *
 * Comparison is constant-time: the caller controls the header and can otherwise measure their way
 * to the secret one character at a time.
 */
export function isSweepAuthorized(
  configuredSecret: string,
  presentedSecret: string | null,
  timingSafeEqual: (a: string, b: string) => boolean,
): boolean {
  if (!configuredSecret) return false;
  if (!presentedSecret) return false;
  return timingSafeEqual(configuredSecret, presentedSecret);
}
