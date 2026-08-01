/**
 * The durable queue projected onto a cached read model (§6.1/§6.3).
 *
 * These are the rules behind the launch blocker `FLOW_OFFLINE_SYNC` catches: a completion made
 * offline must still be SHOWN after the process is killed, not merely still be queued.
 */
import {
  applyPendingCompletions,
  pendingChecklistDates,
  pendingChecklistItemIds,
  type QueuedMutation,
} from '..';

function checklistMutation(itemId: string, localDate: string, id = `m-${itemId}`): QueuedMutation {
  return {
    id,
    kind: 'checklist',
    payload: { item_id: itemId, local_date: localDate },
    client_id: id,
    local_ts: '2026-07-28T07:30:00.000Z',
    attempts: 0,
  };
}

describe('pendingChecklistItemIds', () => {
  it('finds the completion a user made offline', () => {
    const queue = [checklistMutation('item-1', '2026-07-28')];
    expect(pendingChecklistItemIds(queue, '2026-07-28')).toEqual(new Set(['item-1']));
  });

  it('ignores completions recorded against another day', () => {
    // A queue can outlive a day boundary: a mutation made last night must not tick today's list.
    const queue = [checklistMutation('item-1', '2026-07-27')];
    expect(pendingChecklistItemIds(queue, '2026-07-28').size).toBe(0);
  });

  it('ignores other mutation kinds', () => {
    const queue: QueuedMutation[] = [
      {
        id: 'r1',
        kind: 'ritual_complete',
        payload: { ritual_id: 'r', local_date: '2026-07-28' },
        client_id: 'r1',
        local_ts: '2026-07-28T07:30:00.000Z',
        attempts: 0,
      },
    ];
    expect(pendingChecklistItemIds(queue, '2026-07-28').size).toBe(0);
  });

  it('returns nothing when the local date is not yet known', () => {
    // ADR-026: the day is null until the time zone resolves, and guessing it would project a
    // completion onto the wrong date — the defect issue #30 already cost this project.
    const queue = [checklistMutation('item-1', '2026-07-28')];
    expect(pendingChecklistItemIds(queue, null).size).toBe(0);
  });

  it('skips an entry whose payload is not the shape this version writes', () => {
    // Restored from an older persisted queue. Skipping costs a projection; throwing costs a launch.
    const queue = [
      { ...checklistMutation('item-1', '2026-07-28'), payload: { item_id: 42 } },
      checklistMutation('item-2', '2026-07-28'),
    ] as QueuedMutation[];
    expect(pendingChecklistItemIds(queue, '2026-07-28')).toEqual(new Set(['item-2']));
  });
});

describe('pendingChecklistDates', () => {
  it('reports each distinct day exactly once', () => {
    const queue = [
      checklistMutation('item-1', '2026-07-28', 'a'),
      checklistMutation('item-2', '2026-07-28', 'b'),
      checklistMutation('item-3', '2026-07-27', 'c'),
    ];
    expect(pendingChecklistDates(queue).sort()).toEqual(['2026-07-27', '2026-07-28']);
  });
});

describe('applyPendingCompletions', () => {
  const items = [
    { id: 'item-1', label: 'Light the lamp', complete: false },
    { id: 'item-2', label: 'Offer water', complete: false },
  ];

  it('marks a pending item complete and leaves the rest alone', () => {
    const next = applyPendingCompletions(items, new Set(['item-1']));
    expect(next).toEqual([
      { id: 'item-1', label: 'Light the lamp', complete: true },
      { id: 'item-2', label: 'Offer water', complete: false },
    ]);
  });

  it('never un-completes: the queue can only express a completion (§6.6 union)', () => {
    const done = [{ id: 'item-1', label: 'Light the lamp', complete: true }];
    expect(applyPendingCompletions(done, new Set())).toEqual(done);
  });

  it('returns the same reference when nothing changes, so an unchanged cache costs no write', () => {
    expect(applyPendingCompletions(items, new Set())).toBe(items);
    expect(applyPendingCompletions(items, new Set(['unknown-id']))).toBe(items);
  });
});
