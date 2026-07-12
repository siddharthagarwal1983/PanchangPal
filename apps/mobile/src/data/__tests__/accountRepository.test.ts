/**
 * AccountRepository tests. Mocks supabase-js functions.invoke so no network is needed. Asserts:
 * reauth returns the token; deletion posts to the OpenAPI path with the reauth token and maps
 * execute_after → executeAfter; transfer posts household_id + new_owner_id; the ERR_* envelope
 * code propagates (e.g. the F-3 409).
 */
import { AccountRepository } from '../accountRepository';

type Result = { data: unknown; error: unknown };

function makeDb(result: Result, capture?: (path: string, options: { method?: string; body?: unknown }) => void) {
  return {
    functions: {
      invoke: (path: string, options: { method?: string; body?: unknown } = {}) => {
        capture?.(path, options);
        return Promise.resolve(result);
      },
    },
  } as never;
}

describe('AccountRepository', () => {
  it('requests a reauth token', async () => {
    const db = makeDb({ data: { reauth_token: 'rt_123' }, error: null });
    expect(await new AccountRepository(db).requestReauth()).toBe('rt_123');
  });

  it('requests deletion at the OpenAPI path with the reauth token and maps execute_after', async () => {
    const calls: Array<{ path: string; options: { method?: string; body?: unknown } }> = [];
    const db = makeDb({ data: { execute_after: '2026-08-12T00:00:00Z' }, error: null }, (path, options) => calls.push({ path, options }));
    const res = await new AccountRepository(db).requestDeletion('rt_123');
    expect(calls[0].path).toBe('account/delete');
    expect(calls[0].options.body).toEqual({ reauth_token: 'rt_123' });
    expect(res).toEqual({ executeAfter: '2026-08-12T00:00:00Z' });
  });

  it('transfers ownership with household_id + new_owner_id', async () => {
    const calls: Array<{ path: string; options: { method?: string; body?: unknown } }> = [];
    const db = makeDb({ data: { ok: true }, error: null }, (path, options) => calls.push({ path, options }));
    await new AccountRepository(db).transferOwnership('h1', 'u2');
    expect(calls[0].path).toBe('household/transfer');
    expect(calls[0].options.body).toEqual({ household_id: 'h1', new_owner_id: 'u2' });
  });

  it('propagates the ERR_* envelope code (e.g. F-3 gate 409)', async () => {
    const db = makeDb({ data: null, error: { context: { code: 'ERR_UNKNOWN' } } });
    await expect(new AccountRepository(db).requestDeletion('rt')).rejects.toThrow('ERR_UNKNOWN');
  });
});
