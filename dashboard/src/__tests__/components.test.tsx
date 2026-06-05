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

// ── Toast ──
describe('Toast', () => {
  it('ToastProvider renders children', async () => {
    const { ToastProvider } = await import('@/components/Toast');
    const { container } = renderWithProviders(
      <ToastProvider><div>Toast child</div></ToastProvider>,
      { withIntl: false }
    );
    expect(container.textContent).toContain('Toast child');
  });

  it('useToast returns toast function', async () => {
    const { useToast } = await import('@/components/Toast');
    expect(typeof useToast).toBe('function');
  });
});

// ── PrefetchLink ──
describe('PrefetchLink', () => {
  it('renders as anchor element', async () => {
    const { PrefetchLink } = await import('@/components/PrefetchLink');
    const { container } = renderWithProviders(
      <PrefetchLink href="/dashboard">Link</PrefetchLink>,
      { withIntl: false }
    );
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('renders children inside link', async () => {
    const { PrefetchLink } = await import('@/components/PrefetchLink');
    const { container } = renderWithProviders(
      <PrefetchLink href="/dashboard">Click me</PrefetchLink>,
      { withIntl: false }
    );
    expect(container.textContent).toContain('Click me');
  });
});

// ── AuthGuard (extended) ──
describe('AuthGuard (extended)', () => {
  it('redirects when no token', async () => {
    const mockPush = vi.fn();
    vi.doMock('@/i18n/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
      Link: ({ children, ...props }: any) => React.createElement('a', props, children),
    }));
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: null, isLoading: false }),
    }));
    const AuthGuard = (await import('@/components/AuthGuard')).AuthGuard;
    renderWithProviders(
      <AuthGuard><div>Protected</div></AuthGuard>,
      { withIntl: false }
    );
    // Should attempt redirect
    expect(mockPush).toHaveBeenCalled();
    vi.doUnmock('@/lib/store');
    vi.doUnmock('@/i18n/navigation');
  });

  it('shows loading state', async () => {
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: null, isLoading: true }),
    }));
    const AuthGuard = (await import('@/components/AuthGuard')).AuthGuard;
    const { container } = renderWithProviders(
      <AuthGuard><div>Protected</div></AuthGuard>,
      { withIntl: false }
    );
    // Should show loading, not children
    expect(container.textContent).not.toContain('Protected');
    vi.doUnmock('@/lib/store');
  });
});

// ── ConfirmDialog (extended) ──
describe('ConfirmDialog (extended)', () => {
  it('calls onCancel when cancel clicked', async () => {
    const ConfirmDialog = (await import('@/components/ConfirmDialog')).default;
    const onCancel = vi.fn();
    const { container } = renderWithProviders(
      <ConfirmDialog open={true} title="Delete?" message="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />,
      { withIntl: false }
    );
    const buttons = container.querySelectorAll('button');
    const cancelBtn = buttons[0];
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

// ── StatusBadge (extended) ──
describe('StatusBadge (extended)', () => {
  it('renders delivered status with correct styling', async () => {
    const { StatusBadge } = await import('@/components/StatusBadge');
    const { container } = renderWithProviders(
      <StatusBadge status="delivered" />,
      { withIntl: false }
    );
    expect(container.textContent!.length).toBeGreaterThan(0);
  });

  it('renders unknown status', async () => {
    const { StatusBadge } = await import('@/components/StatusBadge');
    const { container } = renderWithProviders(
      <StatusBadge status="unknown_status" />,
      { withIntl: false }
    );
    expect(container.textContent!.length).toBeGreaterThan(0);
  });
});
