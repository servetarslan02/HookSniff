// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';

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
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'admin@test.com', plan: 'business', is_admin: true } }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => React.createElement('div', null, children),
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: any) => React.createElement('div', null, children),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => React.createElement('div', null, children),
}));

vi.mock('@/components/tremor/StatCard', () => ({
  StatCard: ({ title }: any) => React.createElement('div', null, title),
}));

vi.mock('@/components/tremor/ChartCard', () => ({
  ChartCard: ({ title }: any) => React.createElement('div', null, title),
}));

const { default: AdminSystemPage } = await import('@/app/[locale]/admin/system/page');

const healthyResponse = {
  database: { status: 'healthy', latency_ms: 5 },
  redis: { status: 'connected', latency_ms: 2 },
  api: { status: 'ok', uptime_seconds: 172800 },
  queue: { pending: 3, processing: 1, failed: 0 },
};

const degradedResponse = {
  database: { status: 'healthy', latency_ms: 5 },
  redis: { status: 'slow', latency_ms: 250 },
  api: { status: 'ok', uptime_seconds: 86400 },
  queue: { pending: 50, processing: 5, failed: 15 },
};

const downResponse = {
  database: { status: 'down', latency_ms: 0 },
  redis: { status: 'disconnected', latency_ms: 0 },
  api: { status: 'error', uptime_seconds: 0 },
  queue: { pending: 0, processing: 0, failed: 0 },
};

describe('AdminSystemPage - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(healthyResponse),
    });
  });

  // --- Basic Rendering ---
  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminSystemPage));
    });
  });

  it('fetches health on mount', async () => {
    await act(async () => {
      render(React.createElement(AdminSystemPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('displays system health title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('systemHealth');
  });

  it('displays subtitle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Monitor infrastructure services and system status');
  });

  // --- Loading State ---
  it('shows loading skeleton initially', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    const pulseElements = container!.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows 4 skeleton cards during loading', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    const glassCards = container!.querySelectorAll('.glass-card.animate-pulse');
    expect(glassCards.length).toBe(4);
  });

  it('hides service cards during loading', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).not.toContain('API Server');
    expect(container!.textContent).not.toContain('PostgreSQL Database');
  });

  // --- Service Status Display (Healthy) ---
  it('shows all operational when all services healthy', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('allOperational');
  });

  it('renders API Server card', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('API Server');
  });

  it('renders PostgreSQL Database card', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('PostgreSQL Database');
  });

  it('renders Redis Cache card', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Redis Cache');
  });

  it('renders Webhook Queue card', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Webhook Queue');
  });

  it('displays API uptime', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // 172800 seconds = 2 days
    expect(container!.textContent).toContain('2d');
    expect(container!.textContent).toContain('Uptime');
  });

  it('displays database latency', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('5ms');
    expect(container!.textContent).toContain('Latency');
  });

  it('displays redis latency', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('2ms');
  });

  it('displays queue stats', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('3 pending');
    expect(container!.textContent).toContain('1 processing');
    expect(container!.textContent).toContain('0 failed');
  });

  it('displays service statuses', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('ok');
    expect(container!.textContent).toContain('healthy');
    expect(container!.textContent).toContain('connected');
  });

  // --- Degraded State ---
  it('shows partial degradation when some services degraded', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(degradedResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('partialDegradation');
  });

  it('shows degraded status for slow redis', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(degradedResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('slow');
  });

  it('shows high failed count in queue', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(degradedResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('15 failed');
  });

  // --- Down State ---
  it('shows system issues when services are down', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(downResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('systemIssues');
  });

  it('shows down/disconnected status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(downResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('down');
    expect(container!.textContent).toContain('disconnected');
  });

  // --- Infrastructure Section ---
  it('renders infrastructure section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('infrastructure');
  });

  it('shows infrastructure providers', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Oracle Cloud ARM');
    expect(container!.textContent).toContain('Neon PostgreSQL');
    expect(container!.textContent).toContain('Upstash Redis');
    expect(container!.textContent).toContain('Cloudflare');
    expect(container!.textContent).toContain('Vercel');
    expect(container!.textContent).toContain('Grafana Cloud');
  });

  it('shows infrastructure details', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('4 OCPU, 24 GB RAM');
    expect(container!.textContent).toContain('Serverless, 0.5 GB');
    expect(container!.textContent).toContain('Next.js 15');
  });

  // --- Auto-refresh ---
  it('sets up auto-refresh interval', async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(React.createElement(AdminSystemPage));
    });
    const callsAfterMount = mockFetch.mock.calls.length;
    await act(async () => {
      vi.advanceTimersByTime(15000);
    });
    expect(mockFetch.mock.calls.length).toBeGreaterThan(callsAfterMount);
    vi.useRealTimers();
  });

  it('clears interval on unmount', async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    let unmount: () => void;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      unmount = result.unmount;
    });
    unmount!();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  // --- Error Handling ---
  it('handles fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // Should still render the page, just without health data
    expect(container!.textContent).toContain('systemHealth');
  });

  it('handles non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // Should render with unknown statuses
    expect(container!.textContent).toContain('systemHealth');
  });

  it('shows "Checking..." when no health data', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Checking...');
  });

  // --- Latency Bars ---
  it('renders latency bars for database and redis', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // Latency bars have a specific structure with 0ms and 500ms labels
    expect(container!.textContent).toContain('0ms');
    expect(container!.textContent).toContain('500ms');
  });

  it('renders latency value in bar label', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // Both database (5ms) and redis (2ms) should show their latency
    const allText = container!.textContent!;
    expect(allText).toContain('5ms');
    expect(allText).toContain('2ms');
  });

  // --- Status Color Mapping ---
  it('renders green dot for healthy status', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    const greenDots = container!.querySelectorAll('.bg-green-500');
    expect(greenDots.length).toBeGreaterThan(0);
  });

  it('renders green dot for overall status when all healthy', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // The overall status indicator should be green
    const animatePulseDots = container!.querySelectorAll('.animate-pulse.bg-green-500');
    expect(animatePulseDots.length).toBe(1);
  });

  it('renders yellow dot for degraded overall status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(degradedResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    const yellowDots = container!.querySelectorAll('.animate-pulse.bg-yellow-500');
    expect(yellowDots.length).toBe(1);
  });

  it('renders red dot for down overall status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(downResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    const redDots = container!.querySelectorAll('.animate-pulse.bg-red-500');
    expect(redDots.length).toBe(1);
  });

  // --- Last Checked ---
  it('displays last checked timestamp', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Last checked');
    expect(container!.textContent).toContain('Auto-refresh every 15s');
  });

  // --- Queue with no failed ---
  it('shows healthy queue when failed is 0', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // Queue should show healthy since failed = 0
    const queueCard = Array.from(container!.querySelectorAll('.glass-card')).find(card =>
      card.textContent?.includes('Webhook Queue')
    );
    expect(queueCard).toBeTruthy();
    expect(queueCard!.textContent).toContain('healthy');
  });

  it('shows degraded queue when failed > 10', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(degradedResponse),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    const queueCard = Array.from(container!.querySelectorAll('.glass-card')).find(card =>
      card.textContent?.includes('Webhook Queue')
    );
    expect(queueCard!.textContent).toContain('degraded');
  });

  // --- Uptime Formatting ---
  it('formats uptime with days correctly', async () => {
    // 172800 seconds = 2d 0h 0m
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('2d 0h 0m');
  });

  it('formats uptime with hours only', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...healthyResponse,
        api: { status: 'ok', uptime_seconds: 7200 }, // 2h 0m
      }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('2h 0m');
  });

  it('formats uptime with minutes only', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...healthyResponse,
        api: { status: 'ok', uptime_seconds: 300 }, // 5m
      }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('5m');
  });

  // --- Service icons ---
  it('renders service icons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('🚀'); // API
    expect(container!.textContent).toContain('🐘'); // PostgreSQL
    expect(container!.textContent).toContain('⚡'); // Redis
    expect(container!.textContent).toContain('📬'); // Queue
  });
});
