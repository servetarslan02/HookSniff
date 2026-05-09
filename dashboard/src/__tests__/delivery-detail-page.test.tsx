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
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'delivery-123' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => React.createElement('span', null, status),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: () => null,
}));

const mockGet = vi.fn().mockResolvedValue({
  id: 'delivery-123',
  event: 'order.created',
  status: 'delivered',
  endpoint_id: 'ep-1',
  created_at: '2024-01-01',
  request_body: '{}',
  response_status: 200,
  response_body: '{}',
  attempt_count: 1,
});
const mockGetAttempts = vi.fn().mockResolvedValue([
  { id: 'att-1', status: 'delivered', response_status: 200, created_at: '2024-01-01', latency_ms: 150 },
]);
const mockReplay = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    get: mockGet,
    getAttempts: mockGetAttempts,
    replay: mockReplay,
  },
}));

const { default: DeliveryDetailPage } = await import('@/app/[locale]/dashboard/deliveries/[id]/page');

describe('DeliveryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({
      id: 'delivery-123',
      event: 'order.created',
      status: 'delivered',
      endpoint_id: 'ep-1',
      created_at: '2024-01-01',
      request_body: '{}',
      response_status: 200,
      response_body: '{}',
      attempt_count: 1,
    });
    mockGetAttempts.mockResolvedValue([
      { id: 'att-1', status: 'delivered', response_status: 200, created_at: '2024-01-01', latency_ms: 150 },
    ]);
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(DeliveryDetailPage));
    });
  });

  it('fetches delivery detail on mount', async () => {
    await act(async () => {
      render(React.createElement(DeliveryDetailPage));
    });
    expect(mockGet).toHaveBeenCalledWith('test-token', 'delivery-123');
  });

  it('displays delivery title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Delivery Details');
  });

  it('shows loading state initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    mockGetAttempts.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    act(() => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders replay button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Replay Webhook');
  });
});
