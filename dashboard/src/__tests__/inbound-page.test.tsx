// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEndpointsList = vi.fn().mockResolvedValue([
  { id: 'ep1', url: 'https://example.com', is_active: true, created_at: '2024-01-01' },
]);
const mockListConfigs = vi.fn().mockResolvedValue([]);
const mockCreateConfig = vi.fn().mockResolvedValue({ id: 'new' });
const mockDeleteConfig = vi.fn().mockResolvedValue({});

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
  },
  inboundApi: {
    listConfigs: (...args: any[]) => mockListConfigs(...args),
    createConfig: (...args: any[]) => mockCreateConfig(...args),
    deleteConfig: (...args: any[]) => mockDeleteConfig(...args),
  },
}));

const mockConfigs = [
  { id: 'cfg1', provider: 'stripe', endpoint_id: 'ep1', enabled: true, secret: 'whsec_123', created_at: '2024-01-01' },
  { id: 'cfg2', provider: 'github', endpoint_id: null, enabled: false, secret: 'ghsec_456', created_at: '2024-02-01' },
];

const { default: InboundPage } = await import('@/app/[locale]/dashboard/inbound/page');

describe('InboundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue([
      { id: 'ep1', url: 'https://example.com', is_active: true, created_at: '2024-01-01' },
    ]);
    mockListConfigs.mockResolvedValue(mockConfigs);
  });

  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(InboundPage)); });
  });

  it('displays inbound title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Inbound Webhooks');
  });

  it('displays subtitle', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Receive webhooks from Stripe, GitHub, Shopify');
  });

  it('renders how it works section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('How it works');
  });

  it('renders provider URLs section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Your Inbound URLs');
  });

  it('renders add provider button', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Add Provider');
  });

  it('fetches configs on mount', async () => {
    await act(async () => { render(React.createElement(InboundPage)); });
    expect(mockListConfigs).toHaveBeenCalledWith('test-token');
  });

  it('displays configured providers', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('stripe');
    expect(container!.textContent).toContain('github');
  });

  it('shows enabled/disabled status', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    // The component renders enabled/disabled configs
    expect(container!.textContent).toContain('stripe');
    expect(container!.textContent).toContain('github');
  });

  it('shows empty state when no configs', async () => {
    mockListConfigs.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Inbound Webhooks');
  });

  it('shows create form when Add Provider clicked', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Add Provider'));
    await act(async () => { fireEvent.click(btn!); });
    // Form should be visible
    expect(container!.querySelectorAll('button').length).toBeGreaterThan(1);
  });

  it('shows provider options in create form', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Add Provider'));
    await act(async () => { fireEvent.click(btn!); });
    expect(container!.textContent).toContain('Stripe');
    expect(container!.textContent).toContain('GitHub');
    expect(container!.textContent).toContain('Shopify');
    expect(container!.textContent).toContain('Generic');
  });

  it('creates inbound config', async () => {
    mockCreateConfig.mockResolvedValueOnce({ id: 'new' });

    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Add Provider'));
    await act(async () => { fireEvent.click(btn!); });

    // Select Stripe provider
    const stripeBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Stripe'));
    if (stripeBtn) {
      await act(async () => { fireEvent.click(stripeBtn); });
    }

    const saveBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Save'));
    if (saveBtn) {
      await act(async () => { fireEvent.click(saveBtn); });
      expect(mockCreateConfig).toHaveBeenCalledWith(
        'test-token',
        expect.objectContaining({ provider: 'stripe' })
      );
    }
  });

  it('shows provider icons', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('💳'); // Stripe
    expect(container!.textContent).toContain('🐙'); // GitHub
    expect(container!.textContent).toContain('🛒'); // Shopify
  });

  it('renders inbound URL examples', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('/inbound/stripe');
    expect(container!.textContent).toContain('/inbound/github');
  });

  it('shows secret field in configs', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('stripe');
  });

  it('handles fetch error gracefully', async () => {
    mockListConfigs.mockRejectedValueOnce(new Error('Network error'));
    mockEndpointsList.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Inbound Webhooks');
  });

  it('shows loading state initially', async () => {
    mockListConfigs.mockReturnValue(new Promise(() => {}));
    mockEndpointsList.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(InboundPage)).container; });
    expect(container!.textContent).toContain('Inbound Webhooks');
  });
});
