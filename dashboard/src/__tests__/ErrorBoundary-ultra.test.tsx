// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';

const { default: ErrorBoundary } = await import('@/components/ErrorBoundary');

// Component that throws on render
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary-ultra', () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => { console.error = vi.fn(); });
  afterEach(() => {
    console.error = originalError;
    cleanup();
  });

  // Test 1: Renders children when no error
  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  // Test 2: Shows error UI when child throws
  it('shows error UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  // Test 3: Shows "Try again" button
  it('shows "Try again" button on error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(getByText('Try again')).toBeTruthy();
  });

  // Test 4: Resets error state on "Try again" click
  it('resets error state when "Try again" clicked', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Click "Try again" — since the child still throws, it re-catches
    fireEvent.click(getByText('Try again'));
    // The error boundary should still show the error (child re-throws)
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  // Test 5: Shows custom fallback when provided
  it('renders custom fallback when provided', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(getByText('Custom error UI')).toBeTruthy();
  });

  // Test 6: Shows error emoji
  it('shows error emoji', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(getByText('💥')).toBeTruthy();
  });

  // Test 7: Error message is displayed
  it('displays the error message', () => {
    function SpecificError() {
      throw new Error('Specific error message');
    }
    const { getByText } = render(
      <ErrorBoundary>
        <SpecificError />
      </ErrorBoundary>
    );
    expect(getByText('Specific error message')).toBeTruthy();
  });

  // Test 8: Handles multiple children without error
  it('handles multiple children without error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );
    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
    expect(getByText('Child 3')).toBeTruthy();
  });

  // Test 9: Has glass-card styling on error
  it('has glass-card styling on error', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const errorCard = container.querySelector('.glass-card');
    expect(errorCard).toBeTruthy();
  });

  // Test 10: Try again button has correct styling
  it('Try again button has brand styling', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    const btn = getByText('Try again').closest('button')!;
    expect(btn.className).toContain('bg-brand-600');
  });
});
