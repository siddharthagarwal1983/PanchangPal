/**
 * App-level ErrorBoundary (TDD Part 4 §5.3).
 * Catches render/runtime errors and shows a calm fallback UI instead of a
 * white screen. Never exposes raw error details to the user.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@panchangpal/ui';
import { t } from '../i18n';

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
    // TODO: Replace with Sentry/Crashlytics or your logging service.
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