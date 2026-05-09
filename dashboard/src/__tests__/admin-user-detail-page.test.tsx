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
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'user-123' }),
}));

const mockToastFn = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToastFn }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => React.createElement('span', null, status),
}));

const mockGetUserDetail = vi.fn().mockResolvedValue({
  user: { id: 'user-123', email: 'test@test.com', name: 'Test User', plan: 'free', status: 'active', created_at: '2024-01-01' },
  endpoints: [],
  recent_deliveries: [],
});
const mockUpdateUserPlan = vi.fn().mockResolvedValue({});
const mockUpdateUserStatus = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  adminApi: {
    getUserDetail: mockGetUserDetail,
    updateUserPlan: mockUpdateUserPlan,
    updateUserStatus: mockUpdateUserStatus,
  },
}));

const { default: AdminUserDetailPage } = await import('@/app/[locale]/admin/users/[id]/page');

describe('AdminUserDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserDetail.mockResolvedValue({
      user: { id: 'user-123', email: 'test@test.com', name: 'Test User', plan: 'free', status: 'active', created_at: '2024-01-01' },
      endpoints: [],
      recent_deliveries: [],
    });
  });

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

  it('displays user detail title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Test User');
  });

  it('shows loading state initially', () => {
    mockGetUserDetail.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    act(() => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows plan selector', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminUserDetailPage));
      container = result.container;
    });
    const select = container!.querySelector('select');
    expect(select).toBeTruthy();
    expect(select!.value).toBe('free');
  });
});
