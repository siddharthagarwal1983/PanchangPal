/**
 * A queued mutation belongs to the identity that made it (`isSendableBy`).
 *
 * WHAT THIS PREVENTS, and it is two things. The obvious one: a pending change draining onto
 * someone else's account after a fresh anonymous uid is minted — the M1/M9 defect
 * `secureSessionStorage.ts` exists to prevent, which this app cannot assume never recurs.
 *
 * The subtle one matters more for the suite's trustworthiness. `FLOW_AUTH_SESSION_PERSISTENCE`
 * proves identity survived a restart by reading back a tradition only that identity could have
 * written. Once preferences are durably queued, a drain that ignored identity would RECREATE that
 * value under the new uid — so the flow would pass at the exact moment the defect it guards
 * occurred. A false green on the one flow nobody may dismiss.
 */
import { isSendableBy, nextBatch, type QueuedMutation } from '..';

const ALICE = 'alice-uid';
const BOB = 'bob-uid';

function queued(over: Partial<QueuedMutation> = {}): QueuedMutation {
  return {
    id: 'm1',
    kind: 'preferences',
    payload: { tradition_code: 'bengali' },
    client_id: 'm1',
    local_ts: '2026-07-28T07:30:00.000Z',
    attempts: 0,
    user_id: ALICE,
    ...over,
  };
}

describe('isSendableBy', () => {
  it('sends a mutation under the identity that made it', () => {
    expect(isSendableBy(queued(), ALICE)).toBe(true);
  });

  it('HOLDS a mutation when a different identity is signed in', () => {
    expect(isSendableBy(queued(), BOB)).toBe(false);
  });

  it('sends an entry from an older build that carries no identity', () => {
    // Those entries were queued under the previous behaviour; stranding them would discard a
    // completion, which §6 forbids. Absent means "unknown", not "someone else's".
    expect(isSendableBy(queued({ user_id: undefined }), ALICE)).toBe(true);
  });

  it('sends when the current identity is not yet known', () => {
    // A cold start drains before the session resolves. Refusing everything here would strand the
    // queue behind a value that arrives moments later.
    expect(isSendableBy(queued(), null)).toBe(true);
    expect(isSendableBy(queued(), undefined)).toBe(true);
  });
});

describe('nextBatch identity scoping', () => {
  it('excludes another identity’s mutations from the batch', () => {
    const batch = nextBatch(
      [queued({ id: 'a', user_id: ALICE }), queued({ id: 'b', user_id: BOB })],
      Date.now(),
      25,
      ALICE,
    );
    expect(batch.map((m) => m.id)).toEqual(['a']);
  });

  it('HOLDS rather than drops — the held entry is still in the queue', () => {
    // The distinction is the whole point: "belongs to someone else right now" is not "invalid".
    // If Alice's session is restored, her mutation must still be there to send.
    const queue = [queued({ id: 'a', user_id: ALICE }), queued({ id: 'b', user_id: BOB })];
    expect(nextBatch(queue, Date.now(), 25, BOB).map((m) => m.id)).toEqual(['b']);
    expect(nextBatch(queue, Date.now(), 25, ALICE).map((m) => m.id)).toEqual(['a']);
    expect(queue).toHaveLength(2);
  });

  it('is unchanged when no identity is supplied, so existing callers keep working', () => {
    const queue = [queued({ id: 'a', user_id: ALICE }), queued({ id: 'b', user_id: BOB })];
    expect(nextBatch(queue, Date.now()).map((m) => m.id)).toEqual(['a', 'b']);
  });
});
