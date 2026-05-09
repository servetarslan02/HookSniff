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

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const mockEndpointsList = vi.fn().mockResolvedValue([
  { id: 'ep1', url: 'https://example.com', description: 'Test', is_active: true, created_at: '2024-01-01' },
]);
const mockWebhooksCreate = vi.fn().mockResolvedValue({ id: 'w1', status: 'delivered' });

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    create: mockWebhooksCreate,
  },
  endpointsApi: {
    list: mockEndpointsList,
  },
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: () => React.createElement('div', null, 'Loading'),
}));

const { default: SendWebhookPage } = await import('@/app/[locale]/dashboard/webhooks/new/page');

describe('SendWebhookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue([
      { id: 'ep1', url: 'https://example.com', description: 'Test', is_active: true, created_at: '2024-01-01' },
    ]);
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(SendWebhookPage));
    });
  });

  it('fetches endpoints on mount', async () => {
    await act(async () => {
      render(React.createElement(SendWebhookPage));
    });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  it('displays webhook title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('title');
  });

  it('renders endpoint selector dropdown', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select');
    expect(select).toBeTruthy();
    expect(container!.textContent).toContain('selectEndpoint');
  });

  it('renders payload textarea', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const textarea = container!.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('renders send button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('sendWebhook');
  });
});
