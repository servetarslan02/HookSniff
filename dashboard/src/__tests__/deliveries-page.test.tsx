// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement('a', props, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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
  page: 1,
  per_page: 20,
});

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    list: mockWebhooksList,
    replay: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: () => null,
}));
vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));

const { default: DeliveriesPage } = await import('@/app/[locale]/dashboard/deliveries/page');

describe('DeliveriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksList.mockResolvedValue({
      deliveries: [
        { id: 'd1', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01' },
      ],
      total: 1,
      page: 1,
      per_page: 20,
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(DeliveriesPage));
    });
  });

  it('fetches deliveries on mount', async () => {
    await act(async () => {
      render(React.createElement(DeliveriesPage));
    });
    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 1 }));
  });

  it('displays deliveries title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.title');
  });

  it('shows empty state when no deliveries', async () => {
    mockWebhooksList.mockResolvedValueOnce({ deliveries: [], total: 0, page: 1, per_page: 20 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.empty');
  });

  it('renders filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Delivered');
    expect(container!.textContent).toContain('Failed');
    expect(container!.textContent).toContain('Pending');
  });
});
