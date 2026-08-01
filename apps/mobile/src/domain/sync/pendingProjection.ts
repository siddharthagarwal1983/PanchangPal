/**
 * Projecting the durable queue onto a cached read model (TDD Part 4 §6.1/§6.3).
 *
 * WHY THIS EXISTS. `STORE_offlineQueue` is durable and `queryPersistence` is a cache, but until
 * now only the cache was ever rendered. The checklist tick a user sees after a cold start came
 * exclusively from the persisted query-cache snapshot, and that snapshot is written on a throttle
 * and flushed from an unsubscribe handler a process kill never runs. So a completion made offline
 * survived or vanished depending on whether the process happened to die inside the throttle
 * window — the ~50% failure `FLOW_OFFLINE_SYNC` catches at "THE ASSERTION THIS FLOW EXISTS FOR".
 *
 * The queue was never the problem: `keyValueStore`'s `set` is MMKV's synchronous JSI call, made
 * inside the tap handler. The pending mutation reached disk every time. Nothing re-applied it to
 * what was rendered.
 *
 * So the rule is: the durable queue is the source of truth for pending state, and the cache is
 * corrected from it at startup. Server truth still wins the moment it arrives — the drain
 * invalidates these keys (§6.4), which refetches and overwrites whatever is projected here.
 *
 * Pure by construction: no store, no query client, no vendor SDK (dependency direction, Part 1 §5).
 */
import type { QueuedMutation } from './types';

/**
 * A checklist entry's payload as `useToggleChecklistItem` enqueues it. `QueuedMutation.payload` is
 * deliberately `unknown` — the queue carries three kinds and the drain does not care — so it is
 * narrowed here rather than widened there.
 */
interface ChecklistPayload {
  item_id: string;
  local_date: string;
}

function asChecklistPayload(payload: unknown): ChecklistPayload | null {
  const candidate = payload as Partial<ChecklistPayload> | null | undefined;
  if (typeof candidate?.item_id !== 'string' || typeof candidate?.local_date !== 'string') {
    // A payload this version did not write, or one restored from an older persisted shape.
    // Skipping beats throwing: an unreadable entry must cost a projection, never a launch.
    return null;
  }
  return { item_id: candidate.item_id, local_date: candidate.local_date };
}

/**
 * The checklist item ids with a completion pending for `localDate`.
 *
 * COMPLETION, NOT TOGGLE. The enqueued payload carries `{ item_id, local_date }` and no desired
 * state, so a queued entry can only mean "completed" — which matches §6.6's conflict rule for the
 * checklist, a UNION on the server. Un-completing is therefore not expressible in the queue at
 * all; that is a pre-existing property of the §6.6 contract, not a decision taken here, and it is
 * why this projection only ever sets `complete` to true.
 */
export function pendingChecklistItemIds(
  queue: readonly QueuedMutation[],
  localDate: string | null,
): Set<string> {
  const ids = new Set<string>();
  if (!localDate) return ids;
  for (const mutation of queue) {
    if (mutation.kind !== 'checklist') continue;
    const payload = asChecklistPayload(mutation.payload);
    if (payload && payload.local_date === localDate) ids.add(payload.item_id);
  }
  return ids;
}

/** The distinct `local_date`s the queue holds checklist completions for. */
export function pendingChecklistDates(queue: readonly QueuedMutation[]): string[] {
  const dates = new Set<string>();
  for (const mutation of queue) {
    if (mutation.kind !== 'checklist') continue;
    const payload = asChecklistPayload(mutation.payload);
    if (payload) dates.add(payload.local_date);
  }
  return [...dates];
}

/** A cached checklist row. Structural, so the domain does not import the data layer's DTO. */
interface CompletableItem {
  id: string;
  complete: boolean;
}

/**
 * Mark the pending ids complete, preserving order and identity.
 *
 * Returns the SAME array reference when nothing changes, so a caller can skip a cache write
 * entirely rather than churn every subscriber on every launch.
 */
export function applyPendingCompletions<T extends CompletableItem>(
  items: readonly T[],
  pendingIds: ReadonlySet<string>,
): readonly T[] {
  if (pendingIds.size === 0) return items;
  let changed = false;
  const next = items.map((item) => {
    if (!pendingIds.has(item.id) || item.complete) return item;
    changed = true;
    return { ...item, complete: true };
  });
  return changed ? next : items;
}
