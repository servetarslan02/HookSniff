// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();
const mockApiFetch = vi.fn();

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

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
  },
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: AuditLogPage } = await import('@/app/[locale]/dashboard/audit-log/page');

const MOCK_ENTRIES = [
  {
    id: 'entry-1',
    timestamp: '2024-06-15T10:30:00Z',
    actor: 'user-1',
    actor_email: 'admin@test.com',
    action: 'auth.login',
    resource_type: 'user',
    resource_id: 'usr_abc12345',
    details: 'Logged in via SSO',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
  },
  {
    id: 'entry-2',
    timestamp: '2024-06-15T11:00:00Z',
    actor: 'user-2',
    actor_email: 'dev@test.com',
    action: 'endpoint.create',
    resource_type: 'endpoint',
    resource_id: 'ep_xyz98765',
    details: 'Created new endpoint',
    ip_address: '10.0.0.1',
    user_agent: 'Chrome/120',
  },
  {
    id: 'entry-3',
    timestamp: '2024-06-15T12:00:00Z',
    actor: 'user-1',
    actor_email: 'admin@test.com',
    action: 'apikey.rotate',
    resource_type: 'api_key',
    resource_id: 'key_def54321',
    details: 'Rotated API key',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
  },
];

describe('AuditLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { getByText } = render(React.createElement(AuditLogPage));
    expect(getByText(/Loading audit log/)).toBeTruthy();
  });

  it('renders the page title after loading', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      const h1s = container.querySelectorAll('h1');
      expect(Array.from(h1s).some(h => h.textContent?.includes('Audit Log'))).toBe(true);
    });
  });

  it('renders the page description', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Track all activity in your workspace');
    });
  });

  it('renders the filter dropdown', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      const select = container.querySelector('select');
      expect(select).toBeTruthy();
      expect(select!.value).toBe('');
    });
  });

  it('renders filter options', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      const options = container.querySelectorAll('option');
      const optionTexts = Array.from(options).map(o => o.textContent);
      expect(optionTexts).toContain('All Actions');
      expect(optionTexts).toContain('Authentication');
      expect(optionTexts).toContain('Endpoints');
      expect(optionTexts).toContain('API Keys');
      expect(optionTexts).toContain('Webhooks');
      expect(optionTexts).toContain('Team');
    });
  });

  it('renders table headers', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      const ths = container.querySelectorAll('th');
      const headers = Array.from(ths).map(th => th.textContent);
      expect(headers).toContain('Time');
      expect(headers).toContain('Action');
      expect(headers).toContain('Actor');
      expect(headers).toContain('Resource');
      expect(headers).toContain('Details');
      expect(headers).toContain('IP');
    });
  });

  it('displays audit entries in the table', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('auth.login');
      expect(container.textContent).toContain('endpoint.create');
      expect(container.textContent).toContain('apikey.rotate');
    });
  });

  it('displays actor emails', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('admin@test.com');
      expect(container.textContent).toContain('dev@test.com');
    });
  });

  it('displays IP addresses', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('192.168.1.1');
      expect(container.textContent).toContain('10.0.0.1');
    });
  });

  it('shows empty state when no entries', async () => {
    mockApiFetch.mockResolvedValue({ entries: [], has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('No activity yet');
    });
  });

  it('shows empty state description', async () => {
    mockApiFetch.mockResolvedValue({ entries: [], has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Actions like login');
    });
  });

  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('No activity yet');
    });
  });

  it('shows load more button when has_more is true', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: true });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Load more');
    });
  });

  it('does not show load more when has_more is false', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(container.textContent).not.toContain('Load more');
    });
  });

  it('handles filter change', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      const select = container.querySelector('select')!;
      fireEvent.change(select, { target: { value: 'auth' } });
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('fetches audit log on mount with token', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
      const call = mockApiFetch.mock.calls[0];
      expect(call[0]).toContain('/audit-log');
      expect(call[1]).toEqual({ token: 'test-token' });
    });
  });

  it('displays resource type and id', async () => {
    mockApiFetch.mockResolvedValue({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      // resource_id is sliced to 8 chars in the UI: {resource_type}/{resource_id?.slice(0, 8)}
      expect(container.textContent).toContain('user/usr_abc1');
      expect(container.textContent).toContain('endpoint/ep_xyz98');
      expect(container.textContent).toContain('api_key/key_def5');
    });
  });
});
