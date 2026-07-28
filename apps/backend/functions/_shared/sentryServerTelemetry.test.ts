/**
 * The Edge Function Sentry client (TDD Part 5 §7.1).
 *
 * Two properties are worth pinning, and neither is SDK plumbing:
 *
 *   1. **The thrown value never reaches the SDK.** `toServerErrorReport` already drops
 *      `err.message`; this client must not quietly reintroduce it by handing the raw error to
 *      `captureException`. On the server a stack's frames sit inside Postgres or a fetch library
 *      and carry query text, which is why this differs deliberately from the mobile adapter.
 *   2. **Failure is contained.** The SDK is loaded lazily and shared by every Edge Function, so a
 *      load that never resolves, or throws, must not take the function with it.
 */
import { describe, expect, it, vi } from 'vitest';
import { SentryServerTelemetry } from './sentryServerTelemetry.ts';

const REPORT = {
  code: 'ERR_SYNC_CONFLICT' as const,
  fn: 'sync',
  correlation_id: 'corr-9',
  recoverable: true,
};

function fakeSdk() {
  return {
    init: vi.fn(),
    captureMessage: vi.fn(),
  };
}

/** Let the lazy-load promise chain settle. */
const settle = () => new Promise((r) => setTimeout(r, 0));

describe('SentryServerTelemetry', () => {
  it('initialises once with PII off and tracing disabled', async () => {
    const sdk = fakeSdk();
    const t = new SentryServerTelemetry('https://k@o1.ingest.sentry.io/1', 'staging', async () => sdk);

    t.captureError(REPORT);
    t.captureError(REPORT);
    await settle();

    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init.mock.calls[0][0]).toMatchObject({
      dsn: 'https://k@o1.ingest.sentry.io/1',
      environment: 'staging',
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
  });

  it('sends the ERR_* code as the message, with the triage tags', async () => {
    const sdk = fakeSdk();
    const t = new SentryServerTelemetry('dsn', 'production', async () => sdk);

    t.captureError(REPORT);
    await settle();

    expect(sdk.captureMessage).toHaveBeenCalledWith('ERR_SYNC_CONFLICT', {
      level: 'error',
      tags: {
        err_code: 'ERR_SYNC_CONFLICT',
        fn: 'sync',
        correlation_id: 'corr-9',
        recoverable: 'true',
      },
    });
  });

  it('never hands the thrown value to the SDK — a server stack carries query text', async () => {
    const sdk = fakeSdk() as ReturnType<typeof fakeSdk> & { captureException?: unknown };
    const t = new SentryServerTelemetry('dsn', 'production', async () => sdk);

    t.captureError(REPORT);
    await settle();

    // The port's signature permits a second argument; this client must ignore it.
    expect(sdk.captureException).toBeUndefined();
    const [message] = sdk.captureMessage.mock.calls[0];
    expect(message).toBe('ERR_SYNC_CONFLICT');
  });

  it('queues reports that arrive during the load, rather than dropping them', async () => {
    const sdk = fakeSdk();
    let release: (v: typeof sdk) => void = () => {};
    const t = new SentryServerTelemetry(
      'dsn',
      'production',
      () => new Promise<typeof sdk>((res) => (release = res)),
    );

    t.captureError(REPORT);
    t.captureError({ ...REPORT, code: 'ERR_OFFLINE' });
    expect(sdk.captureMessage).not.toHaveBeenCalled();

    release(sdk);
    await settle();

    expect(sdk.captureMessage).toHaveBeenCalledTimes(2);
  });

  it('bounds the queue, so a burst of failures cannot grow it without limit', async () => {
    const sdk = fakeSdk();
    let release: (v: typeof sdk) => void = () => {};
    const t = new SentryServerTelemetry(
      'dsn',
      'production',
      () => new Promise<typeof sdk>((res) => (release = res)),
    );

    for (let i = 0; i < 50; i++) t.captureError(REPORT);

    release(sdk);
    await settle();

    expect(sdk.captureMessage).toHaveBeenCalledTimes(10);
  });

  it('degrades quietly when the SDK cannot be loaded — errors are still logged elsewhere', async () => {
    const t = new SentryServerTelemetry('dsn', 'production', async () => {
      throw new Error('registry unreachable');
    });

    expect(() => t.captureError(REPORT)).not.toThrow();
    await settle();
    // And a later report still does not throw, now that the load has failed.
    expect(() => t.captureError(REPORT)).not.toThrow();
  });

  it('does not throw when the SDK itself throws on send', async () => {
    const sdk = {
      init: vi.fn(),
      captureMessage: vi.fn(() => {
        throw new Error('sentry exploded');
      }),
    };
    const t = new SentryServerTelemetry('dsn', 'production', async () => sdk);

    t.captureError(REPORT);
    await settle();

    expect(() => t.captureError(REPORT)).not.toThrow();
  });
});
