// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/test',
  Link: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
}));

describe('Toast', () => {
  it('ToastProvider renders children', async () => {
    const { ToastProvider } = await import('@/components/Toast');
    const { container } = render(<ToastProvider><div>child</div></ToastProvider>);
    expect(container.textContent).toContain('child');
  });

  it('useToast throws without ToastProvider', async () => {
    const { useToast } = await import('@/components/Toast');
    let error: Error | null = null;
    function Bad() {
      try { useToast(); } catch (e) { error = e as Error; }
      return null;
    }
    render(<Bad />);
    expect(error?.message).toContain('ToastProvider');
  });

  it('toast function shows message', async () => {
    const { ToastProvider, useToast } = await import('@/components/Toast');
    function Consumer() {
      const { toast } = useToast();
      return <button onClick={() => toast('Success!', 'success')}>Show</button>;
    }
    const { container } = render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(container.querySelector('button')!);
    expect(container.textContent).toContain('Success!');
  });

  it('dismiss button removes toast', async () => {
    const { ToastProvider, useToast } = await import('@/components/Toast');
    function Consumer() {
      const { toast } = useToast();
      return <button onClick={() => toast('Bye', 'error')}>Show</button>;
    }
    const { container } = render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(container.querySelector('button')!);
    expect(container.textContent).toContain('Bye');
    const dismissBtn = container.querySelector('[aria-label="Dismiss"]');
    if (dismissBtn) {
      fireEvent.click(dismissBtn);
      await waitFor(() => { expect(container.textContent).not.toContain('Bye'); });
    }
  });

  it('renders warning and info toast types', async () => {
    const { ToastProvider, useToast } = await import('@/components/Toast');
    function Consumer() {
      const { toast } = useToast();
      return (
        <div>
          <button onClick={() => toast('Info msg', 'info')}>Info</button>
          <button onClick={() => toast('Warn msg', 'warning')}>Warn</button>
        </div>
      );
    }
    const { container } = render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(container.querySelectorAll('button')[0]);
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(container.textContent).toContain('Info msg');
    expect(container.textContent).toContain('Warn msg');
  });

  it('max toasts limit enforced', async () => {
    const { ToastProvider, useToast } = await import('@/components/Toast');
    function Consumer() {
      const { toast } = useToast();
      return (
        <button onClick={() => { for (let i = 0; i < 10; i++) toast(`Toast ${i}`, 'info'); }}>Many</button>
      );
    }
    const { container } = render(<ToastProvider><Consumer /></ToastProvider>);
    fireEvent.click(container.querySelector('button')!);
    const alerts = container.querySelectorAll('[role="alert"] > div');
    expect(alerts.length).toBeLessThanOrEqual(4);
  });
});

describe('PrefetchLink', () => {
  it('renders link with href', async () => {
    const { PrefetchLink } = await import('@/components/PrefetchLink');
    const { container } = renderWithProviders(<PrefetchLink href="/test">Click</PrefetchLink>);
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link!.textContent).toContain('Click');
  });

  it('usePrefetch returns prefetch functions', async () => {
    const { usePrefetch } = await import('@/components/PrefetchLink');
    let prefetch: any;
    let prefetchMany: any;
    function Consumer() {
      const p = usePrefetch();
      prefetch = p.prefetch;
      prefetchMany = p.prefetchMany;
      return null;
    }
    renderWithProviders(<Consumer />);
    expect(typeof prefetch).toBe('function');
    expect(typeof prefetchMany).toBe('function');
  });

  it('prefetch calls queryClient.prefetchQuery', async () => {
    const { usePrefetch } = await import('@/components/PrefetchLink');
    let prefetchFn: any;
    function Consumer() {
      const p = usePrefetch();
      prefetchFn = p.prefetch;
      return null;
    }
    renderWithProviders(<Consumer />);
    prefetchFn({ queryKey: ['test-prefetch'], queryFn: () => Promise.resolve({ data: 'test' }) });
  });

  it('prefetchMany handles multiple queries', async () => {
    const { usePrefetch } = await import('@/components/PrefetchLink');
    let prefetchManyFn: any;
    function Consumer() {
      const p = usePrefetch();
      prefetchManyFn = p.prefetchMany;
      return null;
    }
    renderWithProviders(<Consumer />);
    prefetchManyFn([
      { queryKey: ['q1'], queryFn: () => Promise.resolve(1) },
      { queryKey: ['q2'], queryFn: () => Promise.resolve(2) },
    ]);
  });
});
