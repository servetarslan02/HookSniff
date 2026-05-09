// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/Toast';
import React from 'react';

// Helper component to test useToast hook
function ToastTrigger() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.toast('Success!', 'success')}>Success</button>
      <button onClick={() => toast.toast('Error!', 'error')}>Error</button>
      <button onClick={() => toast.toast('Info!')}>Info</button>
    </div>
  );
}

describe('Toast', () => {
  it('renders children without crashing', () => {
    const { container } = render(
      <ToastProvider>
        <div>child</div>
      </ToastProvider>
    );
    expect(container.textContent).toContain('child');
  });

  it('shows success toast', async () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const successBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Success'
      )!;
      fireEvent.click(successBtn);
    });
    expect(container.textContent).toContain('Success!');
  });

  it('shows error toast', async () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const errorBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Error'
      )!;
      fireEvent.click(errorBtn);
    });
    expect(container.textContent).toContain('Error!');
  });

  it('shows info toast', async () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const infoBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Info'
      )!;
      fireEvent.click(infoBtn);
    });
    expect(container.textContent).toContain('Info!');
  });

  it('applies correct class for success toast', async () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const successBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Success'
      )!;
      fireEvent.click(successBtn);
    });
    const toastEl = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'Success!' && el.classList.contains('bg-green-600')
    );
    expect(toastEl).toBeTruthy();
  });

  it('applies correct class for error toast', async () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const errorBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Error'
      )!;
      fireEvent.click(errorBtn);
    });
    const toastEl = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'Error!' && el.classList.contains('bg-red-600')
    );
    expect(toastEl).toBeTruthy();
  });

  it('applies correct class for info toast', async () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const infoBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Info'
      )!;
      fireEvent.click(infoBtn);
    });
    const toastEl = Array.from(container.querySelectorAll('div')).find(
      (el) => el.textContent === 'Info!' && el.classList.contains('bg-gray-900')
    );
    expect(toastEl).toBeTruthy();
  });

  it('removes toast after timeout', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await act(async () => {
      const successBtn = Array.from(container.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Success'
      )!;
      fireEvent.click(successBtn);
    });
    expect(container.textContent).toContain('Success!');

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(container.textContent).not.toContain('Success!');
    vi.useRealTimers();
  });

  it('throws when useToast used outside ToastProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<ToastTrigger />);
    }).toThrow('useToast must be used within ToastProvider');
    consoleSpy.mockRestore();
  });
});
