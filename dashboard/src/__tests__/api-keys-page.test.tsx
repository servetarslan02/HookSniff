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
  useAuth: () => ({ token: 'test-token', apiKey: 'test-key' }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const { default: ApiKeysPage } = await import('@/app/[locale]/dashboard/api-keys/page');

describe('ApiKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 'k1', name: 'Key 1', prefix: 'sk_abc', created_at: '2024-01-01', last_used_at: null, is_active: true },
      ]),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(ApiKeysPage));
    });
  });

  it('fetches API keys on mount', async () => {
    await act(async () => {
      render(React.createElement(ApiKeysPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.anything()
    );
  });

  it('displays API keys title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(ApiKeysPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('apiKeys.title');
  });

  it('shows empty state when no keys', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(ApiKeysPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('apiKeys.noKeys');
  });

  it('renders create key section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(ApiKeysPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('apiKeys.createNewKey');
  });
});
