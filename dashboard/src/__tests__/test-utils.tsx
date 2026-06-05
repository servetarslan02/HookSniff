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
import { NextIntlClientProvider } from 'next-intl';

// Minimal messages for tests — just return key as value
const testMessages: Record<string, any> = {};

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
}

/**
 * Render a component wrapped with QueryClientProvider + NextIntlClientProvider.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), locale = 'en', messages = testMessages, ...renderOptions }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

export { createTestQueryClient };
