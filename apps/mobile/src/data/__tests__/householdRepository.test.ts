/**
 * HouseholdRepository tests. Mocks supabase-js so no network is needed. Asserts: RLS-scoped read
 * maps to the domain Household; member/invite writes call the SVC_household Edge Function with the
 * documented action + body; invite/accept responses map to the client shape; and the realtime
 * seam wires a filtered postgres_changes subscription and returns a working unsubscribe.
 */
import { HouseholdRepository } from '../householdRepository';

type Result = { data: unknown; error: unknown };

function makeDb(opts: {
  select?: Result;
  invoke?: Result;
  captureInvoke?: (path: string, options: { method?: string; body?: unknown }) => void;
  channelSpy?: { onArgs?: unknown[]; removed?: boolean };
}) {
  const selectBuilder: Record<string, unknown> = {};
  selectBuilder.select = () => selectBuilder;
  selectBuilder.maybeSingle = () => Promise.resolve(opts.select ?? { data: null, error: null });

  const channel = {
    on: (...args: unknown[]) => {
      if (opts.channelSpy) opts.channelSpy.onArgs = args;
      return channel;
    },
    subscribe: () => channel,
  };

  return {
    from: () => selectBuilder,
    functions: {
      invoke: (path: string, options: { method?: string; body?: unknown } = {}) => {
        opts.captureInvoke?.(path, options);
        return Promise.resolve(opts.invoke ?? { data: null, error: null });
      },
    },
    channel: () => channel,
    removeChannel: () => {
      if (opts.channelSpy) opts.channelSpy.removed = true;
    },
  } as never;
}

describe('HouseholdRepository', () => {
  it('reads and maps the caller household (RLS-scoped)', async () => {
    const db = makeDb({
      select: { data: { id: 'h1', name: 'Home', owner_id: 'u1', tradition_code: 'generic', members: [] }, error: null },
    });
    const hh = await new HouseholdRepository(db).getHousehold();
    expect(hh).toMatchObject({ id: 'h1', name: 'Home', ownerId: 'u1' });
  });

  it('returns null when the user has no household', async () => {
    const db = makeDb({ select: { data: null, error: null } });
    expect(await new HouseholdRepository(db).getHousehold()).toBeNull();
  });

  it('adds a member via the OpenAPI path with a snake_case body', async () => {
    const calls: Array<{ path: string; options: { method?: string; body?: unknown } }> = [];
    const db = makeDb({
      invoke: { data: { id: 'h1', name: 'Home', owner_id: 'u1', tradition_code: 'generic', members: [] }, error: null },
      captureInvoke: (path, options) => calls.push({ path, options }),
    });
    await new HouseholdRepository(db).addMember('h1', { displayName: 'Nani', role: 'elder', depth: 'deep' });
    expect(calls[0].path).toBe('household/member');
    expect(calls[0].options.body).toEqual({ household_id: 'h1', display_name: 'Nani', role: 'elder', depth: 'deep' });
  });

  it('removes a member via DELETE on the member path', async () => {
    const calls: Array<{ path: string; options: { method?: string; body?: unknown } }> = [];
    const db = makeDb({
      invoke: { data: { id: 'h1', name: 'Home', owner_id: 'u1', tradition_code: 'generic', members: [] }, error: null },
      captureInvoke: (path, options) => calls.push({ path, options }),
    });
    await new HouseholdRepository(db).removeMember('m9');
    expect(calls[0].path).toBe('household/member/m9');
    expect(calls[0].options.method).toBe('DELETE');
  });

  it('maps a created invite to the client shape', async () => {
    const db = makeDb({ invoke: { data: { token: 'tok', url: 'https://x/i/tok', expires_at: '2026-07-20T00:00:00Z' }, error: null } });
    const invite = await new HouseholdRepository(db).createInvite('h1');
    expect(invite).toEqual({ token: 'tok', url: 'https://x/i/tok', expiresAt: '2026-07-20T00:00:00Z' });
  });

  it('maps an accepted invite (household id + optional switched_from)', async () => {
    const db = makeDb({ invoke: { data: { household_id: 'h2', switched_from: 'h1' }, error: null } });
    const res = await new HouseholdRepository(db).acceptInvite({ token: 'tok', idempotencyKey: 'k' });
    expect(res).toEqual({ householdId: 'h2', switchedFrom: 'h1' });
  });

  it('propagates SVC errors', async () => {
    const db = makeDb({ invoke: { data: null, error: new Error('rls denied') } });
    await expect(new HouseholdRepository(db).removeMember('m1')).rejects.toThrow('rls denied');
  });

  it('wires a filtered realtime subscription and a working unsubscribe', () => {
    const spy: { onArgs?: unknown[]; removed?: boolean } = {};
    const db = makeDb({ channelSpy: spy });
    const unsub = new HouseholdRepository(db).subscribeMembers('h1', () => {});
    const filter = (spy.onArgs?.[1] as { table: string; filter: string });
    expect(filter.table).toBe('household_member');
    expect(filter.filter).toBe('household_id=eq.h1');
    unsub();
    expect(spy.removed).toBe(true);
  });
});
</content>
