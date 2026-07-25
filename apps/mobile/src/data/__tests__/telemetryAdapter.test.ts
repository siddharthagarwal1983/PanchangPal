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
          code: 'ERR_OFFLINE',
          surface: 'error-boundary',
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

  it('warns when a DSN is configured but no adapter can consume it', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://public@o0.ingest.sentry.io/0';

    getTelemetryAdapter();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('NOT being reported'));
  });

  it('stays quiet when no DSN is configured — the deferral is expected, not a fault', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    getTelemetryAdapter();
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
