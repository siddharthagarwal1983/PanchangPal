/**
 * TelemetryAdapter — the client seam over the crash/error reporter (TDD Part 5 §7.1, Provider
 * Adapter pattern). Errors and crashes leave the app through this port and nowhere else, so no
 * feature, screen, or repository ever imports a vendor SDK.
 *
 * The concrete `SentryTelemetryAdapter` is a DEFERRED deliverable, the same status as
 * ExpoNotificationAdapter and the RevenueCat PaymentAdapter: `@sentry/react-native` is not
 * installed and no DSN has been provisioned. Until both land, the app uses NullTelemetryAdapter.
 *
 * BE CLEAR ABOUT WHAT THIS DOES AND DOES NOT BUY. With the Null adapter in place, nothing is
 * reported anywhere — this port makes the app *ready* to report, it does not make it observed.
 * §7.1's telemetry requirement and the §7.2 crash-free SLO stay unmet until a real adapter is
 * wired, and B4 cannot close on the seam alone. `getTelemetryBackend()` below exists so that
 * status is inspectable rather than assumed, and the resolver warns when a DSN is configured but
 * no adapter can consume it — the shape of mistake that let ritual sessions run on memory for a
 * week (see `ritualSessionRepository`).
 */
import type { ErrorCode } from '@panchangpal/shared';

/** Where an error was caught. Kept coarse — a screen name, never user content. */
export type TelemetrySurface = 'error-boundary' | 'global-handler' | 'query' | 'manual';

/**
 * A single error report. Deliberately NOT free-form: `[MANDATORY] No PII in any telemetry`
 * (§7.1), and the surest way to honour that is to give callers no field that invites user
 * content. The `Error` itself travels separately, for a crash reporter's own stack handling.
 */
export interface TelemetryErrorReport {
  /** ERR_* taxonomy code (packages/shared) — the stable identity of the failure. */
  code: ErrorCode;
  /** Where it was caught. */
  surface: TelemetrySurface;
  /** Server correlation ID when the failure came from an Edge Function envelope (ADR-022). */
  correlationId?: string | null;
  /** Whether the user can retry — mirrors the ErrorEnvelope field, useful for triage. */
  recoverable?: boolean;
}

/** Breadcrumb trail leading up to a failure. Categories are app-defined, values are never PII. */
export interface TelemetryBreadcrumb {
  category: 'navigation' | 'network' | 'lifecycle' | 'ritual';
  message: string;
}

export interface TelemetryAdapter {
  /**
   * Report a caught error. Never throws and never rejects: telemetry failing must not become the
   * user's problem, and a throw here would re-enter the ErrorBoundary that called it.
   */
  captureError(report: TelemetryErrorReport, error?: unknown): void;
  /** Leave a breadcrumb for the next report. Never throws. */
  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void;
  /**
   * Associate reports with the pseudonymous analytics identity (ADR-013/031) — never an email,
   * a name, or a Supabase user id. Pass null on sign-out.
   */
  setUserPseudoId(pseudoId: string | null): void;
}

/**
 * The adapter in use until a concrete reporter is wired.
 *
 * It logs in development and drops the report in production. Logging is not reporting — nobody
 * reads a device console — but a developer running the app should be able to see that the call
 * site fired, which is the only part of the chain this slice can actually verify.
 */
export class NullTelemetryAdapter implements TelemetryAdapter {
  captureError(report: TelemetryErrorReport, error?: unknown): void {
    if (__DEV__) {
      console.warn(
        `[telemetry] ${report.code} at ${report.surface} — NOT REPORTED (no telemetry adapter configured).`,
        error,
      );
    }
  }

  addBreadcrumb(_breadcrumb: TelemetryBreadcrumb): void {
    // no-op: breadcrumbs only have value attached to a report, and nothing is reported.
  }

  setUserPseudoId(_pseudoId: string | null): void {
    // no-op
  }
}
