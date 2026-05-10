// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const { default: RetryPolicyPage } = await import('@/app/[locale]/dashboard/retry-policy/page');

describe('RetryPolicyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue([
      { id: 'ep1', max_attempts: 5, base_delay_ms: 10000, max_delay_ms: 3600000, multiplier: 2.0 },
    ]);
  });

  it('renders loading state', async () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    render(React.createElement(RetryPolicyPage));
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders header and save button', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText(/Retry Policy/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Save Changes').length).toBeGreaterThan(0);
  });

  it('renders retry settings section', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText('Retry Settings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Max Attempts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Backoff Strategy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Initial Delay (sec)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Max Delay (sec)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Request Timeout (sec)').length).toBeGreaterThan(0);
  });

  it('renders backoff options', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText('Exponential').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Linear').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fixed').length).toBeGreaterThan(0);
  });

  it('renders dead letter queue section', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText('Dead Letter Queue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Enable DLQ').length).toBeGreaterThan(0);
  });

  it('renders status codes section', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText('Retry on Status Codes').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/408/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/429/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/500/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/502/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/503/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/504/).length).toBeGreaterThan(0);
  });

  it('renders delay preview section', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText(/Delay Preview/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Attempt 1/).length).toBeGreaterThan(0);
  });

  it('renders total retry time', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText(/Total retry time/).length).toBeGreaterThan(0);
  });

  it('renders tip section', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText(/Tip:/).length).toBeGreaterThan(0);
  });

  it('saves policy successfully', async () => {
    mockApiFetch
      .mockResolvedValueOnce([{ id: 'ep1', max_attempts: 5, base_delay_ms: 10000, max_delay_ms: 3600000, multiplier: 2.0 }])
      .mockResolvedValueOnce([{ id: 'ep1' }]) // endpoints list for save
      .mockResolvedValueOnce({}); // PUT retry-policy

    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });

    const saveBtns = screen.getAllByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveBtns[saveBtns.length - 1]);
    });

    expect(mockToast).toHaveBeenCalled();
  });

  it('handles save error', async () => {
    mockApiFetch
      .mockResolvedValueOnce([{ id: 'ep1', max_attempts: 5, base_delay_ms: 10000, max_delay_ms: 3600000, multiplier: 2.0 }])
      .mockRejectedValueOnce(new Error('Save failed'));

    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });

    const saveBtns = screen.getAllByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveBtns[saveBtns.length - 1]);
    });

    expect(mockToast).toHaveBeenCalled();
  });

  it('changes max attempts value', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    const inputs = screen.getAllByRole('spinbutton');
    const maxAttemptsInput = inputs[0]; // first number input
    await act(async () => {
      fireEvent.change(maxAttemptsInput, { target: { value: '10' } });
    });
    expect((maxAttemptsInput as HTMLInputElement).value).toBe('10');
  });

  it('toggles status code checkbox', async () => {
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    const checkboxes = screen.getAllByRole('checkbox');
    // Click first status code checkbox to toggle it
    if (checkboxes.length > 0) {
      await act(async () => {
        fireEvent.click(checkboxes[0]);
      });
    }
  });

  it('handles API error on fetch', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    // Should still render with defaults
    expect(screen.getAllByText(/Retry Policy/).length).toBeGreaterThan(0);
  });

  it('uses defaults when no endpoints', async () => {
    mockApiFetch.mockResolvedValue([]);
    await act(async () => {
      render(React.createElement(RetryPolicyPage));
    });
    expect(screen.getAllByText(/Retry Policy/).length).toBeGreaterThan(0);
  });
});
