// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTAdmin = (key: string) => `admin.${key}`;
const mockTCommon = (key: string) => `common.${key}`;
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => ns === 'common' ? mockTCommon : mockTAdmin,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockListUsers = vi.fn().mockResolvedValue({ users: [], total: 0 });
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
    mockListUsers.mockResolvedValue({ users: [], total: 0 });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminUsersPage));
    });
  });

  it('fetches users on mount', async () => {
    await act(async () => {
      render(React.createElement(AdminUsersPage));
    });
    expect(mockListUsers).toHaveBeenCalledWith('test-token', {
      page: 1,
      search: undefined,
      plan: undefined,
      status: undefined,
    });
  });

  it('displays users title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('userManagement');
  });

  it('shows search input', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]');
    expect(searchInput).toBeTruthy();
    expect(searchInput!.getAttribute('placeholder')).toBe('admin.searchByEmail');
  });

  it('shows empty state when no users', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No users found.');
  });
});
