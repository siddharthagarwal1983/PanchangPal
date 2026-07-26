import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  MAX_SYNC_ATTEMPTS,
  SYNCABLE_KINDS,
  SYNC_BATCH_LIMIT,
  backoffDelayMs,
  isDue,
  isExhausted,
  nextBatch,
  reconcileBatch,
  withFailedAttempt,
  type QueuedMutation,
} from '../sync';

function mutation(overrides: Partial<QueuedMutation> = {}): QueuedMutation {
  return {
    id: overrides.id ?? 'm1',
    kind: overrides.kind ?? 'ritual_complete',
    payload: overrides.payload ?? { ritual_id: 'r1', local_date: '2026-07-26' },
    client_id: overrides.client_id ?? overrides.id ?? 'm1',
    local_ts: overrides.local_ts ?? '2026-07-26T06:00:00.000Z',
    attempts: overrides.attempts ?? 0,
    nextAttemptAt: overrides.nextAttemptAt,
  };
}

describe('backoffDelayMs', () => {
  it('grows exponentially with attempts', () => {
    const half = () => 0.5;
    const delays = [0, 1, 2, 3].map((a) => backoffDelayMs(a, half));
    expect(delays).toEqual([...delays].sort((x, y) => x - y));
    expect(new Set(delays).size).toBe(delays.length);
  });

  it('never returns a near-zero delay, whatever the jitter', () => {
    // Full jitter can return ~0, which for a device that just failed to reach the server means
    // retrying instantly against a radio that is still down. Half-range jitter keeps a floor.
    expect(backoffDelayMs(0, () => 0)).toBeGreaterThan(0);
    expect(backoffDelayMs(3, () => 0)).toBeGreaterThanOrEqual(backoffDelayMs(2, () => 1) / 2);
  });

  it('caps the delay so a long-offline queue still retries within minutes', () => {
    expect(backoffDelayMs(50, () => 1)).toBeLessThanOrEqual(5 * 60 * 1000);
  });

  it('stays within the jittered band', () => {
    const low = backoffDelayMs(4, () => 0);
    const high = backoffDelayMs(4, () => 1);
    expect(high).toBeGreaterThan(low);
    expect(high).toBeLessThanOrEqual(2 * low);
  });
});

describe('nextBatch', () => {
  it('is FIFO, preserving the order actions happened in', () => {
    const queue = [mutation({ id: 'a' }), mutation({ id: 'b' }), mutation({ id: 'c' })];
    expect(nextBatch(queue, 1_000).map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('skips mutations still inside their backoff', () => {
    const queue = [
      mutation({ id: 'a', nextAttemptAt: 5_000 }),
      mutation({ id: 'b', nextAttemptAt: 500 }),
    ];
    expect(nextBatch(queue, 1_000).map((m) => m.id)).toEqual(['b']);
  });

  it('treats an entry with no nextAttemptAt as due', () => {
    // Entries written before this field existed must not be stranded forever.
    expect(isDue(mutation({ nextAttemptAt: undefined }), 0)).toBe(true);
  });

  it('bounds the batch', () => {
    const queue = Array.from({ length: SYNC_BATCH_LIMIT + 10 }, (_, i) => mutation({ id: `m${i}` }));
    expect(nextBatch(queue, 1_000)).toHaveLength(SYNC_BATCH_LIMIT);
  });
});

describe('reconcileBatch', () => {
  it('retires what the server applied', () => {
    const sent = [mutation({ id: 'a', client_id: 'ca' }), mutation({ id: 'b', client_id: 'cb' })];
    const result = reconcileBatch(sent, { applied: ['ca', 'cb'], conflicts: [] });
    expect(result.dequeue).toEqual(['a', 'b']);
    expect(result.retry).toEqual([]);
  });

  it('treats a conflict as acknowledged, not as a failure', () => {
    // §6.3 resolves conflicts by rule. `deduped` means the server has reached its final state for
    // that mutation, so keeping it queued would retry a decision already made.
    const sent = [mutation({ id: 'a', client_id: 'ca' })];
    const result = reconcileBatch(sent, {
      applied: [],
      conflicts: [{ client_id: 'ca', resolution: 'deduped' }],
    });
    expect(result.dequeue).toEqual(['a']);
    expect(result.retry).toEqual([]);
  });

  it('retries anything the server accounted for in neither list', () => {
    // The conservative reading, and the whole reason this queue exists: a 200 that silently
    // dropped a mutation must not look like success. This is exactly what SVC_sync does today
    // for a kind it has no branch for.
    const sent = [mutation({ id: 'a', client_id: 'ca' }), mutation({ id: 'b', client_id: 'cb' })];
    const result = reconcileBatch(sent, { applied: ['ca'], conflicts: [] });
    expect(result.dequeue).toEqual(['a']);
    expect(result.retry.map((m) => m.id)).toEqual(['b']);
  });

  it('matches on client_id, which is what the server echoes', () => {
    const sent = [mutation({ id: 'queue-id', client_id: 'echoed-id' })];
    expect(reconcileBatch(sent, { applied: ['echoed-id'], conflicts: [] }).dequeue).toEqual([
      'queue-id',
    ]);
  });

  it('survives a response missing either list', () => {
    const sent = [mutation({ id: 'a', client_id: 'ca' })];
    const result = reconcileBatch(sent, {} as never);
    expect(result.retry.map((m) => m.id)).toEqual(['a']);
  });
});

describe('withFailedAttempt', () => {
  it('counts the attempt and schedules the retry into the future', () => {
    const next = withFailedAttempt(mutation({ attempts: 1 }), 10_000, () => 0.5);
    expect(next.attempts).toBe(2);
    expect(next.nextAttemptAt).toBeGreaterThan(10_000);
  });

  it('does not mutate its input', () => {
    const original = mutation({ attempts: 0 });
    withFailedAttempt(original, 0, () => 0.5);
    expect(original.attempts).toBe(0);
    expect(original.nextAttemptAt).toBeUndefined();
  });

  it('marks a mutation exhausted only after the attempt budget', () => {
    let m = mutation();
    for (let i = 0; i < MAX_SYNC_ATTEMPTS - 1; i++) m = withFailedAttempt(m, i, () => 0.5);
    expect(isExhausted(m)).toBe(false);
    m = withFailedAttempt(m, 99, () => 0.5);
    expect(isExhausted(m)).toBe(true);
  });
});

describe('the syncable-kind contract', () => {
  it('lists exactly the kinds SVC_sync has a branch for', () => {
    // The defect this pins: the client queued five kinds and the server switched on three, so a
    // `preferences` entry was logged as `sync_unknown_kind`, returned in neither list, and could
    // never be retired — an entry in durable storage that nothing could remove.
    //
    // Read from the handler's source rather than restated, so the two cannot drift apart silently.
    // A restated constant would agree with itself forever.
    const handler = readFileSync(
      resolve(__dirname, '../../../../../apps/backend/functions/sync/index.ts'),
      'utf8',
    );
    const serverKinds = [...handler.matchAll(/case '([a-z_]+)':/g)].map((m) => m[1]).sort();
    expect(serverKinds).toEqual([...SYNCABLE_KINDS].sort());
  });
});
