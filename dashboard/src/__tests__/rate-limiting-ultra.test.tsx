// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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

const { default: RateLimitingPage } = await import('@/app/[locale]/dashboard/rate-limiting/page');

const MOCK_RATE_LIMITS = [
  { endpoint_id: 'ep_001aaaabbbbccccdd', requests_per_second: 10, burst_size: 20, enabled: true },
  { endpoint_id: 'ep_002aaaabbbbccccdd', requests_per_second: 5, burst_size: 10, enabled: true },
  { endpoint_id: 'ep_003aaaabbbbccccdd', requests_per_second: 20, burst_size: 40, enabled: false },
];

describe('RateLimitingPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // === Loading State ===
  it('shows loading skeleton initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(RateLimitingPage));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('loading skeleton has correct structure', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(RateLimitingPage));
    const pulse = container.querySelector('.animate-pulse');
    expect(pulse).toBeTruthy();
    // Should have placeholder bars
    const bars = container.querySelectorAll('.bg-gray-200, .dark\\:bg-slate-700');
    expect(bars.length).toBeGreaterThanOrEqual(1);
  });

  // === Empty State ===
  it('renders empty state when API returns empty array', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Rate Limiting');
      expect(container.textContent).toContain('Auto Retry');
      expect(container.textContent).toContain('Per-Endpoint');
      expect(container.textContent).toContain('Alerts');
    });
  });

  it('shows emoji icons in empty state cards', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🔄');
      expect(container.textContent).toContain('📊');
      expect(container.textContent).toContain('🔔');
    });
  });

  it('shows description text in empty state', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('HookSniff automatically rate-limits');
      expect(container.textContent).toContain('Exponential backoff');
      expect(container.textContent).toContain('Custom limits');
      expect(container.textContent).toContain('Throttle notifications');
    });
  });

  it('does not show empty state when data exists', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Total Endpoints');
    });
    // Empty state emoji should not appear
    expect(container.textContent).not.toContain('🔄');
  });

  // === Stats Cards ===
  it('shows total endpoints count', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Total Endpoints');
      expect(container.textContent).toContain('3');
    });
  });

  it('calculates average RPS correctly', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      // avg = (10 + 5 + 20) / 3 = 11.666... → 11.7
      expect(container.textContent).toContain('Avg Requests/sec');
      expect(container.textContent).toContain('11.7');
    });
  });

  it('calculates peak RPS correctly', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      // peak = max(10, 5, 20) = 20
      expect(container.textContent).toContain('Peak Requests/sec');
      expect(container.textContent).toContain('20.0');
    });
  });

  it('shows throttled count as 0 with green color', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Throttled Requests');
      const throttledEl = container.querySelector('.text-green-600, .dark\\:text-green-400');
      expect(throttledEl).toBeTruthy();
    });
  });

  it('shows single endpoint avg correctly', async () => {
    mockApiFetch.mockResolvedValue([
      { endpoint_id: 'ep_solo', requests_per_second: 15, burst_size: 30, enabled: true },
    ]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('15.0');
      expect(container.textContent).toContain('1');
    });
  });

  // === Per-Endpoint Table ===
  it('renders per-endpoint limits table with correct headers', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Per-Endpoint Limits');
      const headers = container.querySelectorAll('th');
      const headerTexts = Array.from(headers).map(h => h.textContent);
      expect(headerTexts).toContain('Endpoint');
      expect(headerTexts).toContain('RPS');
      expect(headerTexts).toContain('RPM');
      expect(headerTexts).toContain('Burst');
      expect(headerTexts).toContain('Queue');
      expect(headerTexts).toContain('Throttled');
    });
  });

  it('renders correct number of table rows', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
    });
  });

  it('displays endpoint IDs truncated', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      // endpoint_url is endpoint_id.slice(0, 8) + '...'
      expect(container.textContent).toContain('ep_001aa...');
      expect(container.textContent).toContain('ep_002aa...');
      expect(container.textContent).toContain('ep_003aa...');
    });
  });

  it('displays RPS values per endpoint', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      // First row: RPS=10
      expect(rows[0].textContent).toContain('10');
      // Second row: RPS=5
      expect(rows[1].textContent).toContain('5');
      // Third row: RPS=20
      expect(rows[2].textContent).toContain('20');
    });
  });

  it('calculates RPM correctly (rps * 60)', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      // RPM = requests_per_second * 60
      // ep1: 10*60=600, ep2: 5*60=300, ep3: 20*60=1200
      expect(container.textContent).toContain('600');
      expect(container.textContent).toContain('300');
      expect(container.textContent).toContain('1200');
    });
  });

  it('displays burst size per endpoint', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('20');
      expect(container.textContent).toContain('10');
      expect(container.textContent).toContain('40');
    });
  });

  it('shows queue depth as 0 by default', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const queueCells = container.querySelectorAll('tbody td:nth-child(5)');
      queueCells.forEach(cell => {
        expect(cell.textContent).toBe('0');
      });
    });
  });

  it('shows throttled count as 0 per endpoint', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const throttledCells = container.querySelectorAll('tbody td:nth-child(6)');
      throttledCells.forEach(cell => {
        expect(cell.textContent).toBe('0');
      });
    });
  });

  // === How Rate Limiting Works Section ===
  it('renders how it works section', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('How Rate Limiting Works');
      expect(container.textContent).toContain('Token Bucket Algorithm');
      expect(container.textContent).toContain('Burst Handling');
      expect(container.textContent).toContain('Queue & Retry');
      expect(container.textContent).toContain('Per-Endpoint Config');
    });
  });

  it('shows step numbers in how it works', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('1️⃣');
      expect(container.textContent).toContain('2️⃣');
      expect(container.textContent).toContain('3️⃣');
      expect(container.textContent).toContain('4️⃣');
    });
  });

  it('shows algorithm descriptions', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('token bucket');
      expect(container.textContent).toContain('Burst');
      expect(container.textContent).toContain('Exponential backoff');
      expect(container.textContent).toContain('10 req/sec, 600 req/min, burst 20');
    });
  });

  // === Page Header ===
  it('renders page header with emoji', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('⚡');
      expect(container.textContent).toContain('Rate Limiting');
    });
  });

  it('renders description text', async () => {
    mockApiFetch.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Monitor and configure rate limits');
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    // Should show empty state (not crash)
    await waitFor(() => {
      expect(container.textContent).toContain('Rate Limiting');
    });
  });

  it('handles API returning non-array data', async () => {
    mockApiFetch.mockResolvedValue(null);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      // Should show empty state
      expect(container.textContent).toContain('Rate Limiting');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: null }),
    }));
    vi.doMock('next-intl', () => ({
      useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
    }));
    vi.doMock('@/i18n/navigation', () => ({
      useRouter: () => ({ push: vi.fn() }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiFetch: (...args: unknown[]) => mockApiFetch(...args),
    }));
    const { default: Page } = await import('@/app/[locale]/dashboard/rate-limiting/page');
    await act(async () => {
      render(React.createElement(Page));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // === Hover states ===
  it('table rows have hover styling classes', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row.className).toContain('hover:bg-gray-50');
      });
    });
  });

  // === Single endpoint edge case ===
  it('handles single endpoint correctly', async () => {
    mockApiFetch.mockResolvedValue([
      { endpoint_id: 'single_ep', requests_per_second: 100, burst_size: 200, enabled: true },
    ]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Total Endpoints');
      expect(container.textContent).toContain('1');
      expect(container.textContent).toContain('100.0'); // avg
      expect(container.textContent).toContain('100.0'); // peak
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
    });
  });

  // === Large dataset ===
  it('handles many endpoints', async () => {
    const manyEndpoints = Array.from({ length: 50 }, (_, i) => ({
      endpoint_id: `ep_${String(i).padStart(16, '0')}`,
      requests_per_second: i + 1,
      burst_size: (i + 1) * 2,
      enabled: true,
    }));
    mockApiFetch.mockResolvedValue(manyEndpoints);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Total Endpoints');
      expect(container.textContent).toContain('50');
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(50);
    });
  });

  // === Table styling ===
  it('table has correct class structure', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).toBeTruthy();
      expect(table!.className).toContain('w-full');
    });
  });

  it('table header row has correct styling', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      const headerRow = container.querySelector('thead tr');
      expect(headerRow).toBeTruthy();
      expect(headerRow!.className).toContain('bg-gray-50');
    });
  });

  // === Endpoint URL truncation ===
  it('truncates endpoint URL to 8 chars + ...', async () => {
    mockApiFetch.mockResolvedValue([
      { endpoint_id: 'abcdefghijklmnop', requests_per_second: 10, burst_size: 20, enabled: true },
    ]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(RateLimitingPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('abcdefgh...');
    });
  });
});
