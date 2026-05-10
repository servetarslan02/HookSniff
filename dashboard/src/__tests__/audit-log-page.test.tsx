// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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

// Don't mock @/lib/api — apiFetch uses global.fetch under the hood

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

function mockApiResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
}

function mockApiError(status = 500) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'Server error' }),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
}

describe('AuditLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { container } = render(React.createElement(AuditLogPage));
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    // Don't resolve the fetch yet
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    expect(getByText(/Loading audit log/)).toBeTruthy();
  });

  it('renders the page title after loading', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText(/Audit Log/)).toBeTruthy();
    });
  });

  it('renders the page description', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText(/Track all activity in your workspace/)).toBeTruthy();
    });
  });

  it('renders the filter dropdown', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByDisplayValue } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByDisplayValue('All Actions')).toBeTruthy();
    });
  });

  it('renders filter options', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('Authentication')).toBeTruthy();
      expect(getByText('Endpoints')).toBeTruthy();
      expect(getByText('API Keys')).toBeTruthy();
      expect(getByText('Webhooks')).toBeTruthy();
      expect(getByText('Team')).toBeTruthy();
    });
  });

  it('renders table headers', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('Time')).toBeTruthy();
      expect(getByText('Action')).toBeTruthy();
      expect(getByText('Actor')).toBeTruthy();
      expect(getByText('Resource')).toBeTruthy();
      expect(getByText('Details')).toBeTruthy();
      expect(getByText('IP')).toBeTruthy();
    });
  });

  it('displays audit entries in the table', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('auth.login')).toBeTruthy();
      expect(getByText('endpoint.create')).toBeTruthy();
      expect(getByText('apikey.rotate')).toBeTruthy();
    });
  });

  it('displays actor emails', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('admin@test.com')).toBeTruthy();
      expect(getByText('dev@test.com')).toBeTruthy();
    });
  });

  it('displays IP addresses', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('192.168.1.1')).toBeTruthy();
      expect(getByText('10.0.0.1')).toBeTruthy();
    });
  });

  it('shows empty state when no entries', async () => {
    mockApiResponse({ entries: [], has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText(/No activity yet/)).toBeTruthy();
    });
  });

  it('shows empty state description', async () => {
    mockApiResponse({ entries: [], has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText(/Actions like login/)).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    mockApiError(500);
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      // Should show empty state after error
      expect(getByText(/No activity yet/)).toBeTruthy();
    });
  });

  it('shows load more button when has_more is true', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: true });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('Load more')).toBeTruthy();
    });
  });

  it('does not show load more when has_more is false', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { queryByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(queryByText('Load more')).toBeNull();
    });
  });

  it('handles filter change', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByDisplayValue } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      const select = getByDisplayValue('All Actions');
      fireEvent.change(select, { target: { value: 'auth' } });
    });
    // After filter change, a new fetch should be triggered
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('fetches audit log on mount with token', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/audit-log');
      expect(call[1].headers.get('Authorization')).toBe('Bearer test-token');
    });
  });

  it('displays resource type and id', async () => {
    mockApiResponse({ entries: MOCK_ENTRIES, has_more: false });
    const { getByText } = render(React.createElement(AuditLogPage));
    await waitFor(() => {
      expect(getByText('user/usr_abc123')).toBeTruthy();
      expect(getByText('endpoint/ep_xyz987')).toBeTruthy();
    });
  });
});
