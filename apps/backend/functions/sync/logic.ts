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

/**
 * The narrow slice of the repository `applyPreferences` needs. Declared here rather than importing
 * `SyncRepository` so the sequencing can be tested with a fake, which is the whole point of it.
 */
export interface PreferencesStore {
  getPreferencesUpdatedAt(userId: string): Promise<string | null>;
  updatePreferences(
    userId: string,
    payload: Record<string, unknown>,
    localTs: string,
  ): Promise<void>;
}

/**
 * Read the stored timestamp, decide with `resolvePreferences`, and write ONLY if the mutation wins.
 *
 * ⚠️ **THIS SEQUENCE IS THE THING THAT WAS BROKEN.** Until 2026-08-02 the handler called
 * `resolvePreferences(m, null)` and then wrote unconditionally, so the comparison could never fire
 * and §6.6's rule was really last-drain-wins — with `updated_at` free to move backwards. Every
 * existing test passed, because they called `resolvePreferences` directly and nothing exercised the
 * handler's use of it.
 *
 * It lives here, separately from the handler, so a fake store can assert the ORDERING: that a stale
 * mutation is reported `superseded` **and never reaches the write**. A test that only checks the
 * returned resolution would have passed against the defect.
 */
export async function applyPreferences(
  store: PreferencesStore,
  userId: string,
  m: Mutation,
): Promise<ConflictResult> {
  const existingUpdatedAt = await store.getPreferencesUpdatedAt(userId);
  const outcome = resolvePreferences(m, existingUpdatedAt);
  if (outcome.resolution === 'applied') {
    await store.updatePreferences(userId, m.payload as Record<string, unknown>, m.local_ts);
  }
  return outcome;
}

/** Longer streak wins (used by anon→auth merge and cross-device reconcile). */
export function reconcileStreak(a: number, b: number): number {
  return Math.max(a, b);
}
