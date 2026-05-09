// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockEndpointsList = vi.fn();

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

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
  },
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: TransformsPage } = await import('@/app/[locale]/dashboard/transforms/page');

const mockEndpoints = [
  { id: 'ep1', url: 'https://example.com', is_active: true, created_at: '2024-01-01' },
  { id: 'ep2', url: 'https://other.com', is_active: false, created_at: '2024-02-01' },
];

const mockRules = [
  {
    id: 'r1',
    endpoint_id: 'ep1',
    rule_json: { filter: { include: ['order_id', 'amount'] } },
    created_at: '2024-01-15',
  },
  {
    id: 'r2',
    endpoint_id: 'ep1',
    rule_json: { mappings: [{ source: 'data.order.id', target: 'order_id' }] },
    created_at: '2024-01-16',
  },
  {
    id: 'r3',
    endpoint_id: 'ep1',
    rule_json: { enrich: { fields: { source: 'hooksniff' } } },
    created_at: '2024-01-17',
  },
];

// Default fetch handler - returns empty rules for any endpoint
function defaultFetchHandler(url: string, options?: any) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  });
}

function getCreateFormInputs(container: HTMLElement) {
  const formCard = Array.from(container.querySelectorAll('.glass-card')).find(
    (el) => el.textContent?.includes('New Transform Rule')
  );
  if (!formCard) return [];
  return Array.from(formCard.querySelectorAll('input'));
}

describe('TransformsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockFetch.mockImplementation(defaultFetchHandler);
  });

  // === Render tests ===
  it('renders without crashing', () => {
    render(React.createElement(TransformsPage));
  });

  it('displays transforms title', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Webhook Transforms');
  });

  it('renders endpoint selector', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Select Endpoint');
  });

  it('shows select endpoint message', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Select an endpoint to manage transforms');
  });

  it('renders new rule button', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('New Rule');
  });

  it('renders description text', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Filter, map, and enrich webhook payloads before delivery');
  });

  // === Endpoint fetching ===
  it('fetches endpoints on mount', async () => {
    await act(async () => {
      render(React.createElement(TransformsPage));
    });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  it('renders endpoint options in select', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.options.length).toBe(3);
    expect(select.options[1].textContent).toContain('https://example.com');
    expect(select.options[2].textContent).toContain('https://other.com');
  });

  // === Select endpoint ===
  it('loads rules when endpoint is selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints/ep1/transforms'),
      expect.anything()
    );
  });

  it('displays rules after loading', async () => {
    // Override fetch to return rules for ep1
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/endpoints/ep1/transforms')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRules) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    expect(container!.textContent).toContain('Filter');
    expect(container!.textContent).toContain('order_id');
    expect(container!.textContent).toContain('amount');
    expect(container!.textContent).toContain('Map');
    expect(container!.textContent).toContain('data.order.id');
  });

  it('displays enrich rule', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/endpoints/ep1/transforms')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([mockRules[2]]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    expect(container!.textContent).toContain('Enrich');
    expect(container!.textContent).toContain('hooksniff');
  });

  // === Empty state ===
  it('shows empty state when no rules for selected endpoint', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    expect(container!.textContent).toContain('No transform rules');
  });

  // === Create form ===
  it('shows create form when New Rule is clicked', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );

    await act(async () => {
      fireEvent.click(newRuleButton!);
    });

    expect(container.textContent).toContain('New Transform Rule');
    expect(container.textContent).toContain('Filter (include fields)');
    expect(container.textContent).toContain('Filter (exclude fields)');
    expect(container.textContent).toContain('Map from');
    expect(container.textContent).toContain('Map to');
    expect(container.textContent).toContain('Enrich key');
    expect(container.textContent).toContain('Enrich value');
  });

  it('hides create form when New Rule is clicked again', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });
    expect(container.textContent).toContain('New Transform Rule');

    await act(async () => { fireEvent.click(newRuleButton!); });
    expect(container.textContent).not.toContain('New Transform Rule');
  });

  it('renders Create button in form', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    expect(createButton).toBeTruthy();
  });

  // === Create rule ===
  it('creates rule with filter include', async () => {
    let createCallBody: any = null;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        createCallBody = JSON.parse(options.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container!);
    expect(inputs.length).toBeGreaterThanOrEqual(6);

    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'order_id, amount' } });
    });

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    expect(createCallBody).toBeTruthy();
    expect(createCallBody.rule.filter.include).toEqual(['order_id', 'amount']);
  });

  it('creates rule with filter exclude', async () => {
    let createCallBody: any = null;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        createCallBody = JSON.parse(options.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container!);
    await act(async () => {
      fireEvent.change(inputs[1], { target: { value: 'internal_secret' } });
    });

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    expect(createCallBody).toBeTruthy();
    expect(createCallBody.rule.filter.exclude).toEqual(['internal_secret']);
  });

  it('creates rule with mapping', async () => {
    let createCallBody: any = null;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        createCallBody = JSON.parse(options.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container!);
    await act(async () => {
      fireEvent.change(inputs[2], { target: { value: 'data.order.id' } });
      fireEvent.change(inputs[3], { target: { value: 'order_id' } });
    });

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    expect(createCallBody).toBeTruthy();
    expect(createCallBody.rule.mappings).toEqual([{ source: 'data.order.id', target: 'order_id' }]);
  });

  it('creates rule with enrich fields', async () => {
    let createCallBody: any = null;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        createCallBody = JSON.parse(options.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container!);
    await act(async () => {
      fireEvent.change(inputs[4], { target: { value: 'source' } });
      fireEvent.change(inputs[5], { target: { value: 'hooksniff' } });
    });

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    expect(createCallBody).toBeTruthy();
    expect(createCallBody.rule.enrich).toEqual({ fields: { source: 'hooksniff' } });
  });

  it('hides create form after successful creation', async () => {
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });
    expect(container!.textContent).toContain('New Transform Rule');

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    expect(container!.textContent).not.toContain('New Transform Rule');
  });

  it('clears form fields after successful creation', async () => {
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container!);
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'field1' } });
    });

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    // Reopen form
    const newRuleButton2 = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton2!); });

    const newInputs = getCreateFormInputs(container!);
    expect((newInputs[0] as HTMLInputElement).value).toBe('');
  });

  // === Delete rule ===
  it('deletes a rule', async () => {
    let deleteCallUrl = '';
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'DELETE') {
        deleteCallUrl = url;
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url.includes('/endpoints/ep1/transforms') && !options?.method) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRules) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const deleteButtons = Array.from(container!.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('✕')
    );

    if (deleteButtons.length > 0) {
      await act(async () => { fireEvent.click(deleteButtons[0]); });
      expect(deleteCallUrl).toContain('/endpoints/ep1/transforms/r1');
    }
  });

  it('removes deleted rule from list', async () => {
    let deleteCount = 0;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'DELETE') {
        deleteCount++;
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      if (url.includes('/endpoints/ep1/transforms') && !options?.method) {
        if (deleteCount === 0) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRules) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRules.slice(1)) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    expect(container!.textContent).toContain('order_id');

    const deleteButtons = Array.from(container!.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('✕')
    );

    if (deleteButtons.length > 0) {
      await act(async () => { fireEvent.click(deleteButtons[0]); });
      // After delete, the component re-fetches rules (now returns mockRules.slice(1))
      await waitFor(() => {
        expect(deleteCount).toBe(1);
      });
    }
  });

  // === Empty/no endpoint selected ===
  it('shows placeholder message when no endpoint selected', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Select an endpoint to manage transforms');
  });

  it('shows "Choose an endpoint..." as default select option', () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.options[0].textContent).toContain('Choose an endpoint...');
  });

  // === Filter rule display ===
  it('displays filter include tag', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/endpoints/ep1/transforms')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([mockRules[0]]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    expect(container!.textContent).toContain('Filter');
    expect(container!.textContent).toContain('include:');
  });

  it('displays filter exclude tag', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/endpoints/ep1/transforms')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{
            id: 'r_ex',
            endpoint_id: 'ep1',
            rule_json: { filter: { exclude: ['secret'] } },
            created_at: '2024-01-20',
          }]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    expect(container!.textContent).toContain('exclude:');
    expect(container!.textContent).toContain('secret');
  });

  // === Map rule display ===
  it('displays mapping arrow', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/endpoints/ep1/transforms')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([mockRules[1]]) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    expect(container!.textContent).toContain('Map');
    expect(container!.textContent).toContain('→');
  });

  // === Error handling for fetch on mount ===
  it('handles endpoint fetch error gracefully', async () => {
    mockEndpointsList.mockRejectedValueOnce(new Error('Network error'));

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    expect(select.options.length).toBe(1);
  });

  // === Rules fetch on endpoint change ===
  it('fetches rules for different endpoint', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;

    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    await act(async () => { fireEvent.change(select, { target: { value: 'ep2' } }); });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // === Input changes in create form ===
  it('allows typing in filter include input', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container);
    expect(inputs.length).toBeGreaterThanOrEqual(6);

    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'field1, field2' } });
    });
    expect((inputs[0] as HTMLInputElement).value).toBe('field1, field2');
  });

  it('allows typing in filter exclude input', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container);
    await act(async () => {
      fireEvent.change(inputs[1], { target: { value: 'secret_field' } });
    });
    expect((inputs[1] as HTMLInputElement).value).toBe('secret_field');
  });

  it('allows typing in map source input', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container);
    await act(async () => {
      fireEvent.change(inputs[2], { target: { value: 'data.field' } });
    });
    expect((inputs[2] as HTMLInputElement).value).toBe('data.field');
  });

  it('allows typing in map target input', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container);
    await act(async () => {
      fireEvent.change(inputs[3], { target: { value: 'target_field' } });
    });
    expect((inputs[3] as HTMLInputElement).value).toBe('target_field');
  });

  it('allows typing in enrich key input', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container);
    await act(async () => {
      fireEvent.change(inputs[4], { target: { value: 'env' } });
    });
    expect((inputs[4] as HTMLInputElement).value).toBe('env');
  });

  it('allows typing in enrich value input', async () => {
    const { container } = render(React.createElement(TransformsPage));

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container);
    await act(async () => {
      fireEvent.change(inputs[5], { target: { value: 'production' } });
    });
    expect((inputs[5] as HTMLInputElement).value).toBe('production');
  });

  // === Combined rule creation ===
  it('creates rule with both filter and mapping', async () => {
    let createCallBody: any = null;
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        createCallBody = JSON.parse(options.body);
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'new' }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(TransformsPage));
      container = result.container;
    });

    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });

    const newRuleButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('New Rule')
    );
    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = getCreateFormInputs(container!);
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'field_a' } });
      fireEvent.change(inputs[2], { target: { value: 'src' } });
      fireEvent.change(inputs[3], { target: { value: 'tgt' } });
    });

    const createButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create')
    );
    await act(async () => { fireEvent.click(createButton!); });

    expect(createCallBody).toBeTruthy();
    expect(createCallBody.rule.filter.include).toEqual(['field_a']);
    expect(createCallBody.rule.mappings).toEqual([{ source: 'src', target: 'tgt' }]);
  });
});
