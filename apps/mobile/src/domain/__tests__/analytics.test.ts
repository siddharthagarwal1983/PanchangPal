/**
 * Pure analytics rules (ADR-013, PDD §11.1).
 *
 * Two properties carry the privacy guarantee, and both are asserted here rather than trusted to
 * review: props are primitives only (an object or an array is how an error, a server response, or a
 * user's Ask Guru question would reach the event store), and the event id must come from the
 * documented EVT_* taxonomy — PDD §11 owns that list, and an invented event is a documentation
 * divergence that no schema would catch, since `event_id` is a text column.
 */
import {
  ANALYTICS_BATCH_SIZE,
  ANALYTICS_QUEUE_LIMIT,
  buildEnvelope,
  enqueue,
  isEventId,
  sanitizeProps,
  shouldFlush,
} from '../analytics';

const NOW = new Date('2026-07-25T09:30:00.000Z');

describe('isEventId', () => {
  it('accepts documented EVT_* ids and rejects anything else', () => {
    expect(isEventId('EVT_017')).toBe(true);
    expect(isEventId('EVT_054')).toBe(true);
    expect(isEventId('EVT_999')).toBe(false);
    expect(isEventId('ritual_complete')).toBe(false);
    expect(isEventId(undefined)).toBe(false);
  });
});

describe('sanitizeProps', () => {
  it('keeps primitives, including null and falsy values', () => {
    expect(sanitizeProps({ a: 'x', b: 2, c: true, d: false, e: 0, f: '', g: null })).toEqual({
      a: 'x',
      b: 2,
      c: true,
      d: false,
      e: 0,
      f: '',
      g: null,
    });
  });

  it('drops objects and arrays — the way user content would otherwise arrive', () => {
    const props = {
      kept: 'yes',
      error: new Error('user@example.com not found') as unknown as string,
      payload: { question: 'about my health' } as unknown as string,
      list: ['a', 'b'] as unknown as string,
    };
    expect(sanitizeProps(props)).toEqual({ kept: 'yes' });
  });

  it('drops undefined rather than recording an absent value', () => {
    expect(sanitizeProps({ a: undefined as unknown as string, b: 1 })).toEqual({ b: 1 });
  });

  it('returns an empty object for no props', () => {
    expect(sanitizeProps(undefined)).toEqual({});
  });
});

describe('buildEnvelope', () => {
  it('produces the §11.1 envelope, matching the analytics_event columns', () => {
    const envelope = buildEnvelope({
      eventId: 'EVT_017',
      userPseudoId: 'pseudo-1',
      householdId: 'house-1',
      sessionId: 'sess-1',
      props: { steps: 5 },
      now: NOW,
    });

    expect(envelope).toEqual({
      event_id: 'EVT_017',
      user_pseudo_id: 'pseudo-1',
      household_id: 'house-1',
      session_id: 'sess-1',
      ts: '2026-07-25T09:30:00.000Z',
      props: { steps: 5 },
    });
  });

  it('defaults household and session to null rather than omitting them', () => {
    const envelope = buildEnvelope({ eventId: 'EVT_012', userPseudoId: 'p', now: NOW });
    expect(envelope.household_id).toBeNull();
    expect(envelope.session_id).toBeNull();
  });

  it('rejects an event id outside the taxonomy — PDD §11 owns that list', () => {
    expect(() =>
      buildEnvelope({ eventId: 'EVT_777' as 'EVT_017', userPseudoId: 'p', now: NOW }),
    ).toThrow(/Unknown analytics event id/);
  });

  it('sanitizes props on the way into the envelope', () => {
    const envelope = buildEnvelope({
      eventId: 'EVT_054',
      userPseudoId: 'p',
      props: { code: 'ERR_OFFLINE', raw: { secret: 1 } as unknown as string },
      now: NOW,
    });
    expect(envelope.props).toEqual({ code: 'ERR_OFFLINE' });
  });
});

describe('batching', () => {
  it('flushes at the batch size, not before', () => {
    expect(shouldFlush(ANALYTICS_BATCH_SIZE - 1)).toBe(false);
    expect(shouldFlush(ANALYTICS_BATCH_SIZE)).toBe(true);
  });

  it('appends within the cap', () => {
    expect(enqueue([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('drops the OLDEST events on overflow, keeping the most recent', () => {
    const full = Array.from({ length: ANALYTICS_QUEUE_LIMIT }, (_, i) => i);
    const next = enqueue(full, 9999);

    expect(next).toHaveLength(ANALYTICS_QUEUE_LIMIT);
    expect(next.at(-1)).toBe(9999);
    expect(next[0]).toBe(1); // the original 0 was dropped
  });
});
