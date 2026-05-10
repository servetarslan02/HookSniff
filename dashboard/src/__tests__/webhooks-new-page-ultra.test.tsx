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

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => err instanceof Error ? err.message : 'Unknown error',
}));

const mockEndpointsList = vi.fn();
const mockWebhooksCreate = vi.fn();
vi.mock('@/lib/api', () => ({
  endpointsApi: { list: (...args: unknown[]) => mockEndpointsList(...args) },
  webhooksApi: { create: (...args: unknown[]) => mockWebhooksCreate(...args) },
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'loading-spinner' }, 'Loading'),
}));

const { default: SendWebhookPage } = await import('@/app/[locale]/dashboard/webhooks/new/page');

const MOCK_ENDPOINTS = [
  { id: 'ep1', url: 'https://api.example.com/webhook' },
  { id: 'ep2', url: 'https://api.example.com/payments' },
];

describe('SendWebhookPage (webhooks/new) - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(MOCK_ENDPOINTS);
    mockWebhooksCreate.mockResolvedValue({ id: 'wh_123', status: 'pending' });
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhooks.title');
    });
  });

  it('renders configuration section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhooks.configuration');
    });
  });

  it('renders endpoint select', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      const select = container.querySelector('select');
      expect(select).toBeTruthy();
      expect(container.textContent).toContain('https://api.example.com/webhook');
    });
  });

  it('renders event type input', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      const input = container.querySelector('input[placeholder*="webhooks.eventType"]');
      expect(input).toBeTruthy();
    });
  });

  it('renders payload textarea with default JSON', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeTruthy();
      expect(textarea!.value).toContain('Hello from HookSniff');
    });
  });

  it('renders send button', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhooks.sendWebhook');
    });
  });

  it('renders response section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhooks.responseTitle');
      expect(container.textContent).toContain('webhooks.sendToSeeResponse');
    });
  });

  it('shows JSON error for invalid payload', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhooks.configuration');
    });
    const textarea = container.querySelector('textarea')!;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'not json' } });
    });
    expect(container.textContent).toContain('⚠️');
  });

  it('clears JSON error for valid payload', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    const textarea = container.querySelector('textarea')!;
    // First make it invalid
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'invalid' } });
    });
    // Then fix it
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '{"valid": true}' } });
    });
    const warnings = container.querySelectorAll('.text-red-600');
    expect(warnings.length).toBe(0);
  });

  it('calls webhooksApi.create on send', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhooks.sendWebhook');
    });
    // Select endpoint
    const select = container.querySelector('select')!;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    // Click send
    const sendBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('webhooks.sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksCreate).toHaveBeenCalledWith('test-token', expect.objectContaining({
        endpoint_id: 'ep1',
      }));
    });
  });

  it('shows response after successful send', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    const select = container.querySelector('select')!;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('webhooks.sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('wh_123');
    });
  });

  it('shows error toast on send failure', async () => {
    mockWebhooksCreate.mockRejectedValue(new Error('Send failed'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SendWebhookPage)).container;
    });
    const select = container.querySelector('select')!;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('webhooks.sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('webhooks.sendFailed', 'error');
    });
  });

  it('does not fetch endpoints when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/components/Toast', () => ({ useToast: () => ({ toast: mockToast }) }));
    vi.doMock('@/lib/errors', () => ({ getErrorMessage: (err: unknown) => err instanceof Error ? err.message : '' }));
    vi.doMock('@/lib/api', () => ({
      endpointsApi: { list: mockEndpointsList },
      webhooksApi: { create: mockWebhooksCreate },
    }));
    vi.doMock('@/components/LoadingSpinner', () => ({ default: () => null }));
    const { default: PageNoToken } = await import('@/app/[locale]/dashboard/webhooks/new/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockEndpointsList).not.toHaveBeenCalled();
  });
});
