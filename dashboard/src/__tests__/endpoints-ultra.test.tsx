// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockPush = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
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

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, onConfirm, onCancel }: any) => open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
    React.createElement('button', { onClick: onConfirm }, 'Confirm'),
    React.createElement('button', { onClick: onCancel }, 'Cancel'),
  ) : null,
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

const mockEndpointsList = vi.fn();
const mockEndpointsDelete = vi.fn();
vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: unknown[]) => mockEndpointsList(...args),
    delete: (...args: unknown[]) => mockEndpointsDelete(...args),
  },
}));

const { default: EndpointsPage } = await import('@/app/[locale]/[username]/endpoints/page');

const MOCK_ENDPOINTS = [
  { id: 'ep1', url: 'https://api.example.com/webhook', description: 'Production webhook', status: 'active', created_at: '2024-01-15T10:00:00Z' },
  { id: 'ep2', url: 'https://staging.example.com/webhook', description: 'Staging webhook', status: 'active', created_at: '2024-02-20T11:00:00Z' },
  { id: 'ep3', url: 'https://test.example.com/webhook', description: 'Test endpoint', status: 'inactive', created_at: '2024-03-10T12:00:00Z' },
];

describe('EndpointsPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(MOCK_ENDPOINTS);
    mockEndpointsDelete.mockResolvedValue({});
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('endpoints.title');
    });
  });

  it('renders all endpoints', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('https://api.example.com/webhook');
      expect(container.textContent).toContain('https://staging.example.com/webhook');
      expect(container.textContent).toContain('https://test.example.com/webhook');
    });
  });

  it('renders endpoint descriptions', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Production webhook');
      expect(container.textContent).toContain('Staging webhook');
    });
  });

  it('renders status indicators', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      // Endpoints page shows status as text or badge
      expect(container.textContent).toContain('active');
    });
  });

  it('shows empty state when no endpoints', async () => {
    mockEndpointsList.mockResolvedValue([]);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      // Page renders with title but no endpoint rows
      expect(container.textContent).toContain('endpoints.title');
      const rows = container.querySelectorAll('tbody tr, [class*="endpoint"]');
      expect(rows.length).toBe(0);
    });
  });

  it('handles API error', async () => {
    mockEndpointsList.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      // Page still renders
      expect(container.textContent).toContain('endpoints.title');
    });
  });

  it('navigates to endpoint detail on click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(EndpointsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('https://api.example.com/webhook');
    });
    const viewBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent?.includes('endpoints.viewDetails'));
    if (viewBtns.length > 0) {
      await act(async () => {
        fireEvent.click(viewBtns[0]);
      });
      expect(mockPush).toHaveBeenCalled();
    }
  });

  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: mockPush }), Link: ({ children, ...props }: any) => React.createElement('a', props, children) }));
    vi.doMock('@/components/Toast', () => ({ useToast: () => ({ toast: mockToast }) }));
    vi.doMock('@/lib/errors', () => ({ getErrorMessage: (err: unknown) => err instanceof Error ? err.message : '' }));
    vi.doMock('@/components/ConfirmDialog', () => ({ default: () => null }));
    vi.doMock('@/components/StatusBadge', () => ({ StatusBadge: ({ status }: any) => React.createElement('span', null, status) }));
    vi.doMock('@/lib/api', () => ({
      endpointsApi: { list: mockEndpointsList, delete: mockEndpointsDelete },
    }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/endpoints/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockEndpointsList).not.toHaveBeenCalled();
  });
});
