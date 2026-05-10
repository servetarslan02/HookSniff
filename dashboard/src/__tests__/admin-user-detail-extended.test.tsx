// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'admin@test.com', plan: 'business', is_admin: true } }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'user-123' }),
}));

const mockToastFn = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToastFn }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => React.createElement('div', null, children),
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: any) => React.createElement('div', null, children),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => React.createElement('div', null, children),
}));

vi.mock('@/components/tremor/StatCard', () => ({
  StatCard: ({ title }: any) => React.createElement('div', null, title),
}));

vi.mock('@/components/tremor/ChartCard', () => ({
  ChartCard: ({ title }: any) => React.createElement('div', null, title),
}));

const mockGetUserDetail = vi.fn();
const mockUpdateUserPlan = vi.fn().mockResolvedValue({});
const mockUpdateUserStatus = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  adminApi: {
    getUserDetail: (...args: any[]) => mockGetUserDetail(...args),
    updateUserPlan: (...args: any[]) => mockUpdateUserPlan(...args),
    updateUserStatus: (...args: any[]) => mockUpdateUserStatus(...args),
  },
}));

const { default: AdminUserDetailPage } = await import('@/app/[locale]/admin/users/[id]/page');

const fullDetail = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    plan: 'pro',
    status: 'active',
    created_at: '2024-03-15T14:30:00Z',
  },
  usage_stats: {
    total_deliveries: 1250,
    success_rate: 98.5,
    endpoints_count: 3,
  },
  endpoints: [
    { id: 'ep-1', url: 'https://example.com/webhook', is_active: true, created_at: '2024-02-01T00:00:00Z' },
    { id: 'ep-2', url: 'https://other.com/hook', is_active: false, created_at: '2024-02-15T00:00:00Z' },
  ],
  recent_deliveries: [
    { id: 'del-001-abcdef1234', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-03-15T10:00:00Z' },
    { id: 'del-002-abcdef5678', event: 'user.signup', status: 'failed', attempt_count: 3, created_at: '2024-03-14T08:00:00Z' },
  ],
};

describe('AdminUserDetailPage - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockGetUserDetail.mockResolvedValue(fullDetail);
  });

  // --- Basic Rendering ---
  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminUserDetailPage));
    });
  });

  it('fetches user detail on mount', async () => {
    await act(async () => {
      render(React.createElement(AdminUserDetailPage));
    });
    expect(mockGetUserDetail).toHaveBeenCalledWith('test-token', 'user-123');
  });

  it('displays user name as title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Test User');
  });

  it('displays "User Detail" subtitle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('User Detail');
  });

  it('displays user email', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('test@example.com');
  });

  it('displays user ID', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('user-123');
  });

  it('displays user status via StatusBadge', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const badges = container!.querySelectorAll('[data-testid="status-badge"]');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].textContent).toBe('active');
  });

  it('displays created date', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('2024');
  });

  // --- User Info Card ---
  it('renders User Info section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('User Info');
  });

  it('renders ID label and value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const labels = container!.querySelectorAll('label');
    const idLabel = Array.from(labels).find(l => l.textContent === 'ID');
    expect(idLabel).toBeTruthy();
  });

  it('renders Email label and value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const labels = container!.querySelectorAll('label');
    const emailLabel = Array.from(labels).find(l => l.textContent === 'Email');
    expect(emailLabel).toBeTruthy();
  });

  it('renders Name label', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const labels = container!.querySelectorAll('label');
    const nameLabel = Array.from(labels).find(l => l.textContent === 'Name');
    expect(nameLabel).toBeTruthy();
  });

  it('renders dash when user has no name', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      user: { ...fullDetail.user, name: '' },
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    // Should show — for empty name
    const namePs = Array.from(container!.querySelectorAll('p')).filter(p => p.textContent === '—');
    expect(namePs.length).toBeGreaterThan(0);
  });

  // --- Plan Change ---
  it('renders Management section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Management');
  });

  it('shows plan selector with current plan', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe('pro');
  });

  it('plan selector has all plan options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.querySelectorAll('option')).map(o => o.value);
    expect(options).toEqual(['free', 'pro', 'business']);
  });

  it('Update button is disabled when plan unchanged', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const updateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update');
    expect(updateBtn).toBeTruthy();
    expect(updateBtn!.disabled).toBe(true);
  });

  it('Update button enables when plan is changed', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'business' } });
    });
    const updateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update');
    expect(updateBtn!.disabled).toBe(false);
  });

  it('calls updateUserPlan when Update is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'business' } });
    });
    const updateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update')!;
    await act(async () => {
      fireEvent.click(updateBtn);
    });
    expect(mockUpdateUserPlan).toHaveBeenCalledWith('test-token', 'user-123', 'business');
  });

  it('shows success toast after plan update', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'free' } });
    });
    const updateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update')!;
    await act(async () => {
      fireEvent.click(updateBtn);
    });
    expect(mockToastFn).toHaveBeenCalledWith(expect.stringContaining('Plan updated'), 'success');
  });

  it('refetches detail after plan update', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const callsBefore = mockGetUserDetail.mock.calls.length;
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'free' } });
    });
    const updateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update')!;
    await act(async () => {
      fireEvent.click(updateBtn);
    });
    expect(mockGetUserDetail.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('shows error toast when plan update fails', async () => {
    mockUpdateUserPlan.mockRejectedValue(new Error('fail'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'free' } });
    });
    const updateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Update')!;
    await act(async () => {
      fireEvent.click(updateBtn);
    });
    expect(mockToastFn).toHaveBeenCalledWith('Failed to update plan', 'error');
  });

  // --- Status Toggle ---
  it('shows "Ban User" button for active users', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const banBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Ban User');
    expect(banBtn).toBeTruthy();
  });

  it('shows "Activate User" button for banned users', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      user: { ...fullDetail.user, status: 'banned' },
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const activateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Activate User');
    expect(activateBtn).toBeTruthy();
  });

  it('calls updateUserStatus when Ban User is clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const banBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Ban User')!;
    await act(async () => {
      fireEvent.click(banBtn);
    });
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('test-token', 'user-123', 'banned');
  });

  it('calls updateUserStatus when Activate User is clicked', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      user: { ...fullDetail.user, status: 'banned' },
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const activateBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Activate User')!;
    await act(async () => {
      fireEvent.click(activateBtn);
    });
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('test-token', 'user-123', 'active');
  });

  it('shows toast after status toggle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const banBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Ban User')!;
    await act(async () => {
      fireEvent.click(banBtn);
    });
    expect(mockToastFn).toHaveBeenCalledWith(expect.stringContaining('banned'), 'success');
  });

  it('shows error toast when status toggle fails', async () => {
    mockUpdateUserStatus.mockRejectedValue(new Error('fail'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const banBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Ban User')!;
    await act(async () => {
      fireEvent.click(banBtn);
    });
    expect(mockToastFn).toHaveBeenCalledWith('Failed to update status', 'error');
  });

  // --- Usage Stats ---
  it('displays total deliveries', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Total Deliveries');
    expect(container!.textContent).toContain('1,250');
  });

  it('displays success rate', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Success Rate');
    expect(container!.textContent).toContain('98.5');
  });

  it('displays endpoints count', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Endpoints');
    expect(container!.textContent).toContain('3');
  });

  it('shows 0 when usage_stats is missing', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      usage_stats: undefined,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('0');
  });

  // --- Endpoints ---
  it('renders Endpoints section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const headings = Array.from(container!.querySelectorAll('h2'));
    const epHeading = headings.find(h => h.textContent === 'Endpoints');
    expect(epHeading).toBeTruthy();
  });

  it('renders endpoint URLs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('https://example.com/webhook');
    expect(container!.textContent).toContain('https://other.com/hook');
  });

  it('renders endpoint active/inactive status', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Active');
    expect(container!.textContent).toContain('Inactive');
  });

  it('shows "No endpoints" when endpoints array is empty', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      endpoints: [],
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No endpoints');
  });

  it('shows "No endpoints" when endpoints is undefined', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      endpoints: undefined,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No endpoints');
  });

  // --- Recent Deliveries ---
  it('renders Recent Deliveries section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Recent Deliveries');
  });

  it('renders delivery table headers', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const headers = Array.from(container!.querySelectorAll('th')).map(h => h.textContent);
    expect(headers).toContain('ID');
    expect(headers).toContain('Event');
    expect(headers).toContain('Status');
    expect(headers).toContain('Attempts');
    expect(headers).toContain('Time');
  });

  it('renders delivery data rows', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('order.created');
    expect(container!.textContent).toContain('user.signup');
  });

  it('renders attempt count', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    // attempt_count values are 1 and 3
    const rows = container!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('shows "No deliveries" when recent_deliveries is empty', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      recent_deliveries: [],
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No deliveries');
  });

  it('shows "No deliveries" when recent_deliveries is undefined', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      recent_deliveries: undefined,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No deliveries');
  });

  // --- Back Navigation ---
  it('renders back button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const backBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Back'));
    expect(backBtn).toBeTruthy();
  });

  it('navigates to users list on back click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const backBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Back'))!;
    await act(async () => {
      fireEvent.click(backBtn);
    });
    expect(mockPush).toHaveBeenCalledWith('/admin/users');
  });

  // --- Loading State ---
  it('shows loading skeleton initially', () => {
    mockGetUserDetail.mockReturnValue(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    act(() => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('does not show user content during loading', () => {
    mockGetUserDetail.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    act(() => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).not.toContain('Test User');
    expect(container!.textContent).not.toContain('User Info');
  });

  // --- Error State / Not Found ---
  it('shows "User Not Found" when detail is null after loading', async () => {
    mockGetUserDetail.mockResolvedValue(null);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('User Not Found');
  });

  it('shows back button in not-found state', async () => {
    mockGetUserDetail.mockResolvedValue(null);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Back to Users');
  });

  it('navigates to users list from not-found state', async () => {
    mockGetUserDetail.mockResolvedValue(null);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const backLink = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Users'));
    expect(backLink).toBeTruthy();
    await act(async () => {
      fireEvent.click(backLink!);
    });
    expect(mockPush).toHaveBeenCalledWith('/admin/users');
  });

  it('shows error toast when fetch fails', async () => {
    mockGetUserDetail.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(AdminUserDetailPage));
    });
    expect(mockToastFn).toHaveBeenCalledWith('Failed to load user details', 'error');
  });

  // --- Banned user display ---
  it('shows banned status correctly', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      user: { ...fullDetail.user, status: 'banned' },
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const badges = container!.querySelectorAll('[data-testid="status-badge"]');
    expect(badges[0].textContent).toBe('banned');
  });

  // --- Email used as fallback title when no name ---
  it('uses email as title when name is empty', async () => {
    mockGetUserDetail.mockResolvedValue({
      ...fullDetail,
      user: { ...fullDetail.user, name: '' },
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    // h1 should contain the email
    const h1 = container!.querySelector('h1');
    expect(h1!.textContent).toBe('test@example.com');
  });
});
