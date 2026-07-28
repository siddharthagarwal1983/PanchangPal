/**
 * The concrete Sentry client for Edge Functions (TDD Part 5 §7.1 — "Sentry (client + Edge
 * Functions), correlation IDs"). The client half of §7.1 lives in
 * `apps/mobile/src/data/sentryTelemetry.ts`; this is the server half, behind the same
 * `ServerTelemetry` port so `errorResponse()` remains the one exit every ERR_* passes through.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * WHY THE SDK IS IMPORTED DYNAMICALLY, AND ONLY WHEN A DSN EXISTS
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * `_shared/http.ts` is imported by EVERY Edge Function. A top-level `import` of a third-party SDK
 * there puts that package on the critical path of every deploy and every cold start: if it fails
 * to resolve, or slows boot, it does so for `today`, `sync`, `account` and everything else at
 * once — including the endpoints that have nothing to do with telemetry.
 *
 * A dynamic import behind the DSN check makes the blast radius zero while no DSN is provisioned,
 * which is the state today. Nothing is fetched, nothing is evaluated, and the functions behave
 * exactly as they did before this file existed.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * SAME PII RULE AS EVERYWHERE ELSE (§7.1 `[MANDATORY]`)
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * `toServerErrorReport` already drops `err.message`, "because an unknown error's message is
 * whatever a library chose to say — the place a query string, a row, or a token would leak."
 * This client holds that line at the SDK boundary too: it sends the ERR_* code, the function name
 * and the correlation id, and it does NOT pass the thrown value to the SDK. That is a deliberate
 * difference from the mobile adapter, which does pass the error so Sentry can extract a stack:
 * on a device the stack is our own code, whereas a server-side stack is usually inside Postgres or
 * a fetch library and its frames carry query text.
 *
 * ⚠️ NOT VERIFIED END-TO-END. No Sentry DSN is provisioned and Edge Functions have not been
 * redeployed with this file, so nothing here has been observed delivering an event. The shape is
 * tested; the delivery is not. Do not record §7.2 as satisfied on the strength of this module.
 */
import type { ServerErrorReport, ServerTelemetry } from './telemetry.ts';

/** The subset of the Sentry SDK this module uses. Declared so the dynamic import stays typed. */
interface SentryDenoModule {
  init(options: Record<string, unknown>): void;
  captureMessage(
    message: string,
    context?: { level?: string; tags?: Record<string, string> },
  ): void;
}

/**
 * Sentry client over the ServerTelemetry port.
 *
 * `captureError` is synchronous by contract (it must never make the caller await telemetry), while
 * loading the SDK is asynchronous. The load is therefore kicked off once and the report is sent
 * when it resolves; a report that arrives during the very first load is queued rather than dropped.
 */
export class SentryServerTelemetry implements ServerTelemetry {
  #sdk: SentryDenoModule | null = null;
  #loading: Promise<void> | null = null;
  /** Reports received before the SDK finished loading. Bounded — see `#queue` handling below. */
  #pending: ServerErrorReport[] = [];

  constructor(
    private readonly dsn: string,
    private readonly environment: string,
    /** Injectable for tests: the real loader performs a dynamic import. */
    private readonly load: () => Promise<SentryDenoModule> = () =>
      import('npm:@sentry/deno@8') as unknown as Promise<SentryDenoModule>,
  ) {}

  captureError(report: ServerErrorReport): void {
    try {
      if (this.#sdk) {
        this.#send(this.#sdk, report);
        return;
      }

      // An Edge Function instance handling a burst of failures must not accumulate reports without
      // bound while the SDK loads. Ten is enough to see a pattern and small enough to be free.
      if (this.#pending.length < 10) this.#pending.push(report);

      this.#ensureLoaded();
    } catch {
      // Telemetry must never replace the original error. The structured log in `logging.ts`
      // remains the real record either way.
    }
  }

  #ensureLoaded(): void {
    if (this.#loading) return;

    this.#loading = this.load()
      .then((sdk) => {
        sdk.init({
          dsn: this.dsn,
          environment: this.environment,
          // No PII, stated rather than inherited — the same reasoning as the mobile adapter.
          sendDefaultPii: false,
          // Server-side tracing is a separate deliverable (B4.4) and would multiply event volume
          // on a free tier that the crash-free metric depends on.
          tracesSampleRate: 0,
        });
        this.#sdk = sdk;
        for (const queued of this.#pending) this.#send(sdk, queued);
        this.#pending = [];
      })
      .catch(() => {
        // The SDK could not be loaded (offline, registry failure, removed package). Errors are
        // still logged by `logging.ts`; telemetry degrading must not take the function with it.
        this.#pending = [];
      });
  }

  /**
   * Send as a MESSAGE whose text is the ERR_* code, never `captureException` with the thrown
   * value — see the header. Tags carry the triage axes and are indexed by Sentry.
   */
  #send(sdk: SentryDenoModule, report: ServerErrorReport): void {
    sdk.captureMessage(report.code, {
      level: 'error',
      tags: {
        err_code: report.code,
        fn: report.fn,
        correlation_id: report.correlation_id,
        recoverable: String(report.recoverable),
      },
    });
  }
}
