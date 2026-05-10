// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, cleanup } from '@testing-library/react';

const { ToastProvider, useToast } = await import('@/components/Toast');

function ToastConsumer() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast('Success!', 'success')}>success</button>
      <button onClick={() => toast('Error!', 'error')}>error</button>
      <button onClick={() => toast('Info!')}>info</button>
      <button onClick={() => toast('Default')}>default</button>
    </div>
  );
}

function renderWithToast() {
  return render(
    <ToastProvider>
      <ToastConsumer />
    </ToastProvider>
  );
}

describe('Toast-ultra: ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('renders children without crashing', () => {
    const { getByText } = renderWithToast();
    expect(getByText('success')).toBeTruthy();
  });

  it('shows success toast', () => {
    const { getByText } = renderWithToast();
    act(() => { fireEvent.click(getByText('success')); });
    expect(getByText('Success!')).toBeTruthy();
    expect(getByText('Success!').closest('[class*="bg-green"]')).toBeTruthy();
  });

  it('shows error toast', () => {
    const { getByText } = renderWithToast();
    act(() => { fireEvent.click(getByText('error')); });
    expect(getByText('Error!')).toBeTruthy();
    expect(getByText('Error!').closest('[class*="bg-red"]')).toBeTruthy();
  });

  it('shows info toast', () => {
    const { getByText } = renderWithToast();
    act(() => { fireEvent.click(getByText('info')); });
    expect(getByText('Info!')).toBeTruthy();
    expect(getByText('Info!').closest('[class*="bg-gray"]')).toBeTruthy();
  });

  it('defaults to info type', () => {
    const { getByText } = renderWithToast();
    act(() => { fireEvent.click(getByText('default')); });
    expect(getByText('Default').closest('[class*="bg-gray"]')).toBeTruthy();
  });

  it('shows multiple toasts', () => {
    const { getByText } = renderWithToast();
    act(() => {
      fireEvent.click(getByText('success'));
      fireEvent.click(getByText('error'));
    });
    expect(getByText('Success!')).toBeTruthy();
    expect(getByText('Error!')).toBeTruthy();
  });

  it('auto-dismisses after 4 seconds', () => {
    const { getByText, queryByText } = renderWithToast();
    act(() => { fireEvent.click(getByText('success')); });
    expect(getByText('Success!')).toBeTruthy();

    act(() => { vi.advanceTimersByTime(4000); });
    expect(queryByText('Success!')).toBeNull();
  });

  it('dismisses when X clicked', () => {
    const { getByText, getByLabelText, queryByText } = renderWithToast();
    act(() => { fireEvent.click(getByText('success')); });
    expect(getByText('Success!')).toBeTruthy();

    act(() => { fireEvent.click(getByLabelText('Dismiss notification')); });
    expect(queryByText('Success!')).toBeNull();
  });

  it('limits to 4 toasts', () => {
    const { getByText, container } = renderWithToast();
    act(() => {
      fireEvent.click(getByText('success'));
      fireEvent.click(getByText('error'));
      fireEvent.click(getByText('info'));
      fireEvent.click(getByText('default'));
      fireEvent.click(getByText('success')); // 5th
    });
    const alertContainer = container.querySelector('[role="alert"]');
    expect(alertContainer!.children.length).toBeLessThanOrEqual(4);
  });

  it('has alert role', () => {
    const { container } = renderWithToast();
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('useToast throws outside ToastProvider', () => {
    function BadConsumer() { useToast(); return null; }
    expect(() => render(<BadConsumer />)).toThrow('useToast must be used within ToastProvider');
  });
});
