// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: RetryPolicyPage } = await import('@/app/[locale]/dashboard/retry-policy/page');

const MOCK_ENDPOINTS = [
  { id: 'ep_1', max_attempts: 3, base_delay_ms: 5000, max_delay_ms: 60000, multiplier: 2.0 },
  { id: 'ep_2', max_attempts: 5, base_delay_ms: 10000, max_delay_ms: 120000, multiplier: 2.0 },
];

describe('RetryPolicyPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue(MOCK_ENDPOINTS);
  });

  // === Loading State ===
  it('shows loading skeleton initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(RetryPolicyPage));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === Page Header ===
  it('renders page header with emoji', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🔄');
      expect(container.textContent).toContain('Retry Policy');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Configure global retry behavior');
    });
  });

  it('renders save button', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Changes');
      expect(saveBtn).toBeTruthy();
    });
  });

  // === Retry Settings ===
  it('renders retry settings section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Retry Settings');
      expect(container.textContent).toContain('Max Attempts');
      expect(container.textContent).toContain('Backoff Strategy');
      expect(container.textContent).toContain('Initial Delay');
      expect(container.textContent).toContain('Max Delay');
      expect(container.textContent).toContain('Request Timeout');
    });
  });

  it('populates max attempts from API data', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      const input = container.querySelector('input[type="number"][min="1"][max="20"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(parseInt(input.value)).toBe(3); // from first endpoint
    });
  });

  // === Backoff Strategy ===
  it('renders backoff options', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Exponential');
      expect(container.textContent).toContain('Linear');
      expect(container.textContent).toContain('Fixed');
    });
  });

  it('renders backoff descriptions', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Delay doubles each attempt');
      expect(container.textContent).toContain('Delay increases linearly');
      expect(container.textContent).toContain('Same delay every attempt');
    });
  });

  it('selects exponential backoff by default', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      const radios = container.querySelectorAll('input[type="radio"][name="backoff"]') as NodeListOf<HTMLInputElement>;
      expect(radios[0].checked).toBe(true); // exponential
    });
  });

  it('backoff radio buttons are rendered with correct values', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      const radios = container.querySelectorAll('input[type="radio"][name="backoff"]');
      expect(radios.length).toBe(3);
      expect((radios[0] as HTMLInputElement).value).toBe('exponential');
      expect((radios[1] as HTMLInputElement).value).toBe('linear');
      expect((radios[2] as HTMLInputElement).value).toBe('fixed');
    });
  });

  // === Dead Letter Queue ===
  it('renders DLQ section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Dead Letter Queue');
      expect(container.textContent).toContain('Enable DLQ');
    });
  });

  it('DLQ is enabled by default', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      const dlqCheckbox = container.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement;
      expect(dlqCheckbox.checked).toBe(true);
    });
  });

  it('shows max age hours when DLQ enabled', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Max Age');
      expect(container.textContent).toContain('hours');
    });
  });

  // === Status Codes ===
  it('renders status code checkboxes', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Retry on Status Codes');
      expect(container.textContent).toContain('408 Request Timeout');
      expect(container.textContent).toContain('429 Too Many Requests');
      expect(container.textContent).toContain('500 Internal Server Error');
      expect(container.textContent).toContain('502 Bad Gateway');
      expect(container.textContent).toContain('503 Service Unavailable');
      expect(container.textContent).toContain('504 Gateway Timeout');
    });
  });

  it('all status codes checked by default', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      // DLQ checkbox + 6 status code checkboxes
      const statusCheckboxes = Array.from(checkboxes).slice(1); // skip DLQ
      statusCheckboxes.forEach(cb => {
        expect((cb as HTMLInputElement).checked).toBe(true);
      });
    });
  });

  it('toggles status code on click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('408');
    });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    const statusCheckbox = checkboxes[1] as HTMLInputElement; // 408
    await act(async () => {
      fireEvent.click(statusCheckbox);
    });
    expect(statusCheckbox.checked).toBe(false);
  });

  // === Delay Preview ===
  it('renders delay preview section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Delay Preview');
      expect(container.textContent).toContain('Attempt 1');
    });
  });

  it('renders total retry time', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Total retry time');
    });
  });

  it('renders tip about per-endpoint overrides', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Per-endpoint retry policies override');
    });
  });

  // === Save ===
  it('calls save API for all endpoints', async () => {
    mockApiFetch
      .mockResolvedValueOnce(MOCK_ENDPOINTS) // fetchPolicy
      .mockResolvedValueOnce(MOCK_ENDPOINTS) // handleSave endpoints list
      .mockResolvedValueOnce({}) // ep_1 save
      .mockResolvedValueOnce({}); // ep_2 save
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Changes');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Changes');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Retry policy saved for all endpoints!', 'success');
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      // Should still render with defaults
      expect(container.textContent).toContain('Retry Policy');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/components/Toast', () => ({ useToast: () => ({ toast: mockToast }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
    const { default: PageNoToken } = await import('@/app/[locale]/dashboard/retry-policy/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // === Empty endpoints ===
  it('uses defaults when no endpoints exist', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RetryPolicyPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Retry Policy');
      // Default max attempts is 5
      const input = container.querySelector('input[type="number"][min="1"][max="20"]') as HTMLInputElement;
      expect(parseInt(input.value)).toBe(5);
    });
  });
});
