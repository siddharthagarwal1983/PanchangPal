/**
 * The telemetry adapter must be resolved at STARTUP, not lazily on the first error
 * (TDD Part 5 §7.1/§7.2).
 *
 * WHY THIS TEST EXISTS. Both original call sites — `installGlobalErrorHandler` and
 * `ErrorBoundary.componentDidCatch` — call `getTelemetryAdapter()` from inside an error path. With
 * only those, `Sentry.init` first runs *after* something has already gone wrong, and the feature
 * silently fails to deliver the thing it was built for:
 *
 *   - `enableAutoSessionTracking` never starts a session in a healthy run, so **crash-free
 *     sessions (NFR-06, §7.2)** — the metric §10.1 gates the launch on — cannot be measured;
 *   - **native crash capture is never installed**, losing exactly the crashes that matter most to
 *     that SLO, because a Java/ObjC crash never reaches JS to trigger a handler;
 *   - a crash during startup is reported by nobody.
 *
 * None of that is visible at runtime — an app reporting nothing looks identical to an app with no
 * errors — which is precisely why it survived review and had to be found by reading the call
 * graph. The assertion below is behavioural rather than a source grep: `getTelemetryBackend()`
 * returns `null` until the adapter is resolved, so it fails if the startup resolution is removed.
 */
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppProviders } from '../AppProviders';
import { getTelemetryBackend, resetTelemetryForTests } from '../../data/telemetryAdapter';

beforeEach(() => resetTelemetryForTests());

describe('AppProviders — telemetry is live before anything can fail', () => {
  it('resolves the telemetry adapter on mount, with no error having occurred', async () => {
    // Nothing has thrown; the reporter is unresolved.
    expect(getTelemetryBackend()).toBeNull();

    await render(
      <AppProviders>
        <Text>ready</Text>
      </AppProviders>,
    );

    // Resolved by startup, not by a failure. Remove `getTelemetryAdapter()` from AppProviders'
    // mount effect and this is still null — which is the whole point.
    expect(getTelemetryBackend()).not.toBeNull();
  });

  it('reports a concrete backend rather than leaving it ambiguous', async () => {
    await render(
      <AppProviders>
        <Text>ready</Text>
      </AppProviders>,
    );

    // 'none' with no DSN configured, 'sentry' with one. Either is a real answer; null is not.
    expect(['sentry', 'none']).toContain(getTelemetryBackend());
  });
});
