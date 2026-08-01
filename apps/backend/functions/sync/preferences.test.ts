/**
 * The `preferences` sync kind (§6.6) — its conflict rule and, more importantly, the column
 * allowlist standing between a client-supplied payload and an upsert running as the SERVICE ROLE.
 */
import { describe, it, expect } from 'vitest';
import { resolvePreferences, type Mutation } from './logic';
import { SyncRepository } from '../_shared/db/syncRepo';

const mut = (over: Partial<Mutation> = {}): Mutation => ({
  kind: 'preferences',
  payload: { tradition_code: 'bengali' },
  client_id: 'c1',
  local_ts: '2026-07-12T06:00:00Z',
  ...over,
});

describe('resolvePreferences', () => {
  it('applies a change with no existing row', () => {
    expect(resolvePreferences(mut(), null)).toEqual({ client_id: 'c1', resolution: 'applied' });
  });

  it('applies a change newer than the stored one', () => {
    expect(resolvePreferences(mut(), '2026-07-12T05:00:00Z').resolution).toBe('applied');
  });

  it('supersedes a change older than the stored one — last writer wins', () => {
    // Two devices, or one device draining a stale offline edit after a newer one landed.
    expect(resolvePreferences(mut(), '2026-07-12T07:00:00Z').resolution).toBe('superseded');
  });

  it('treats an equal timestamp as superseded, so a redelivery cannot reorder', () => {
    expect(resolvePreferences(mut(), '2026-07-12T06:00:00Z').resolution).toBe('superseded');
  });
});

/** Captures what would have been written, so the allowlist is asserted on the actual row. */
function fakeDb() {
  const calls: { table: string; row: Record<string, unknown> }[] = [];
  return {
    calls,
    from(table: string) {
      return {
        upsert(row: Record<string, unknown>) {
          calls.push({ table, row });
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

describe('SyncRepository.updatePreferences — the column allowlist', () => {
  const CALLER = '11111111-1111-1111-1111-111111111111';
  const VICTIM = '22222222-2222-2222-2222-222222222222';

  it('writes the recognised preference columns', async () => {
    const db = fakeDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo = new SyncRepository(db as any);
    await repo.updatePreferences(
      CALLER,
      { tradition_code: 'bengali', city: 'Sydney' },
      '2026-07-12T06:00:00Z',
    );
    expect(db.calls).toHaveLength(1);
    expect(db.calls[0].table).toBe('user_profile');
    expect(db.calls[0].row).toMatchObject({
      tradition_code: 'bengali',
      city: 'Sydney',
      user_id: CALLER,
    });
  });

  it('CANNOT be redirected to another user by the payload', async () => {
    // The SVC_account defect in a new place: this function runs with the service role, so RLS is
    // not a backstop. A payload naming its own subject must not win. Remove the allowlist — or
    // assign user_id before the spread — and this test fails.
    const db = fakeDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo = new SyncRepository(db as any);
    await repo.updatePreferences(
      CALLER,
      { user_id: VICTIM, tradition_code: 'bengali' },
      '2026-07-12T06:00:00Z',
    );
    expect(db.calls[0].row.user_id).toBe(CALLER);
  });

  it('drops columns outside the preference set', async () => {
    const db = fakeDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo = new SyncRepository(db as any);
    await repo.updatePreferences(
      CALLER,
      { tradition_code: 'bengali', notif_prefs: { push: true }, locale: 'xx-XX' },
      '2026-07-12T06:00:00Z',
    );
    expect(db.calls[0].row).not.toHaveProperty('notif_prefs');
    expect(db.calls[0].row).not.toHaveProperty('locale');
  });

  it('writes nothing at all when no column is recognised', async () => {
    // An entry from a future or corrupted build. Acknowledging it beats retrying it forever, and
    // an upsert of {user_id} alone would pointlessly touch the row.
    const db = fakeDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo = new SyncRepository(db as any);
    await repo.updatePreferences(CALLER, { something_else: 1 }, '2026-07-12T06:00:00Z');
    expect(db.calls).toHaveLength(0);
  });

  it('stamps updated_at from the mutation, not from server receipt time', async () => {
    // The ordering the conflict rule reads must be the user's own edit order, not whichever
    // entry happened to drain first.
    const db = fakeDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo = new SyncRepository(db as any);
    await repo.updatePreferences(CALLER, { tradition_code: 'bengali' }, '2026-07-12T06:00:00Z');
    expect(db.calls[0].row.updated_at).toBe('2026-07-12T06:00:00Z');
  });
});
