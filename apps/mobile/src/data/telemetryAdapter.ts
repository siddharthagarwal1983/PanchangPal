/**
 * Composition root for the TelemetryAdapter (Provider Adapter pattern, TDD Part 5 §7.1). Returns
 * the app-wide singleton. Today that is always NullTelemetryAdapter — the concrete Sentry adapter
 * is deferred until `@sentry/react-native` is installed and a DSN is provisioned — so swapping it
 * in is a one-line change here, with no call-site changes anywhere.
 *
 * The `getTelemetryBackend()` reporter is not ceremony. `ritualSessionRepository` degraded to
 * in-memory storage silently, and the resulting question ("were sessions never saved, or saved
 * somewhere that evaporated?") stayed unanswerable for a week because the degradation was
 * invisible from outside. Telemetry has exactly that failure mode and is worse for it: an app that
 * reports nothing looks identical to an app with no errors. So the state is inspectable, and a DSN
 * configured with no adapter to consume it warns loudly — that combination means someone believes
 * crash reporting is on when it is not.
 */
import Constants from 'expo-constants';
import {
  NullTelemetryAdapter,
  toClientErrorEvent,
  type TelemetryAdapter,
  type TelemetryBreadcrumb,
  type TelemetryErrorReport,
} from '../domain/telemetry';
import { getAnalyticsService } from './analyticsAdapter';

/**
 * Which CRASH REPORTER receives errors. `'none'` means the diagnostic copy is dropped — it does
 * not mean nothing happens: since B4.2 every error is also recorded as EVT_054 in `analytics_event`,
 * which is a working sink. The two are separate on purpose (see ReportingTelemetryAdapter below).
 */
export type TelemetryBackend = 'sentry' | 'none';

let adapter: TelemetryAdapter | null = null;
let activeBackend: TelemetryBackend | null = null;

/** The reporter in use, or null before the adapter has been resolved (resolution is lazy). */
export function getTelemetryBackend(): TelemetryBackend | null {
  return activeBackend;
}

/** Whether a DSN was supplied at build time (EXPO_PUBLIC_SENTRY_DSN → app.config.ts `extra`). */
function isDsnConfigured(): boolean {
  const extra = (Constants.expoConfig?.extra ?? {}) as { sentryDsn?: string };
  const dsn = extra.sentryDsn ?? process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
  return dsn.length > 0;
}

/**
 * Wraps a crash reporter so every error is ALSO recorded as EVT_054 — §7.1's "every `ERR_*` →
 * `EVT_054`", which B4.1 could only map, having no sink to send it to. B4.2 gives it one.
 *
 * The two destinations are deliberately different in kind and must not be collapsed: the reporter
 * is for diagnosis (deferred, currently dropping), while EVT_054 is a product metric that lands in
 * `analytics_event` and works today. An error-rate dashboard therefore does not wait on Sentry.
 */
class ReportingTelemetryAdapter implements TelemetryAdapter {
  constructor(private readonly reporter: TelemetryAdapter) {}

  captureError(report: TelemetryErrorReport, error?: unknown): void {
    this.reporter.captureError(report, error);
    // Analytics must never turn an error into a second error; `track` already swallows, and this
    // guards the lookup itself.
    try {
      const event = toClientErrorEvent({
        code: report.code,
        surface: report.surface,
        recoverable: report.recoverable ?? false,
        correlationId: report.correlationId ?? null,
      });
      getAnalyticsService().track(event.event_id, event.props);
    } catch {
      // Deliberately silent: the reporter above already saw the original error.
    }
  }

  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
    this.reporter.addBreadcrumb(breadcrumb);
  }

  setUserPseudoId(pseudoId: string | null): void {
    this.reporter.setUserPseudoId(pseudoId);
  }
}

export function getTelemetryAdapter(): TelemetryAdapter {
  if (!adapter) {
    adapter = new ReportingTelemetryAdapter(new NullTelemetryAdapter());
    activeBackend = 'none';

    if (isDsnConfigured()) {
      // A DSN is present, which means someone provisioned Sentry and reasonably expects reports.
      // There is no adapter to send them. Say so where it will be seen — Metro and `adb logcat`.
      console.warn(
        '[telemetry] A Sentry DSN is configured but no telemetry adapter is wired — errors and ' +
          'crashes are NOT being reported. Install @sentry/react-native and swap the adapter in ' +
          'src/data/telemetryAdapter.ts (TDD Part 5 §7.1).',
      );
    }
  }
  return adapter;
}

/**
 * Test/DI seam — override the adapter (e.g. a spy in unit tests).
 *
 * The reported backend is cleared rather than set: an injected adapter is not one of the backends
 * this module resolves, and claiming `'sentry'` for a test double would make the one signal this
 * file exists to provide untrustworthy.
 */
export function setTelemetryAdapter(next: TelemetryAdapter | null): void {
  adapter = next;
  activeBackend = null;
}

/** Test seam: forget the resolved adapter so a fresh resolution can be observed. */
export function resetTelemetryForTests(): void {
  adapter = null;
  activeBackend = null;
}
