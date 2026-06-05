/**
 * Global test setup — patches @testing-library/react's render to automatically
 * wrap components with QueryClientProvider. This fixes all "No QueryClient set"
 * errors across the entire test suite without modifying individual test files.
 */
import { vi } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a shared test QueryClient
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0, staleTime: 0 },
    mutations: { retry: false },
  },
});

// Patch @testing-library/react to auto-wrap with QueryClientProvider
vi.mock('@testing-library/react', async () => {
  const actual = await vi.importActual<typeof import('@testing-library/react')>('@testing-library/react');

  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: testQueryClient },
      children
    );
  }

  // Compose wrappers: if the test provides its own wrapper, nest it inside ours
  function CombinedWrapper({ children }: { children: React.ReactNode; _originalWrapper?: React.ComponentType<{ children: React.ReactNode }> }) {
    return React.createElement(QueryWrapper, null, children);
  }

  return {
    ...actual,
    render: (ui: React.ReactElement, options?: Record<string, unknown>) => {
      // If the test already provides a wrapper, compose it with ours
      const originalWrapper = options?.wrapper as ((props: { children: React.ReactNode }) => React.ReactNode) | undefined;
      const mergedWrapper = originalWrapper
        ? ({ children }: { children: React.ReactNode }) =>
            React.createElement(QueryWrapper, null,
              React.createElement(originalWrapper, null, children)
            )
        : QueryWrapper;

      return actual.render(ui, {
        ...options,
        wrapper: mergedWrapper,
      });
    },
  };
});
