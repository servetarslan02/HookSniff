// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, params?: any) => {
    if (params?.action) return `${ns}.${key}:${params.action}`;
    if (params?.plan) return `${ns}.${key}:${params.plan}`;
    return ns ? `${ns}.${key}` : key;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', plan: 'free' },
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const mockGetInvoices = vi.fn();
const mockGetUsage = vi.fn().mockResolvedValue({ deliveries_used: 50, deliveries_limit: 10000 });
const mockGetSubscription = vi.fn().mockResolvedValue({});
const mockUpgrade = vi.fn().mockResolvedValue({});
vi.mock('@/lib/api', () => ({
  billingApi: {
    getInvoices: (...args: any[]) => mockGetInvoices(...args),
  },
  billingApiExtended: {
    getUsage: (...args: any[]) => mockGetUsage(...args),
    getSubscription: (...args: any[]) => mockGetSubscription(...args),
    upgrade: (...args: any[]) => mockUpgrade(...args),
  },
  api: {
    delete: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

const mockInvoices = [
  { id: 'inv-1234-5678', date: '2024-01-01', plan: 'Pro', amount: 29.00, status: 'paid' },
  { id: 'inv-9012-3456', date: '2024-02-01', plan: 'Pro', amount: 29.00, status: 'pending' },
];

const { default: BillingPage } = await import('@/app/[locale]/[username]/billing/page');

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsage.mockResolvedValue({ deliveries_used: 50, deliveries_limit: 10000 });
    mockGetInvoices.mockResolvedValue(mockInvoices);
  });

  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(BillingPage)); });
  });

  it('displays billing title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('billing.title');
  });

  it('fetches usage data on mount', async () => {
    await act(async () => { render(React.createElement(BillingPage)); });
    expect(mockGetUsage).toHaveBeenCalledWith('test-token');
  });

  it('fetches invoices on mount', async () => {
    await act(async () => { render(React.createElement(BillingPage)); });
    expect(mockGetInvoices).toHaveBeenCalledWith('test-token');
  });

  it('displays current plan section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('billing.currentPlan');
  });

  it('displays plan prices', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('$0');
    expect(container!.textContent).toContain('$29');
    expect(container!.textContent).toContain('$99');
  });

  it('displays plan features', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('100 requests/min');
    expect(container!.textContent).toContain('1,000 requests/min');
    expect(container!.textContent).toContain('10,000 requests/min');
  });

  it('displays invoice history section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('billing.invoiceHistory');
  });

  it('displays invoice details', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('inv-1234');
    expect(container!.textContent).toContain('Pro');
    expect(container!.textContent).toContain('$29.00');
  });

  it('displays invoice status badges', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('Paid');
    expect(container!.textContent).toContain('Pending');
  });

  it('shows empty invoice state', async () => {
    mockGetInvoices.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('No invoices yet');
  });

  it('shows loading invoices state', async () => {
    mockGetInvoices.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('Loading invoices');
  });

  it('displays usage chart data', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    // The chart should render with the usage count
    expect(container!.querySelector('svg')).toBeTruthy();
  });

  it('shows invoice count', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('2');
    expect(container!.textContent).toContain('billing.invoices');
  });

  it('displays invoice dates', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('2024');
  });

  it('renders table headers for invoices', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('Invoice');
    expect(container!.textContent).toContain('Date');
    expect(container!.textContent).toContain('Plan');
    expect(container!.textContent).toContain('Amount');
    expect(container!.textContent).toContain('Status');
  });

  it('renders popular badge for pro plan', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('billing.mostPopular');
  });

  it('displays plan limits', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('plans.freeLimit');
    expect(container!.textContent).toContain('plans.proLimit');
    expect(container!.textContent).toContain('plans.businessLimit');
  });

  it('shows current plan indicator for free plan', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    // Free plan should be marked as current
    expect(container!.textContent).toContain('billing.plans.free');
    expect(container!.textContent).toContain('$0');
  });

  it('renders upgrade buttons for non-current plans', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    // Pro and Business should have upgrade buttons
    const buttons = Array.from(container!.querySelectorAll('button'));
    const upgradeBtns = buttons.filter(b => b.textContent?.includes('Upgrade') || b.textContent?.includes('upgrade'));
    expect(upgradeBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('handles usage fetch error gracefully', async () => {
    mockGetUsage.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('billing.title');
  });

  it('handles invoice fetch error gracefully', async () => {
    mockGetInvoices.mockRejectedValueOnce(new Error('API error'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    expect(container!.textContent).toContain('billing.invoiceHistory');
  });

  it('renders 3 plan cards', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(BillingPage)).container; });
    const cards = container!.querySelectorAll('.glass-card');
    // Should have at least 3 plan cards + invoice section
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
});
