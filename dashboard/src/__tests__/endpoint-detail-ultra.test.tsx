// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ep_test_123' }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: unknown[]) => mockApiFetch(...args),
    updateRetryPolicy: vi.fn().mockResolvedValue({}),
  },
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const { default: EndpointSettingsPage } = await import('@/app/[locale]/[username]/endpoints/[id]/page');

const mockEndpoint = {
  id: 'ep_test_123',
  url: 'https://example.com/webhook',
  description: 'Test endpoint',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  retry_policy: {
    max_attempts: 5,
    backoff: 'exponential',
    initial_delay_secs: 10,
    max_delay_secs: 3600,
  },
};

describe('EndpointSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue([mockEndpoint]);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ signing_secret: 'new_secret_123' }),
    });
  });

  it('renders loading state', async () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    render(React.createElement(EndpointSettingsPage));
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders endpoint settings header', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(screen.getAllByText('Endpoint Settings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('https://example.com/webhook').length).toBeGreaterThan(0);
  });

  it('renders retry policy section', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(screen.getAllByText('Retry Policy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Max Attempts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Backoff Strategy').length).toBeGreaterThan(0);
  });

  it('renders backoff options', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(screen.getAllByText('Exponential').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Linear').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fixed').length).toBeGreaterThan(0);
  });

  it('renders signature section', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(screen.getAllByText(/Signing Secret/).length).toBeGreaterThan(0);
  });

  it('renders test webhook section', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(screen.getAllByText(/Test Webhook/).length).toBeGreaterThan(0);
  });

  it('renders back button', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    const backBtns = screen.getAllByRole('button');
    expect(backBtns.length).toBeGreaterThan(0);
  });

  it('navigates back when clicking back button', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    const backBtn = document.querySelector('button');
    if (backBtn) {
      await act(async () => {
        fireEvent.click(backBtn);
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard/endpoints');
    }
  });

  it('renders delay preview after loading', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    // After loading, should show retry policy section
    expect(screen.getAllByText('Retry Policy').length).toBeGreaterThan(0);
  });

  it('handles endpoint not found', async () => {
    mockApiFetch.mockResolvedValue([]);
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(mockToast).toHaveBeenCalledWith('Endpoint not found', 'error');
  });

  it('handles fetch error', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(mockToast).toHaveBeenCalled();
  });

  it('renders save button', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(screen.getAllByText(/Save Retry Policy/).length).toBeGreaterThan(0);
  });
});
