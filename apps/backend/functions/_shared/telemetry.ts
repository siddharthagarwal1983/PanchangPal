/**
 * Server-side error telemetry (TDD Part 5 §7.1 — "Sentry (client + Edge Functions), correlation
 * IDs, source maps; every ERR_* → EVT_054").
 *
 * The port mirrors the client's TelemetryAdapter so both halves of §7.1 have the same shape: a
 * failure is reported as an ERR_* code plus the correlation id that already threads the structured
 * logs, and nothing else. The concrete Sentry client is DEFERRED — no DSN is provisioned — so
 * `NullServerTelemetry` holds the seam and reports are dropped after being correctly built.
 *
 * What this is NOT: a claim that Edge Function errors are monitored. They are logged (see
 * `logging.ts`, which is real and always has been) and now also mapped for a reporter that does not
 * exist yet. `SENTRY_DSN` absent means dropped, and `getServerTelemetryBackend()` says so.
 *
 * Pure module (no Deno globals) — Vitest-testable.
 */
import type { ErrorCode } from '@panchangpal/shared';
import { AppError } from './errors.ts';

export interface ServerErrorReport {
  /** ERR_* taxonomy code — the stable identity of the failure. */
  code: ErrorCode;
  /** The Edge Function that failed (`fn` in the structured log). */
  fn: string;
  /** Threads this report to the logs, the client's EVT_054, and the response header. */
  correlation_id: string;
  /** Whether the caller can retry — mirrors the ErrorEnvelope field. */
  recoverable: boolean;
}

export interface ServerTelemetry {
  /** Report a handled failure. Never throws: telemetry must not replace the original error. */
  captureError(report: ServerErrorReport, error?: unknown): void;
}

/** Drops every report. In use until a DSN exists and a real client is wired. */
export class NullServerTelemetry implements ServerTelemetry {
  captureError(_report: ServerErrorReport, _error?: unknown): void {
    // no-op — the structured error log in `logging.ts` remains the only real record.
  }
}

/**
 * Build the report for a thrown value.
 *
 * Deliberately drops `err.message`: an AppError's message is user-facing copy, but an unknown
 * error's message is whatever a library chose to say — the place a query string, a row, or a token
 * would leak into telemetry. §7.1 is `[MANDATORY]` about no PII, and the code plus the correlation
 * id are enough to find the matching log line, which does carry the safe detail.
 */
export function toServerErrorReport(
  err: unknown,
  ctx: { fn: string; correlationId: string },
): ServerErrorReport {
  const isApp = err instanceof AppError;
  return {
    code: (isApp ? err.code : 'ERR_UNKNOWN') as ErrorCode,
    fn: ctx.fn,
    correlation_id: ctx.correlationId,
    recoverable: isApp ? err.recoverable : true,
  };
}

/** Which reporter receives server errors. `'none'` means they are dropped. */
export type ServerTelemetryBackend = 'sentry' | 'none';

export interface ServerTelemetryStatus {
  backend: ServerTelemetryBackend;
  /** Present only when the configuration and the capability disagree. */
  warning?: string;
}

/**
 * Describe what will actually happen to a server error report.
 *
 * Until `SentryServerTelemetry` existed, both branches returned `'none'` and a configured DSN
 * produced a WARNING — the dangerous case being an operator who believes Edge Function errors are
 * reported when they are not. A DSN now resolves a real client, so the warning is gone and the
 * answer is simply which of the two states holds.
 *
 * `'sentry'` means reports are being SENT, which is not the same as being DELIVERED: the client
 * loads the SDK lazily and drops reports if that load fails, and nothing here has been observed
 * against a real DSN. See `sentryServerTelemetry.ts`.
 */
export function describeServerTelemetry(dsn: string | undefined): ServerTelemetryStatus {
  return { backend: dsn ? 'sentry' : 'none' };
}
