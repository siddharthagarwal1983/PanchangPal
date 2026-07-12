/**
 * App-level ErrorBoundary (TDD Part 4 §5.3). Catches render/`ERR_UNKNOWN` errors and shows
 * the calm ErrorState instead of a white screen (fail-calm, §12). Never surfaces a raw error.
 * Route-level boundaries are provided by Expo Router's per-route ErrorBoundary export.
 */
import { Component, type ReactNode } from 'react';
import { ErrorState } from '@panchangpal/ui';
import { t } from '../i18n';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    // Report to Sentry with correlation id in the observability task (ADR-023). No PII.
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorState message={t('errors.unknown')} onRetry={this.reset} retryLabel={t('actions.retry')} />;
    }
    return this.props.children;
  }
}
