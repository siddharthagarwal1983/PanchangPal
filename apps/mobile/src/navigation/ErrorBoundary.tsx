/**
 * App-level ErrorBoundary (TDD Part 4 §5.3).
 * Catches render/runtime errors and shows a calm fallback UI instead of a
 * white screen. Never exposes raw error details to the user.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@panchangpal/ui';
import { t } from '../i18n';
import { toErrorCode } from '../domain/telemetry';
import { getTelemetryAdapter } from '../data/telemetryAdapter';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Report through the TelemetryAdapter port (TDD Part 5 §7.1) — never a vendor SDK directly.
    // The adapter is currently the Null implementation, so this reaches no service yet; the call
    // site is what B4.1 fixes, the destination is what wiring a real adapter fixes.
    //
    // `errorInfo.componentStack` is deliberately NOT forwarded: §7.1 forbids PII in telemetry, and
    // a component stack can carry rendered values. The Error itself is passed for a future
    // reporter's own stack handling; the structured report carries only the ERR_* code.
    getTelemetryAdapter().captureError(
      { code: toErrorCode(error), surface: 'error-boundary', recoverable: true },
      error,
    );
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private readonly reset = (): void => {
    this.setState({
      hasError: false,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          message={t('errors.unknown')}
          onRetry={this.reset}
          retryLabel={t('actions.retry')}
        />
      );
    }

    return this.props.children;
  }
}