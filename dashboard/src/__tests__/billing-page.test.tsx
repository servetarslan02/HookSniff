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
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', plan: 'free' },
  }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  billingApi: {
    getInvoices: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const { default: BillingPage } = await import('@/app/[locale]/dashboard/billing/page');

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ webhooks: { used: 50, limit: 10000 } }),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(BillingPage));
    });
  });

  it('displays billing title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(BillingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('billing.title');
  });

  it('displays current plan section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(BillingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('billing.currentPlan');
  });

  it('renders plan cards', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(BillingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('$0');
    expect(container!.textContent).toContain('$49');
    expect(container!.textContent).toContain('$149');
  });

  it('renders invoice history section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(BillingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('billing.invoiceHistory');
  });
});
