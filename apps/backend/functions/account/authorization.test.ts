/**
 * SVC_account authorization (B6.2, found by the OWASP Mobile review — M3 Insecure Authorization).
 *
 * These are the tests that would have caught the original defect. Before this change the handler
 * read the acting identity from the REQUEST BODY while running with the service role, so RLS was
 * not a backstop:
 *
 *   POST /account/delete {"user_id": "<victim>"}                      → deleted anyone
 *   POST /account/merge  {"anon_uid": "<victim>", "auth_uid": "<me>"} → reassigned a victim's
 *                                                                       owned rows to the caller,
 *                                                                       who then read them under
 *                                                                       ordinary RLS
 *
 * Anonymous sign-in is enabled, so any attacker can mint a valid JWT for free, and household member
 * lists expose `user_id` — co-members were directly targetable.
 *
 * The invariant under test is narrow and worth stating plainly: **no uid in a request body may ever
 * influence which rows this function touches.** Each test supplies a hostile body and asserts the
 * caller's own uid is what reaches the repository.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const CALLER = '11111111-1111-4111-8111-111111111111';
const VICTIM = '22222222-2222-4222-8222-222222222222';
const ANON = '33333333-3333-4333-8333-333333333333';

/** Records every uid the handler acts on, so a test can assert the victim's never appears. */
interface RepoCalls {
  scheduleDeletion: string[];
  reassign: Array<{ from: string; to: string }>;
  exported: string[];
  sweeps: number;
}

function makeRepo(calls: RepoCalls, tokens: Record<string, string>) {
  return {
    currentUserId: vi.fn(async (jwt: string) => {
      const uid = tokens[jwt];
      if (!uid) throw new Error('auth_getUser_failed');
      return uid;
    }),
    getStreakLen: vi.fn(async () => 0),
    getActiveHousehold: vi.fn(async () => null),
    countOtherActiveMembers: vi.fn(async () => 0),
    scheduleDeletion: vi.fn(async (userId: string) => void calls.scheduleDeletion.push(userId)),
    reassignOwnership: vi.fn(async (from: string, to: string) => void calls.reassign.push({ from, to })),
    exportOwnedRows: vi.fn(async (userId: string) => {
      calls.exported.push(userId);
      return { user_profile: [{ user_id: userId }] };
    }),
    sweepDueDeletions: vi.fn(async () => {
      calls.sweeps += 1;
      return { deleted: 2, blocked: 1 };
    }),
  };
}

let calls: RepoCalls;
let repo: ReturnType<typeof makeRepo>;

// The handler builds its own repository from a service client; swap both for the fakes above.
vi.mock('../_shared/supabase.ts', () => ({ serviceClient: () => ({}) }));
vi.mock('../_shared/env.ts', () => ({ readEnv: () => ({}) }));
vi.mock('../_shared/db/accountRepo.ts', () => ({
  AccountRepository: class {
    constructor() {
      return repo as unknown as object;
    }
  },
}));

const { handler } = await import('./index.ts');

/**
 * The handler reads ACCOUNT_SWEEP_SECRET through Deno.env, which does not exist under Vitest.
 * Stubbing it here rather than mocking the module keeps the handler's own env lookup under test —
 * including the case that matters most, where the variable is simply not set.
 */
const setSweepSecret = (v: string | undefined): void => {
  (globalThis as unknown as { Deno?: { env: { get: () => string } } }).Deno =
    v === undefined ? undefined : { env: { get: () => v } };
};

const postSweep = (secret?: string) =>
  handler(
    new Request('https://x/account/sweep', {
      method: 'POST',
      headers: {
        authorization: 'Bearer caller-token',
        ...(secret === undefined ? {} : { 'x-panchangpal-sweep-secret': secret }),
      },
      body: '{}',
    }),
  );

const post = (action: string, body: unknown, jwt = 'caller-token') =>
  handler(
    new Request(`https://x/account/${action}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${jwt}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  calls = { scheduleDeletion: [], reassign: [], exported: [], sweeps: 0 };
  setSweepSecret(undefined);
  repo = makeRepo(calls, { 'caller-token': CALLER, 'anon-token': ANON, 'victim-token': VICTIM });
});

describe('SVC_account — the body can never choose the acting user', () => {
  it('delete ignores a body user_id and deletes only the caller', async () => {
    const res = await post('delete', { user_id: VICTIM });

    expect(res.status).toBe(200);
    expect(calls.scheduleDeletion).toEqual([CALLER]);
    expect(calls.scheduleDeletion).not.toContain(VICTIM);
  });

  it('export ignores a body user_id and returns only the caller rows', async () => {
    const res = await post('export', { user_id: VICTIM });
    const payload = (await res.json()) as { user_id: string; format: string };

    expect(calls.exported).toEqual([CALLER]);
    expect(payload.user_id).toBe(CALLER);
    // The envelope is versioned because F-10 is unratified; a consumer must be able to tell.
    expect(payload.format).toBe('panchangpal.export.v1');
  });

  it('merge ignores a body auth_uid — the caller is always the merge target', async () => {
    await post('merge', { auth_uid: VICTIM, anon_access_token: 'anon-token' });

    expect(calls.reassign).toEqual([{ from: ANON, to: CALLER }]);
  });

  it('merge refuses a bare anon_uid — a uid is a claim, not proof of ownership', async () => {
    // The original exploit: naming a victim's uid pulled their rows into the caller's account.
    const res = await post('merge', { anon_uid: VICTIM });

    expect(res.status).toBe(422);
    expect(calls.reassign).toEqual([]);
  });

  it('merge refuses an anon token that does not verify', async () => {
    const res = await post('merge', { anon_access_token: 'forged-token' });

    expect(res.status).toBe(401);
    expect(calls.reassign).toEqual([]);
  });

  it('merge refuses to merge an account into itself', async () => {
    const res = await post('merge', { anon_access_token: 'caller-token' });

    expect(res.status).toBe(422);
    expect(calls.reassign).toEqual([]);
  });

  it('a request with no bearer token is rejected before any repository call', async () => {
    const res = await handler(
      new Request('https://x/account/export', { method: 'POST', body: '{}' }),
    );

    expect(res.status).toBe(401);
    expect(calls.exported).toEqual([]);
  });
});

/**
 * The deletion sweep erases accounts, so its authorization is held to the same standard as the
 * rest of this file: assume the caller is hostile and holds a valid token, because anonymous
 * sign-in means they can always get one.
 */
describe('SVC_account sweep — a user token is never enough to erase accounts', () => {
  it('refuses when no sweep secret is configured, even with a valid bearer token', async () => {
    // The important one. An unconfigured secret must fail closed; treating it as "not protected
    // yet" would leave a public endpoint that deletes accounts.
    const res = await postSweep('anything');

    expect(res.status).toBe(401);
    expect(calls.sweeps).toBe(0);
  });

  it('refuses a valid bearer token with no sweep secret header', async () => {
    setSweepSecret('right-secret');
    const res = await postSweep(undefined);

    expect(res.status).toBe(401);
    expect(calls.sweeps).toBe(0);
  });

  it('refuses a wrong sweep secret', async () => {
    setSweepSecret('right-secret');
    const res = await postSweep('wrong-secret');

    expect(res.status).toBe(401);
    expect(calls.sweeps).toBe(0);
  });

  it('runs the sweep for a correct secret and reports counts, never subjects', async () => {
    setSweepSecret('right-secret');
    const res = await postSweep('right-secret');
    const payload = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(calls.sweeps).toBe(1);
    expect(payload).toEqual({ deleted: 2, blocked: 1 });
    // No uid, no table name, no list of who was erased: an erasure record that names its subjects
    // keeps exactly the data the erasure removed.
    expect(JSON.stringify(payload)).not.toContain(CALLER);
  });
});
