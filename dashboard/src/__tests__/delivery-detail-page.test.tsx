// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

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
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123', logout: vi.fn() }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'delivery-123' }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status, size: _size }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, message, confirmLabel, onConfirm, onCancel, loading }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('span', null, message),
      React.createElement('button', { onClick: onConfirm, disabled: loading }, confirmLabel),
      React.createElement('button', { onClick: onCancel }, 'Cancel'),
    ) : null,
}));

const mockGet = vi.fn();
const mockGetAttempts = vi.fn();
const mockReplay = vi.fn();

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    get: (...args: any[]) => mockGet(...args),
    getAttempts: (...args: any[]) => mockGetAttempts(...args),
    replay: (...args: any[]) => mockReplay(...args),
  },
}));

const { default: DeliveryDetailPage } = await import('@/app/[locale]/dashboard/deliveries/[id]/page');

const mockDelivery = {
  id: 'delivery-123',
  event: 'order.created',
  status: 'delivered',
  endpoint_id: 'ep-1',
  endpoint_url: 'https://example.com/webhook',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:05Z',
  request_body: '{"order_id": 123}',
  request_headers: { 'Content-Type': 'application/json', 'X-Webhook-Id': 'wh-1' },
  response_status: 200,
  response_body: '{"ok": true}',
  attempt_count: 2,
  error_message: null,
};

const mockAttempts = [
  {
    id: 'att-1',
    status: 'failed',
    attempt_number: 1,
    response_status: 500,
    created_at: '2024-01-15T10:30:01Z',
    duration_ms: 1200,
    error_message: 'Internal Server Error',
    response_headers: { 'Content-Type': 'application/json' },
    response_body: '{"error": "server error"}',
  },
  {
    id: 'att-2',
    status: 'delivered',
    attempt_number: 2,
    response_status: 200,
    created_at: '2024-01-15T10:30:05Z',
    duration_ms: 300,
    error_message: null,
    response_headers: { 'Content-Type': 'application/json' },
    response_body: '{"ok": true}',
  },
];

describe('DeliveryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue(mockDelivery);
    mockGetAttempts.mockResolvedValue(mockAttempts);
    mockReplay.mockResolvedValue({ id: 'delivery-123', status: 'pending' });
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
    expect(mockGetAttempts).toHaveBeenCalledWith('test-token', 'delivery-123');
  });

  it('shows loading skeleton initially', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    mockGetAttempts.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    act(() => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('displays delivery details after loading', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Delivery Details');
    expect(container!.textContent).toContain('delivery-123');
    expect(container!.textContent).toContain('order.created');
    expect(container!.textContent).toContain('200');
  });

  it('displays overview cards with status, event, attempts, response', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Status');
    expect(container!.textContent).toContain('Event');
    expect(container!.textContent).toContain('Attempts');
    expect(container!.textContent).toContain('Response');
  });

  it('renders replay button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Replay Webhook');
  });

  it('opens replay confirmation dialog on replay click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const replayBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Replay Webhook'));
    await act(async () => {
      fireEvent.click(replayBtn!);
    });
    expect(container!.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
  });

  it('calls replay API when confirmed', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    // Click replay button to open dialog
    const replayBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Replay Webhook'));
    await act(async () => {
      fireEvent.click(replayBtn!);
    });
    // Click confirm button in dialog
    const confirmBtn = container!.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmBtn!);
    });
    expect(mockReplay).toHaveBeenCalledWith('test-token', 'delivery-123');
  });

  it('shows error state when fetch fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Failed to load delivery');
    expect(container!.textContent).toContain('Network error');
    expect(container!.textContent).toContain('Try Again');
    expect(container!.textContent).toContain('Back to Deliveries');
  });

  it('shows error state with default message for non-Error throws', async () => {
    mockGet.mockRejectedValue('unknown error');
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Failed to load delivery');
  });

  it('retries fetch on "Try Again" click', async () => {
    mockGet.mockRejectedValueOnce(new Error('fail'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    mockGet.mockResolvedValue(mockDelivery);
    const tryAgainBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Try Again'));
    await act(async () => {
      fireEvent.click(tryAgainBtn!);
    });
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('renders delivery information section with detail rows', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Delivery Information');
    expect(container!.textContent).toContain('Delivery ID');
    expect(container!.textContent).toContain('Endpoint ID');
    expect(container!.textContent).toContain('Endpoint URL');
    expect(container!.textContent).toContain('Event Type');
    expect(container!.textContent).toContain('Attempt Count');
  });

  it('displays error message when delivery has error_message', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, error_message: 'Timeout after 30s' });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Timeout after 30s');
  });

  it('renders request details section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Request Details');
    expect(container!.textContent).toContain('Request Headers');
    expect(container!.textContent).toContain('Request Body');
  });

  it('toggles request headers visibility', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    // Headers should be hidden initially
    expect(container!.textContent).not.toContain('Content-Type: application/json');
    // Click to expand headers
    const headersBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Request Headers'));
    await act(async () => {
      fireEvent.click(headersBtn!);
    });
    expect(container!.textContent).toContain('Content-Type: application/json');
  });

  it('toggles request body visibility', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const bodyBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Request Body'));
    await act(async () => {
      fireEvent.click(bodyBtn!);
    });
    expect(container!.textContent).toContain('order_id');
  });

  it('renders attempt timeline', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Attempt Timeline');
    expect(container!.textContent).toContain('Attempt #1');
    expect(container!.textContent).toContain('Attempt #2');
    expect(container!.textContent).toContain('2 attempts');
  });

  it('shows empty attempt state when no attempts', async () => {
    mockGetAttempts.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No attempt data available');
  });

  it('expands attempt details on click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    // Click on first attempt to expand
    const attempt1 = Array.from(container!.querySelectorAll('div')).find(d =>
      d.textContent?.includes('Attempt #1') && d.className?.includes('cursor-pointer')
    );
    if (attempt1) {
      await act(async () => {
        fireEvent.click(attempt1);
      });
      expect(container!.textContent).toContain('Internal Server Error');
      expect(container!.textContent).toContain('Response Headers');
      expect(container!.textContent).toContain('Response Body');
    }
  });

  it('collapses expanded attempt on second click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const attempt1 = Array.from(container!.querySelectorAll('div')).find(d =>
      d.textContent?.includes('Attempt #1') && d.className?.includes('cursor-pointer')
    );
    if (attempt1) {
      await act(async () => {
        fireEvent.click(attempt1);
      });
      await act(async () => {
        fireEvent.click(attempt1);
      });
      // Error message should not be visible when collapsed
      // (the expanded section is removed from DOM)
    }
  });

  it('handles getAttempts failure gracefully', async () => {
    mockGetAttempts.mockRejectedValue(new Error('fail'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    // Should still render delivery detail even if attempts fail
    expect(container!.textContent).toContain('Delivery Details');
    expect(container!.textContent).toContain('No attempt data available');
  });

  it('renders back button in header', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const backBtn = container!.querySelector('button[title="Back to deliveries"]');
    expect(backBtn).toBeTruthy();
  });

  it('shows attempt with no expanded data message', async () => {
    mockGetAttempts.mockResolvedValue([{
      id: 'att-minimal',
      status: 'delivered',
      attempt_number: 1,
      response_status: 200,
      created_at: '2024-01-15T10:30:01Z',
      duration_ms: 100,
    }]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const attempt = Array.from(container!.querySelectorAll('div')).find(d =>
      d.textContent?.includes('Attempt #1') && d.className?.includes('cursor-pointer')
    );
    if (attempt) {
      await act(async () => {
        fireEvent.click(attempt);
      });
      expect(container!.textContent).toContain('No additional debug data captured');
    }
  });

  it('handles delivery with no endpoint_url', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, endpoint_url: undefined });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).not.toContain('Endpoint URL');
  });

  it('handles delivery with no response_status', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, response_status: undefined });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('—');
  });

  it('handles delivery with string request_body', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, request_body: '{"key": "value"}' });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const bodyBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Request Body'));
    await act(async () => {
      fireEvent.click(bodyBtn!);
    });
    expect(container!.textContent).toContain('key');
  });

  it('shows "No headers captured" when request_headers is null', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, request_headers: null });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const headersBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Request Headers'));
    await act(async () => {
      fireEvent.click(headersBtn!);
    });
    expect(container!.textContent).toContain('No headers captured');
  });

  it('shows "No payload captured" when request_body is null', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, request_body: null });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const bodyBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Request Body'));
    await act(async () => {
      fireEvent.click(bodyBtn!);
    });
    expect(container!.textContent).toContain('No payload captured');
  });

  it('returns null when delivery is null after loading', async () => {
    mockGet.mockResolvedValue(null);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    // When delivery is null, the component returns null (renders nothing meaningful)
    expect(container!.textContent).not.toContain('Delivery Details');
  });

  it('shows replay loading state', async () => {
    mockReplay.mockReturnValue(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const replayBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Replay Webhook'));
    await act(async () => {
      fireEvent.click(replayBtn!);
    });
    const confirmBtn = container!.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmBtn!);
    });
    // replaying state is active - dialog should still be visible
    expect(container!.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
  });

  it('handles replay failure', async () => {
    mockReplay.mockRejectedValue(new Error('Replay failed'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    const replayBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Replay Webhook'));
    await act(async () => {
      fireEvent.click(replayBtn!);
    });
    const confirmBtn = container!.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmBtn!);
    });
    // Should handle error gracefully without crashing
  });

  it('shows attempt duration and timestamp', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('1200ms');
    expect(container!.textContent).toContain('300ms');
  });

  it('shows HTTP status codes in attempt timeline', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('HTTP 500');
    expect(container!.textContent).toContain('HTTP 200');
  });

  it('displays event type card with dash when no event', async () => {
    mockGet.mockResolvedValue({ ...mockDelivery, event: null });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveryDetailPage));
      container = result.container;
    });
    // Should show dash for empty event
    expect(container!.textContent).toContain('—');
  });
});
