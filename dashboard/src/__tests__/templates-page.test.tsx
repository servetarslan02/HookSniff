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

const mockApiFetch = vi.fn().mockResolvedValue({ templates: [] });

vi.mock('@/lib/api', () => ({
  apiFetch: mockApiFetch,
}));

const { default: TemplatesPage } = await import('@/app/[locale]/[username]/templates/page');

describe('TemplatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({ templates: [] });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(TemplatesPage));
    });
  });

  it('fetches templates on mount', async () => {
    await act(async () => {
      render(React.createElement(TemplatesPage));
    });
    expect(mockApiFetch).toHaveBeenCalledWith('/templates', { token: 'test-token' });
  });

  it('displays templates title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TemplatesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Templates');
  });

  it('shows empty state when no templates', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TemplatesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No templates available');
  });

  it('renders template cards when data exists', async () => {
    mockApiFetch.mockResolvedValueOnce({
      templates: [
        { id: 't1', name: 'Stripe Webhooks', description: 'Handle Stripe payment events', tags: ['payments'] },
        { id: 't2', name: 'GitHub Events', description: 'Handle GitHub repo events', tags: ['git'] },
      ],
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TemplatesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Stripe Webhooks');
    expect(container!.textContent).toContain('GitHub Events');
    expect(container!.textContent).toContain('payments');
    expect(container!.textContent).toContain('git');
  });
});
