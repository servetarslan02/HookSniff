// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'test@test.com', plan: 'pro' } }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
}));

const { default: RoutingPage } = await import('@/app/[locale]/dashboard/routing/page');

const mockEndpoints = [
  {
    id: 'ep1',
    url: 'https://api.example.com/webhook',
    endpoint_id: 'ep1',
    routing_strategy: 'round-robin',
    fallback_url: null,
    avg_response_ms: 150,
    failure_streak: 0,
    is_healthy: true,
    resolved_url: 'https://api.example.com/webhook',
    using_fallback: false,
  },
  {
    id: 'ep2',
    url: 'https://backup.example.com/hook',
    endpoint_id: 'ep2',
    routing_strategy: 'failover',
    fallback_url: 'https://fallback.example.com/hook',
    avg_response_ms: 320,
    failure_streak: 5,
    is_healthy: false,
    resolved_url: 'https://fallback.example.com/hook',
    using_fallback: true,
  },
  {
    id: 'ep3',
    url: 'https://latency.example.com/webhook',
    endpoint_id: 'ep3',
    routing_strategy: 'latency-based',
    fallback_url: 'https://fallback2.example.com/hook',
    avg_response_ms: 45,
    failure_streak: 1,
    is_healthy: true,
    resolved_url: 'https://latency.example.com/webhook',
    using_fallback: false,
  },
];

describe('RoutingPage - Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue(mockEndpoints);
  });

  // === Routing Strategy Display ===
  it('displays round-robin strategy', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('round-robin');
  });

  it('displays failover strategy', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('failover');
  });

  it('displays latency-based strategy', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('latency-based');
  });

  it('displays default round-robin when strategy is empty', async () => {
    mockApiFetch.mockResolvedValueOnce([{
      ...mockEndpoints[0],
      routing_strategy: '',
    }]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('round-robin');
  });

  // === Endpoint URL Display ===
  it('displays endpoint URLs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('https://api.example.com/webhook');
    expect(container!.textContent).toContain('https://backup.example.com/hook');
    expect(container!.textContent).toContain('https://latency.example.com/webhook');
  });

  // === Fallback URL Display ===
  it('displays fallback URL when present', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('https://fallback.example.com/hook');
    expect(container!.textContent).toContain('Fallback:');
  });

  it('does not display fallback when null', async () => {
    mockApiFetch.mockResolvedValueOnce([mockEndpoints[0]]); // no fallback
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).not.toContain('Fallback:');
  });

  // === Health Status ===
  it('displays healthy status for low failure streak', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Healthy');
  });

  it('displays unhealthy status for high failure streak', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Unhealthy');
  });

  it('applies badge-green class for healthy endpoints', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    const greenBadge = container!.querySelector('.badge-green');
    expect(greenBadge).toBeTruthy();
  });

  it('applies badge-red class for unhealthy endpoints', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    const redBadge = container!.querySelector('.badge-red');
    expect(redBadge).toBeTruthy();
  });

  it('marks endpoint with failure_streak >= 3 as unhealthy', async () => {
    mockApiFetch.mockResolvedValueOnce([{
      ...mockEndpoints[0],
      failure_streak: 3,
    }]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Unhealthy');
  });

  it('marks endpoint with failure_streak < 3 as healthy', async () => {
    mockApiFetch.mockResolvedValueOnce([{
      ...mockEndpoints[0],
      failure_streak: 2,
    }]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Healthy');
  });

  // === Average Response Time ===
  it('displays average response time', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('150ms avg');
    expect(container!.textContent).toContain('320ms avg');
    expect(container!.textContent).toContain('45ms avg');
  });

  // === Empty State ===
  it('shows empty state when no endpoints', async () => {
    mockApiFetch.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No endpoints configured yet');
  });

  it('empty state has correct styling', async () => {
    mockApiFetch.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    const emptyState = container!.querySelector('.text-center.py-12');
    expect(emptyState).toBeTruthy();
  });

  // === Loading State ===
  it('shows loading initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(React.createElement(RoutingPage));
    expect(container.textContent).toContain('Loading...');
  });

  it('loading has correct styling', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(RoutingPage));
    const loadingDiv = container.querySelector('.text-gray-500');
    expect(loadingDiv).toBeTruthy();
    expect(loadingDiv!.textContent).toContain('Loading...');
  });

  // === API Call ===
  it('calls apiFetch with correct path and token', async () => {
    await act(async () => {
      render(React.createElement(RoutingPage));
    });
    expect(mockApiFetch).toHaveBeenCalledWith('/endpoints', { token: 'test-token' });
  });

  // === Error Handling ===
  it('handles fetch error gracefully', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    // Should show empty state since endpoints stays empty on error
    expect(container!.textContent).toContain('No endpoints configured yet');
  });

  // === Title and Description ===
  it('displays routing title with emoji', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('🔀');
    expect(container!.textContent).toContain('Routing');
  });

  it('displays routing description', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('round-robin');
    expect(container!.textContent).toContain('latency-based');
    expect(container!.textContent).toContain('failover');
  });

  // === Single Endpoint ===
  it('renders single endpoint correctly', async () => {
    mockApiFetch.mockResolvedValueOnce([mockEndpoints[0]]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('https://api.example.com/webhook');
    expect(container!.textContent).toContain('Healthy');
    expect(container!.textContent).toContain('150ms avg');
  });

  // === Multiple Endpoints ===
  it('renders all endpoints', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    // All 3 URLs should be present
    expect(container!.textContent).toContain('https://api.example.com/webhook');
    expect(container!.textContent).toContain('https://backup.example.com/hook');
    expect(container!.textContent).toContain('https://latency.example.com/webhook');
  });

  // === Layout ===
  it('has max-w-6xl container', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    const mainDiv = container!.querySelector('.max-w-6xl');
    expect(mainDiv).toBeTruthy();
  });

  it('renders endpoint cards with border styling', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    const cards = container!.querySelectorAll('.rounded-xl');
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  // === Edge case: failure_streak exactly 0 ===
  it('shows healthy for failure_streak of 0', async () => {
    mockApiFetch.mockResolvedValueOnce([{
      ...mockEndpoints[0],
      failure_streak: 0,
    }]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Healthy');
  });

  // === Strategy label ===
  it('displays Strategy: label', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Strategy:');
  });
});
