// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './test-utils';
import { act, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), Link: ({ children, ...p }: any) => React.createElement('a', p, children), usePathname: () => '/deliveries' }));
vi.mock('@/lib/store', () => ({ useAuth: () => ({ token: 'tk', user: { id: 'u1', email: 't@t.com', plan: 'pro' } }) }));
vi.mock('@/components/Toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(), usePathname: () => '/deliveries' }));

const deliveries = [
  { id: 'd1', endpoint_id: 'ep1', event_type: 'order.created', status: 'delivered', attempt_count: 1, response_status: 200, created_at: '2024-03-01T10:00:00Z', customer_id: 'c1', endpoint_url: 'https://ex.com' },
  { id: 'd2', endpoint_id: 'ep2', event_type: 'payment.completed', status: 'failed', attempt_count: 3, response_status: 500, created_at: '2024-03-01T11:00:00Z', customer_id: 'c1', endpoint_url: 'https://ex.com' },
];

vi.mock('@/hooks/useDashboardData', () => ({
  useWebhooks: () => ({ data: { deliveries, total: 2 }, isLoading: false, error: null }),
  useReplayDelivery: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useSearch: () => ({ data: null, isLoading: false }),
  useDeliveryAttempts: () => ({ data: null, isLoading: false }),
  useStatusCounts: () => ({ data: { total: 2, delivered: 1, failed: 1 }, isLoading: false }),
}));
vi.mock('@/hooks/useCollections', () => ({ useLiveEndpoints: () => ({ data: [], isLoading: false }) }));
vi.mock('@/hooks/useDeliveryStream', () => ({ useDeliveryStream: () => ({ connected: true, lastEvent: null }) }));
vi.mock('@/hooks/useAdminData', () => ({ useIsFeatureEnabled: () => false }));
vi.mock('@/hooks/useDebouncedSearch', () => ({ useDebouncedSearch: () => ({ search: '', setSearch: vi.fn(), debouncedSearch: '' }) }));
vi.mock('@/components/ConfirmDialog', () => ({ default: ({ open }: any) => open ? React.createElement('div', { 'data-testid': 'confirm' }) : null }));
vi.mock('@/components/StatusBadge', () => ({ StatusBadge: ({ status }: any) => React.createElement('span', null, status) }));
vi.mock('@/components/RoleGuard', () => ({ RoleGuard: ({ children }: any) => children }));
vi.mock('@/components/VirtualTable', () => ({ VirtualTable: ({ data, columns }: any) => React.createElement('div', { 'data-testid': 'table' }, data.map((d: any, i: number) => React.createElement('div', { key: i }, columns.map((c: any) => React.createElement('span', { key: c.key }, String(c.render ? c.render(d[c.key], d) : d[c.key])))) )) }));
vi.mock('@/components/LazySection', () => ({ LazySection: ({ children }: any) => children, Skeletons: { table: () => null } }));

const { DeliveriesContent } = await import('@/app/[locale]/(dashboard)/deliveries/DeliveriesContent');

describe('DeliveriesContent', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders delivery event types', () => {
    const { container } = renderWithProviders(React.createElement(DeliveriesContent));
    expect(container.textContent).toContain('order.created');
    expect(container.textContent).toContain('payment.completed');
  });

  it('shows delivery statuses', () => {
    const { container } = renderWithProviders(React.createElement(DeliveriesContent));
    expect(container.textContent).toContain('delivered');
    expect(container.textContent).toContain('failed');
  });

  it('renders response status codes', () => {
    const { container } = renderWithProviders(React.createElement(DeliveriesContent));
    expect(container.textContent).toContain('200');
    expect(container.textContent).toContain('500');
  });

  it('shows page title', () => {
    const { container } = renderWithProviders(React.createElement(DeliveriesContent));
    expect(container.textContent).toContain('deliveries');
  });
});
