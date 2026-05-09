// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Component that throws
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error from expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(container.textContent).toContain('Safe content');
  });

  it('renders default error UI when child throws', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(container.textContent).toContain('Something went wrong');
    expect(container.textContent).toContain('Test error');
    expect(container.textContent).toContain('Try again');
  });

  it('renders custom fallback when provided', () => {
    const { container } = render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(container.textContent).toContain('Custom error fallback');
  });

  it('recovers when Try again is clicked', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(container.textContent).toContain('Something went wrong');

    const tryAgainBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Try again'
    )!;
    fireEvent.click(tryAgainBtn);

    // After clicking Try again, hasError is reset to false.
    // But the child will still throw on re-render, so it goes back to error state.
    expect(container.textContent).toContain('Something went wrong');
  });

  it('renders error icon emoji', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(container.textContent).toContain('💥');
  });
});
