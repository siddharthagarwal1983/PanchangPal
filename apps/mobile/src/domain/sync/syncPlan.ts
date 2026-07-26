/**
 * Drain planning for STORE_offlineQueue (TDD Part 4 §6.4). Pure: no network, no storage, no
 * ambient clock — `now` and the jitter source are passed in. The orchestration hook does the
 * effects; every rule that decides WHAT gets sent, WHEN it is retried and WHAT is retired is
 * decided here, where it can be tested without an emulator.
 *
 * §6.4's four requirements map one-to-one onto this file: FIFO ordering with independent kinds
 * batched (`nextBatch`), exponential backoff with jitter (`backoffDelayMs`), capped attempts then
 * a non-blocking surface (`MAX_SYNC_ATTEMPTS` / `isExhausted`), and reconciliation from server
 * truth (`reconcileBatch`).
 */
import type { QueuedMutation, SyncResponse } from './types';

/** Mutations per batch. Small enough that one failure costs little, large enough to drain a day. */
export const SYNC_BATCH_LIMIT = 25;

/**
 * Attempts before a mutation is treated as stuck. Six attempts spans roughly a minute of real
 * backoff, after which §6.4 calls for a non-blocking "couldn't sync — will retry" state rather
 * than more silent retrying. The mutation is NOT discarded: it stays queued and is retried on the
 * next trigger, because dropping a completion is the one outcome §6 forbids.
 */
export const MAX_SYNC_ATTEMPTS = 6;

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 5 * 60 * 1_000;

/**
 * Exponential backoff with jitter. Jitter is half-range rather than full: full jitter can return a
 * delay near zero, which for a device that just failed to reach the server means retrying
 * immediately and burning battery on a radio that is still down.
 *
 * `random` is injected so the schedule is assertable; production passes `Math.random`.
 */
export function backoffDelayMs(attempts: number, random: () => number = Math.random): number {
  const exponential = Math.min(BASE_DELAY_MS * 2 ** Math.max(0, attempts), MAX_DELAY_MS);
  return Math.round(exponential / 2 + random() * (exponential / 2));
}

/** Whether a mutation's backoff has elapsed. An entry with no `nextAttemptAt` is due. */
export function isDue(m: QueuedMutation, now: number): boolean {
  return m.nextAttemptAt === undefined || m.nextAttemptAt <= now;
}

/** A mutation that has exhausted its attempt budget — surfaced calmly, never dropped. */
export function isExhausted(m: QueuedMutation): boolean {
  return m.attempts >= MAX_SYNC_ATTEMPTS;
}

/**
 * The next batch to send: FIFO over the queue, skipping entries still inside their backoff.
 *
 * Order is insertion order, which for this queue is causal order — a checklist toggle enqueued
 * after a completion is sent after it. §6.4 allows independent kinds to share a batch, so no
 * per-kind partitioning is needed; the server's per-kind rules make each entry independently
 * idempotent.
 */
export function nextBatch(
  queue: readonly QueuedMutation[],
  now: number,
  limit: number = SYNC_BATCH_LIMIT,
): QueuedMutation[] {
  return queue.filter((m) => isDue(m, now)).slice(0, limit);
}

export interface BatchReconciliation {
  /** Mutation ids the server acknowledged — safe to remove from the queue. */
  dequeue: string[];
  /** Mutations the server did not account for; they stay queued with an incremented attempt. */
  retry: QueuedMutation[];
}

/**
 * Reconcile a sent batch against SVC_sync's answer.
 *
 * A CONFLICT counts as acknowledged. §6.3 resolves conflicts by rule rather than by asking —
 * `deduped`, `superseded` and `tombstoned` all mean the server has reached its final state for
 * that mutation, so keeping it queued would retry a decision that has already been made.
 *
 * Anything sent and returned in neither list is treated as unacknowledged and retried. That is the
 * conservative reading: the alternative — assuming success because the HTTP call returned 200 —
 * is how a silently dropped mutation looks from the client, and this queue exists precisely so a
 * completion is never lost.
 */
export function reconcileBatch(
  sent: readonly QueuedMutation[],
  response: SyncResponse,
): BatchReconciliation {
  const acknowledged = new Set<string>([
    ...(response.applied ?? []),
    ...(response.conflicts ?? []).map((c) => c.client_id),
  ]);
  const dequeue: string[] = [];
  const retry: QueuedMutation[] = [];
  for (const m of sent) {
    // Acknowledgement is keyed by client_id (what the server echoes); the queue is keyed by id.
    if (acknowledged.has(m.client_id)) dequeue.push(m.id);
    else retry.push(m);
  }
  return { dequeue, retry };
}

/**
 * Fold a failed or unacknowledged attempt back into a mutation: one more attempt, and a backoff
 * before the next one. Pure, so the schedule can be asserted rather than waited out.
 */
export function withFailedAttempt(
  m: QueuedMutation,
  now: number,
  random: () => number = Math.random,
): QueuedMutation {
  const attempts = m.attempts + 1;
  return { ...m, attempts, nextAttemptAt: now + backoffDelayMs(attempts, random) };
}
