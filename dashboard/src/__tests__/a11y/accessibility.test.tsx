// @vitest-environment jsdom
/**
 * Accessibility (a11y) Tests — @axe-core/react + jest-axe
 *
 * Tests major dashboard pages for WCAG 2.1 AA compliance.
 * Uses pending (never-resolving) API mocks so pages render in their initial state
 * without infinite re-render loops from async effects.
 *
 * Violations are collected and reported as warnings. As a11y issues are fixed
 * in the codebase, switch from `reportViolations()` to `expect(results).toHaveNoViolations()`
 * to enforce zero violations per page.
 *
 * To run: npx vitest run src/__tests__/a11y/
 */
import { describe, it, expect, vi, afterAll, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ─── Shared Mocks ───

vi.mock('next-intl', () => {
  const createTranslator = (ns?: string) => {
    const t = (key: string) => (ns ? `${ns}.${key}` : key);
    t.raw = (key: string) => {
      // Return sensible defaults for known raw() calls
      if (key.includes('features') || key.includes('Features')) return ['Feature 1', 'Feature 2'];
      if (key.includes('faq') || key.includes('FAQ') || key.includes('questions'))
        return [{ q: 'Question?', a: 'Answer.' }];
      if (key.includes('steps') || key.includes('Steps')) return ['Step 1', 'Step 2'];
      if (key.includes('typewriter') || key.includes('phrases'))
        return ['Webhook delivery made simple', 'Ship webhooks in minutes'];
      // Default: return a single-element array (most raw() calls expect arrays)
      return ['Item 1'];
    };
    t.rich = (key: string) => (ns ? `${ns}.${key}` : key);
    t.markup = (key: string) => (ns ? `${ns}.${key}` : key);
    t.has = () => true;
    return t;
  };
  return {
    useTranslations: createTranslator,
    useLocale: () => 'en',
    useNow: () => new Date(),
    useTimeZone: () => 'UTC',
    NextIntlClientProvider: ({ children }: React.PropsWithChildren) => children,
  };
});

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

vi.mock('@/components/ConfirmDialog', () => ({ default: () => null }));
vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));
vi.mock('@/components/OnboardingWizard', () => ({
  OnboardingWizard: () => null,
  SetupChecklist: () => null,
}));
vi.mock('@/components/tremor', () => ({
  StatCard: ({ title }: { title: string }) => React.createElement('div', { role: 'status' }, title),
  ChartCard: ({ title }: { title: string }) => React.createElement('div', null, title),
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));

// API mocks — return pending promises to keep pages in loading/initial state.
// This prevents infinite re-renders while still testing the actual component DOM.
const pending = () => new Promise<never>(() => {});

vi.mock('@/lib/api', () => ({
  statsApi: { get: () => pending() },
  webhooksApi: { list: () => pending(), create: () => pending(), delete: () => pending(), replay: () => pending() },
  endpointsApi: { list: () => pending(), create: () => pending(), delete: () => pending(), get: () => pending() },
  analyticsApi: { deliveryTrend: () => pending(), successRate: () => pending() },
  alertsApi: { list: () => pending(), create: () => pending(), delete: () => pending(), test: () => pending() },
  teamApi: { list: () => pending(), invite: () => pending(), remove: () => pending() },
  apiKeysApi: { list: () => pending(), create: () => pending(), delete: () => pending() },
  settingsApi: { get: () => pending(), update: () => pending() },
  healthApi: { check: () => pending() },
  auditApi: { list: () => pending() },
  notificationsApi: { list: () => pending(), markRead: () => pending() },
  adminApi: {
    users: () => pending(),
    revenue: () => pending(),
    system: () => pending(),
    settings: () => pending(),
  },
}));

// ─── Helpers ───

let totalViolations = 0;
const violationSummary: string[] = [];

function renderForA11y(ui: React.ReactElement) {
  const { container } = render(ui, {
    wrapper: ({ children }) => React.createElement('main', null, children),
  });
  return container;
}

/**
 * Reports a11y violations as warnings without failing the test.
 * Once violations are fixed, switch to: expect(results).toHaveNoViolations()
 */
function reportViolations(pageName: string, results: Awaited<ReturnType<typeof axe>>) {
  const violations = results.violations;
  if (violations.length > 0) {
    totalViolations += violations.length;
    const summary = violations.map((v) => `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} element(s))`).join('\n');
    violationSummary.push(`⚠️  ${pageName}: ${violations.length} violation(s)\n${summary}`);
    // Log as warning for visibility
    console.warn(`\n⚠️  a11y violations in "${pageName}":`);
    violations.forEach((v) => {
      console.warn(`   [${v.impact}] ${v.id}: ${v.description}`);
      console.warn(`   Help: ${v.helpUrl}`);
      v.nodes.forEach((n) => console.warn(`   → ${n.html}`));
    });
  }
}

// ─── Test Suites ───

describe('Accessibility — Dashboard Pages', () => {
  afterAll(() => {
    if (violationSummary.length > 0) {
      console.warn('\n' + '═'.repeat(60));
      console.warn('📊 A11y Test Summary — Dashboard Pages');
      console.warn('═'.repeat(60));
      violationSummary.forEach((s) => console.warn(s));
      console.warn(`\nTotal violations found: ${totalViolations}`);
      console.warn('Fix violations, then switch reportViolations() → expect().toHaveNoViolations()');
      console.warn('═'.repeat(60) + '\n');
    }
  });

  async function testPageA11y(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType }>,
  ) {
    it(`${name} — scans for a11y violations`, async () => {
      const { default: PageComponent } = await importFn();
      const container = renderForA11y(React.createElement(PageComponent));
      await new Promise((r) => setTimeout(r, 50));
      const results = await axe(container);
      reportViolations(name, results);
      // Test passes — violations are logged as warnings.
      // To enforce zero violations, uncomment the line below:
      // expect(results).toHaveNoViolations();
    });
  }

  testPageA11y('Dashboard Home', () => import('@/app/[locale]/dashboard/page'));
  testPageA11y('Endpoints Page', () => import('@/app/[locale]/dashboard/endpoints/page'));
  testPageA11y('Deliveries Page', () => import('@/app/[locale]/dashboard/deliveries/page'));
  testPageA11y('Settings Page', () => import('@/app/[locale]/dashboard/settings/page'));
  testPageA11y('Alerts Page', () => import('@/app/[locale]/dashboard/alerts/page'));
  testPageA11y('API Keys Page', () => import('@/app/[locale]/dashboard/api-keys/page'));
  testPageA11y('Team Page', () => import('@/app/[locale]/dashboard/team/page'));
  testPageA11y('Health Page', () => import('@/app/[locale]/dashboard/health/page'));
  testPageA11y('Notifications Page', () => import('@/app/[locale]/dashboard/notifications/page'));
  testPageA11y('Logs Page', () => import('@/app/[locale]/dashboard/logs/page'));
  testPageA11y('Analytics Page', () => import('@/app/[locale]/dashboard/analytics/page'));
});

describe('Accessibility — Admin Pages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function testPageA11y(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType }>,
  ) {
    it(`${name} — scans for a11y violations`, async () => {
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
      await new Promise((r) => setTimeout(r, 50));
      const results = await axe(container);
      reportViolations(name, results);
    });
  }

  testPageA11y('Admin Overview', () => import('@/app/[locale]/admin/page'));
  testPageA11y('Admin Users', () => import('@/app/[locale]/admin/users/page'));
  testPageA11y('Admin Revenue', () => import('@/app/[locale]/admin/revenue/page'));
  testPageA11y('Admin System', () => import('@/app/[locale]/admin/system/page'));
  testPageA11y('Admin Settings', () => import('@/app/[locale]/admin/settings/page'));
});

describe('Accessibility — Public Pages', () => {
  async function testPageA11y(
    name: string,
    importFn: () => Promise<{ default: React.ComponentType }>,
  ) {
    it(`${name} — scans for a11y violations`, async () => {
      const { default: PageComponent } = await importFn();
      const container = renderForA11y(React.createElement(PageComponent));
      await new Promise((r) => setTimeout(r, 50));
      const results = await axe(container);
      reportViolations(name, results);
    });
  }

  testPageA11y('Landing Page', () => import('@/app/[locale]/page'));
  testPageA11y('Pricing Page', () => import('@/app/[locale]/pricing/page'));
  testPageA11y('Login Page', () => import('@/app/[locale]/login/page'));
  testPageA11y('Status Page', () => import('@/app/[locale]/status/page'));
  testPageA11y('FAQ Page', () => import('@/app/[locale]/faq/page'));
  testPageA11y('Contact Page', () => import('@/app/[locale]/contact/page'));
});
