/**
 * NotificationRepository tests. Mocks supabase-js so no network is needed. Asserts: notif_prefs
 * read maps the JSON blob (with calm-default fallbacks); update merges the patch onto current
 * prefs and upserts the full blob (snake_case) owner-only; push-token registration upserts
 * push_token on the expo_token conflict target; and schedule invokes SVC_notify_scheduler and
 * maps the scheduled count.
 */
import { NotificationRepository } from '../notificationRepository';
import { DEFAULT_NOTIF_PREFS } from '../../domain/notifications';

type Result = { data: unknown; error: unknown };

/** A fresh supabase-js-like builder per from() call; thenable so `await db.from().upsert()` works. */
function makeDb(opts: {
  selectResult?: Result;
  upsertResult?: Result;
  invokeResult?: Result;
  captureUpsert?: (table: string, row: unknown, options: unknown) => void;
  captureInvoke?: (path: string, options: { body?: unknown }) => void;
}) {
  const invoke = (path: string, options: { body?: unknown } = {}) => {
    opts.captureInvoke?.(path, options);
    return Promise.resolve(opts.invokeResult ?? { data: null, error: null });
  };

  const from = (table: string) => {
    const b: Record<string, unknown> = {};
    let op: 'select' | 'upsert' = 'select';
    b.select = () => b;
    b.eq = () => b;
    b.upsert = (row: unknown, options: unknown) => {
      op = 'upsert';
      opts.captureUpsert?.(table, row, options);
      return b;
    };
    b.maybeSingle = () => Promise.resolve(op === 'upsert' ? (opts.upsertResult ?? { data: null, error: null }) : (opts.selectResult ?? { data: null, error: null }));
    // Make `await db.from(...).upsert(...)` (no .select) resolve — used by registerToken.
    b.then = (resolve: (v: Result) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(opts.upsertResult ?? { data: null, error: null }).then(resolve, reject);
    return b;
  };

  return { from, functions: { invoke } } as never;
}

describe('NotificationRepository', () => {
  it('reads notif_prefs and maps the blob', async () => {
    const db = makeDb({ selectResult: { data: { notif_prefs: { channels: { daily: false }, quiet_hours: { start: '22:00', end: '07:00' } } }, error: null } });
    const prefs = await new NotificationRepository(db).getPrefs('u1');
    expect(prefs.channels.daily).toBe(false);
    expect(prefs.channels.festival).toBe(true); // default fill
    expect(prefs.quietHours).toEqual({ start: '22:00', end: '07:00' });
  });

  it('returns calm defaults when no row/blob exists', async () => {
    const db = makeDb({ selectResult: { data: null, error: null } });
    expect(await new NotificationRepository(db).getPrefs('u1')).toEqual(DEFAULT_NOTIF_PREFS);
  });

  it('merges a channel patch onto current prefs and upserts the full blob owner-only', async () => {
    const upserts: Array<{ table: string; row: unknown; options: unknown }> = [];
    const db = makeDb({
      selectResult: { data: { notif_prefs: { channels: {}, quiet_hours: null } }, error: null },
      upsertResult: { data: { notif_prefs: { channels: { ...DEFAULT_NOTIF_PREFS.channels, growth: true }, quiet_hours: null } }, error: null },
      captureUpsert: (table, row, options) => upserts.push({ table, row, options }),
    });
    const res = await new NotificationRepository(db).updatePrefs('u1', { channels: { growth: true } });
    expect(res.channels.growth).toBe(true);
    const call = upserts.find((u) => u.table === 'user_profile');
    expect(call?.row).toMatchObject({ user_id: 'u1' });
    expect((call?.row as { notif_prefs: { channels: Record<string, boolean> } }).notif_prefs.channels.growth).toBe(true);
    expect(call?.options).toEqual({ onConflict: 'user_id' });
  });

  it('registers a push token via upsert on expo_token', async () => {
    const upserts: Array<{ table: string; row: unknown; options: unknown }> = [];
    const db = makeDb({ upsertResult: { data: null, error: null }, captureUpsert: (table, row, options) => upserts.push({ table, row, options }) });
    await new NotificationRepository(db).registerToken('u1', 'ExponentPushToken[xyz]', 'ios');
    expect(upserts[0].table).toBe('push_token');
    expect(upserts[0].row).toEqual({ user_id: 'u1', expo_token: 'ExponentPushToken[xyz]', platform: 'ios' });
    expect(upserts[0].options).toEqual({ onConflict: 'expo_token' });
  });

  it('invokes SVC_notify_scheduler and maps the scheduled count', async () => {
    const calls: Array<{ path: string; options: { body?: unknown } }> = [];
    const db = makeDb({ invokeResult: { data: { scheduled: 3 }, error: null }, captureInvoke: (path, options) => calls.push({ path, options }) });
    const res = await new NotificationRepository(db).requestSchedule(DEFAULT_NOTIF_PREFS);
    expect(calls[0].path).toBe('notify/schedule');
    expect((calls[0].options.body as { channels: unknown }).channels).toBeDefined();
    expect(res).toEqual({ scheduled: 3 });
  });

  it('propagates the ERR_* envelope code from schedule', async () => {
    const db = makeDb({ invokeResult: { data: null, error: { context: { code: 'ERR_UNKNOWN' } } } });
    await expect(new NotificationRepository(db).requestSchedule()).rejects.toThrow('ERR_UNKNOWN');
  });
});
