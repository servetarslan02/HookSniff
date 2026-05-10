// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockToast = vi.fn();
const mockEndpointsList = vi.fn().mockResolvedValue([]);
const mockTransformsList = vi.fn().mockResolvedValue([]);
const mockTransformsCreate = vi.fn().mockResolvedValue({});
const mockTransformsDelete = vi.fn().mockResolvedValue({});

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
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
  },
  transformsApi: {
    list: (...args: any[]) => mockTransformsList(...args),
    create: (...args: any[]) => mockTransformsCreate(...args),
    delete: (...args: any[]) => mockTransformsDelete(...args),
  },
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: TransformsPage } = await import('@/app/[locale]/dashboard/transforms/page');

describe('TransformsPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue([]);
    mockTransformsList.mockResolvedValue([]);
    mockTransformsCreate.mockResolvedValue({});
    mockTransformsDelete.mockResolvedValue({});
  });

  it('renders without crashing', () => {
    render(React.createElement(TransformsPage));
  });

  it('displays title', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Webhook Transforms');
  });

  it('displays description', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Filter, map, and enrich');
  });

  it('renders new rule button', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('New Rule');
  });

  it('renders endpoint selector', () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('shows choose endpoint placeholder', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Choose an endpoint');
  });

  it('shows select endpoint message when no endpoint chosen', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Select an endpoint to manage transforms');
  });

  it('opens create form on new rule click', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).toContain('New Transform Rule');
  });

  it('create form has filter include input', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(4);
  });

  it('can type filter include', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const inputs = container.querySelectorAll('input');
    await act(async () => { fireEvent.change(inputs[0], { target: { value: 'order_id, amount' } }); });
    expect(inputs[0].value).toBe('order_id, amount');
  });

  it('can type filter exclude', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const inputs = container.querySelectorAll('input');
    await act(async () => { fireEvent.change(inputs[1], { target: { value: 'internal_secret' } }); });
    expect(inputs[1].value).toBe('internal_secret');
  });

  it('can type map source and target', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const inputs = container.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[2], { target: { value: 'data.id' } });
      fireEvent.change(inputs[3], { target: { value: 'id' } });
    });
    expect(inputs[2].value).toBe('data.id');
    expect(inputs[3].value).toBe('id');
  });

  it('can type enrich key and value', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const inputs = container.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[4], { target: { value: 'source' } });
      fireEvent.change(inputs[5], { target: { value: 'hooksniff' } });
    });
    expect(inputs[4].value).toBe('source');
    expect(inputs[5].value).toBe('hooksniff');
  });

  it('toggles create form visibility', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).toContain('New Transform Rule');
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).not.toContain('New Transform Rule');
  });

  it('does not create rule when no endpoint selected', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Create')
    );
    if (createBtn) {
      await act(async () => { fireEvent.click(createBtn); });
      expect(mockTransformsCreate).not.toHaveBeenCalled();
    }
  });

  it('renders label for filter include', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).toContain('Filter (include fields)');
  });

  it('renders label for filter exclude', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).toContain('Filter (exclude fields)');
  });

  it('renders label for map from/to', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).toContain('Map from');
    expect(container.textContent).toContain('Map to');
  });

  it('renders label for enrich', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    expect(container.textContent).toContain('Enrich key');
    expect(container.textContent).toContain('Enrich value');
  });

  it('renders create button in form', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleBtn!); });
    const createBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent?.includes('Create')
    );
    expect(createBtns.length).toBeGreaterThan(0);
  });

  it('renders select label', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Select Endpoint');
  });

  it('renders new rule button with plus icon', () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('New Rule')
    );
    expect(newRuleBtn?.textContent).toContain('+');
  });
});
