// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({ schemas: [] }),
}));

const { default: SchemasPage } = await import('@/app/[locale]/dashboard/schemas/page');

describe('SchemasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { apiFetch } = await import('@/lib/api');
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ schemas: [] });
    await act(async () => {
      render(React.createElement(SchemasPage));
    });
  });

  it('displays schemas title', async () => {
    const { apiFetch } = await import('@/lib/api');
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ schemas: [] });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SchemasPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Schemas');
  });

  it('shows empty state when no schemas', async () => {
    const { apiFetch } = await import('@/lib/api');
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ schemas: [] });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SchemasPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No schemas registered yet');
  });
});
