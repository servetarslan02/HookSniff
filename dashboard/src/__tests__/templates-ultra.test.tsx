// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: TemplatesPage } = await import('@/app/[locale]/dashboard/templates/page');

const MOCK_TEMPLATES = [
  { id: 't1', name: 'E-commerce Order', description: 'Order created webhook template', tags: ['ecommerce', 'orders'] },
  { id: 't2', name: 'Payment Notification', description: 'Payment completed template', tags: ['payments'] },
];

describe('TemplatesPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({ templates: MOCK_TEMPLATES });
  });

  it('shows loading initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(TemplatesPage));
    expect(container.textContent).toContain('Loading');
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(TemplatesPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('📦');
      expect(container.textContent).toContain('Templates');
    });
  });

  it('renders all templates', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(TemplatesPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('E-commerce Order');
      expect(container.textContent).toContain('Payment Notification');
    });
  });

  it('renders template descriptions', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(TemplatesPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Order created webhook template');
      expect(container.textContent).toContain('Payment completed template');
    });
  });

  it('renders tags', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(TemplatesPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('ecommerce');
      expect(container.textContent).toContain('payments');
    });
  });

  it('shows empty state when no templates', async () => {
    mockApiFetch.mockResolvedValue({ templates: [] });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(TemplatesPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('No templates');
    });
  });

  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(TemplatesPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Templates');
    });
  });

  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
    const { default: PageNoToken } = await import('@/app/[locale]/dashboard/templates/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });
});
