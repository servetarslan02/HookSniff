// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor, cleanup } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const mockMutate = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
  },
  endpointsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'ep_abc123', url: 'https://example.com/hook', description: 'Test Endpoint', is_active: true, created_at: '2026-01-01' },
      { id: 'ep_def456', url: 'https://other.com/hook', description: null, is_active: true, created_at: '2026-01-01' },
    ]),
    get: vi.fn().mockResolvedValue({}),
  },
  portalApi: {
    get: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      { id: 'ep_abc123', url: 'https://example.com/hook', description: 'Test Endpoint', is_active: true, created_at: '2026-01-01' },
      { id: 'ep_def456', url: 'https://other.com/hook', description: null, is_active: true, created_at: '2026-01-01' },
    ],
    isLoading: false,
  }),
  useMutation: () => ({ mutate: mockMutate, isPending: false }),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

import WebhookBuilderPage from '@/app/[locale]/(dashboard)/webhook-builder/page';

describe('WebhookBuilderPage', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the page header', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.title/)).toBeTruthy();
  });

  it('shows description text', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.subtitle/)).toBeTruthy();
  });

  it('renders template buttons', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText('order.created')).toBeTruthy();
    expect(getByText('payment.completed')).toBeTruthy();
    expect(getByText('user.created')).toBeTruthy();
  });

  it('renders event type input with default value', () => {
    const { getByDisplayValue } = render(<WebhookBuilderPage />);
    expect(getByDisplayValue('order.created')).toBeTruthy();
  });

  it('renders payload fields section', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.payloadFields/)).toBeTruthy();
  });

  it('renders default template fields for order.created', () => {
    const { getByDisplayValue } = render(<WebhookBuilderPage />);
    expect(getByDisplayValue('order_id')).toBeTruthy();
    expect(getByDisplayValue('ord_123')).toBeTruthy();
    expect(getByDisplayValue('total')).toBeTruthy();
    expect(getByDisplayValue('currency')).toBeTruthy();
  });

  it('renders add field button', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.addField/)).toBeTruthy();
  });

  it('adds a new field when clicking add field', () => {
    const { getByText, getAllByPlaceholderText } = render(<WebhookBuilderPage />);
    const initialCount = getAllByPlaceholderText('field_name').length;
    fireEvent.click(getByText(/webhookBuilder\.addField/));
    expect(getAllByPlaceholderText('field_name').length).toBe(initialCount + 1);
  });

  it('removes a field when clicking remove button', () => {
    const { getAllByText, getAllByPlaceholderText } = render(<WebhookBuilderPage />);
    const initialCount = getAllByPlaceholderText('field_name').length;
    const removeButtons = getAllByText('✕');
    fireEvent.click(removeButtons[0]);
    expect(getAllByPlaceholderText('field_name').length).toBe(initialCount - 1);
  });

  it('loads payment.completed template when clicked', () => {
    const { getByText, getByDisplayValue } = render(<WebhookBuilderPage />);
    fireEvent.click(getByText('payment.completed'));
    expect(getByDisplayValue('payment_id')).toBeTruthy();
    expect(getByDisplayValue('pay_xyz')).toBeTruthy();
  });

  it('loads user.created template when clicked', () => {
    const { getByText, getByDisplayValue } = render(<WebhookBuilderPage />);
    fireEvent.click(getByText('user.created'));
    expect(getByDisplayValue('user_id')).toBeTruthy();
    expect(getByDisplayValue('usr_456')).toBeTruthy();
  });

  it('renders endpoint select dropdown', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.selectEndpoint/)).toBeTruthy();
  });

  it('renders send webhook button', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.sendWebhook/)).toBeTruthy();
  });

  it('send button is disabled when no endpoint is selected', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    const btn = getByText(/webhookBuilder\.sendWebhook/).closest('button');
    expect(btn?.disabled).toBe(true);
  });

  it('renders preview section', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.preview/)).toBeTruthy();
  });

  it('auto-updates preview on load', () => {
    const { container } = render(<WebhookBuilderPage />);
    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre!.textContent).toContain('order.created');
    expect(pre!.textContent).toContain('order_id');
  });

  it('auto-updates preview when fields change', () => {
    const { getByDisplayValue, container } = render(<WebhookBuilderPage />);
    const keyInput = getByDisplayValue('order_id');
    fireEvent.change(keyInput, { target: { value: 'new_key' } });
    const pre = container.querySelector('pre');
    expect(pre!.textContent).toContain('new_key');
  });

  it('allows editing event type', () => {
    const { getByDisplayValue } = render(<WebhookBuilderPage />);
    const input = getByDisplayValue('order.created');
    fireEvent.change(input, { target: { value: 'custom.event' } });
    expect(input.value).toBe('custom.event');
  });

  it('allows editing field values', () => {
    const { getByDisplayValue } = render(<WebhookBuilderPage />);
    const keyInput = getByDisplayValue('order_id');
    fireEvent.change(keyInput, { target: { value: 'new_key' } });
    expect(keyInput.value).toBe('new_key');
  });

  it('renders field type selectors', () => {
    const { getAllByText } = render(<WebhookBuilderPage />);
    // i18n key: webhookBuilder.typeStr
    expect(getAllByText(/webhookBuilder\.typeStr/).length).toBeGreaterThan(0);
  });

  it('renders clear all button', () => {
    const { getByText } = render(<WebhookBuilderPage />);
    expect(getByText(/webhookBuilder\.clearAll/)).toBeTruthy();
  });

  it('renders keyboard shortcut hint', () => {
    const { getAllByText } = render(<WebhookBuilderPage />);
    expect(getAllByText(/Ctrl/).length).toBeGreaterThan(0);
  });
});
