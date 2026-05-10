// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockEndpointsList = vi.fn();
const mockTransformsList = vi.fn();
const mockTransformsCreate = vi.fn();
const mockTransformsDelete = vi.fn();

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

const mockEndpoints = [
  { id: 'ep1', url: 'https://example.com/webhook', is_active: true, created_at: '2024-01-01' },
  { id: 'ep2', url: 'https://other.com/hook', is_active: true, created_at: '2024-02-01' },
];

const mockRules = [
  { id: 'r1', endpoint_id: 'ep1', rule_json: { filter: { include: ['order_id', 'amount'] } }, created_at: '2024-01-15' },
  { id: 'r2', endpoint_id: 'ep1', rule_json: { mappings: [{ source: 'data.order.id', target: 'order_id' }] }, created_at: '2024-01-16' },
  { id: 'r3', endpoint_id: 'ep1', rule_json: { enrich: { fields: { source: 'hooksniff' } } }, created_at: '2024-01-17' },
];

describe('TransformsPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockTransformsList.mockResolvedValue(mockRules);
    mockTransformsCreate.mockResolvedValue({});
    mockTransformsDelete.mockResolvedValue({});
  });

  // === Render ===
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
    expect(container.textContent).toContain('+ New Rule');
  });

  // === Endpoint selector ===
  it('renders endpoint selector', () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('shows placeholder when no endpoint selected', () => {
    const { container } = render(React.createElement(TransformsPage));
    expect(container.textContent).toContain('Select an endpoint to manage transforms');
  });

  it('populates endpoint options', async () => {
    const { container } = render(React.createElement(TransformsPage));
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);
      expect(options).toContain('ep1');
      expect(options).toContain('ep2');
    });
  });

  it('loads rules when endpoint is selected', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(mockTransformsList).toHaveBeenCalledWith('test-token', 'ep1');
    });
  });

  // === Rules list ===
  it('renders rules after selecting endpoint', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Filter');
      expect(container.textContent).toContain('Map');
      expect(container.textContent).toContain('Enrich');
    });
  });

  it('renders filter rule with include fields', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('order_id, amount');
    });
  });

  it('renders map rule with source → target', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('data.order.id');
      expect(container.textContent).toContain('→');
    });
  });

  it('renders enrich rule with fields', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('hooksniff');
    });
  });

  // === Empty state ===
  it('shows empty state when no rules', async () => {
    mockTransformsList.mockResolvedValue([]);
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('No transform rules');
    });
  });

  // === Create form ===
  it('shows create form on button click', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => {
      fireEvent.click(newRuleButton!);
    });

    expect(container.textContent).toContain('New Transform Rule');
  });

  it('hides create form on second click', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });
    expect(container.textContent).toContain('New Transform Rule');

    await act(async () => { fireEvent.click(newRuleButton!); });
    expect(container.textContent).not.toContain('New Transform Rule');
  });

  it('renders filter include input', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    expect(container.textContent).toContain('Filter (include fields)');
  });

  it('renders filter exclude input', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    expect(container.textContent).toContain('Filter (exclude fields)');
  });

  it('renders map source and target inputs', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    expect(container.textContent).toContain('Map from');
    expect(container.textContent).toContain('Map to');
  });

  it('renders enrich key and value inputs', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    expect(container.textContent).toContain('Enrich key');
    expect(container.textContent).toContain('Enrich value');
  });

  // === Create rule with filter ===
  it('creates rule with filter include', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = container.querySelectorAll('input');
    // First input is filter include
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'order_id, amount, status' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create') && !b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(createButton!); });

    await waitFor(() => {
      expect(mockTransformsCreate).toHaveBeenCalledWith(
        'test-token',
        'ep1',
        expect.objectContaining({
          rule: expect.objectContaining({
            filter: { include: ['order_id', 'amount', 'status'] },
          }),
        })
      );
    });
  });

  // === Create rule with mapping ===
  it('creates rule with field mapping', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = container.querySelectorAll('input');
    // inputs[2] = map source, inputs[3] = map target
    await act(async () => {
      fireEvent.change(inputs[2], { target: { value: 'data.user.name' } });
      fireEvent.change(inputs[3], { target: { value: 'user_name' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create') && !b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(createButton!); });

    await waitFor(() => {
      expect(mockTransformsCreate).toHaveBeenCalledWith(
        'test-token',
        'ep1',
        expect.objectContaining({
          rule: expect.objectContaining({
            mappings: [{ source: 'data.user.name', target: 'user_name' }],
          }),
        })
      );
    });
  });

  // === Create rule with enrichment ===
  it('creates rule with enrichment', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = container.querySelectorAll('input');
    // inputs[4] = enrich key, inputs[5] = enrich value
    await act(async () => {
      fireEvent.change(inputs[4], { target: { value: 'source' } });
      fireEvent.change(inputs[5], { target: { value: 'myapp' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create') && !b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(createButton!); });

    await waitFor(() => {
      expect(mockTransformsCreate).toHaveBeenCalledWith(
        'test-token',
        'ep1',
        expect.objectContaining({
          rule: expect.objectContaining({
            enrich: { fields: { source: 'myapp' } },
          }),
        })
      );
    });
  });

  // === Toast on create success ===
  it('shows success toast after creating rule', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create') && !b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(createButton!); });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Transform rule created!', 'success');
    });
  });

  // === Toast on create failure ===
  it('shows error toast on create failure', async () => {
    mockTransformsCreate.mockRejectedValue(new Error('Create failed'));
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create') && !b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(createButton!); });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to create rule', 'error');
    });
  });

  // === Delete rule ===
  it('deletes rule on delete click', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Filter');
    });

    const deleteButtons = container.querySelectorAll('[aria-label="Delete transform"]');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockTransformsDelete).toHaveBeenCalledWith('test-token', 'ep1', 'r1');
  });

  it('shows toast after successful delete', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Filter');
    });

    const deleteButtons = container.querySelectorAll('[aria-label="Delete transform"]');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Rule deleted', 'info');
    });
  });

  it('shows error toast on delete failure', async () => {
    mockTransformsDelete.mockRejectedValue(new Error('Delete failed'));
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Filter');
    });

    const deleteButtons = container.querySelectorAll('[aria-label="Delete transform"]');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to delete', 'error');
    });
  });

  // === Loading state ===
  it('shows loading state while fetching rules', async () => {
    mockTransformsList.mockReturnValue(new Promise(() => {})); // Never resolves
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    // Should show loading skeleton
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === Form resets after create ===
  it('resets form after successful create', async () => {
    const { container } = render(React.createElement(TransformsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });

    const newRuleButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(newRuleButton!); });

    const inputs = container.querySelectorAll('input');
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: 'test_field' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Create') && !b.textContent?.includes('+ New Rule')
    );

    await act(async () => { fireEvent.click(createButton!); });

    await waitFor(() => {
      // Create form should be hidden after successful creation
      expect(container.textContent).not.toContain('New Transform Rule');
    });
  });
});
