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

export type MutationKind = 'ritual_complete' | 'checklist' | 'personal_date';

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

/** Longer streak wins (used by anon→auth merge and cross-device reconcile). */
export function reconcileStreak(a: number, b: number): number {
  return Math.max(a, b);
}
