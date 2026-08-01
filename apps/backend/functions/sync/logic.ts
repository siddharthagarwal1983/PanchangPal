/**
 * SVC_sync conflict-resolution rules (TDD Part 1 §2.11 / Part 2 §6.6). Pure functions
 * — no Deno/DB — so they're unit-tested under Vitest and reused by the handler.
 *
 * Per-kind rules:
 *  - ritual_complete: daily completion is CLIENT-AUTHORITATIVE for its local_date
 *    (upsert ON CONFLICT (user_id, local_date) DO NOTHING → first write wins, idempotent).
 *  - checklist: UNION (a completion for (user,item,local_date) is kept once).
 *  - personal_date: last-writer-wins on updated_at, tombstones via deleted_at.
 *  - streak: DERIVED server-side from completions — never client-set (can't be gamed).
 */

export type MutationKind = 'ritual_complete' | 'checklist' | 'personal_date' | 'preferences';

export interface Mutation {
  kind: MutationKind;
  payload: Record<string, unknown>;
  client_id: string;
  local_ts: string; // ISO-8601
}

export type Resolution = 'applied' | 'deduped' | 'superseded' | 'tombstoned';

export interface ConflictResult {
  client_id: string;
  resolution: Resolution;
}

/** ritual_complete: idempotent by (user_id, local_date). A duplicate for the same day dedupes. */
export function resolveRitualCompletion(
  incoming: Mutation,
  existingForDay: boolean,
): ConflictResult {
  return { client_id: incoming.client_id, resolution: existingForDay ? 'deduped' : 'applied' };
}

/** checklist: union by (user_id, item_id, local_date). */
export function resolveChecklist(incoming: Mutation, existing: boolean): ConflictResult {
  return { client_id: incoming.client_id, resolution: existing ? 'deduped' : 'applied' };
}

/** personal_date: last-writer-wins on updated_at; a delete (deleted_at set) tombstones. */
export function resolvePersonalDate(
  incoming: Mutation,
  existingUpdatedAt: string | null,
): ConflictResult {
  const isDelete = Boolean(incoming.payload['deleted_at']);
  if (isDelete) return { client_id: incoming.client_id, resolution: 'tombstoned' };
  if (existingUpdatedAt && new Date(existingUpdatedAt) >= new Date(incoming.local_ts)) {
    return { client_id: incoming.client_id, resolution: 'superseded' };
  }
  return { client_id: incoming.client_id, resolution: 'applied' };
}

/**
 * preferences: last-writer-wins on `local_ts`.
 *
 * ⚠️ **THE §6.6 RULE FOR THIS KIND IS NOT YET RATIFIED.** TDD Part 2 §6.6 defines conflict rules
 * for the other three kinds and says nothing about preferences, so this adopts the NEAREST
 * RATIFIED PRECEDENT — `personal_date`'s last-writer-wins — rather than inventing a novel one.
 * That choice is deliberate and narrow, and the TDD owes a ruling; if it lands differently, this
 * function is the only place that changes.
 *
 * Why LWW is the defensible default here: a preference is a single mutable value with no
 * uniqueness constraint and no history, so union (checklist) and first-write-wins
 * (ritual_complete) are both wrong for it — the former cannot express a change at all, and the
 * latter would make the FIRST tradition a user ever picked permanent.
 *
 * `local_ts` rather than a server timestamp, matching `personal_date`: the client's clock is what
 * orders two of the user's own edits made offline, and a server-received-at time would reorder
 * them by whichever drained first.
 */
export function resolvePreferences(
  incoming: Mutation,
  existingUpdatedAt: string | null,
): ConflictResult {
  if (existingUpdatedAt && new Date(existingUpdatedAt) >= new Date(incoming.local_ts)) {
    return { client_id: incoming.client_id, resolution: 'superseded' };
  }
  return { client_id: incoming.client_id, resolution: 'applied' };
}

/** Longer streak wins (used by anon→auth merge and cross-device reconcile). */
export function reconcileStreak(a: number, b: number): number {
  return Math.max(a, b);
}
