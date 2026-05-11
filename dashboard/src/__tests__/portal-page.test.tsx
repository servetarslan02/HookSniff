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

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn().mockImplementation((path: string) => {
    if (path === '/portal/me') {
      return Promise.resolve({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test User',
        plan: 'pro',
        webhook_limit: 10000,
        webhook_count: 500,
        created_at: '2024-01-01',
      });
    }
    if (path === '/portal/usage') {
      return Promise.resolve({
        webhooks_used: 500,
        api_calls_today: 50,
        total_deliveries: 600,
        delivered: 580,
        failed: 20,
        success_rate: 96.7,
        endpoints_count: 5,
      });
    }
    return Promise.resolve({});
  }),
}));

const { default: PortalPage } = await import('@/app/[locale]/dashboard/portal-manage/page');

describe('PortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(PortalPage));
    });
  });

  it('displays portal title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(PortalPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Customer Portal');
  });

  it('shows loading state initially', () => {
    const { container } = render(React.createElement(PortalPage));
    expect(container.textContent).toContain('Loading...');
  });

  it('displays profile after loading', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(PortalPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Profile');
    expect(container!.textContent).toContain('test@test.com');
  });

  it('displays usage after loading', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(PortalPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Usage');
  });
});
