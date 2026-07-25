/**
 * Global JS error handler (TDD Part 5 §7.1). The ErrorBoundary catches errors thrown during
 * render; this catches everything else — a throw inside a timer, a listener, or an async callback
 * that no React tree is on the stack for. Without it, exactly the failures that leave no visible
 * trace are also the ones no report would ever be built for.
 *
 * Reports go through the TelemetryAdapter port, which is currently the Null implementation: the
 * handler runs, builds the report, and nothing receives it until a real adapter is wired.
 */
import { toErrorCode } from '../domain/telemetry';
import { getTelemetryAdapter } from '../data/telemetryAdapter';

/** React Native's global handler hook. Not part of the DOM or Node lib, so it is declared here. */
interface ReactNativeErrorUtils {
  getGlobalHandler?: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
  setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
}

let installed = false;

/**
 * Install the handler once. Idempotent because the composition root can re-run (Fast Refresh, a
 * remounted root), and chaining a handler onto itself would report every error N times.
 *
 * The previous handler is always called. RN's default handler is what shows the redbox in dev and
 * terminates on a fatal in production; replacing it outright would silence development feedback
 * and change crash behaviour, which is not telemetry's business.
 */
export function installGlobalErrorHandler(): void {
  if (installed) return;

  const errorUtils = (globalThis as { ErrorUtils?: ReactNativeErrorUtils }).ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return; // Not running under React Native (jest/node); nothing to hook.

  const previous = errorUtils.getGlobalHandler?.();
  installed = true;

  errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    try {
      getTelemetryAdapter().captureError(
        // A fatal is not recoverable by definition — the runtime is going down after this.
        { code: toErrorCode(error), surface: 'global-handler', recoverable: !isFatal },
        error,
      );
    } catch {
      // Reporting must never replace the original error with one of its own. Swallow and continue
      // to the previous handler, which is the one that actually shows the user something.
    }
    previous?.(error, isFatal);
  });
}

/** Test seam: allow a fresh install to be observed. */
export function resetGlobalErrorHandlerForTests(): void {
  installed = false;
}
