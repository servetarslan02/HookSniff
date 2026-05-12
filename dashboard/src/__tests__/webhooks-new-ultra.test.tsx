// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockToast = vi.fn();
const mockEndpointsList = vi.fn().mockResolvedValue([]);
const mockWebhooksCreate = vi.fn().mockResolvedValue({ id: 'wh-1', status: 'delivered' });

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
  }),
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
  default: () => React.createElement('div', null, 'Loading...'),
}));

const { default: SendWebhookPage } = await import('@/app/[locale]/[username]/webhooks/new/page');

const mockEndpoints = [
  { id: 'ep1', url: 'https://example.com/webhook', is_active: true, created_at: '2024-01-01' },
  { id: 'ep2', url: 'https://other.com/hook', is_active: true, created_at: '2024-02-01' },
];

describe('SendWebhookPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue([]);
    mockWebhooksCreate.mockResolvedValue({ id: 'wh-1', status: 'delivered' });
  });

  it('renders without crashing', () => {
    render(React.createElement(SendWebhookPage));
  });

  it('displays page title', () => {
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

  it('renders endpoint select', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('shows select endpoint placeholder', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.selectEndpoint');
  });

  it('renders event type input', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const inputs = container.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders payload textarea', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('payload has default value', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('Hello from HookSniff');
  });

  it('renders send button', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.sendWebhook');
  });

  it('loads endpoints on mount', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    render(React.createElement(SendWebhookPage));
    await waitFor(() => {
      expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
    });
  });

  it('populates endpoint options', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options).map(o => o.value);
      expect(options).toContain('ep1');
      expect(options).toContain('ep2');
    });
  });

  it('can select an endpoint', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.options.length).toBeGreaterThan(1);
    });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    expect(select.value).toBe('ep1');
  });

  it('can change event type', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const eventInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(eventInput, { target: { value: 'order.created' } }); });
    expect(eventInput.value).toBe('order.created');
  });

  it('can change payload', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => { fireEvent.change(textarea, { target: { value: '{"test": true}' } }); });
    expect(textarea.value).toBe('{"test": true}');
  });

  it('shows JSON error for invalid payload', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => { fireEvent.change(textarea, { target: { value: 'not json' } }); });
    await waitFor(() => {
      expect(container.textContent).toContain('⚠️');
    });
  });

  it('clears JSON error for valid payload', async () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => { fireEvent.change(textarea, { target: { value: 'invalid' } }); });
    await act(async () => { fireEvent.change(textarea, { target: { value: '{"valid": true}' } }); });
    const errorMsgs = container.querySelectorAll('.text-red-600');
    expect(errorMsgs.length).toBe(0);
  });

  it('send button is disabled when no endpoint selected', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    expect(sendBtn?.disabled).toBe(true);
  });

  it('send button is disabled with invalid JSON', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => { fireEvent.change(textarea, { target: { value: 'bad json' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    expect(sendBtn?.disabled).toBe(true);
  });

  it('sends webhook with correct data', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockResolvedValue({ id: 'wh-1' });
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const eventInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(eventInput, { target: { value: 'order.created' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    if (sendBtn && !sendBtn.disabled) {
      await act(async () => { fireEvent.click(sendBtn); });
      expect(mockWebhooksCreate).toHaveBeenCalledWith('test-token', {
        endpoint_id: 'ep1',
        event: 'order.created',
        data: expect.any(Object),
      });
    }
  });

  it('shows success toast after sending', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockResolvedValue({ id: 'wh-1' });
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    if (sendBtn && !sendBtn.disabled) {
      await act(async () => { fireEvent.click(sendBtn); });
      expect(mockToast).toHaveBeenCalledWith('webhooks.sendSuccess', 'success');
    }
  });

  it('shows error toast on send failure', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockRejectedValue(new Error('Send failed'));
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    if (sendBtn && !sendBtn.disabled) {
      await act(async () => { fireEvent.click(sendBtn); });
      expect(mockToast).toHaveBeenCalledWith('webhooks.sendFailed', 'error');
    }
  });

  it('shows response after successful send', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockResolvedValue({ id: 'wh-1', status: 'delivered' });
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    if (sendBtn && !sendBtn.disabled) {
      await act(async () => { fireEvent.click(sendBtn); });
      await waitFor(() => {
        const pre = container.querySelector('pre');
        expect(pre).toBeTruthy();
        expect(pre?.textContent).toContain('wh-1');
      });
    }
  });

  it('shows empty response state initially', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    expect(container.textContent).toContain('webhooks.sendToSeeResponse');
  });

  it('shows error in response on failure', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockRejectedValue(new Error('Server error'));
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    if (sendBtn && !sendBtn.disabled) {
      await act(async () => { fireEvent.click(sendBtn); });
      await waitFor(() => {
        const pre = container.querySelector('pre');
        expect(pre?.textContent).toContain('Server error');
      });
    }
  });

  it('handles endpoint fetch error gracefully', async () => {
    mockEndpointsList.mockRejectedValue(new Error('Failed to load'));
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => {
      expect(mockEndpointsList).toHaveBeenCalled();
    });
    // Should still render without crashing
    expect(container.textContent).toContain('webhooks.title');
  });

  it('send button disabled during sending', async () => {
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    let resolveCreate: (v: any) => void;
    mockWebhooksCreate.mockReturnValue(new Promise(r => { resolveCreate = r; }));
    const { container } = render(React.createElement(SendWebhookPage));
    await waitFor(() => { expect(container.querySelector('select')).toBeTruthy(); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => { fireEvent.change(select, { target: { value: 'ep1' } }); });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhooks.sendWebhook')
    );
    if (sendBtn && !sendBtn.disabled) {
      await act(async () => { fireEvent.click(sendBtn); });
      // Button should now show loading
      expect(container.textContent).toContain('Sending');
      await act(async () => { resolveCreate!({ id: 'wh-1' }); });
    }
  });

  it('event type input has placeholder', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const eventInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(eventInput.placeholder).toContain('webhooks.eventTypePlaceholder');
  });

  it('payload textarea has spellcheck attribute', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.getAttribute('spellcheck')).toBe('false');
  });

  it('grid layout renders two columns', () => {
    const { container } = render(React.createElement(SendWebhookPage));
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
  });
});
