// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/Toast';

// Helper component to trigger toasts
function ToastTrigger({ message, type }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const { toast } = useToast();
  return (
    <button onClick={() => toast(message, type)} data-testid="trigger">
      Trigger
    </button>
  );
}

function renderWithProvider(ui: React.ReactNode) {
  return render(
    <ToastProvider>
      {ui}
    </ToastProvider>
  );
}

describe('ToastProvider + useToast - Ultra Coverage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // === Basic Rendering ===
  it('renders children without crashing', () => {
    const { container } = renderWithProvider(<div>Child</div>);
    expect(container.textContent).toContain('Child');
  });

  it('renders toast container with correct role', () => {
    const { container } = renderWithProvider(<ToastTrigger message="test" />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert!.getAttribute('aria-live')).toBe('assertive');
  });

  it('starts with no toasts', () => {
    const { container } = renderWithProvider(<ToastTrigger message="test" />);
    const toasts = container.querySelectorAll('.animate-slide-up');
    expect(toasts.length).toBe(0);
  });

  // === Triggering Toasts ===
  it('shows toast on trigger', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Hello!" />);
    const trigger = container.querySelector('[data-testid="trigger"]')!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    expect(container.textContent).toContain('Hello!');
  });

  it('shows success toast with green styling', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Success!" type="success" />);
    const trigger = container.querySelector('[data-testid="trigger"]')!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    const toastEl = container.querySelector('.bg-green-600');
    expect(toastEl).toBeTruthy();
    expect(toastEl!.textContent).toContain('Success!');
  });

  it('shows error toast with red styling', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Error!" type="error" />);
    const trigger = container.querySelector('[data-testid="trigger"]')!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    const toastEl = container.querySelector('.bg-red-600');
    expect(toastEl).toBeTruthy();
    expect(toastEl!.textContent).toContain('Error!');
  });

  it('shows info toast with dark styling (default)', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Info!" />);
    const trigger = container.querySelector('[data-testid="trigger"]')!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    const toastEl = container.querySelector('.bg-gray-900');
    expect(toastEl).toBeTruthy();
    expect(toastEl!.textContent).toContain('Info!');
  });

  it('defaults to info type when no type specified', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Default" />);
    const trigger = container.querySelector('[data-testid="trigger"]')!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    const toastEl = container.querySelector('.bg-gray-900');
    expect(toastEl).toBeTruthy();
  });

  // === Multiple Toasts ===
  it('shows multiple toasts', async () => {
    function MultiTrigger() {
      const { toast } = useToast();
      return (
        <div>
          <button onClick={() => toast('First', 'success')} data-testid="t1">1</button>
          <button onClick={() => toast('Second', 'error')} data-testid="t2">2</button>
          <button onClick={() => toast('Third', 'info')} data-testid="t3">3</button>
        </div>
      );
    }

    const { container } = renderWithProvider(<MultiTrigger />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="t1"]')!);
      fireEvent.click(container.querySelector('[data-testid="t2"]')!);
      fireEvent.click(container.querySelector('[data-testid="t3"]')!);
    });
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('Second');
    expect(container.textContent).toContain('Third');
  });

  it('limits toasts to MAX_TOASTS (4)', async () => {
    function ManyTriggers() {
      const { toast } = useToast();
      return (
        <div>
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => toast(`Toast ${i}`, 'info')} data-testid={`t${i}`}>
              {i}
            </button>
          ))}
        </div>
      );
    }

    const { container } = renderWithProvider(<ManyTriggers />);
    // Click all 5
    for (let i = 1; i <= 5; i++) {
      await act(async () => {
        fireEvent.click(container.querySelector(`[data-testid="t${i}"]`)!);
      });
    }
    // Should only show last 4 (MAX_TOASTS = 4)
    const toastEls = container.querySelectorAll('.animate-slide-up');
    expect(toastEls.length).toBeLessThanOrEqual(4);
    // Toast 1 should have been removed
    expect(container.textContent).not.toContain('Toast 1');
    expect(container.textContent).toContain('Toast 5');
  });

  // === Dismiss ===
  it('dismisses toast on close button click', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Dismissible" type="success" />);
    const trigger = container.querySelector('[data-testid="trigger"]')!;
    await act(async () => {
      fireEvent.click(trigger);
    });
    expect(container.textContent).toContain('Dismissible');

    // Find and click dismiss button
    const dismissBtn = container.querySelector('[aria-label="Dismiss notification"]');
    expect(dismissBtn).toBeTruthy();
    await act(async () => {
      fireEvent.click(dismissBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).not.toContain('Dismissible');
    });
  });

  it('dismiss button has correct aria-label', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Test" type="info" />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="trigger"]')!);
    });
    const dismissBtn = container.querySelector('[aria-label="Dismiss notification"]');
    expect(dismissBtn).toBeTruthy();
  });

  it('only dismisses the clicked toast', async () => {
    function TwoTriggers() {
      const { toast } = useToast();
      return (
        <div>
          <button onClick={() => toast('Keep me', 'success')} data-testid="keep">Keep</button>
          <button onClick={() => toast('Remove me', 'error')} data-testid="remove">Remove</button>
        </div>
      );
    }

    const { container } = renderWithProvider(<TwoTriggers />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="keep"]')!);
      fireEvent.click(container.querySelector('[data-testid="remove"]')!);
    });
    expect(container.textContent).toContain('Keep me');
    expect(container.textContent).toContain('Remove me');

    // Dismiss the second toast
    const dismissBtns = container.querySelectorAll('[aria-label="Dismiss notification"]');
    await act(async () => {
      fireEvent.click(dismissBtns[dismissBtns.length - 1]!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Keep me');
      expect(container.textContent).not.toContain('Remove me');
    });
  });

  // === Auto-dismiss (timeout) ===
  it('auto-dismisses toast after 4 seconds', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Temporary" type="info" />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="trigger"]')!);
    });
    expect(container.textContent).toContain('Temporary');

    // Advance timer by 4 seconds
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain('Temporary');
    });
  });

  it('toast remains visible before 4 second timeout', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Still here" type="success" />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="trigger"]')!);
    });

    // Advance by 3 seconds (not yet dismissed)
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(container.textContent).toContain('Still here');
  });

  // === Styling ===
  it('toast container is fixed at bottom-right', () => {
    const { container } = renderWithProvider(<ToastTrigger message="Test" />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert!.className).toContain('fixed');
    expect(alert!.className).toContain('bottom-6');
    expect(alert!.className).toContain('right-6');
    expect(alert!.className).toContain('z-100');
  });

  it('success toast has rounded-xl styling', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Styled" type="success" />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="trigger"]')!);
    });
    const toastEl = container.querySelector('.bg-green-600');
    expect(toastEl!.className).toContain('rounded-xl');
    expect(toastEl!.className).toContain('shadow-lg');
  });

  // === useToast hook ===
  it('throws error when useToast used outside ToastProvider', () => {
    function BadComponent() {
      const { toast } = useToast();
      return <div>{toast ? 'ok' : 'no'}</div>;
    }
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(React.createElement(BadComponent))).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });

  // === Dismiss SVG icon ===
  it('dismiss button contains SVG close icon', async () => {
    const { container } = renderWithProvider(<ToastTrigger message="Icon test" type="info" />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="trigger"]')!);
    });
    const dismissBtn = container.querySelector('[aria-label="Dismiss notification"]');
    const svg = dismissBtn!.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('width')).toBe('14');
    expect(svg!.getAttribute('height')).toBe('14');
  });

  // === Toast message content ===
  it('displays the exact message text', async () => {
    const exactMsg = 'This is a very specific toast message 123!@#';
    const { container } = renderWithProvider(<ToastTrigger message={exactMsg} type="success" />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="trigger"]')!);
    });
    expect(container.textContent).toContain(exactMsg);
  });

  // === Rapid fire toasts ===
  it('handles rapid toast creation', async () => {
    function RapidFire() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            for (let i = 0; i < 10; i++) {
              toast(`Rapid ${i}`, 'info');
            }
          }}
          data-testid="rapid"
        >
          Fire
        </button>
      );
    }

    const { container } = renderWithProvider(<RapidFire />);
    await act(async () => {
      fireEvent.click(container.querySelector('[data-testid="rapid"]')!);
    });
    // Should only show max 4 toasts
    const toastEls = container.querySelectorAll('.animate-slide-up');
    expect(toastEls.length).toBeLessThanOrEqual(4);
  });
});
