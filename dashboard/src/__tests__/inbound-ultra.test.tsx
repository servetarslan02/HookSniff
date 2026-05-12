// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockEndpointsList = vi.fn();
const mockInboundListConfigs = vi.fn();
const mockInboundCreateConfig = vi.fn();

vi.mock('@/lib/api', () => ({
  endpointsApi: { list: (...args: unknown[]) => mockEndpointsList(...args) },
  inboundApi: {
    listConfigs: (...args: unknown[]) => mockInboundListConfigs(...args),
    createConfig: (...args: unknown[]) => mockInboundCreateConfig(...args),
  },
}));

const { default: InboundPage } = await import('@/app/[locale]/[username]/inbound/page');

const MOCK_ENDPOINTS = [
  { id: 'ep1', url: 'https://api.example.com/webhook' },
  { id: 'ep2', url: 'https://api.example.com/payments' },
];

const MOCK_CONFIGS = [
  { id: 'cfg1', provider: 'stripe', endpoint_id: 'ep1', enabled: true },
  { id: 'cfg2', provider: 'github', endpoint_id: 'ep2', enabled: false },
];

describe('InboundPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(MOCK_ENDPOINTS);
    mockInboundListConfigs.mockResolvedValue(MOCK_CONFIGS);
    mockInboundCreateConfig.mockResolvedValue({});
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('📨');
      expect(container.textContent).toContain('Inbound Webhooks');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Receive webhooks from Stripe, GitHub, Shopify');
    });
  });

  it('renders Add Provider button', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === '+ Add Provider');
      expect(btn).toBeTruthy();
    });
  });

  it('renders how it works section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('How it works');
      expect(container.textContent).toContain('External Service');
      expect(container.textContent).toContain('Verify Signature');
    });
  });

  it('renders inbound URLs for all providers', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Your Inbound URLs');
      expect(container.textContent).toContain('/inbound/stripe');
      expect(container.textContent).toContain('/inbound/github');
      expect(container.textContent).toContain('/inbound/shopify');
      expect(container.textContent).toContain('/inbound/generic');
    });
  });

  it('renders active configs', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Active Configs');
      expect(container.textContent).toContain('Stripe');
      expect(container.textContent).toContain('GitHub');
    });
  });

  it('renders config endpoint mapping', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('https://api.example.com/webhook');
      expect(container.textContent).toContain('https://api.example.com/payments');
    });
  });

  it('shows create form on Add Provider click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('+ Add Provider');
    });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === '+ Add Provider');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    expect(container.textContent).toContain('Add Inbound Provider');
  });

  it('renders provider selection cards', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === '+ Add Provider');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    expect(container.textContent).toContain('💳');
    expect(container.textContent).toContain('🐙');
    expect(container.textContent).toContain('🛒');
    expect(container.textContent).toContain('🔗');
  });

  it('shows secret input after selecting provider', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === '+ Add Provider');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    const stripeBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Stripe'));
    await act(async () => {
      fireEvent.click(stripeBtn!);
    });
    expect(container.textContent).toContain('Webhook Secret');
    expect(container.textContent).toContain('Route to Endpoint');
  });

  it('handles API error gracefully', async () => {
    mockEndpointsList.mockRejectedValue(new Error('Error'));
    mockInboundListConfigs.mockRejectedValue(new Error('Error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(InboundPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Inbound Webhooks');
    });
  });

  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/components/Toast', () => ({ useToast: () => ({ toast: mockToast }) }));
    vi.doMock('@/lib/api', () => ({
      endpointsApi: { list: mockEndpointsList },
      inboundApi: { listConfigs: mockInboundListConfigs, createConfig: mockInboundCreateConfig },
    }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/inbound/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockEndpointsList).not.toHaveBeenCalled();
  });
});
