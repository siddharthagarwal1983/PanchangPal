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
 * It is deliberately NARROWER than the union the queue carried through M2–M8, which also listed
 * `preferences` and `notif_prefs`. Those two reach the handler's `default:` branch: it logs
 * `sync_unknown_kind` and returns them in neither `applied` nor `conflicts`, so a drained
 * preference change is discarded by the server while the client has no acknowledgement to act on.
 * Queuing them therefore bought a user nothing — the optimistic update still reverts on the failed
 * direct write — while a row accumulated in durable storage that nothing could ever remove.
 *
 * Narrowing the type is what stops that recurring: the two hooks that enqueued an unsyncable kind
 * now fail to compile rather than silently producing an entry no drain can retire. Extending sync
 * to cover preferences properly needs an approved §6.6 conflict rule and a server branch; inventing
 * either here would be inventing business rules.
 */
export const SYNCABLE_KINDS = ['ritual_complete', 'checklist', 'personal_date'] as const;

export type MutationKind = (typeof SYNCABLE_KINDS)[number];

export interface QueuedMutation {
  id: string;
  kind: MutationKind;
  payload: unknown;
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
