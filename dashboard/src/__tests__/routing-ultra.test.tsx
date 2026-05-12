// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: RoutingPage } = await import('@/app/[locale]/[username]/routing/page');

const MOCK_ENDPOINTS = [
  { id: 'ep1', url: 'https://api.example.com/webhook', endpoint_id: 'ep1', routing_strategy: 'round-robin', fallback_url: null, avg_response_ms: 120, failure_streak: 0, is_healthy: true, resolved_url: 'https://api.example.com/webhook', using_fallback: false },
  { id: 'ep2', url: 'https://api.example.com/payments', endpoint_id: 'ep2', routing_strategy: 'latency-based', fallback_url: 'https://backup.example.com/payments', avg_response_ms: 350, failure_streak: 5, is_healthy: false, resolved_url: 'https://backup.example.com/payments', using_fallback: true },
];

describe('RoutingPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue(MOCK_ENDPOINTS);
  });

  it('shows loading initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(RoutingPage));
    expect(container.textContent).toContain('Loading');
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🔀');
      expect(container.textContent).toContain('Routing');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('round-robin, latency-based, or failover');
    });
  });

  it('renders all endpoints', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('https://api.example.com/webhook');
      expect(container.textContent).toContain('https://api.example.com/payments');
    });
  });

  it('renders routing strategy', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('round-robin');
      expect(container.textContent).toContain('latency-based');
    });
  });

  it('renders fallback URL when set', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('https://backup.example.com/payments');
    });
  });

  it('renders response time', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('120ms');
      expect(container.textContent).toContain('350ms');
    });
  });

  it('renders healthy status', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Healthy');
    });
  });

  it('renders unhealthy status for high failure streak', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Unhealthy');
    });
  });

  it('shows empty state when no endpoints', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('No endpoints configured yet');
    });
  });

  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('No endpoints configured yet');
    });
  });

  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/routing/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('renders default strategy as round-robin', async () => {
    mockApiFetch.mockResolvedValue([{ ...MOCK_ENDPOINTS[0], routing_strategy: '' }]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RoutingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('round-robin');
    });
  });
});
