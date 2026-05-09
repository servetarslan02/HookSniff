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
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement('a', props, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
    isLoading: false,
  }),
}));

const mockEndpointsList = vi.fn().mockResolvedValue([
  { id: 'ep1', url: 'https://example.com', description: 'Test', is_active: true, created_at: '2024-01-01' },
]);
const mockEndpointsCreate = vi.fn().mockResolvedValue({ id: 'ep2', url: 'https://new.com', is_active: true, created_at: '2024-01-02' });
const mockEndpointsDelete = vi.fn().mockResolvedValue({ deleted: true });

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: mockEndpointsList,
    create: mockEndpointsCreate,
    delete: mockEndpointsDelete,
  },
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, onConfirm, onCancel }: { open: boolean; title: string; onConfirm: () => void; onCancel: () => void }) =>
    open ? React.createElement('div', null,
      React.createElement('span', null, title),
      React.createElement('button', { onClick: onConfirm }, 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel')
    ) : null,
}));

const { default: EndpointsPage } = await import('@/app/[locale]/dashboard/endpoints/page');

describe('EndpointsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue([
      { id: 'ep1', url: 'https://example.com', description: 'Test', is_active: true, created_at: '2024-01-01' },
    ]);
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(EndpointsPage));
    });
  });

  it('fetches endpoints on mount', async () => {
    await act(async () => {
      render(React.createElement(EndpointsPage));
    });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  it('displays endpoints after loading', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(EndpointsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('endpoints.title');
    expect(container!.textContent).toContain('https://example.com');
  });

  it('shows empty state when no endpoints', async () => {
    mockEndpointsList.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(EndpointsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No endpoints yet');
  });

  it('shows create button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(EndpointsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('New Endpoint');
  });
});
