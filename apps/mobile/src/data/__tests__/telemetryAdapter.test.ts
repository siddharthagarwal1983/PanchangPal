/**
 * TelemetryAdapter composition + the global error handler (TDD Part 5 §7.1).
 *
 * These suites guard the two properties that make the seam honest rather than decorative:
 * `getTelemetryBackend()` reports `'none'` while the Null adapter is in place (an app that reports
 * nothing must not be indistinguishable from an app with no errors), and a configured DSN with no
 * adapter to consume it warns — that combination means an operator believes crash reporting is on
 * when it is not, which is precisely how ritual sessions ran on memory unnoticed for a week.
 */
import { NullTelemetryAdapter, type TelemetryErrorReport } from '../../domain/telemetry';
import type { AnalyticsProps } from '../../domain/analytics';
import type { EventId } from '@panchangpal/shared';
import {
  getTelemetryAdapter,
  getTelemetryBackend,
  isUsableDsn,
  resetTelemetryForTests,
  setTelemetryAdapter,
} from '../telemetryAdapter';
import { setAnalyticsService } from '../analyticsAdapter';
import {
  installGlobalErrorHandler,
  resetGlobalErrorHandlerForTests,
} from '../../providers/installGlobalErrorHandler';

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: {} } } }));

describe('telemetry adapter resolution', () => {
  beforeEach(() => {
    resetTelemetryForTests();
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    resetTelemetryForTests();
  });

  it('resolves lazily — nothing is decided before the first call', () => {
    expect(getTelemetryBackend()).toBeNull();
  });

  it('reports the crash-reporter backend as none while Sentry is deferred', () => {
    expect(getTelemetryAdapter()).toBeDefined();
    expect(getTelemetryBackend()).toBe('none');
  });

  it("records every error as EVT_054 even though the crash reporter is 'none' (§7.1)", () => {
    const tracked: { eventId: EventId; props?: AnalyticsProps }[] = [];
    setAnalyticsService({
      track: (eventId, props) => void tracked.push({ eventId, props }),
      flush: async () => undefined,
      setHouseholdId: () => undefined,
    });

    getTelemetryAdapter().captureError({
      code: 'ERR_OFFLINE',
      surface: 'error-boundary',
      recoverable: true,
      correlationId: 'corr-7',
    });

    expect(tracked).toEqual([
      {
        eventId: 'EVT_054',
        props: {
          error_code: 'ERR_OFFLINE',
          screen_id: 'error-boundary',
          recoverable: true,
          correlation_id: 'corr-7',
        },
      },
    ]);
    setAnalyticsService(null);
  });

  it('survives an analytics failure — reporting must not create a second error', () => {
    setAnalyticsService({
      track: () => {
        throw new Error('analytics exploded');
      },
      flush: async () => undefined,
      setHouseholdId: () => undefined,
    });

    expect(() =>
      getTelemetryAdapter().captureError({ code: 'ERR_UNKNOWN', surface: 'manual' }),
    ).not.toThrow();
    setAnalyticsService(null);
  });

  it('returns the same singleton on repeat calls', () => {
    expect(getTelemetryAdapter()).toBe(getTelemetryAdapter());
  });

  // Until @sentry/react-native was installed, a configured DSN with no adapter to consume it was
  // the dangerous state, and this file WARNED about it. That state no longer exists: a DSN now
  // resolves the real reporter. These two tests replace that warning with the property it was
  // standing in for — `getTelemetryBackend()` tells the truth about where reports go.
  // Every .env.*.example in this repo ships the literal placeholder DSN. If that reaches a build,
  // initialising against it gives telemetry that looks configured and reports nowhere — the exact
  // failure this seam exists to make visible.
  it.each([
    'https://YOUR_KEY@oXXXX.ingest.sentry.io/XXXX',
    '',
    'not-a-url',
    'https://o1.ingest.sentry.io/1', // no public key
    'https://k@o1.ingest.sentry.io', // no project id
  ])('treats %p as unconfigured', (dsn) => {
    expect(isUsableDsn(dsn)).toBe(false);
  });

  it('accepts a real DSN', () => {
    expect(isUsableDsn('https://abc123@o4507.ingest.sentry.io/4507')).toBe(true);
  });

  it('resolves the Sentry reporter when a DSN is configured', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://public@o0.ingest.sentry.io/0';

    getTelemetryAdapter();

    expect(getTelemetryBackend()).toBe('sentry');
    // Nothing to warn about any more — the DSN and the capability now agree.
    expect(warn).not.toHaveBeenCalled();
  });

  it('reports `none` and stays quiet with no DSN — a local or CI build is not a fault', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    getTelemetryAdapter();

    expect(getTelemetryBackend()).toBe('none');
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not claim a real backend for an injected test double', () => {
    setTelemetryAdapter(new NullTelemetryAdapter());
    expect(getTelemetryBackend()).toBeNull();
    setTelemetryAdapter(null);
  });
});

describe('global error handler', () => {
  const originalErrorUtils = (globalThis as Record<string, unknown>).ErrorUtils;

  beforeEach(() => {
    resetGlobalErrorHandlerForTests();
    resetTelemetryForTests();
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).ErrorUtils = originalErrorUtils;
    setTelemetryAdapter(null);
    resetGlobalErrorHandlerForTests();
    resetTelemetryForTests();
  });

  function installFakeErrorUtils() {
    let handler: ((error: unknown, isFatal?: boolean) => void) | undefined;
    const previous = jest.fn();
    handler = previous;
    (globalThis as Record<string, unknown>).ErrorUtils = {
      getGlobalHandler: () => handler,
      setGlobalHandler: (next: (error: unknown, isFatal?: boolean) => void) => {
        handler = next;
      },
    };
    return {
      previous,
      dispatch: (error: unknown, isFatal?: boolean) => handler?.(error, isFatal),
    };
  }

  function spyAdapter() {
    const captured: TelemetryErrorReport[] = [];
    setTelemetryAdapter({
      captureError: (report) => void captured.push(report),
      addBreadcrumb: () => undefined,
      setUserPseudoId: () => undefined,
    });
    return captured;
  }

  it('reports an uncaught error through the port with the ERR_* code', () => {
    const { dispatch } = installFakeErrorUtils();
    const captured = spyAdapter();

    installGlobalErrorHandler();
    dispatch(new Error('ERR_NETWORK_TIMEOUT'), false);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual({
      code: 'ERR_NETWORK_TIMEOUT',
      surface: 'global-handler',
      recoverable: true,
    });
  });

  it('marks a fatal as unrecoverable', () => {
    const { dispatch } = installFakeErrorUtils();
    const captured = spyAdapter();

    installGlobalErrorHandler();
    dispatch(new Error('boom'), true);

    expect(captured[0]).toMatchObject({ code: 'ERR_UNKNOWN', recoverable: false });
  });

  it("always calls the previous handler — telemetry must not swallow the app's own reporting", () => {
    const { previous, dispatch } = installFakeErrorUtils();
    spyAdapter();

    installGlobalErrorHandler();
    const error = new Error('boom');
    dispatch(error, true);

    expect(previous).toHaveBeenCalledWith(error, true);
  });

  it('still calls the previous handler when reporting itself throws', () => {
    const { previous, dispatch } = installFakeErrorUtils();
    setTelemetryAdapter({
      captureError: () => {
        throw new Error('reporter exploded');
      },
      addBreadcrumb: () => undefined,
      setUserPseudoId: () => undefined,
    });

    installGlobalErrorHandler();
    const error = new Error('boom');
    expect(() => dispatch(error, false)).not.toThrow();
    expect(previous).toHaveBeenCalledWith(error, false);
  });

  it('is idempotent — a second install does not double-report', () => {
    const { dispatch } = installFakeErrorUtils();
    const captured = spyAdapter();

    installGlobalErrorHandler();
    installGlobalErrorHandler();
    dispatch(new Error('boom'), false);

    expect(captured).toHaveLength(1);
  });

  it('is a no-op off React Native, where there is no ErrorUtils to hook', () => {
    delete (globalThis as Record<string, unknown>).ErrorUtils;
    expect(() => installGlobalErrorHandler()).not.toThrow();
  });
});

/**
 * Which environment a build reports as (§7.2). This is not cosmetic: the crash-free SLO and every
 * alert are scoped by it, so a build that misreports its environment silently contaminates the
 * metric it is supposed to be measured by.
 *
 * The defect these guard was live: `sentryEnvironment()` derived the environment from
 * `extra.eas.channel`, which only EAS Build stamps. CI builds with `expo prebuild` +
 * `gradlew assembleRelease` on the runner — no channel — and `__DEV__` is false in a release APK,
 * so it fell through to **'production'** while pulling a real DSN from EAS's preview environment.
 * Essentially all 91 sessions in `panchangpal-mobile` were E2E emulator launches counted as
 * production, and an `environment:production` alert would have paged on every CI run.
 */
describe('the environment a build reports as', () => {
  const constants = jest.requireMock('expo-constants').default as {
    expoConfig: { extra: Record<string, unknown> };
  };

  function resolvedEnv(): string {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    getTelemetryAdapter();
    const line = log.mock.calls.map(String).find((c) => c.includes('[telemetry]')) ?? '';
    return /env=(\S+)/.exec(line)?.[1] ?? '';
  }

  beforeEach(() => {
    resetTelemetryForTests();
    delete process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT;
    constants.expoConfig.extra = {};
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT;
    constants.expoConfig.extra = {};
    resetTelemetryForTests();
  });

  it('is stated on the resolution line, so an E2E artifact can answer it without a redeploy', () => {
    expect(resolvedEnv()).not.toBe('');
  });

  it('uses an explicit override — this is what stops CI reporting as production', () => {
    process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT = 'ci';
    expect(resolvedEnv()).toBe('ci');
  });

  it('reads the override from `extra`, which is the path that actually works in CI', () => {
    // The first attempt read ONLY `process.env`, which relies on Babel inlining EXPO_PUBLIC_* into
    // the bundle. The gradle-driven `export:embed` path did not deliver it: run 30735155676 logged
    // `env=production` with the variable set in .env. `extra` is evaluated by Expo CLI in Node,
    // and is how `sentryDsn` already reaches the app. This asserts the working path directly,
    // because the broken one passed its unit test.
    constants.expoConfig.extra = { sentryEnvironment: 'ci' };
    expect(resolvedEnv()).toBe('ci');
  });

  it('prefers `extra` over a stale process.env value', () => {
    constants.expoConfig.extra = { sentryEnvironment: 'ci' };
    process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT = 'production';
    expect(resolvedEnv()).toBe('ci');
  });

  it('lets the override WIN over an EAS channel, since only the build knows it is not real', () => {
    // The ordering that matters. If the channel won, `e2e.yml`'s override would be inert on any
    // build that happened to carry one, and the fix would look applied while changing nothing.
    constants.expoConfig.extra = { eas: { channel: 'preview' } };
    process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT = 'ci';
    expect(resolvedEnv()).toBe('ci');
  });

  it('still prefers the EAS channel over the __DEV__ fallback when no override is set', () => {
    // Kept as the primary signal for EAS builds: a channel cannot disagree with the binary it was
    // stamped into, whereas an override is only as good as the workflow that sets it.
    constants.expoConfig.extra = { eas: { channel: 'preview' } };
    expect(resolvedEnv()).toBe('preview');
  });
});
