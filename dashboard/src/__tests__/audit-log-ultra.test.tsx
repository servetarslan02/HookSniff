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

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: AuditLogPage } = await import('@/app/[locale]/[username]/audit-log/page');

const MOCK_ENTRIES = [
  { id: 'a1', timestamp: '2024-06-01T10:00:00Z', actor: 'user_1', actor_email: 'admin@test.com', action: 'auth.login', resource_type: 'user', resource_id: 'user_1abc1234', details: 'Login from Chrome', ip_address: '192.168.1.1', user_agent: 'Chrome/120' },
  { id: 'a2', timestamp: '2024-06-01T11:00:00Z', actor: 'user_1', actor_email: 'admin@test.com', action: 'endpoint.create', resource_type: 'endpoint', resource_id: 'ep_12345abc', details: 'Created endpoint https://example.com', ip_address: '192.168.1.1', user_agent: 'Chrome/120' },
  { id: 'a3', timestamp: '2024-06-01T12:00:00Z', actor: 'user_2', actor_email: 'dev@test.com', action: 'webhook.send', resource_type: 'delivery', resource_id: 'del_abc12345', details: 'Sent webhook order.created', ip_address: '10.0.0.5', user_agent: 'curl/8.0' },
];

describe('AuditLogPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: true });
  });

  // === Loading State ===
  it('shows loading spinner initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(AuditLogPage));
    expect(container.querySelector('.animate-spin')).toBeTruthy();
    expect(container.textContent).toContain('Loading audit log');
  });

  // === Page Header ===
  it('renders page header with emoji', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('📋');
      expect(container.textContent).toContain('Audit Log');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Track all activity');
      expect(container.textContent).toContain('Who did what, when');
    });
  });

  // === Filter ===
  it('renders filter dropdown', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      const select = container.querySelector('select');
      expect(select).toBeTruthy();
      const options = Array.from(select!.querySelectorAll('option'));
      expect(options.length).toBe(8); // All + 7 categories
    });
  });

  it('filter options have correct values', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options).map(o => o.value);
      expect(options).toContain('');
      expect(options).toContain('auth');
      expect(options).toContain('endpoint');
      expect(options).toContain('apikey');
      expect(options).toContain('webhook');
      expect(options).toContain('team');
      expect(options).toContain('settings');
      expect(options).toContain('billing');
    });
  });

  // === Table Headers ===
  it('renders table headers', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      const headers = container.querySelectorAll('th');
      const texts = Array.from(headers).map(h => h.textContent);
      expect(texts).toContain('Time');
      expect(texts).toContain('Action');
      expect(texts).toContain('Actor');
      expect(texts).toContain('Resource');
      expect(texts).toContain('Details');
      expect(texts).toContain('IP');
    });
  });

  // === Entry Rendering ===
  it('renders all entries', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
    });
  });

  it('renders action names', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('auth.login');
      expect(container.textContent).toContain('endpoint.create');
      expect(container.textContent).toContain('webhook.send');
    });
  });

  it('renders actor emails', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin@test.com');
      expect(container.textContent).toContain('dev@test.com');
    });
  });

  it('renders resource type and ID (truncated)', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      // resource_id is sliced to 8 chars: user_1ab, ep_12345
      expect(container.textContent).toContain('user/user_1ab');
      expect(container.textContent).toContain('endpoint/ep_12345');
    });
  });

  it('renders IP addresses', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('192.168.1.1');
      expect(container.textContent).toContain('10.0.0.5');
    });
  });

  it('renders timestamps', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('2024');
    });
  });

  it('renders action icons', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🔑'); // auth.login
      expect(container.textContent).toContain('🔗'); // endpoint.create
      expect(container.textContent).toContain('📦'); // webhook.send
    });
  });

  // === Load More ===
  it('shows load more button when has_more is true', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      const loadMoreBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Load more');
      expect(loadMoreBtn).toBeTruthy();
    });
  });

  it('hides load more when has_more is false', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      const loadMoreBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Load more');
      expect(loadMoreBtn).toBeFalsy();
    });
  });

  it('loads more entries on button click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Load more');
    });
    mockApiFetch.mockResolvedValueOnce({
      entries: [{ ...MOCK_ENTRIES[0], id: 'a4', action: 'team.invite' }],
      has_more: false,
    });
    const loadMoreBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Load more');
    await act(async () => {
      fireEvent.click(loadMoreBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('team.invite');
    });
  });

  // === Empty State ===
  it('shows empty state when no entries', async () => {
    mockApiFetch.mockResolvedValue({ entries: [], has_more: false });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('No activity yet');
      expect(container.textContent).toContain('login, endpoint creation');
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Not found'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      // Should show empty state
      expect(container.textContent).toContain('No activity yet');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/audit-log/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // === Unknown action icon ===
  it('uses default icon for unknown actions', async () => {
    mockApiFetch.mockResolvedValue({
      entries: [{ ...MOCK_ENTRIES[0], action: 'unknown.action' }],
      has_more: false,
    });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AuditLogPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('📌'); // default icon
    });
  });
});
