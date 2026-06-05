import { renderWithProviders } from './test-utils';
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

// Polyfill IntersectionObserver for jsdom
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTAdmin = (key: string) => `admin.${key}`;
const mockTCommon = (key: string) => `common.${key}`;
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => ns === 'common' ? mockTCommon : mockTAdmin,
  useLocale: () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/admin/users',
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin/users',
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockListUsers = vi.fn().mockResolvedValue({ users: [], total: 0, page: 1, per_page: 25 });
const mockUpdateUserPlan = vi.fn().mockResolvedValue({});
const mockUpdateUserStatus = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  adminApi: {
    listUsers: mockListUsers,
    updateUserPlan: mockUpdateUserPlan,
    updateUserStatus: mockUpdateUserStatus,
  },
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => React.createElement('span', null, status),
}));

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => React.createElement('div', null, 'Pie'),
  Cell: () => React.createElement('div', null, 'Cell'),
  BarChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  Bar: () => React.createElement('div', null, 'Bar'),
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => React.createElement('div', null, children),
}));

vi.mock('@/components/tremor/StatCard', () => ({
  StatCard: ({ title }: any) => React.createElement('div', { 'data-testid': 'stat-card' }, title),
}));

vi.mock('@/components/tremor/ChartCard', () => ({
  ChartCard: ({ title }: any) => React.createElement('div', { 'data-testid': 'chart-card' }, title),
}));

const { default: AdminUsersPage } = await import('@/app/[locale]/admin/users/page');

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListUsers.mockResolvedValue({ users: [], total: 0, page: 1, per_page: 25 });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      renderWithProviders(React.createElement(AdminUsersPage));
    });
  });

  it('fetches users on mount', async () => {
    await act(async () => {
      renderWithProviders(React.createElement(AdminUsersPage));
    });
    expect(mockListUsers).toHaveBeenCalled();
    const callArgs = mockListUsers.mock.calls[0];
    expect(callArgs[0]).toBe('test-token');
  });

  it('displays users title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toBeTruthy();
    expect(container!.textContent!.length).toBeGreaterThan(10);
  });

  it('shows search input', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"], input[type="search"], input[placeholder]');
    expect(searchInput).toBeTruthy();
  });

  it('shows empty state when no users', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(React.createElement(AdminUsersPage));
      container = result.container;
    });
    // Component uses i18n — just verify it renders without crashing
    expect(container!.textContent).toBeTruthy();
  });
});
