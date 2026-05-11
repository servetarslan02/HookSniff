// @vitest-environment jsdom
/**
 * Accessibility (a11y) Tests — @axe-core/react + jest-axe
 *
 * Tests all major dashboard pages for WCAG 2.1 AA compliance.
 * Each page is rendered with minimal mocking, then axe-core scans the DOM
 * for violations (color contrast, ARIA roles, label associations, etc.).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// ─── Shared Mocks ───

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => {
    // Return readable labels so axe can evaluate text content
    const fallback = ns ? `${ns}.${key}` : key;
    return fallback;
  },
  useLocale: () => 'en',
  useNow: () => new Date(),
  useTimeZone: () => 'UTC',
  NextIntlClientProvider: ({ children }: React.PropsWithChildren) => children,
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement('a', { href: href || '#', ...props }, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test User', plan: 'pro', is_admin: false },
    apiKey: 'test-api-key',
    isLoading: false,
    setToken: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
  ToastProvider: ({ children }: React.PropsWithChildren) => children,
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('recharts', () => {
  const Null = () => null;
  return {
    XAxis: Null, YAxis: Null, CartesianGrid: Null, Tooltip: Null, Legend: Null,
    ResponsiveContainer: ({ children }: React.PropsWithChildren) =>
      React.createElement('div', { role: 'img', 'aria-label': 'Chart' }, children),
    PieChart: ({ children }: React.PropsWithChildren) =>
      React.createElement('div', null, children),
    Pie: Null, Cell: Null, AreaChart: Null, Area: Null,
  };
});

// Default API mocks — return empty/success for all
const mockApiReturn = vi.fn().mockResolvedValue({});
vi.mock('@/lib/api', () => ({
  statsApi: { get: vi.fn().mockResolvedValue({ total_deliveries: 0, success_rate: 0, active_endpoints: 0, p99_latency_ms: 0 }) },
  webhooksApi: { list: vi.fn().mockResolvedValue({ deliveries: [], total: 0 }), create: vi.fn(), delete: vi.fn() },
  endpointsApi: { list: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), get: vi.fn() },
  analyticsApi: { deliveryTrend: vi.fn().mockResolvedValue([]), successRate: vi.fn().mockResolvedValue([]) },
  alertsApi: { list: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn(), test: vi.fn() },
  teamApi: { list: vi.fn().mockResolvedValue([]), invite: vi.fn(), remove: vi.fn() },
  apiKeysApi: { list: vi.fn().mockResolvedValue([]), create: vi.fn(), delete: vi.fn() },
  settingsApi: { get: vi.fn().mockResolvedValue({}), update: vi.fn() },
  healthApi: { check: vi.fn().mockResolvedValue({ status: 'healthy', services: [] }) },
  auditApi: { list: vi.fn().mockResolvedValue({ entries: [], total: 0 }) },
  notificationsApi: { list: vi.fn().mockResolvedValue([]), markRead: vi.fn() },
  adminApi: {
    users: vi.fn().mockResolvedValue({ users: [], total: 0 }),
    revenue: vi.fn().mockResolvedValue({ mrr: 0, arr: 0, breakdown: [] }),
    system: vi.fn().mockResolvedValue({ services: [] }),
    settings: vi.fn().mockResolvedValue({}),
  },
}));

// ─── Helpers ───

/**
 * Wrapper that provides a minimal DOM container for axe to scan.
 * Some pages need specific wrapper elements (main, form, table context).
 */
function renderForA11y(ui: React.ReactElement) {
  const { container } = render(ui, { wrapper: ({ children }) => React.createElement('main', null, children) });
  return container;
}

// ─── Test Suites ───

describe('Accessibility — Dashboard Pages', () => {
  /**
   * Helper: dynamically import a page component and run axe against it.
   * We import lazily so vi.mock() is applied before module evaluation.
   */
  async function testPageA11y(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType }>,
  ) {
    it(`${name} should have no a11y violations`, async () => {
      const { default: PageComponent } = await importFn();
      const container = renderForA11y(React.createElement(PageComponent));

      // Wait for effects to settle
      await new Promise((r) => setTimeout(r, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  }

  // ── Dashboard Home ──
  testPageA11y('Dashboard Home', () => import('@/app/[locale]/dashboard/page'));

  // ── Endpoints Page ──
  testPageA11y('Endpoints Page', () => import('@/app/[locale]/dashboard/endpoints/page'));

  // ── Deliveries Page ──
  testPageA11y('Deliveries Page', () => import('@/app/[locale]/dashboard/deliveries/page'));

  // ── Settings Page ──
  testPageA11y('Settings Page', () => import('@/app/[locale]/dashboard/settings/page'));

  // ── Alerts Page ──
  testPageA11y('Alerts Page', () => import('@/app/[locale]/dashboard/alerts/page'));

  // ── API Keys Page ──
  testPageA11y('API Keys Page', () => import('@/app/[locale]/dashboard/api-keys/page'));

  // ── Team Page ──
  testPageA11y('Team Page', () => import('@/app/[locale]/dashboard/team/page'));

  // ── Health Page ──
  testPageA11y('Health Page', () => import('@/app/[locale]/dashboard/health/page'));

  // ── Notifications Page ──
  testPageA11y('Notifications Page', () => import('@/app/[locale]/dashboard/notifications/page'));

  // ── Logs Page ──
  testPageA11y('Logs Page', () => import('@/app/[locale]/dashboard/logs/page'));

  // ── Analytics Page ──
  testPageA11y('Analytics Page', () => import('@/app/[locale]/dashboard/analytics/page'));
});

describe('Accessibility — Admin Pages', () => {
  async function testPageA11y(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType }>,
  ) {
    it(`${name} should have no a11y violations`, async () => {
      // Override auth for admin pages
      vi.doMock('@/lib/store', () => ({
        useAuth: () => ({
          token: 'admin-token',
          user: { id: '1', email: 'admin@test.com', name: 'Admin', plan: 'business', is_admin: true },
          apiKey: 'admin-key',
          isLoading: false,
          setToken: vi.fn(),
          logout: vi.fn(),
        }),
      }));

      const { default: PageComponent } = await importFn();
      const container = renderForA11y(React.createElement(PageComponent));

      await new Promise((r) => setTimeout(r, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  }

  // ── Admin Overview ──
  testPageA11y('Admin Overview', () => import('@/app/[locale]/admin/page'));

  // ── Admin Users ──
  testPageA11y('Admin Users', () => import('@/app/[locale]/admin/users/page'));

  // ── Admin Revenue ──
  testPageA11y('Admin Revenue', () => import('@/app/[locale]/admin/revenue/page'));

  // ── Admin System ──
  testPageA11y('Admin System', () => import('@/app/[locale]/admin/system/page'));

  // ── Admin Settings ──
  testPageA11y('Admin Settings', () => import('@/app/[locale]/admin/settings/page'));
});

describe('Accessibility — Public Pages', () => {
  async function testPageA11y(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType }>,
  ) {
    it(`${name} should have no a11y violations`, async () => {
      const { default: PageComponent } = await importFn();
      const container = renderForA11y(React.createElement(PageComponent));

      await new Promise((r) => setTimeout(r, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  }

  testPageA11y('Landing Page', () => import('@/app/[locale]/page'));
  testPageA11y('Pricing Page', () => import('@/app/[locale]/pricing/page'));
  testPageA11y('Login Page', () => import('@/app/[locale]/login/page'));
  testPageA11y('Status Page', () => import('@/app/[locale]/status/page'));
  testPageA11y('FAQ Page', () => import('@/app/[locale]/faq/page'));
  testPageA11y('Contact Page', () => import('@/app/[locale]/contact/page'));
});
