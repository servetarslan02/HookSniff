'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** i18n overrides — defaults to English */
  title?: string;
  description?: string;
  retryLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in dev; in production this would go to Sentry/OTEL
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const title = this.props.title || 'Something went wrong';
      const description = this.props.description || 'An unexpected error occurred. Please try again.';
      const retryLabel = this.props.retryLabel || 'Try again';

      return (
        <div className="glass-card p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">💥</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{description}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            {retryLabel}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
