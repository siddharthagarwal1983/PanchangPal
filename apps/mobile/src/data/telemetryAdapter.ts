/**
 * Composition root for the TelemetryAdapter (Provider Adapter pattern, TDD Part 5 §7.1). Returns
 * the app-wide singleton.
 *
 * `@sentry/react-native` is now installed, so this resolves to the real reporter **when a DSN is
 * configured** and to NullTelemetryAdapter otherwise. That is not a fallback for convenience: the
 * DSN is per-environment (`EXPO_PUBLIC_SENTRY_DSN`), and a local or CI build without one must still
 * run normally rather than initialising an SDK that has nowhere to send anything.
 *
 * The reported backend therefore answers a real question — `'sentry'` means reports are leaving the
 * device, `'none'` means they are being dropped — where before it could only ever say `'none'`.
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
import { SentryTelemetryAdapter, initSentry } from './sentryTelemetry';

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

/** The DSN supplied at build time (EXPO_PUBLIC_SENTRY_DSN → app.config.ts `extra`), or ''. */
function configuredDsn(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { sentryDsn?: string };
  return extra.sentryDsn ?? process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
}

/**
 * Whether a DSN string is one we should actually initialise the SDK with.
 *
 * Every `.env.*.example` in this repo ships the literal placeholder
 * `https://YOUR_KEY@oXXXX.ingest.sentry.io/XXXX`. A placeholder that reaches a build is worse than
 * an absent value: `initSentry` would run, the SDK would install its network instrumentation, and
 * every event would be addressed to a project that does not exist — telemetry that looks configured
 * and reports nowhere, which is the precise failure mode this whole seam exists to make visible.
 * So the shape is checked, not just the length.
 */
export function isUsableDsn(dsn: string): boolean {
  if (!dsn) return false;
  if (/YOUR_KEY|XXXX|example\.com/i.test(dsn)) return false;
  try {
    const url = new URL(dsn);
    // A real DSN is `https://<publicKey>@<host>/<projectId>`.
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.username.length > 0 &&
      url.pathname.replace(/^\//, '').length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Which environment a report belongs to. Sentry filters and alerts on this, so a staging crash
 * must not be counted against the production crash-free SLO (§7.2).
 *
 * ⚠️ THE CHANNEL-ONLY DERIVATION WAS WRONG FOR EVERY BUILD EAS DID NOT PRODUCE, and CI is exactly
 * that build. `extra.eas.channel` is stamped by EAS Build; `e2e.yml` runs `expo prebuild` +
 * `gradlew assembleRelease` on the runner, so there is no channel — and `__DEV__` is false in a
 * release APK. The fallback therefore resolved to **'production'**, and CI has been reporting
 * emulator sessions into the production SLO. It pulls a REAL DSN
 * (`eas-cli env:pull --environment preview`), so this was not theoretical: at the time this was
 * found, essentially all 91 sessions in `panchangpal-mobile` were E2E launches, and an alert
 * scoped to `environment:production` — the scope §7.2 wants — would have paged on CI.
 *
 * An explicit override wins, because the build that knows it is not production is the build
 * itself. The channel remains the preferred signal for EAS builds, since it cannot disagree with
 * the binary it came from; the override exists for builds EAS did not make.
 */
function sentryEnvironment(): string {
  const explicit = process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT;
  if (typeof explicit === 'string' && explicit.length > 0) return explicit;

  const channel = Constants.expoConfig?.extra?.eas?.channel;
  if (typeof channel === 'string' && channel.length > 0) return channel;

  return __DEV__ ? 'development' : 'production';
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
    const dsn = configuredDsn();

    const environment = sentryEnvironment();

    if (isUsableDsn(dsn)) {
      // Initialise BEFORE constructing the adapter: a report captured against an uninitialised
      // client is dropped by the SDK, and the first thing to fail in a session is exactly the
      // thing worth reporting.
      initSentry({ dsn, environment });
      adapter = new ReportingTelemetryAdapter(new SentryTelemetryAdapter());
      activeBackend = 'sentry';
    } else {
      adapter = new ReportingTelemetryAdapter(new NullTelemetryAdapter());
      activeBackend = 'none';
    }

    // Say which reporter won, once, at resolution. `getStorageBackend()` earns its keep the same
    // way: when a native-backed seam degrades, the only thing worse than the degradation is not
    // being able to tell from a device log whether it happened. This line is what makes an E2E
    // artifact answer "was Sentry actually running in that build?" without a redeploy.
    //
    // `env=` is here because the answer to "which environment did that build report as?" cost a
    // four-file deduction (e2e.yml's `env:pull` → app.config.ts → this function → Expo's channel
    // stamping) and STILL could not be read directly out of an artifact. Sentry's own logs print
    // the DSN and never the environment. An SLO that is scoped by a value nobody can observe is
    // the same shape of defect as a gate that cannot fail.
    console.log(`[telemetry] reporter=${activeBackend} env=${environment}`);
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
