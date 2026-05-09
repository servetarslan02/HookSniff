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
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'ep1', url: 'https://example.com', is_active: true, created_at: '2024-01-01' },
    ]),
  },
}));

const { default: InboundPage } = await import('@/app/[locale]/dashboard/inbound/page');

describe('InboundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(InboundPage));
    });
  });

  it('displays inbound title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(InboundPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Inbound Webhooks');
  });

  it('renders how it works section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(InboundPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('How it works');
  });

  it('renders provider URLs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(InboundPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Your Inbound URLs');
  });

  it('renders add provider button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(InboundPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Add Provider');
  });
});
