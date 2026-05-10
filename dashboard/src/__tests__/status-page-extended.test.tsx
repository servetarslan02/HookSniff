// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
const mockRefresh = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: StatusPage } = await import('@/app/[locale]/status/page');

// ─── Test Data ───

function makeStatusData(overrides: Partial<any> = {}) {
  return {
    overall_status: 'operational',
    uptime_30d: 99.97,
    components: [
      { name: 'API', icon: '⚡', status: 'healthy', latency_ms: 45, description: 'REST API', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 99.99 },
      { name: 'Dashboard', icon: '🖥️', status: 'healthy', latency_ms: 30, description: 'Next.js frontend', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 99.95 },
      { name: 'Database', icon: '🗄️', status: 'healthy', latency_ms: 12, description: 'PostgreSQL', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 99.98 },
      { name: 'Worker', icon: '⚙️', status: 'healthy', latency_ms: 30, description: 'Delivery worker', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 99.90 },
      { name: 'Cache', icon: '💾', status: 'healthy', latency_ms: 5, description: 'Redis', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 100 },
      { name: 'Email Service', icon: '📧', status: 'healthy', latency_ms: 120, description: 'Gmail API', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 99.50 },
      { name: 'Storage', icon: '☁️', status: 'healthy', latency_ms: 25, description: 'Cloudflare R2', last_checked: '2024-06-01T00:00:00Z', uptime_30d: 99.97 },
    ],
    checked_at: '2024-06-01T00:00:00Z',
    response_times: {
      API: [45, 50, 42, 48, 55, 40, 43, 47, 52, 38, 44, 49, 51, 46, 43, 48, 50, 45, 42, 47, 49, 53, 41, 46],
      Database: [12, 15, 11, 14, 13, 10, 12, 16, 11, 13, 14, 12, 15, 11, 13, 12, 14, 16, 10, 12, 13, 15, 11, 14],
    },
    ...overrides,
  };
}

function makeHistory(days = 90) {
  const history = [];
  const now = new Date('2024-06-01');
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      uptime: 99.5 + Math.random() * 0.5,
      incidents: [],
    });
  }
  return history;
}

function makeIncidents() {
  return [
    {
      id: 'inc-1',
      title: 'API Latency Spike',
      status: 'resolved' as const,
      severity: 'minor' as const,
      created_at: '2024-05-28T10:00:00Z',
      resolved_at: '2024-05-28T11:30:00Z',
      affected_components: ['API'],
      updates: [
        { time: '2024-05-28T10:05:00Z', message: 'Investigating increased latency on API endpoints.', status: 'investigating' as const },
        { time: '2024-05-28T10:30:00Z', message: 'Identified root cause: database connection pool exhaustion.', status: 'identified' as const },
        { time: '2024-05-28T11:00:00Z', message: 'Fix deployed, monitoring.', status: 'monitoring' as const },
        { time: '2024-05-28T11:30:00Z', message: 'Resolved. Latency back to normal.', status: 'resolved' as const },
      ],
    },
    {
      id: 'inc-2',
      title: 'Database Outage',
      status: 'resolved' as const,
      severity: 'critical' as const,
      created_at: '2024-05-15T08:00:00Z',
      resolved_at: '2024-05-15T09:00:00Z',
      affected_components: ['Database', 'API'],
      updates: [
        { time: '2024-05-15T08:05:00Z', message: 'Database is unreachable.', status: 'investigating' as const },
        { time: '2024-05-15T08:45:00Z', message: 'Failover to standby completed.', status: 'resolved' as const },
      ],
    },
  ];
}

function makeMaintenance() {
  return [
    {
      id: 'mnt-1',
      title: 'Database Migration',
      scheduled_start: '2024-06-05T02:00:00Z',
      scheduled_end: '2024-06-05T04:00:00Z',
      status: 'scheduled' as const,
      affected_components: ['Database'],
      description: 'Migrating to PostgreSQL 16. Expect brief downtime.',
    },
    {
      id: 'mnt-2',
      title: 'Cache Upgrade',
      scheduled_start: '2024-05-20T03:00:00Z',
      scheduled_end: '2024-05-20T03:30:00Z',
      status: 'completed' as const,
      affected_components: ['Cache'],
      description: 'Upgraded Redis to v7.2.',
    },
  ];
}

function setupFetchMock(overrides: {
  statusData?: any;
  history?: any[];
  incidents?: any[];
  maintenance?: any[];
  failMain?: boolean;
} = {}) {
  const statusData = overrides.statusData ?? makeStatusData();
  const history = overrides.history ?? makeHistory();
  const incidents = overrides.incidents ?? makeIncidents();
  const maintenance = overrides.maintenance ?? makeMaintenance();

  mockFetch.mockImplementation((url: string) => {
    if (overrides.failMain) {
      // All main status endpoints fail, fallback to static
      if (url === '/api/status') return Promise.reject(new Error('fail'));
      if (url.endsWith('/v1/status')) return Promise.reject(new Error('fail'));
    }

    if (url === '/api/status' || url.endsWith('/v1/status') || url.endsWith('/status.json')) {
      if (overrides.failMain && url !== '/status.json') {
        return Promise.reject(new Error('fail'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(statusData) });
    }
    if (url.includes('status-history')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(history) });
    }
    if (url.includes('incidents')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(incidents) });
    }
    if (url.includes('maintenance')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(maintenance) });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

describe('StatusPage - Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setupFetchMock();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Component Status Rendering ───

  it('renders all healthy components', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('API');
    expect(container!.textContent).toContain('Dashboard');
    expect(container!.textContent).toContain('Database');
    expect(container!.textContent).toContain('Worker');
    expect(container!.textContent).toContain('Cache');
    expect(container!.textContent).toContain('Email Service');
    expect(container!.textContent).toContain('Storage');
  });

  it('renders component descriptions', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('REST API');
    expect(container!.textContent).toContain('Next.js frontend');
    expect(container!.textContent).toContain('PostgreSQL');
  });

  it('renders latency values for each component', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('45ms');
    expect(container!.textContent).toContain('30ms');
    expect(container!.textContent).toContain('12ms');
  });

  it('renders uptime percentages', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('99.99%');
    expect(container!.textContent).toContain('99.95%');
  });

  it('shows operational banner when all healthy', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('All Systems Operational');
  });

  it('shows degraded banner when overall status is degraded', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        overall_status: 'degraded',
        components: [
          { name: 'API', status: 'degraded', latency_ms: 800, description: 'REST API', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Some Systems Degraded');
  });

  it('shows down banner when overall status is down', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        overall_status: 'down',
        components: [
          { name: 'API', status: 'down', latency_ms: null, description: 'REST API', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Major Outage Detected');
  });

  it('renders degraded component with correct badge', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        components: [
          { name: 'API', status: 'degraded', latency_ms: 800, description: 'REST API', last_checked: '2024-06-01T00:00:00Z' },
          { name: 'Database', status: 'healthy', latency_ms: 12, description: 'PostgreSQL', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Degraded');
  });

  it('renders down component with correct badge', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        components: [
          { name: 'API', status: 'down', latency_ms: null, description: 'REST API', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Down');
  });

  it('renders unknown component status', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        components: [
          { name: 'API', status: 'unknown', latency_ms: null, description: 'REST API', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Unknown');
  });

  // ─── Incident Display ───

  it('renders incidents when present', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('API Latency Spike');
    expect(container!.textContent).toContain('Database Outage');
  });

  it('shows incident severity labels', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('minor');
    expect(container!.textContent).toContain('critical');
  });

  it('shows incident status badges', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    // Both incidents are resolved
    const resolvedBadges = container!.querySelectorAll('span');
    const resolvedTexts = Array.from(resolvedBadges).filter(s => s.textContent === 'Resolved');
    expect(resolvedTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('expands incident details on click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });

    // Click on the first incident
    const incidentButtons = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent?.includes('API Latency Spike')
    );
    expect(incidentButtons.length).toBeGreaterThan(0);
    await act(async () => { fireEvent.click(incidentButtons[0]); });

    // Should show the update messages
    expect(container!.textContent).toContain('Investigating increased latency');
    expect(container!.textContent).toContain('Identified root cause');
  });

  it('collapses incident on second click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });

    const incidentButtons = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent?.includes('API Latency Spike')
    );

    // Expand
    await act(async () => { fireEvent.click(incidentButtons[0]); });
    expect(container!.textContent).toContain('Investigating increased latency');

    // Collapse
    await act(async () => { fireEvent.click(incidentButtons[0]); });
    expect(container!.textContent).not.toContain('Investigating increased latency');
  });

  it('shows "No incidents" when incident list is empty', async () => {
    setupFetchMock({ incidents: [] });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No incidents in the past 30 days');
  });

  // ─── Maintenance Display ───

  it('renders scheduled maintenance', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Database Migration');
    expect(container!.textContent).toContain('Migrating to PostgreSQL 16');
  });

  it('renders completed maintenance', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Cache Upgrade');
  });

  it('shows affected components for maintenance', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    // Upcoming maintenance shows "Affects: ..."
    expect(container!.textContent).toContain('Affects: Database');
    // Completed maintenance shows components in parentheses
    expect(container!.textContent).toContain('(Cache)');
  });

  it('shows "No scheduled maintenance" when list is empty', async () => {
    setupFetchMock({ maintenance: [] });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No scheduled maintenance');
  });

  // ─── Uptime Bar ───

  it('renders uptime bar section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Overall Uptime');
    expect(container!.textContent).toContain('Last 30 days');
  });

  it('renders 30-day uptime bar with history data', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    // Should show "30 days ago" and "Today" labels
    expect(container!.textContent).toContain('30 days ago');
    expect(container!.textContent).toContain('Today');
  });

  it('renders 90-day uptime calendar when history is available', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Uptime — Last 90 Days');
  });

  it('falls back to static uptime when no history', async () => {
    setupFetchMock({ history: [] });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    // Should still show uptime from data
    expect(container!.textContent).toContain('99.97%');
  });

  // ─── Auto-Refresh Interval ───

  it('sets up auto-refresh interval on mount', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');

    await act(async () => {
      render(React.createElement(StatusPage));
    });

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
    setIntervalSpy.mockRestore();
  });

  it('clears interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    let unmount: () => void;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      unmount = result.unmount;
    });

    unmount!();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('refreshes data when interval fires', async () => {
    await act(async () => {
      render(React.createElement(StatusPage));
    });

    const initialCalls = mockFetch.mock.calls.length;

    // Advance timer by 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // fetch should have been called again
    expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  // ─── Data Source Indicator ───

  it('shows data source indicator when using static fallback', async () => {
    // Make /api/status and /v1/status fail, so it falls back to /status.json
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/status') return Promise.reject(new Error('fail'));
      if (url.endsWith('/v1/status')) return Promise.reject(new Error('fail'));
      if (url.endsWith('/status.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(makeStatusData()) });
      }
      if (url.includes('status-history')) return Promise.resolve({ ok: true, json: () => Promise.resolve(makeHistory()) });
      if (url.includes('incidents')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      if (url.includes('maintenance')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('showing cached data');
  });

  // ─── Manual Refresh Button ───

  it('has a refresh button in the status banner', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });

    const refreshBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('Refresh')
    );
    expect(refreshBtn).toBeTruthy();
  });

  it('refresh button calls router.refresh()', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });

    const refreshBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('Refresh')
    );
    await act(async () => { fireEvent.click(refreshBtn!); });

    expect(mockRefresh).toHaveBeenCalled();
  });

  // ─── Loading State ───

  it('shows loading spinner initially', () => {
    // Don't resolve fetch immediately
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { container } = render(React.createElement(StatusPage));
    expect(container.textContent).toContain('Loading status');
  });

  // ─── API Failure Fallback ───

  it('shows major outage when all fetches fail', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Major Outage Detected');
  });

  it('shows unknown component statuses when using unreachableData fallback', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Unknown');
    expect(container!.textContent).toContain('API');
    expect(container!.textContent).toContain('Dashboard');
  });

  // ─── Responsive Layout ───

  it('renders navigation bar', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('HookSniff');
    expect(container!.textContent).toContain('Status');
  });

  it('renders subscribe button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Subscribe to updates');
  });

  it('renders LanguageSwitcher', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('LanguageSwitcher');
  });

  it('renders footer with version info', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Powered by HookSniff monitoring');
    expect(container!.textContent).toContain('Data refreshes every 30 seconds');
  });

  it('renders doc and home links in footer', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    const links = Array.from(container!.querySelectorAll('a'));
    const homeLink = links.find(a => a.textContent?.includes('hooksniff.vercel.app'));
    const docsLink = links.find(a => a.textContent?.includes('Docs'));
    expect(homeLink).toBeTruthy();
    expect(docsLink).toBeTruthy();
  });

  // ─── Sparkline Charts ───

  it('renders sparkline for components with response times', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    // Sparkline renders as a div with h-6 class and child bars
    const sparklines = container!.querySelectorAll('.h-6');
    expect(sparklines.length).toBeGreaterThan(0);
  });

  // ─── Component Section Structure ───

  it('renders all major sections', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Overall Uptime');
    expect(container!.textContent).toContain('Components');
    expect(container!.textContent).toContain('Incident History');
    expect(container!.textContent).toContain('Scheduled Maintenance');
  });

  // ─── Multiple Status Combinations ───

  it('renders mixed component statuses correctly', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        overall_status: 'degraded',
        components: [
          { name: 'API', status: 'healthy', latency_ms: 45, description: 'REST API', last_checked: '2024-06-01T00:00:00Z' },
          { name: 'Database', status: 'degraded', latency_ms: 800, description: 'PostgreSQL', last_checked: '2024-06-01T00:00:00Z' },
          { name: 'Worker', status: 'down', latency_ms: null, description: 'Delivery worker', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });

    expect(container!.textContent).toContain('Operational');
    expect(container!.textContent).toContain('Degraded');
    expect(container!.textContent).toContain('Down');
  });

  it('renders component with zero latency', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        components: [
          { name: 'Cache', status: 'healthy', latency_ms: 0, description: 'Redis', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Cache');
  });

  it('renders component with null latency', async () => {
    setupFetchMock({
      statusData: makeStatusData({
        components: [
          { name: 'Worker', status: 'healthy', latency_ms: null, description: 'Delivery worker', last_checked: '2024-06-01T00:00:00Z' },
        ],
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Worker');
  });
});
