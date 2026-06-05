// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './test-utils';
import { screen, fireEvent } from '@testing-library/react';

// ── ConfirmDialog ──
describe('ConfirmDialog', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders when open', async () => {
    const ConfirmDialog = (await import('@/components/ConfirmDialog')).default;
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { container } = renderWithProviders(
      <ConfirmDialog open={true} title="Delete?" message="Are you sure?" onConfirm={onConfirm} onCancel={onCancel} />,
      { withIntl: false }
    );
    expect(container.textContent).toContain('Delete?');
  });

  it('does not render when closed', async () => {
    const ConfirmDialog = (await import('@/components/ConfirmDialog')).default;
    const { container } = renderWithProviders(
      <ConfirmDialog open={false} title="Delete?" message="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />,
      { withIntl: false }
    );
    expect(container.textContent).not.toContain('Delete?');
  });

  it('calls onConfirm when confirm clicked', async () => {
    const ConfirmDialog = (await import('@/components/ConfirmDialog')).default;
    const onConfirm = vi.fn();
    const { container } = renderWithProviders(
      <ConfirmDialog open={true} title="Delete?" message="Are you sure?" onConfirm={onConfirm} onCancel={vi.fn()} />,
      { withIntl: false }
    );
    const buttons = container.querySelectorAll('button');
    const confirmBtn = buttons[buttons.length - 1];
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

// ── StatusBadge ──
describe('StatusBadge', () => {
  it('renders with status', async () => {
    const { StatusBadge } = await import('@/components/StatusBadge');
    const { container } = renderWithProviders(
      <StatusBadge status="delivered" />,
      { withIntl: false }
    );
    // StatusBadge uses i18n — with mock it returns key names
    expect(container.textContent!.length).toBeGreaterThan(0);
  });

  it('renders failed status', async () => {
    const { StatusBadge } = await import('@/components/StatusBadge');
    const { container } = renderWithProviders(
      <StatusBadge status="failed" />,
      { withIntl: false }
    );
    expect(container.textContent!.length).toBeGreaterThan(0);
  });

  it('renders pending status', async () => {
    const { StatusBadge } = await import('@/components/StatusBadge');
    const { container } = renderWithProviders(
      <StatusBadge status="pending" />,
      { withIntl: false }
    );
    expect(container.textContent!.length).toBeGreaterThan(0);
  });
});

// ── ErrorBoundary ──
describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    const ErrorBoundary = (await import('@/components/ErrorBoundary')).default;
    const { container } = renderWithProviders(
      <ErrorBoundary><div>Safe content</div></ErrorBoundary>
    );
    expect(container.textContent).toContain('Safe content');
  });

  it('shows error UI when child throws', async () => {
    const ErrorBoundary = (await import('@/components/ErrorBoundary')).default;
    function Thrower() { throw new Error('Test error'); }
    const { container } = renderWithProviders(
      <ErrorBoundary><Thrower /></ErrorBoundary>
    );
    expect(container.textContent).toContain('Something went wrong');
  });

  it('shows Try again button', async () => {
    const ErrorBoundary = (await import('@/components/ErrorBoundary')).default;
    function Thrower() { throw new Error('Test error'); }
    const { container } = renderWithProviders(
      <ErrorBoundary><Thrower /></ErrorBoundary>
    );
    expect(container.textContent).toContain('Try again');
  });
});

// Common mocks
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
  useLocale: () => 'en',
}));
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

// ── AuthGuard ──
describe('AuthGuard', () => {
  it('renders children when token exists', async () => {
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: 'valid-token', isLoading: false }),
    }));
    const AuthGuard = (await import('@/components/AuthGuard')).AuthGuard;
    const { container } = renderWithProviders(
      <AuthGuard><div>Protected</div></AuthGuard>,
      { withIntl: false }
    );
    expect(container.textContent).toContain('Protected');
    vi.doUnmock('@/lib/store');
  });
});

// ── ThemeToggle ──
describe('ThemeToggle', () => {
  it('renders without crashing', async () => {
    const { ThemeToggle } = await import('@/components/ThemeToggle');
    const { container } = renderWithProviders(<ThemeToggle />);
    expect(container).toBeTruthy();
  });
});

// ── LoadingSpinner ──
describe('LoadingSpinner', () => {
  it('renders skeleton without crashing', async () => {
    const mod = await import('@/components/LoadingSkeletons');
    expect(mod.SkeletonDashboard).toBeDefined();
    expect(mod.SkeletonAdmin).toBeDefined();
  });
});

// ── Footer ──
describe('Footer', () => {
  it('renders footer content', async () => {
    const Footer = (await import('@/components/Footer')).default;
    const { container } = renderWithProviders(<Footer />);
    expect(container).toBeTruthy();
  });
});
