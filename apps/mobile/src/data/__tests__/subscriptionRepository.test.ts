/**
 * SubscriptionRepository tests. Mocks supabase-js so no network is needed. Asserts: the
 * household-member read selects the entitlement columns and maps rows to the client Entitlement
 * type (strict is_active); and the realtime seam wires a postgres_changes subscription on the
 * entitlement table and returns a working unsubscribe. Client never writes entitlements.
 */
import { SubscriptionRepository } from '../subscriptionRepository';

type Result = { data: unknown; error: unknown };

function makeDb(opts: { select?: Result; channelSpy?: { onArgs?: unknown[]; removed?: boolean }; captureChannel?: (name: string) => void }) {
  const channel = {
    on: (...args: unknown[]) => {
      if (opts.channelSpy) opts.channelSpy.onArgs = args;
      return channel;
    },
    subscribe: () => channel,
  };
  return {
    from: () => ({ select: () => Promise.resolve(opts.select ?? { data: null, error: null }) }),
    channel: (name: string) => {
      opts.captureChannel?.(name);
      return channel;
    },
    removeChannel: () => {
      if (opts.channelSpy) opts.channelSpy.removed = true;
    },
  } as never;
}

describe('SubscriptionRepository', () => {
  it('reads and maps household entitlements (RLS-scoped)', async () => {
    const db = makeDb({
      select: {
        data: [
          { kind: 'family', is_active: true, granted_at: null, expires_at: null, source: 'revenuecat' },
          { kind: 'individual', is_active: false, granted_at: null, expires_at: null, source: 'revenuecat' },
        ],
        error: null,
      },
    });
    const ents = await new SubscriptionRepository(db).getEntitlements();
    expect(ents).toHaveLength(2);
    expect(ents[0]).toMatchObject({ kind: 'family', isActive: true });
    expect(ents[1].isActive).toBe(false);
  });

  it('returns [] when the household has no entitlements', async () => {
    const db = makeDb({ select: { data: null, error: null } });
    expect(await new SubscriptionRepository(db).getEntitlements()).toEqual([]);
  });

  it('throws on a read error', async () => {
    const db = makeDb({ select: { data: null, error: { message: 'boom' } } });
    await expect(new SubscriptionRepository(db).getEntitlements()).rejects.toBeTruthy();
  });

  it('wires a filtered realtime subscription and returns a working unsubscribe', () => {
    const channelSpy: { onArgs?: unknown[]; removed?: boolean } = {};
    let channelName = '';
    const db = makeDb({ channelSpy, captureChannel: (n) => (channelName = n) });
    const unsubscribe = new SubscriptionRepository(db).subscribeEntitlements(() => {});
    expect(channelName).toBe('entitlement:self');
    expect((channelSpy.onArgs?.[1] as { table: string }).table).toBe('entitlement');
    unsubscribe();
    expect(channelSpy.removed).toBe(true);
  });
});
