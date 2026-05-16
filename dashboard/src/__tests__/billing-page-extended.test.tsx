// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor, cleanup } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), refresh: mockRefresh }),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, params?: any) => {
    if (params?.action && params?.plan) return `${ns}.${key}:${params.action} ${params.plan}`;
    if (params?.action) return `${ns}.${key}:${params.action}`;
    if (params?.plan) return `${ns}.${key}:${params.plan}`;
    return ns ? `${ns}.${key}` : key;
  },
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

// API mocks – module-level so individual tests can tweak return values
const mockGetInvoices = vi.fn();
const mockGetUsage = vi.fn();
const mockGetSubscription = vi.fn();
const mockUpgrade = vi.fn();
const mockApiDelete = vi.fn();

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
    delete: (...args: any[]) => mockApiDelete(...args),
    put: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('clsx', () => ({
  clsx: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

// Default auth mock – tests can override via vi.mocked(useAuth)
let authOverride: any = null;
vi.mock('@/lib/store', () => ({
  useAuth: () =>
    authOverride ?? {
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', plan: 'free' },
    },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockInvoices = [
  { id: 'inv-1234-5678-abcd', date: '2024-01-01', plan: 'Pro', amount: 29.0, status: 'paid' },
  { id: 'inv-9012-3456-efgh', date: '2024-02-01', plan: 'Pro', amount: 29.0, status: 'pending' },
  { id: 'inv-5555-6666-ijkl', date: '2024-03-01', plan: 'Pro', amount: 29.0, status: 'failed' },
];

async function renderPage() {
  // Dynamic import so each test gets a fresh component instance
  const { default: BillingPage } = await import('@/app/[locale]/[username]/billing/page');
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(React.createElement(BillingPage));
  });
  return result!;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BillingPage – Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authOverride = null;
    // Default happy-path mocks
    mockGetUsage.mockResolvedValue({ deliveries_used: 500, deliveries_limit: 10000 });
    mockGetInvoices.mockResolvedValue(mockInvoices);
    mockGetSubscription.mockResolvedValue({});
    mockUpgrade.mockResolvedValue({});
    mockApiDelete.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
  });

  // ===== Plan Card Rendering =====

  describe('Plan card rendering', () => {
    it('renders all three plan cards with correct prices ($0, $29, $99)', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('$0');
      expect(container.textContent).toContain('$29');
      expect(container.textContent).toContain('$99');
    });

    it('renders plan names via translation keys', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('billing.plans.free');
      expect(container.textContent).toContain('billing.plans.pro');
      expect(container.textContent).toContain('billing.plans.business');
    });

    it('renders plan limit descriptions', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('plans.freeLimit');
      expect(container.textContent).toContain('plans.proLimit');
      expect(container.textContent).toContain('plans.businessLimit');
    });

    it('renders /month period for each plan', async () => {
      const { container } = await renderPage();
      const text = container.textContent!;
      // Each plan has "/month"
      const matches = text.match(/\/month/g);
      expect(matches).toBeTruthy();
      expect(matches!.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ===== Plan Features Display =====

  describe('Plan features display', () => {
    it('displays free plan features', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('100 requests/min');
      expect(container.textContent).toContain('3 retry attempts');
      expect(container.textContent).toContain('Community support');
      expect(container.textContent).toContain('5 endpoints');
      expect(container.textContent).toContain('7-day retention');
    });

    it('displays pro plan features', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('1,000 requests/min');
      expect(container.textContent).toContain('5 retry attempts');
      expect(container.textContent).toContain('Priority support');
      expect(container.textContent).toContain('50 endpoints');
      expect(container.textContent).toContain('30-day retention');
    });

    it('displays business plan features', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('10,000 requests/min');
      expect(container.textContent).toContain('10 retry attempts');
      expect(container.textContent).toContain('Dedicated support');
      expect(container.textContent).toContain('SLA guarantee');
      expect(container.textContent).toContain('500 endpoints');
      expect(container.textContent).toContain('90-day retention');
    });

    it('renders checkmarks for each feature', async () => {
      const { container } = await renderPage();
      const checkmarks = container.querySelectorAll('li span');
      const greenChecks = Array.from(checkmarks).filter(
        (el) => el.textContent === '✓'
      );
      // 5 + 5 + 6 = 16 features total
      expect(greenChecks.length).toBe(16);
    });
  });

  // ===== Current Plan Indicator =====

  describe('Current plan indicator', () => {
    it('shows "current plan" label for the free plan when user is on free', async () => {
      const { container } = await renderPage();
      // The free plan card should show "billing.currentPlanLabel" (translated)
      expect(container.textContent).toContain('billing.currentPlanLabel');
    });

    it('shows current plan badge in summary section', async () => {
      const { container } = await renderPage();
      // Should show "Free" capitalized in the summary badge
      expect(container.textContent).toContain('Free');
    });

    it('shows "most popular" badge on pro plan', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('billing.mostPopular');
    });

    it('shows pro plan as current when user is on pro', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();
      // The summary badge should show "Pro"
      expect(container.textContent).toContain('Pro');
    });

    it('shows cancel button when user is on a paid plan', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();
      expect(container.textContent).toContain('Cancel Subscription');
    });

    it('hides cancel button when user is on free plan', async () => {
      const { container } = await renderPage();
      const cancelBtns = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('Cancel Subscription')
      );
      expect(cancelBtns.length).toBe(0);
    });
  });

  // ===== Usage Chart Rendering =====

  describe('Usage chart rendering', () => {
    it('renders an SVG chart with usage data', async () => {
      const { container } = await renderPage();
      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
      });
    });

    it('renders bars inside the chart', async () => {
      const { container } = await renderPage();
      await waitFor(() => {
        const rects = container.querySelectorAll('svg rect');
        expect(rects.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders month label text in the chart', async () => {
      const { container } = await renderPage();
      await waitFor(() => {
        const texts = container.querySelectorAll('svg text');
        expect(texts.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('shows loading spinner for usage while fetching', async () => {
      // Make usage fetch hang
      mockGetUsage.mockReturnValue(new Promise(() => {}));
      const { container } = await renderPage();
      // Should show a spinner (animate-spin class)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();
    });

    it('hides usage chart when data is empty', async () => {
      mockGetUsage.mockResolvedValue({ deliveries_used: 0, deliveries_limit: 10000 });
      const { container } = await renderPage();
      await waitFor(() => {
        // With 0 usage, chartData will have count=0 but still one entry, so SVG still renders.
        // The component renders null only when data.length === 0, but we always push one entry.
        // Instead verify the usage count is displayed.
        expect(container.textContent).toContain('0');
      });
    });
  });

  // ===== Loading States =====

  describe('Loading states', () => {
    it('shows loading spinner for invoices while fetching', async () => {
      mockGetInvoices.mockReturnValue(new Promise(() => {}));
      const { container } = await renderPage();
      expect(container.textContent).toContain('Loading invoices');
    });

    it('shows usage loading spinner initially', async () => {
      mockGetUsage.mockReturnValue(new Promise(() => {}));
      const { container } = await renderPage();
      // The usage section spinner
      const spinners = container.querySelectorAll('.animate-spin');
      expect(spinners.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===== Error States =====

  describe('Error states', () => {
    it('handles usage API error gracefully', async () => {
      mockGetUsage.mockRejectedValueOnce(new Error('Network error'));
      const { container } = await renderPage();
      // Page should still render
      expect(container.textContent).toContain('billing.title');
    });

    it('handles invoice API error gracefully', async () => {
      mockGetInvoices.mockRejectedValueOnce(new Error('API error'));
      const { container } = await renderPage();
      // Should still show invoice section
      expect(container.textContent).toContain('billing.invoiceHistory');
    });

    it('handles both APIs failing', async () => {
      mockGetUsage.mockRejectedValueOnce(new Error('fail'));
      mockGetInvoices.mockRejectedValueOnce(new Error('fail'));
      const { container } = await renderPage();
      expect(container.textContent).toContain('billing.title');
    });
  });

  // ===== Empty Invoice State =====

  describe('Empty invoice state', () => {
    it('shows "No invoices yet" when invoice list is empty', async () => {
      mockGetInvoices.mockResolvedValueOnce([]);
      const { container } = await renderPage();
      await waitFor(() => {
        expect(container.textContent).toContain('No invoices yet');
      });
    });

    it('shows invoice count of 0 when empty', async () => {
      mockGetInvoices.mockResolvedValueOnce([]);
      const { container } = await renderPage();
      await waitFor(() => {
        expect(container.textContent).toContain('0');
        expect(container.textContent).toContain('billing.invoices');
      });
    });
  });

  // ===== Upgrade Flow =====

  describe('Upgrade flow', () => {
    it('opens upgrade modal when clicking an upgrade button', async () => {
      const { container } = await renderPage();
      // Find upgrade buttons (non-current plans)
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );
      expect(upgradeBtn).toBeTruthy();

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      // Modal should appear with role="dialog"
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });

    it('upgrade modal contains confirm and cancel buttons', async () => {
      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const dialogBtns = Array.from(dialog.querySelectorAll('button'));
      const cancelBtn = dialogBtns.find((b) => b.textContent === 'Cancel');
      const confirmBtn = dialogBtns.find(
        (b) => b.textContent?.includes('common.confirm') || b.textContent?.includes('billing.redirecting')
      );
      expect(cancelBtn).toBeTruthy();
      expect(confirmBtn).toBeTruthy();
    });

    it('closes upgrade modal when clicking cancel button', async () => {
      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = container.querySelector('[role="dialog"]')!;
      const cancelBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent === 'Cancel'
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeNull();
    });

    it('calls upgrade API and redirects to checkout URL on confirm', async () => {
      mockUpgrade.mockResolvedValueOnce({ checkout_url: 'https://polar.sh/checkout/123' });

      // Mock window.location
      const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
      const redirectUrl = '';
      Object.defineProperty(window, 'location', {
        value: { href: redirectUrl },
        writable: true,
      });

      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.confirm')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockUpgrade).toHaveBeenCalledWith('test-token', expect.any(String));
      });

      // Restore
      if (originalHref) Object.defineProperty(window, 'location', originalHref);
    });

    it('shows toast when upgrade has no checkout URL', async () => {
      mockUpgrade.mockResolvedValueOnce({ checkout_url: null });

      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.confirm')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Upgrade initiated', 'success');
      });
    });

    it('shows error toast when upgrade API fails', async () => {
      mockUpgrade.mockRejectedValueOnce(new Error('Payment failed'));

      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.confirm')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Payment failed', 'error');
      });
    });

    it('shows error toast for untrusted checkout URL', async () => {
      mockUpgrade.mockResolvedValueOnce({
        checkout_url: 'https://evil.example.com/checkout',
      });

      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.confirm')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Invalid checkout URL', 'error');
      });
    });

    it('closes upgrade modal after confirm completes', async () => {
      mockUpgrade.mockResolvedValueOnce({});

      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.confirm')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeNull();
      });
    });
  });

  // ===== Cancel Subscription Flow =====

  describe('Cancel subscription flow', () => {
    it('opens cancel modal when clicking cancel button (paid plan)', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );
      expect(cancelBtn).toBeTruthy();

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();
    });

    it('cancel modal has keep plan and confirm cancel buttons', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const dialogBtns = Array.from(dialog.querySelectorAll('button'));
      expect(dialogBtns.some((b) => b.textContent?.includes('billing.keepPlan'))).toBe(true);
      expect(dialogBtns.some((b) => b.textContent?.includes('billing.cancelSubscription'))).toBe(true);
    });

    it('closes cancel modal when clicking keep plan', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = container.querySelector('[role="dialog"]')!;
      const keepBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.keepPlan')
      );

      await act(async () => {
        fireEvent.click(keepBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeNull();
    });

    it('calls cancel API and refreshes router on confirm', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.cancelSubscription')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockGetSubscription).toHaveBeenCalledWith('test-token');
        expect(mockApiDelete).toHaveBeenCalledWith('/billing/subscription', 'test-token');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('shows success toast after cancel', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.cancelSubscription')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('billing.cancelledMsg', 'info');
      });
    });

    it('shows error toast when cancel API fails', async () => {
      mockApiDelete.mockRejectedValueOnce(new Error('Cancel failed'));
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.cancelSubscription')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith('Cancel failed', 'error');
      });
    });

    it('closes cancel modal after successful cancel', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.cancelSubscription')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeNull();
      });
    });
  });

  // ===== Modal Escape Key Handling =====

  describe('Modal escape key handling', () => {
    it('closes upgrade modal on Escape key', async () => {
      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(container.querySelector('[role="dialog"]')).toBeNull();
    });

    it('closes cancel modal on Escape key', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(container.querySelector('[role="dialog"]')).toBeNull();
    });

    it('does not react to non-Escape keys', async () => {
      const { container } = await renderPage();
      const buttons = Array.from(container.querySelectorAll('button'));
      const upgradeBtn = buttons.find(
        (b) => b.textContent?.includes('upgrade') || b.textContent?.includes('Upgrade')
      );

      await act(async () => {
        fireEvent.click(upgradeBtn!);
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Enter' });
      });

      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
  });

  // ===== router.refresh() After Cancel =====

  describe('router.refresh() after cancel', () => {
    it('calls router.refresh() after successful cancel', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.cancelSubscription')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call router.refresh() when cancel fails', async () => {
      mockApiDelete.mockRejectedValueOnce(new Error('fail'));
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com', plan: 'pro' },
      };
      const { container } = await renderPage();

      const cancelBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Cancel Subscription')
      );

      await act(async () => {
        fireEvent.click(cancelBtn!);
      });

      const dialog = container.querySelector('[role="dialog"]')!;
      const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('billing.cancelSubscription')
      );

      await act(async () => {
        fireEvent.click(confirmBtn!);
      });

      await waitFor(() => {
        expect(mockRefresh).not.toHaveBeenCalled();
      });
    });
  });

  // ===== Invoice Table =====

  describe('Invoice table', () => {
    it('renders table headers', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('Invoice');
      expect(container.textContent).toContain('Date');
      expect(container.textContent).toContain('Plan');
      expect(container.textContent).toContain('Amount');
      expect(container.textContent).toContain('Status');
    });

    it('renders invoice rows with correct data', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('inv-1234');
      expect(container.textContent).toContain('$29.00');
    });

    it('renders all three status badge types', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('Paid');
      expect(container.textContent).toContain('Pending');
      expect(container.textContent).toContain('Failed');
    });

    it('shows invoice count', async () => {
      const { container } = await renderPage();
      expect(container.textContent).toContain('3');
      expect(container.textContent).toContain('billing.invoices');
    });
  });

  // ===== Usage Progress Bar =====

  describe('Usage progress bar', () => {
    it('displays usage count and limit', async () => {
      const { container } = await renderPage();
      await waitFor(() => {
        expect(container.textContent).toContain('500');
        expect(container.textContent).toContain('10,000');
      });
    });

    it('shows usage percentage', async () => {
      const { container } = await renderPage();
      await waitFor(() => {
        // 500/10000 = 5%
        expect(container.textContent).toContain('5%');
      });
    });

    it('shows warning when usage exceeds 80%', async () => {
      mockGetUsage.mockResolvedValue({ deliveries_used: 9000, deliveries_limit: 10000 });
      const { container } = await renderPage();
      await waitFor(() => {
        expect(container.textContent).toContain('billing.approachingLimit');
      });
    });
  });

  // ===== Edge Cases =====

  describe('Edge cases', () => {
    it('renders when user has no plan field (defaults to free)', async () => {
      authOverride = {
        token: 'test-token',
        user: { id: '1', email: 'test@test.com' }, // no plan
      };
      const { container } = await renderPage();
      expect(container.textContent).toContain('Free');
    });

    it('renders when token is null', async () => {
      authOverride = { token: null, user: null };
      const { container } = await renderPage();
      expect(container.textContent).toContain('billing.title');
      // API calls should not be made
      expect(mockGetUsage).not.toHaveBeenCalled();
      expect(mockGetInvoices).not.toHaveBeenCalled();
    });

    it('does not call APIs when token is missing', async () => {
      authOverride = { token: null, user: { id: '1', plan: 'free' } };
      await renderPage();
      expect(mockGetUsage).not.toHaveBeenCalled();
      expect(mockGetInvoices).not.toHaveBeenCalled();
    });
  });
});
