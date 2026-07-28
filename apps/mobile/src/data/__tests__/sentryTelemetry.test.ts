/**
 * Tests for the concrete Sentry reporter (TDD Part 5 §7.1).
 *
 * The point of these is the PRIVACY GUARANTEE, not SDK plumbing. §7.1 is `[MANDATORY]` that no PII
 * reaches telemetry, and `scrubEvent` / `filterBreadcrumb` are the entire mechanism enforcing it —
 * so they are asserted directly, on the event shapes the SDK actually produces, rather than
 * inferred from the fact that `init` was called with a `beforeSend`.
 *
 * What these tests deliberately do NOT claim: that anything arrives at Sentry. No off-device test
 * can show that. It needs a provisioned DSN and a real build.
 */
import {
  buildSentryOptions,
  filterBreadcrumb,
  scrubEvent,
  SentryTelemetryAdapter,
} from '../sentryTelemetry';

// `__mocks__/@sentry/react-native.js` sits adjacent to node_modules, so this import resolves to
// the manual mock in every suite without a jest.mock() call — the same arrangement as mmkv.
import * as SentrySdk from '@sentry/react-native';

const sentryMock = SentrySdk as unknown as {
  __calls: {
    init: unknown[];
    captureException: unknown[] & { tags?: Record<string, string> };
    addBreadcrumb: unknown[];
    setUser: unknown[];
  };
  __reset: () => void;
  withScope: (cb: (scope: { setTag: (k: string, v: string) => void }) => void) => void;
};

beforeEach(() => sentryMock.__reset());

describe('scrubEvent — no PII by construction (§7.1 [MANDATORY])', () => {
  it('replaces an exception message with its ERR_* code, and keeps the stack', () => {
    const scrubbed = scrubEvent({
      tags: { err_code: 'ERR_NETWORK_TIMEOUT' },
      exception: {
        values: [
          {
            type: 'Error',
            value: 'duplicate key value violates unique constraint (user@example.com)',
            stacktrace: { frames: [{ filename: 'app/index.tsx', lineno: 12 }] },
          },
        ],
      },
    });

    expect(scrubbed.exception?.values?.[0]?.value).toBe('ERR_NETWORK_TIMEOUT');
    // The stack is the diagnostic value and is NOT user data — it must survive.
    expect(scrubbed.exception?.values?.[0]?.stacktrace?.frames?.[0]?.filename).toBe('app/index.tsx');
  });

  it('redacts the message when no recognised code is tagged', () => {
    const scrubbed = scrubEvent({
      exception: { values: [{ value: 'row: {"email":"user@example.com"}' }] },
    });

    expect(scrubbed.exception?.values?.[0]?.value).not.toContain('user@example.com');
    expect(scrubbed.exception?.values?.[0]?.value).toContain('ERR_UNKNOWN');
  });

  it('ignores a tag that is not in the ERR_* taxonomy rather than trusting it', () => {
    const scrubbed = scrubEvent({
      tags: { err_code: 'not-a-real-code' },
      exception: { values: [{ value: 'secret' }] },
    });

    expect(scrubbed.exception?.values?.[0]?.value).toContain('ERR_UNKNOWN');
    expect(scrubbed.fingerprint).toBeUndefined();
  });

  it('strips request (URLs and headers) and extra (an open bag)', () => {
    const scrubbed = scrubEvent({
      request: { url: 'https://api/today?local_date=2026-07-28&household=abc', headers: {} },
      extra: { rawRow: { email: 'user@example.com' } },
    });

    expect(scrubbed.request).toBeUndefined();
    expect(scrubbed.extra).toBeUndefined();
  });

  it('reduces user identity to the pseudonymous id, dropping email, username and ip', () => {
    const scrubbed = scrubEvent({
      user: {
        id: 'pseudo-123',
        email: 'user@example.com',
        username: 'devotee',
        ip_address: '203.0.113.4',
      },
    });

    expect(scrubbed.user).toEqual({ id: 'pseudo-123' });
  });

  it('drops automatic breadcrumbs that survived into the event', () => {
    const scrubbed = scrubEvent({
      breadcrumbs: [
        { category: 'console', message: 'token=abc123' },
        { category: 'xhr', message: 'GET /invite/secret-token' },
        { category: 'ritual', message: 'step advanced' },
      ],
    });

    expect(scrubbed.breadcrumbs).toEqual([{ category: 'ritual', message: 'step advanced' }]);
  });

  it('fingerprints by ERR_* code, so rewritten messages cannot collapse unrelated failures', () => {
    const scrubbed = scrubEvent({
      tags: { err_code: 'ERR_SYNC_CONFLICT' },
      exception: { values: [{ value: 'whatever' }] },
    });

    expect(scrubbed.fingerprint).toEqual(['ERR_SYNC_CONFLICT']);
  });
});

describe('filterBreadcrumb — only the four categories the port declares', () => {
  it.each(['navigation', 'network', 'lifecycle', 'ritual'])('keeps %s', (category) => {
    expect(filterBreadcrumb({ category, message: 'ok' })).not.toBeNull();
  });

  it.each(['console', 'xhr', 'fetch', 'http', 'ui.click', 'sentry.event'])(
    'drops the automatic %s breadcrumb',
    (category) => {
      expect(filterBreadcrumb({ category, message: 'anything' })).toBeNull();
    },
  );

  it('drops a breadcrumb with no category at all', () => {
    expect(filterBreadcrumb({ message: 'anything' })).toBeNull();
  });
});

describe('buildSentryOptions — the hardening is not left to defaults', () => {
  const options = buildSentryOptions({ dsn: 'https://k@o1.ingest.sentry.io/1', environment: 'ci' });

  it('enables session tracking, which is what makes crash-free sessions (NFR-06) measurable', () => {
    expect(options.enableAutoSessionTracking).toBe(true);
  });

  it('states sendDefaultPii: false rather than inheriting it', () => {
    expect(options.sendDefaultPii).toBe(false);
  });

  it('does not capture failed requests (URLs and bodies)', () => {
    expect(options.enableCaptureFailedRequests).toBe(false);
  });

  it('installs the scrubbers', () => {
    expect(options.beforeSend).toBe(scrubEvent);
    expect(options.beforeBreadcrumb).toBe(filterBreadcrumb);
  });

  it("removes ONLY Sentry's JS error hook, so crashes are not reported twice", () => {
    const defaults = [
      { name: 'ReactNativeErrorHandlers' },
      { name: 'DeviceContext' },
      { name: 'Release' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kept = (options.integrations as any)(defaults).map((i: { name: string }) => i.name);

    expect(kept).not.toContain('ReactNativeErrorHandlers');
    // Native crash capture and context must survive: a native crash never reaches the port.
    expect(kept).toEqual(['DeviceContext', 'Release']);
  });
});

describe('SentryTelemetryAdapter', () => {
  it('tags the ERR_* code, surface and correlation id, and sends the thrown value for its stack', () => {
    const error = new Error('boom');
    new SentryTelemetryAdapter().captureError(
      {
        code: 'ERR_NETWORK_TIMEOUT',
        surface: 'error-boundary',
        recoverable: true,
        correlationId: 'corr-1',
      },
      error,
    );

    expect(sentryMock.__calls.captureException).toHaveLength(1);
    expect(sentryMock.__calls.captureException[0]).toBe(error);
    expect(sentryMock.__calls.captureException.tags).toEqual({
      err_code: 'ERR_NETWORK_TIMEOUT',
      surface: 'error-boundary',
      recoverable: 'true',
      correlation_id: 'corr-1',
    });
  });

  it('still reports when there is no Error object, rather than skipping the event', () => {
    new SentryTelemetryAdapter().captureError({ code: 'ERR_UNKNOWN', surface: 'manual' });

    expect(sentryMock.__calls.captureException).toHaveLength(1);
    expect((sentryMock.__calls.captureException[0] as Error).message).toBe('ERR_UNKNOWN');
  });

  it('sets only the pseudonymous id, and clears it with null', () => {
    const adapter = new SentryTelemetryAdapter();
    adapter.setUserPseudoId('pseudo-9');
    adapter.setUserPseudoId(null);

    expect(sentryMock.__calls.setUser).toEqual([{ id: 'pseudo-9' }, null]);
  });

  it('forwards only the category and message of a breadcrumb', () => {
    new SentryTelemetryAdapter().addBreadcrumb({ category: 'ritual', message: 'started' });

    expect(sentryMock.__calls.addBreadcrumb).toEqual([{ category: 'ritual', message: 'started' }]);
  });

  it('never throws when the SDK does — telemetry failing must not become the user’s problem', () => {
    const adapter = new SentryTelemetryAdapter();
    const original = sentryMock.withScope;
    sentryMock.withScope = () => {
      throw new Error('sentry exploded');
    };

    expect(() => adapter.captureError({ code: 'ERR_UNKNOWN', surface: 'manual' })).not.toThrow();

    sentryMock.withScope = original;
  });
});
