/**
 * ProfileRepository tests (API_GET/PATCH_PREFERENCES). Mocks supabase-js so no network is
 * needed. Asserts: owner-only select maps to Preferences; a missing row yields defaults;
 * upsert writes only the changed columns keyed by user_id; errors propagate.
 */
import { ProfileRepository } from '../profileRepository';
import { DEFAULT_PREFERENCES } from '../../domain/profile';

type Result = { data: unknown; error: unknown };

function makeDb(result: Result, capture?: (op: string, arg?: unknown) => void) {
  const builder: Record<string, unknown> = {};
  const chain = (op: string) => (arg?: unknown) => {
    capture?.(op, arg);
    return builder;
  };
  builder.select = chain('select');
  builder.eq = chain('eq');
  builder.upsert = chain('upsert');
  builder.maybeSingle = () => Promise.resolve(result);
  return { from: (table: string) => (capture?.('from', table), builder) } as never;
}

describe('ProfileRepository', () => {
  it('reads owner preferences and maps to the client shape', async () => {
    const db = makeDb({ data: { tradition_code: 'bengali', content_depth: 'deep', appearance: 'dark' }, error: null });
    const prefs = await new ProfileRepository(db).getPreferences('user-1');
    expect(prefs).toMatchObject({ tradition: 'bengali', depth: 'deep', appearance: 'dark' });
  });

  it('returns documented defaults when the profile row does not exist yet', async () => {
    const db = makeDb({ data: null, error: null });
    expect(await new ProfileRepository(db).getPreferences('anon-1')).toEqual(DEFAULT_PREFERENCES);
  });

  it('upserts only changed columns keyed by user_id', async () => {
    const ops: Array<{ op: string; arg?: unknown }> = [];
    const db = makeDb(
      { data: { tradition_code: 'generic', content_depth: 'quick', appearance: 'light' }, error: null },
      (op, arg) => ops.push({ op, arg }),
    );
    const prefs = await new ProfileRepository(db).updatePreferences('user-1', { appearance: 'light' });
    const upsert = ops.find((o) => o.op === 'upsert');
    expect(upsert?.arg).toEqual({ user_id: 'user-1', appearance: 'light' });
    expect(prefs.appearance).toBe('light');
  });

  it('propagates read errors', async () => {
    const db = makeDb({ data: null, error: new Error('rls denied') });
    await expect(new ProfileRepository(db).getPreferences('user-1')).rejects.toThrow('rls denied');
  });
});
