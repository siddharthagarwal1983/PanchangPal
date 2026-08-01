/**
 * The offline mutation queue's shape (TDD Part 4 §6.3). Lives in the domain rather than in
 * STORE_offlineQueue because the drain rules, the store and the sync repository all need it and
 * none of them should own it (dependency direction, TDD Part 1 §5). The store re-exports it, since
 * that is where callers have imported it from since M2.
 */

/**
 * The kinds SVC_sync actually reconciles.
 *
 * This list is the SERVER's contract, not a wish: `apps/backend/functions/sync/index.ts` switches
 * on exactly these three and TDD Part 2 §6.6 defines a conflict rule for each — daily completion
 * client-authoritative for its `local_date`, checklist union, personal-date last-writer-wins with
 * tombstones.
 *
 * `preferences` was REMOVED from this list in the offline-sync work and is now BACK (2026-08-01),
 * with the server branch and conflict rule it was missing. The original removal was right for its
 * time: the kind reached the handler's `default:` branch, was logged as `sync_unknown_kind`, and
 * came back in neither `applied` nor `conflicts`, so no drain could ever retire it — an entry
 * accumulating in durable storage that nothing could remove.
 *
 * What changed is that the two things it lacked now exist: `resolvePreferences` in
 * `sync/logic.ts` and a `case 'preferences'` branch that upserts the caller's `user_profile` row
 * behind a column allowlist. ⚠️ **The §6.6 rule itself is still unratified** — it adopts
 * `personal_date`'s last-writer-wins as the nearest ratified precedent rather than inventing a
 * novel one, and the TDD owes a ruling.
 *
 * WHY IT HAD TO COME BACK. A preference write had no durable path at all: `useUpdatePreferences`
 * called the server directly with an optimistic update, so an app kill inside the request window
 * silently reverted the setting. `FLOW_AUTH_SESSION_PERSISTENCE` hit exactly that and it was
 * misread three times as identity loss, because a lost write and a lost identity look identical
 * on that screen.
 *
 * `notif_prefs` remains OUT, for the original reason: no server branch, no conflict rule.
 */
export const SYNCABLE_KINDS = [
  'ritual_complete',
  'checklist',
  'personal_date',
  'preferences',
] as const;

export type MutationKind = (typeof SYNCABLE_KINDS)[number];

export interface QueuedMutation {
  id: string;
  kind: MutationKind;
  payload: unknown;
  /**
   * The identity that made this mutation.
   *
   * A MUTATION MUST NEVER BE APPLIED UNDER A DIFFERENT IDENTITY. Without this, a queue that
   * survives an app kill would drain against whatever uid happens to be current — so if a fresh
   * anonymous uid were ever minted (the M1/M9 defect `secureSessionStorage.ts` exists to
   * prevent), one user's pending preference or completion would be written onto another's
   * account. It would also make `FLOW_AUTH_SESSION_PERSISTENCE` pass while that defect occurred,
   * because the drain would recreate the very value the flow reads back as proof of identity —
   * a false green on the one flow nobody may dismiss.
   *
   * Optional because entries persisted by earlier builds do not carry it. Those still drain: an
   * absent uid means "unknown, assume the caller's", which preserves the previous behaviour
   * rather than stranding a completion §6 forbids discarding.
   */
  user_id?: string;
  /** Idempotency key (§6.3). The server dedupes on it, so a redelivery never double-applies. */
  client_id: string;
  local_ts: string; // ISO-8601
  /** Failed drain attempts so far; drives the backoff schedule. */
  attempts: number;
  /**
   * Epoch ms before which this mutation must not be retried. Absent means "due now", which is the
   * correct reading for an entry that has never been attempted and for one restored from an older
   * persisted payload.
   */
  nextAttemptAt?: number;
}

/** What SVC_sync returns for a batch (`{ applied, conflicts, server_state }`). */
export interface SyncResponse {
  applied: string[];
  conflicts: { client_id: string; resolution: string }[];
  server_state?: { streak?: unknown };
}
