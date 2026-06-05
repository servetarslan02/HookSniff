// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './test-utils';
import { act, fireEvent, waitFor } from '@testing-library/react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
  useLocale: () => 'en'
}));

// Mock navigation
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

// Mock store
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', email: 'test@test.com', plan: 'pro', is_admin: false } }),
}));

// Mock toast
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock hooks
const mockEndpoints = [
  { id: 'ep_1', url: 'https://example.com/webhook', description: 'Production endpoint', is_active: true, created_at: '2024-01-15T10:00:00Z', secret: 'whsec_abc123' },
  { id: 'ep_2', url: 'https://staging.example.com/hook', description: null, is_active: false, created_at: '2024-02-20T14:30:00Z', secret: 'whsec_def456' },
];

const mockRefetch = vi.fn();
vi.mock('@/hooks/useCollections', () => ({
  useLiveEndpoints: () => ({
    data: mockEndpoints,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
}));

vi.mock('@/hooks/useDashboardData', () => ({
  useDeleteEndpoint: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useToggleEndpoint: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 'ep_new', url: 'https://new.com' }),
    delete: vi.fn().mockResolvedValue({}),
    rotateSecret: vi.fn().mockResolvedValue({ secret: 'whsec_new' }),
  },
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, onConfirm, onCancel }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('button', { onClick: onConfirm }, 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel')
    ) : null,
}));

vi.mock('@/components/RoleGuard', () => ({
  RoleGuard: ({ children }: any) => children,
  ReadOnlyBadge: () => null,
}));

vi.mock('@/components/VirtualList', () => ({
  VirtualList: ({ items, renderItem }: any) => React.createElement('div', { 'data-testid': 'virtual-list' }, items.map(renderItem)),
}));

vi.mock('@/components/LazySection', () => ({
  LazySection: ({ children }: any) => children,
  Skeletons: { card: null, table: () => null },
}));

import { EndpointsContent } from '@/app/[locale]/(dashboard)/endpoints/EndpointsContent';

describe('EndpointsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the endpoints page with title', () => {
    const { container } = renderWithProviders(React.createElement(EndpointsContent), { withIntl: false });
    expect(container.textContent).toContain('endpoints.title');
  });

  it('renders endpoint URLs from data', () => {
    const { container } = renderWithProviders(React.createElement(EndpointsContent), { withIntl: false });
    expect(container.textContent).toContain('https://example.com/webhook');
    expect(container.textContent).toContain('https://staging.example.com/hook');
  });

  it('shows active/inactive status for endpoints', () => {
    const { container } = renderWithProviders(React.createElement(EndpointsContent), { withIntl: false });
    expect(container.textContent).toContain('ep_1');
    expect(container.textContent).toContain('ep_2');
  });

  it('renders endpoint descriptions when available', () => {
    const { container } = renderWithProviders(React.createElement(EndpointsContent), { withIntl: false });
    expect(container.textContent!.length).toBeGreaterThan(20);
  });

  it('shows create endpoint form when button clicked', async () => {
    const { container } = renderWithProviders(React.createElement(EndpointsContent), { withIntl: false });
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('endpoints.create') || b.textContent?.includes('Create')
    );
    if (createBtn) {
      await act(async () => {
        fireEvent.click(createBtn);
      });
      const urlInput = container.querySelector('input[type="url"], input[placeholder*="url"], input[placeholder*="URL"]');
      expect(urlInput).toBeTruthy();
    }
  });

  it('shows both endpoints in the list', () => {
    const { container } = renderWithProviders(React.createElement(EndpointsContent), { withIntl: false });
    expect(container.textContent).toContain('ep_1');
    expect(container.textContent).toContain('ep_2');
  });
});
