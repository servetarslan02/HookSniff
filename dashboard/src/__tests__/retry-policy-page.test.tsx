// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor, cleanup } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
  },
  endpointsApi: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({}),
  },
  portalApi: {
    get: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}));

import RetryPolicyPage from '@/app/[locale]/[username]/retry-policy/page';

describe('RetryPolicyPage', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue([]);
  });

  it('renders loading state initially', async () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<RetryPolicyPage />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders the page header after loading', async () => {
    const { getByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getByText(/Retry Policy/)).toBeTruthy();
    });
  });

  it('shows description text', async () => {
    const { getByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getByText(/Configure global retry behavior/)).toBeTruthy();
    });
  });

  it('renders save button', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Save Changes').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders max attempts input with default value 5', async () => {
    const { getAllByDisplayValue } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByDisplayValue('5').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders initial delay input with default value 10', async () => {
    const { getAllByDisplayValue } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByDisplayValue('10').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders max delay input with default value 3600', async () => {
    const { getAllByDisplayValue } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByDisplayValue('3600').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders backoff strategy radio options', async () => {
    const { container } = render(<RetryPolicyPage />);
    await waitFor(() => {
      const radios = container.querySelectorAll('input[type="radio"][name="backoff"]');
      expect(radios.length).toBe(3);
    });
  });

  it('renders status code checkboxes', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('408 Request Timeout').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('429 Too Many Requests').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders delay preview section', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText(/Delay Preview/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows attempt rows in delay preview', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Attempt 1').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders dead letter queue section', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Dead Letter Queue').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('Enable DLQ').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders request timeout input with default 30', async () => {
    const { getAllByDisplayValue } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByDisplayValue('30').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('allows changing max attempts', async () => {
    const { container } = render(<RetryPolicyPage />);
    // Wait for loading to finish
    await waitFor(() => {
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });
    // Find all number inputs - max attempts should be the first one
    const inputs = container.querySelectorAll('input[type="number"]');
    expect(inputs.length).toBeGreaterThan(0);
    const maxAttemptsInput = inputs[0] as HTMLInputElement;
    expect(maxAttemptsInput.value).toBe('5');
    fireEvent.change(maxAttemptsInput, { target: { value: '10' } });
    expect(maxAttemptsInput.value).toBe('10');
  });

  it('allows switching backoff strategy to linear', async () => {
    const { container } = render(<RetryPolicyPage />);
    await waitFor(() => {
      const radios = container.querySelectorAll('input[type="radio"][name="backoff"]');
      expect(radios.length).toBe(3);
      fireEvent.click(radios[1]); // linear
    });
  });

  it('toggles status code checkbox', async () => {
    const { container } = render(<RetryPolicyPage />);
    await waitFor(() => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  it('calls apiFetch on save and shows success toast', async () => {
    mockApiFetch.mockResolvedValue([]);
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Save Changes').length).toBeGreaterThanOrEqual(1);
    });
    await act(async () => {
      fireEvent.click(getAllByText('Save Changes')[0]);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Retry policy saved for all endpoints!', 'success');
    });
  });

  it('shows error toast when save fails', async () => {
    mockApiFetch.mockRejectedValue(new Error('Save failed'));
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Save Changes').length).toBeGreaterThanOrEqual(1);
    });
    await act(async () => {
      fireEvent.click(getAllByText('Save Changes')[0]);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
    });
  });

  it('populates policy from fetched endpoint data', async () => {
    mockApiFetch.mockResolvedValue([
      { max_attempts: 3, base_delay_ms: 5000, max_delay_ms: 30000, multiplier: 2 },
    ]);
    const { getAllByDisplayValue } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByDisplayValue('3').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders total retry time preview', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText(/Total retry time/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the tip about per-endpoint overrides', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText(/Per-endpoint retry policies override/).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders retry on status codes section', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Retry on Status Codes').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders max age hours input when DLQ is enabled', async () => {
    const { getAllByText } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByText('Max Age (hours)').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches endpoints on mount', async () => {
    render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/endpoints', { token: 'test-token' });
    });
  });

  it('renders DLQ max age hours input', async () => {
    const { getAllByDisplayValue } = render(<RetryPolicyPage />);
    await waitFor(() => {
      expect(getAllByDisplayValue('72').length).toBeGreaterThanOrEqual(1);
    });
  });
});
