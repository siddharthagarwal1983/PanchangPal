/**
 * The concrete Sentry reporter behind the TelemetryAdapter port (TDD Part 5 §7.1, Provider Adapter
 * pattern). This is the ONLY module in the app permitted to import `@sentry/react-native` — every
 * feature, screen and repository reaches telemetry through the port, and nothing else touches the
 * vendor SDK.
 *
 * WHAT THIS BUYS THAT THE NULL ADAPTER DID NOT: `enableAutoSessionTracking` makes **crash-free
 * sessions** (NFR-06, §7.2) measurable. That is the metric §10.1 gates the launch on, and it is the
 * specific reason B4 could not close on the seam alone — a port with nothing behind it reports
 * nothing, and an app that reports nothing looks exactly like an app with no errors.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * NO PII IS STRUCTURAL, NOT ASPIRATIONAL (§7.1 `[MANDATORY]` "No PII in any telemetry")
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * A crash reporter's defaults are tuned for debuggability, not for a privacy-first app, and every
 * one of the following would otherwise carry user content off the device:
 *
 *   - **Exception messages.** `toErrorCode` already refuses to echo a message, "because a message
 *     is free text and free text is where PII gets in"; `toServerErrorReport` drops `err.message`
 *     for the same reason. This adapter holds the same line at the SDK boundary: `beforeSend`
 *     REWRITES every exception value to its ERR_* code. The **stack survives** — a stack is file,
 *     line and function names, i.e. the shape of our own code, and it is the entire diagnostic
 *     value of a crash reporter. The message is the leak vector; the stack is not.
 *   - **Automatic breadcrumbs.** Console breadcrumbs capture whatever was logged, and network
 *     breadcrumbs capture URLs — which for this app means query strings containing a `local_date`,
 *     a household id, or an invite token. Only the four app-defined categories the port declares
 *     survive `beforeBreadcrumb`.
 *   - **`request`, `extra`, and user identity.** `request` carries headers and URLs; `extra` is an
 *     open bag; and `user` may be populated with an email or username by any future call. All are
 *     stripped or reduced to the pseudonymous id in `beforeSend`.
 *
 * `sendDefaultPii: false` is the SDK default in v7 and is stated anyway, because a default that
 * silently flips is exactly how a `[MANDATORY]` rule stops holding.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * WHY THE SDK'S OWN JS ERROR HANDLER IS DISABLED
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * `installGlobalErrorHandler` already routes unhandled JS errors through the port, which is the
 * architecture's single exit. Sentry's `ReactNativeErrorHandlers` integration hooks the same
 * `ErrorUtils` global, so leaving both active reports every crash TWICE — and the duplicate would
 * arrive with an unscrubbed message, since it never passes through `captureError`. Removing it
 * keeps the port meaningful and the scrubbing total.
 *
 * **Native crash handling stays ON.** A Java or Objective-C crash never reaches JS, so the port
 * cannot see it and disabling native capture would lose precisely the crashes that matter most to
 * the crash-free SLO.
 */
import * as Sentry from '@sentry/react-native';
import {
  isErrorCode,
  type TelemetryAdapter,
  type TelemetryBreadcrumb,
  type TelemetryErrorReport,
} from '../domain/telemetry';

/** The breadcrumb categories the port declares. Anything else is an SDK automatic breadcrumb. */
const APP_BREADCRUMB_CATEGORIES: ReadonlySet<string> = new Set([
  'navigation',
  'network',
  'lifecycle',
  'ritual',
]);

/** Tag carrying the ERR_* code, so `beforeSend` can rewrite the message without guessing. */
const CODE_TAG = 'err_code';

/** Replaces any exception message whose code we could not establish. */
const REDACTED = 'ERR_UNKNOWN (message withheld — §7.1 no PII)';

/**
 * Strip everything that could carry user content, and replace exception messages with the ERR_*
 * code. Exported for tests: this function is the entire privacy guarantee, so it is asserted
 * directly rather than inferred from a mocked `init`.
 */
export function scrubEvent<T extends Sentry.Event>(event: T): T {
  const tagged = event.tags?.[CODE_TAG];
  const code = isErrorCode(tagged) ? tagged : null;

  // The message is the leak vector; the stack is the diagnostic value. Keep the second, replace
  // the first with the taxonomy code.
  for (const value of event.exception?.values ?? []) {
    value.value = code ?? REDACTED;
  }

  // A top-level message is free text by construction.
  if (event.message) event.message = code ?? REDACTED;

  // URLs (query strings carry local_date / household id / invite token) and headers.
  delete event.request;
  // An open bag nothing constrains.
  delete event.extra;

  // Identity is the pseudonymous id and nothing else — never an email, username, or IP, and never
  // the Supabase user id (ADR-013/ADR-031).
  if (event.user) {
    const id = typeof event.user.id === 'string' ? event.user.id : undefined;
    event.user = id ? { id } : {};
  }

  // Belt and braces with beforeBreadcrumb: an automatic breadcrumb attached before this adapter
  // installed its filter would still be dropped here.
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter(
      (b) => b.category !== undefined && APP_BREADCRUMB_CATEGORIES.has(b.category),
    );
  }

  // Group by taxonomy rather than by message. With messages rewritten, Sentry's default grouping
  // would otherwise collapse unrelated failures that happen to share a scrubbed value.
  if (code) event.fingerprint = [code];

  return event;
}

/**
 * Drop every automatic breadcrumb, keeping only the four categories the port defines.
 * Exported for the same reason as `scrubEvent`.
 */
export function filterBreadcrumb(crumb: Sentry.Breadcrumb): Sentry.Breadcrumb | null {
  if (!crumb.category || !APP_BREADCRUMB_CATEGORIES.has(crumb.category)) return null;
  return crumb;
}

/** The `Sentry.init` options this app uses. Exported so the hardening can be asserted in tests. */
export function buildSentryOptions(input: {
  dsn: string;
  environment: string;
}): Sentry.ReactNativeOptions {
  return {
    dsn: input.dsn,
    environment: input.environment,

    // Crash-free sessions (NFR-06 / §7.2) — the reason this adapter exists.
    enableAutoSessionTracking: true,

    // Explicit rather than inherited: see the header.
    sendDefaultPii: false,

    // Request/response capture pulls in URLs and bodies.
    enableCaptureFailedRequests: false,

    // Performance tracing is NOT enabled here. §7.2's latency SLOs are a separate deliverable
    // (B4.4) and tracing every transaction on a free tier would exhaust the quota that the
    // crash-free metric depends on. Turning it on is a deliberate later decision, not a default.
    tracesSampleRate: 0,

    beforeSend: scrubEvent,
    beforeBreadcrumb: filterBreadcrumb,

    // Remove ONLY the JS global-error hook — it duplicates `installGlobalErrorHandler`, and the
    // duplicate would bypass `captureError` and therefore the scrubbing. Everything else,
    // including native crash capture, is left as the SDK ships it.
    integrations: (defaults) => defaults.filter((i) => i.name !== 'ReactNativeErrorHandlers'),
  };
}

let initialized = false;

/**
 * Initialise the SDK once. Idempotent: the composition root can re-run under Fast Refresh, and
 * `Sentry.init` twice would install a second client and double-report.
 */
export function initSentry(input: { dsn: string; environment: string }): void {
  if (initialized) return;
  initialized = true;
  Sentry.init(buildSentryOptions(input));
}

/** Test seam: allow a fresh init to be observed. */
export function resetSentryInitForTests(): void {
  initialized = false;
}

/**
 * TelemetryAdapter over the Sentry SDK.
 *
 * Every method swallows: telemetry failing must never become the user's problem, and a throw from
 * `captureError` would re-enter the ErrorBoundary that called it.
 */
export class SentryTelemetryAdapter implements TelemetryAdapter {
  captureError(report: TelemetryErrorReport, error?: unknown): void {
    try {
      Sentry.withScope((scope) => {
        // Tags are indexed and searchable, and are the triage axis §7.1 actually asks for.
        scope.setTag(CODE_TAG, report.code);
        scope.setTag('surface', report.surface);
        scope.setTag('recoverable', String(report.recoverable ?? false));
        // Server-minted request id (ADR-022) — joins this report to the Edge Function log line and
        // to EVT_054. Not a user identifier.
        if (report.correlationId) scope.setTag('correlation_id', report.correlationId);

        // Pass the thrown value so the SDK can extract a STACK. Its message is rewritten in
        // `beforeSend`; if there is no Error at all, report the code itself so the event still
        // exists rather than being silently skipped.
        Sentry.captureException(error ?? new Error(report.code));
      });
    } catch {
      // Deliberately silent — see the class comment.
    }
  }

  addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
    try {
      Sentry.addBreadcrumb({ category: breadcrumb.category, message: breadcrumb.message });
    } catch {
      // Deliberately silent.
    }
  }

  setUserPseudoId(pseudoId: string | null): void {
    try {
      Sentry.setUser(pseudoId ? { id: pseudoId } : null);
    } catch {
      // Deliberately silent.
    }
  }
}
