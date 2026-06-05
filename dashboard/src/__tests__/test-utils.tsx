/**
 * Shared test utilities — wraps components with all required providers.
 *
 * Usage:
 *   import { renderWithProviders } from './test-utils';
 *   renderWithProviders(<MyComponent />);
 */
import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Try to import NextIntlClientProvider — may be mocked out by test files
let NextIntlClientProvider: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NextIntlClientProvider = require('next-intl').NextIntlClientProvider;
} catch {
  // Not available (mocked out)
}

// Common messages for tests — maps i18n keys to readable values
const testMessages: Record<string, any> = {
  confirm: 'Confirm',
  cancel: 'Cancel',
  processing: 'Processing...',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  create: 'Create',
  close: 'Close',
  loading: 'Loading...',
  retry: 'Retry',
  search: 'Search',
  filter: 'Filter',
  reset: 'Reset',
  submit: 'Submit',
  back: 'Back',
  next: 'Next',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
  sending: 'Sending...',
  sendMessage: 'Send Message',
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    processing: 'Processing...',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    close: 'Close',
    loading: 'Loading...',
    retry: 'Retry',
    search: 'Search',
    redirecting: 'Redirecting to login...',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    backToDashboard: 'Back to Dashboard',
    sending: 'Sending...',
    sendMessage: 'Send Message',
    statusLabels: {
      delivered: 'Delivered',
      failed: 'Failed',
      pending: 'Pending',
      active: 'Active',
      inactive: 'Inactive',
      success: 'Success',
      error: 'Error',
      healthy: 'Healthy',
      degraded: 'Degraded',
      down: 'Down',
      unknown: 'Unknown',
      processing: 'Processing',
      cancelled: 'Cancelled',
      completed: 'Completed',
    },
  },
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  locale?: string;
  messages?: Record<string, any>;
  /** Set to false to skip NextIntlClientProvider wrapping (for tests that mock next-intl themselves) */
  withIntl?: boolean;
}

/**
 * Render a component wrapped with QueryClientProvider + NextIntlClientProvider.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), locale = 'en', messages = testMessages, withIntl = true, ...renderOptions }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    let content = children;
    if (withIntl && NextIntlClientProvider) {
      content = (
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      );
    }

    return (
      <QueryClientProvider client={queryClient}>
        {content}
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

export { createTestQueryClient };
