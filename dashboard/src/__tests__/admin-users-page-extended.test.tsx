// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'admin@test.com', plan: 'business', is_admin: true } }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockListUsers = vi.fn();
const mockUpdateUserPlan = vi.fn().mockResolvedValue({});
const mockUpdateUserStatus = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  adminApi: {
    listUsers: (...args: any[]) => mockListUsers(...args),
    updateUserPlan: (...args: any[]) => mockUpdateUserPlan(...args),
    updateUserStatus: (...args: any[]) => mockUpdateUserStatus(...args),
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

const makeUsers = (count: number, overrides: Partial<any> = {}) =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${String(i + 1).padStart(3, '0')}-abcd-efgh`,
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    plan: i % 3 === 0 ? 'free' : i % 3 === 1 ? 'pro' : 'business',
    status: i % 4 === 0 ? 'banned' : 'active',
    created_at: '2024-01-15T10:00:00Z',
    ...overrides,
  }));

describe('AdminUsersPage - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListUsers.mockResolvedValue({ users: makeUsers(3), total: 3 });
  });

  // --- Rendering ---
  it('renders the user management title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('userManagement');
  });

  it('renders the subtitle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Manage users, plans, and account status');
  });

  // --- User Table Rendering ---
  it('renders user table with correct columns', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const headers = container!.querySelectorAll('th');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    expect(headerTexts).toContain('ID');
    expect(headerTexts).toContain('Email');
    expect(headerTexts).toContain('Name');
    expect(headerTexts).toContain('Plan');
    expect(headerTexts).toContain('Status');
    expect(headerTexts).toContain('Created');
    expect(headerTexts).toContain('Actions');
  });

  it('renders user rows with correct data', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('user1@example.com');
    expect(container!.textContent).toContain('user2@example.com');
    expect(container!.textContent).toContain('user3@example.com');
  });

  it('renders truncated user IDs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    // IDs should be truncated with …
    expect(container!.textContent).toContain('…');
  });

  it('renders plan badges for each user', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('free');
    expect(container!.textContent).toContain('pro');
    expect(container!.textContent).toContain('business');
  });

  it('renders user names', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('User 1');
    expect(container!.textContent).toContain('User 2');
  });

  // --- Search ---
  it('renders search input with correct placeholder', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    expect(searchInput.placeholder).toBe('admin.searchByEmail');
  });

  it('updates search value on typing', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test@example.com' } });
    });
    expect(searchInput.value).toBe('test@example.com');
  });

  it('triggers search on form submit', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'search@test.com' } });
    });
    const form = container!.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    // Should have been called at least twice: once on mount, once (or more) on search
    expect(mockListUsers.mock.calls.length).toBeGreaterThanOrEqual(2);
    const lastCall = mockListUsers.mock.calls[mockListUsers.mock.calls.length - 1][1];
    expect(lastCall.search).toBe('search@test.com');
    expect(lastCall.page).toBe(1);
  });

  // --- Plan Filter ---
  it('renders plan filter dropdown with options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const selects = container!.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    const planSelect = selects[0];
    const options = Array.from(planSelect.querySelectorAll('option')).map(o => o.value);
    expect(options).toContain('');
    expect(options).toContain('free');
    expect(options).toContain('pro');
    expect(options).toContain('business');
  });

  it('updates plan filter and refetches', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const selects = container!.querySelectorAll('select');
    const planSelect = selects[0];
    await act(async () => {
      fireEvent.change(planSelect, { target: { value: 'pro' } });
    });
    await waitFor(() => {
      const lastCall = mockListUsers.mock.calls[mockListUsers.mock.calls.length - 1][1];
      expect(lastCall.plan).toBe('pro');
      expect(lastCall.page).toBe(1);
    });
  });

  // --- Status Filter ---
  it('renders status filter dropdown with options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const selects = container!.querySelectorAll('select');
    const statusSelect = selects[1];
    const options = Array.from(statusSelect.querySelectorAll('option')).map(o => o.value);
    expect(options).toContain('');
    expect(options).toContain('active');
    expect(options).toContain('banned');
  });

  it('updates status filter and refetches', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const selects = container!.querySelectorAll('select');
    const statusSelect = selects[1];
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'banned' } });
    });
    await waitFor(() => {
      const lastCall = mockListUsers.mock.calls[mockListUsers.mock.calls.length - 1][1];
      expect(lastCall.status).toBe('banned');
      expect(lastCall.page).toBe(1);
    });
  });

  // --- Pagination ---
  it('shows pagination when total exceeds perPage', async () => {
    mockListUsers.mockResolvedValue({ users: makeUsers(20), total: 50 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Showing');
    expect(container!.textContent).toContain('of 50');
    expect(container!.textContent).toContain('Page 1 of');
    expect(container!.textContent).toContain('Previous');
    expect(container!.textContent).toContain('Next');
  });

  it('hides pagination when total is within perPage', async () => {
    mockListUsers.mockResolvedValue({ users: makeUsers(5), total: 5 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).not.toContain('Showing');
    expect(container!.textContent).not.toContain('Previous');
  });

  it('disables Previous button on first page', async () => {
    mockListUsers.mockResolvedValue({ users: makeUsers(20), total: 50 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const prevButton = Array.from(buttons).find(b => b.textContent === 'Previous');
    expect(prevButton).toBeTruthy();
    expect(prevButton!.disabled).toBe(true);
  });

  it('clicking Next goes to next page', async () => {
    mockListUsers.mockResolvedValue({ users: makeUsers(20), total: 50 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const nextButton = Array.from(buttons).find(b => b.textContent === 'Next')!;
    await act(async () => {
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      const lastCall = mockListUsers.mock.calls[mockListUsers.mock.calls.length - 1][1];
      expect(lastCall.page).toBe(2);
    });
  });

  it('clicking Previous goes back to previous page', async () => {
    mockListUsers.mockResolvedValue({ users: makeUsers(20), total: 50 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const nextButton = Array.from(buttons).find(b => b.textContent === 'Next')!;
    await act(async () => {
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(mockListUsers.mock.calls[mockListUsers.mock.calls.length - 1][1].page).toBe(2);
    });
    // Now click Previous
    const prevButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Previous')!;
    await act(async () => {
      fireEvent.click(prevButton);
    });
    await waitFor(() => {
      expect(mockListUsers.mock.calls[mockListUsers.mock.calls.length - 1][1].page).toBe(1);
    });
  });

  // --- Action Buttons ---
  it('renders View link for each user', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const viewLinks = container!.querySelectorAll('a');
    const viewTexts = Array.from(viewLinks).filter(a => a.textContent === 'View');
    expect(viewTexts.length).toBe(3);
    expect(viewTexts[0].getAttribute('href')).toContain('/admin/users/user-');
  });

  it('renders Plan button for each user', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButtons = Array.from(buttons).filter(b => b.textContent === 'Plan');
    expect(planButtons.length).toBe(3);
  });

  it('renders Ban button for active users', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const banButtons = Array.from(buttons).filter(b => b.textContent === 'Ban');
    // Users 2, 3 are active (user 1 is banned because index 0 % 4 === 0)
    expect(banButtons.length).toBe(2);
  });

  it('renders Activate button for banned users', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const activateButtons = Array.from(buttons).filter(b => b.textContent === 'Activate');
    expect(activateButtons.length).toBe(1);
  });

  // --- Plan Change Modal ---
  it('opens plan change modal when Plan button is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    expect(container!.textContent).toContain('Change Plan');
    expect(container!.textContent).toContain('Update Plan');
    expect(container!.textContent).toContain('Cancel');
  });

  it('shows user email in plan change modal', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    // The modal should show the email of the targeted user
    expect(container!.textContent).toContain('user1@example.com');
  });

  it('plan change modal has plan options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    // The modal has its own select
    const selects = container!.querySelectorAll('select');
    const modalSelect = selects[selects.length - 1]; // last select is in the modal
    const options = Array.from(modalSelect.querySelectorAll('option')).map(o => o.value);
    expect(options).toEqual(['free', 'pro', 'business']);
  });

  it('closes plan change modal when Cancel is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    expect(container!.textContent).toContain('Change Plan');
    const cancelButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Cancel')!;
    await act(async () => {
      fireEvent.click(cancelButton);
    });
    expect(container!.textContent).not.toContain('Change Plan');
  });

  it('closes plan change modal when backdrop is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    expect(container!.textContent).toContain('Change Plan');
    // Click the backdrop (the fixed overlay div)
    const backdrop = container!.querySelector('.fixed.inset-0.bg-black\\/40');
    if (backdrop) {
      await act(async () => {
        fireEvent.click(backdrop);
      });
      expect(container!.textContent).not.toContain('Change Plan');
    }
  });

  it('calls updateUserPlan when Update Plan is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    // Change the plan in the modal select
    const selects = container!.querySelectorAll('select');
    const modalSelect = selects[selects.length - 1];
    await act(async () => {
      fireEvent.change(modalSelect, { target: { value: 'business' } });
    });
    const updateButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update Plan')!;
    await act(async () => {
      fireEvent.click(updateButton);
    });
    expect(mockUpdateUserPlan).toHaveBeenCalledWith('test-token', expect.any(String), 'business');
  });

  it('shows success toast after plan update', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    const updateButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update Plan')!;
    await act(async () => {
      fireEvent.click(updateButton);
    });
    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('Plan updated'), 'success');
  });

  // --- Ban/Activate Toggle ---
  it('calls updateUserStatus when Ban button is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const banButton = Array.from(buttons).find(b => b.textContent === 'Ban')!;
    await act(async () => {
      fireEvent.click(banButton);
    });
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('test-token', expect.any(String), 'banned');
  });

  it('calls updateUserStatus when Activate button is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const activateButton = Array.from(buttons).find(b => b.textContent === 'Activate')!;
    await act(async () => {
      fireEvent.click(activateButton);
    });
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('test-token', expect.any(String), 'active');
  });

  it('shows toast after ban action', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const banButton = Array.from(buttons).find(b => b.textContent === 'Ban')!;
    await act(async () => {
      fireEvent.click(banButton);
    });
    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('banned'), 'success');
  });

  it('shows toast after activate action', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const activateButton = Array.from(buttons).find(b => b.textContent === 'Activate')!;
    await act(async () => {
      fireEvent.click(activateButton);
    });
    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('activated'), 'success');
  });

  it('refetches users after status toggle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const callCountBefore = mockListUsers.mock.calls.length;
    const buttons = container!.querySelectorAll('button');
    const banButton = Array.from(buttons).find(b => b.textContent === 'Ban')!;
    await act(async () => {
      fireEvent.click(banButton);
    });
    expect(mockListUsers.mock.calls.length).toBeGreaterThan(callCountBefore);
  });

  // --- Empty State ---
  it('shows empty state when no users returned', async () => {
    mockListUsers.mockResolvedValue({ users: [], total: 0 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No users found.');
  });

  it('does not show table when no users', async () => {
    mockListUsers.mockResolvedValue({ users: [], total: 0 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const table = container!.querySelector('table');
    expect(table).toBeNull();
  });

  // --- Loading State ---
  it('shows loading indicator while fetching', async () => {
    mockListUsers.mockReturnValue(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Loading users...');
  });

  it('does not show table during loading', async () => {
    mockListUsers.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const table = container!.querySelector('table');
    expect(table).toBeNull();
  });

  // --- Error Handling ---
  it('shows error toast when fetch fails', async () => {
    mockListUsers.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(AdminUsersPage));
    });
    expect(mockToast).toHaveBeenCalledWith('common.error', 'error');
  });

  it('shows error toast when plan update fails', async () => {
    mockUpdateUserPlan.mockRejectedValue(new Error('Update failed'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const planButton = Array.from(buttons).find(b => b.textContent === 'Plan')!;
    await act(async () => {
      fireEvent.click(planButton);
    });
    const updateButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update Plan')!;
    await act(async () => {
      fireEvent.click(updateButton);
    });
    expect(mockToast).toHaveBeenCalledWith('common.error', 'error');
  });

  it('shows error toast when status toggle fails', async () => {
    mockUpdateUserStatus.mockRejectedValue(new Error('Toggle failed'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const banButton = Array.from(buttons).find(b => b.textContent === 'Ban')!;
    await act(async () => {
      fireEvent.click(banButton);
    });
    expect(mockToast).toHaveBeenCalledWith('common.error', 'error');
  });

  // --- Many Users ---
  it('renders large user list correctly', async () => {
    mockListUsers.mockResolvedValue({ users: makeUsers(20), total: 20 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    const rows = container!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(20);
  });

  // --- Users with missing name ---
  it('renders dash when user has no name', async () => {
    mockListUsers.mockResolvedValue({
      users: [{ id: 'u-001-abcdef1234', email: 'noname@test.com', name: '', plan: 'free', status: 'active', created_at: '2024-01-01' }],
      total: 1,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('—');
  });

  // --- Created date rendering ---
  it('renders created date for users', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUsersPage));
      container = result.container;
    });
    // toLocaleDateString of '2024-01-15T10:00:00Z' should contain 2024
    expect(container!.textContent).toContain('2024');
  });
});
