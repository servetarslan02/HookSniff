// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockEndpointsList = vi.fn();
const mockWebhooksCreate = vi.fn();

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
  webhooksApi: {
    create: (...args: any[]) => mockWebhooksCreate(...args),
  },
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: SendWebhookPage } = await import('@/app/[locale]/dashboard/webhooks/new/page');

const mockEndpoints = [
  { id: 'ep1', url: 'https://example.com/webhook', is_active: true, created_at: '2024-01-01' },
  { id: 'ep2', url: 'https://other.com/hook', is_active: true, created_at: '2024-02-01' },
];

/** Helper: render page, wait for endpoints to load, select ep1 */
async function renderWithEndpoint() {
  const result = render(React.createElement(SendWebhookPage));
  const { container } = result;
  // Wait for endpoint options to load
  await waitFor(() => {
    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('ep1');
  });
  const select = container.querySelector('select') as HTMLSelectElement;
  await act(async () => {
    fireEvent.change(select, { target: { value: 'ep1' } });
  });
  return result;
}

describe('SendWebhookPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockResolvedValue({ id: 'wh_123', status: 'delivered' });
  });

  it('renders without crashing', () => {
    render(React.createElement(SendWebhookPage));
  });

  it('displays title', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.title');
  });

  it('renders configuration section', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.configuration');
  });

  it('renders response section', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.responseTitle');
  });

  it('renders endpoint selector', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('populates endpoint options', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.value);
      expect(options).toContain('ep1');
      expect(options).toContain('ep2');
    });
  });

  it('shows placeholder option', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.selectEndpoint');
  });

  it('renders event type input', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('Event Type');
  });

  it('renders payload textarea', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('has default payload', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('Hello from HookSniff');
  });

  it('allows editing payload', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '{"key": "value"}' } });
    });
    expect(textarea.value).toBe('{"key": "value"}');
  });

  it('shows error for invalid JSON', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'not json' } });
    });
    await waitFor(() => {
      expect(container.textContent).toContain('⚠️');
    });
  });

  it('clears error for valid JSON', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'invalid' } });
    });
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '{"valid": true}' } });
    });
    expect(container.textContent).not.toContain('⚠️');
  });

  it('renders send button', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.sendWebhook');
  });

  it('disables send when no endpoint selected', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    expect(sendButton!.disabled).toBe(true);
  });

  it('enables send when endpoint is selected', async () => {
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    expect(sendButton!.disabled).toBe(false);
  });

  it('sends webhook on button click', async () => {
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    expect(mockWebhooksCreate).toHaveBeenCalledWith('test-token', {
      endpoint_id: 'ep1',
      event: undefined,
      data: { message: 'Hello from HookSniff!' },
    });
  });

  it('sends webhook with event type', async () => {
    const { container } = await renderWithEndpoint();
    const eventTypeInput = container.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(eventTypeInput, { target: { value: 'order.created' } });
    });
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    expect(mockWebhooksCreate).toHaveBeenCalledWith('test-token', {
      endpoint_id: 'ep1',
      event: 'order.created',
      data: { message: 'Hello from HookSniff!' },
    });
  });

  it('shows response after sending', async () => {
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    await waitFor(() => {
      const pre = container.querySelector('pre');
      expect(pre).toBeTruthy();
      expect(pre!.textContent).toContain('wh_123');
    });
  });

  it('shows success toast after sending', async () => {
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('webhooks.sendSuccess', 'success');
    });
  });

  it('shows error toast on send failure', async () => {
    mockWebhooksCreate.mockRejectedValue(new Error('Send failed'));
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('webhooks.sendFailed', 'error');
    });
  });

  it('shows error response in response area', async () => {
    mockWebhooksCreate.mockRejectedValue(new Error('Connection refused'));
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    await waitFor(() => {
      const pre = container.querySelector('pre');
      expect(pre).toBeTruthy();
      expect(pre!.textContent).toContain('Connection refused');
    });
  });

  it('shows empty response state initially', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.sendToSeeResponse');
  });

  it('blocks send when JSON is invalid', async () => {
    const { container } = await renderWithEndpoint();
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'not json' } });
    });
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    expect(sendButton!.disabled).toBe(true);
  });

  it('shows loading spinner during send', async () => {
    let resolveCreate: (v: any) => void;
    mockWebhooksCreate.mockReturnValueOnce(new Promise((r) => { resolveCreate = r; }));
    const { container } = await renderWithEndpoint();
    const sendButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('webhooks.sendWebhook')
    );
    await act(async () => { fireEvent.click(sendButton!); });
    expect(container.querySelector('[data-testid="spinner"]')).toBeTruthy();
    await act(async () => { resolveCreate!({ id: 'wh_done', status: 'delivered' }); });
  });

  it('renders payload label', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('Payload (JSON)');
  });
});
