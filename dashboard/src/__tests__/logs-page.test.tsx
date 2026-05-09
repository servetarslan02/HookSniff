// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockWebhooksList = vi.fn().mockResolvedValue({
  deliveries: [
    { id: 'd1', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01' },
  ],
  total: 1,
});

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    list: mockWebhooksList,
    create: vi.fn(),
  },
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));

const { default: LogsPage } = await import('@/app/[locale]/dashboard/logs/page');

describe('LogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksList.mockResolvedValue({
      deliveries: [
        { id: 'd1', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01' },
      ],
      total: 1,
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(LogsPage));
    });
  });

  it('fetches deliveries on mount', async () => {
    await act(async () => {
      render(React.createElement(LogsPage));
    });
    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 1 }));
  });

  it('displays logs title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(LogsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('title');
  });

  it('shows filter buttons (all/delivered/failed/pending)', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(LogsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('All');
    expect(container!.textContent).toContain('Delivered');
    expect(container!.textContent).toContain('Failed');
    expect(container!.textContent).toContain('Pending');
  });

  it('shows search input', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(LogsPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]');
    expect(searchInput).toBeTruthy();
  });

  it('shows empty state when no deliveries', async () => {
    mockWebhooksList.mockResolvedValueOnce({ deliveries: [], total: 0 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(LogsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('noLogs');
  });
});
