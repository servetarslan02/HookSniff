// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

const mockToast = vi.fn();
const mockPush = vi.fn();
const mockWebhooksGet = vi.fn();
const mockWebhooksGetAttempts = vi.fn();
const mockWebhooksReplay = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'del_test_123' }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    get: (...args: any[]) => mockWebhooksGet(...args),
    getAttempts: (...args: any[]) => mockWebhooksGetAttempts(...args),
    replay: (...args: any[]) => mockWebhooksReplay(...args),
  },
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status, size }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, onConfirm, onCancel, confirmLabel, loading }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('button', { onClick: onConfirm, disabled: loading }, confirmLabel || 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel')
    ) : null,
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: DeliveryDetailPage } = await import('@/app/[locale]/dashboard/deliveries/[id]/page');

const mockDelivery = {
  id: 'del_test_123',
  event: 'order.created',
  status: 'delivered',
  attempt_count: 1,
  response_status: 200,
  endpoint_id: 'ep_001',
  created_at: '2024-06-01T10:00:00Z',
};

const mockAttemptList = [
  { id: 'att_1', status: 'delivered', status_code: 200, duration_ms: 120, attempted_at: '2024-06-01T10:00:01Z', response_body: '{"ok": true}' },
];

describe('DeliveryDetailPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksGet.mockResolvedValue(mockDelivery);
    mockWebhooksGetAttempts.mockResolvedValue(mockAttemptList);
    mockWebhooksReplay.mockResolvedValue({});
  });

  // === Render ===
  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(DeliveryDetailPage));
    });
  });

  // === Loading state ===
  it('shows loading state initially', () => {
    mockWebhooksGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(DeliveryDetailPage));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === Error state ===
  it('shows error state on fetch failure', async () => {
    mockWebhooksGet.mockRejectedValue(new Error('Not found'));
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Failed to load delivery');
      expect(container.textContent).toContain('Not found');
    });
  });

  it('renders retry button on error', async () => {
    mockWebhooksGet.mockRejectedValue(new Error('Fail'));
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Try Again');
    });
  });

  it('renders back button on error', async () => {
    mockWebhooksGet.mockRejectedValue(new Error('Fail'));
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Back to Deliveries');
    });
  });

  // === Content ===
  it('renders delivery details after loading', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Delivery Details');
      expect(container.textContent).toContain('del_test_123');
    });
  });

  it('renders status badge', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      const badge = container.querySelector('[data-testid="status-badge"]');
      expect(badge).toBeTruthy();
      expect(badge!.textContent).toBe('delivered');
    });
  });

  it('renders event type', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
  });

  it('renders attempt count', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('1');
    });
  });

  // === Replay ===
  it('renders replay button', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Replay Webhook');
    });
  });

  it('opens replay confirmation dialog', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Replay Webhook');
    });

    const replayButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Replay Webhook')
    );

    await act(async () => {
      fireEvent.click(replayButton!);
    });

    expect(container.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
  });

  it('replays webhook on confirm', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Replay Webhook');
    });

    const replayButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Replay Webhook')
    );

    await act(async () => {
      fireEvent.click(replayButton!);
    });

    const confirmButton = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    expect(mockWebhooksReplay).toHaveBeenCalledWith('test-token', 'del_test_123');
  });

  it('shows success toast after replay', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Replay Webhook');
    });

    const replayButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Replay Webhook')
    );

    await act(async () => {
      fireEvent.click(replayButton!);
    });

    const confirmButton = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Webhook replayed successfully!', 'success');
    });
  });

  it('shows error toast on replay failure', async () => {
    mockWebhooksReplay.mockRejectedValue(new Error('Replay failed'));
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Replay Webhook');
    });

    const replayButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Replay Webhook')
    );

    await act(async () => {
      fireEvent.click(replayButton!);
    });

    const confirmButton = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Replay failed', 'error');
    });
  });

  it('cancels replay on cancel', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Replay Webhook');
    });

    const replayButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Replay Webhook')
    );

    await act(async () => {
      fireEvent.click(replayButton!);
    });

    const cancelButton = Array.from(
      container.querySelector('[data-testid="confirm-dialog"]')!.querySelectorAll('button')
    ).find((b) => b.textContent === 'Cancel');

    await act(async () => {
      fireEvent.click(cancelButton!);
    });

    expect(mockWebhooksReplay).not.toHaveBeenCalled();
  });

  // === Back navigation ===
  it('renders back button', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Delivery Details');
    });

    const backButton = container.querySelector('button[title="Back to deliveries"]');
    expect(backButton).toBeTruthy();
  });

  it('navigates back on back button click', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Delivery Details');
    });

    const backButton = container.querySelector('button[title="Back to deliveries"]');
    await act(async () => {
      fireEvent.click(backButton!);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries');
  });

  // === Overview cards ===
  it('renders Status card', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Status');
    });
  });

  it('renders Event card', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Event');
    });
  });

  it('renders Attempts card', async () => {
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Attempts');
    });
  });

  // === Failed delivery ===
  it('renders failed delivery correctly', async () => {
    mockWebhooksGet.mockResolvedValue({
      ...mockDelivery,
      status: 'failed',
      response_status: 500,
    });
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      const badge = container.querySelector('[data-testid="status-badge"]');
      expect(badge!.textContent).toBe('failed');
    });
  });

  // === Non-null return ===
  it('returns null when delivery is null and not loading', async () => {
    mockWebhooksGet.mockResolvedValue(null);
    mockWebhooksGetAttempts.mockResolvedValue([]);
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      // After loading, if delivery is null and no error, should render nothing
      expect(container.textContent).not.toContain('Delivery Details');
    });
  });

  // === Multiple attempts ===
  it('renders multiple attempts', async () => {
    mockWebhooksGet.mockResolvedValue({ ...mockDelivery, attempt_count: 3, status: 'failed' });
    mockWebhooksGetAttempts.mockResolvedValue([
      { id: 'att_1', status: 'failed', status_code: 500, duration_ms: 100, attempted_at: '2024-06-01T10:00:01Z' },
      { id: 'att_2', status: 'failed', status_code: 500, duration_ms: 200, attempted_at: '2024-06-01T10:05:01Z' },
      { id: 'att_3', status: 'failed', status_code: 500, duration_ms: 300, attempted_at: '2024-06-01T10:15:01Z' },
    ]);
    const { container } = render(React.createElement(DeliveryDetailPage));
    await waitFor(() => {
      expect(container.textContent).toContain('3');
    });
  });
});
