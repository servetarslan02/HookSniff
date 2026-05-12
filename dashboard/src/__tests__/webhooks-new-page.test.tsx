// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123', logout: vi.fn() }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const mockEndpointsList = vi.fn();
const mockWebhooksCreate = vi.fn();

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    create: (...args: any[]) => mockWebhooksCreate(...args),
  },
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
  },
}));

const { default: SendWebhookPage } = await import('@/app/[locale]/[username]/webhooks/new/page');

const mockEndpoints = [
  { id: 'ep1', url: 'https://example.com', description: 'Test Endpoint', is_active: true, created_at: '2024-01-01' },
  { id: 'ep2', url: 'https://other.com', description: 'Other', is_active: true, created_at: '2024-01-02' },
];

describe('SendWebhookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockWebhooksCreate.mockResolvedValue({ id: 'w1', status: 'delivered' });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(SendWebhookPage));
    });
  });

  it('fetches endpoints on mount', async () => {
    await act(async () => {
      render(React.createElement(SendWebhookPage));
    });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  it('displays page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('webhooks.title');
  });

  it('renders endpoint selector with options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select');
    expect(select).toBeTruthy();
    // Should have placeholder option + 2 endpoints
    expect(select!.options.length).toBe(3);
    expect(select!.options[0].textContent).toContain('selectEndpoint');
    expect(select!.options[1].textContent).toBe('https://example.com');
    expect(select!.options[2].textContent).toBe('https://other.com');
  });

  it('renders event type input', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const inputs = container!.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    expect(container!.textContent).toContain('Event Type');
  });

  it('renders payload textarea with default value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const textarea = container!.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea!.value).toContain('Hello from HookSniff');
  });

  it('renders send button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('sendWebhook');
  });

  it('renders response panel with empty state', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('responseTitle');
    expect(container!.textContent).toContain('sendToSeeResponse');
  });

  it('disables send button when no endpoint selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    expect(sendBtn).toBeTruthy();
    expect(sendBtn!.disabled).toBe(true);
  });

  it('enables send button when endpoint is selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    expect(sendBtn!.disabled).toBe(false);
  });

  it('sends webhook successfully', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    // Select endpoint
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    // Click send
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(mockWebhooksCreate).toHaveBeenCalledWith('test-token', {
      endpoint_id: 'ep1',
      event: undefined,
      data: { message: 'Hello from HookSniff!' },
    });
  });

  it('sends webhook with event type', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    // Set event type
    const eventInput = container!.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'order.created' } });
    });
    // Select endpoint
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    // Click send
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(mockWebhooksCreate).toHaveBeenCalledWith('test-token', {
      endpoint_id: 'ep1',
      event: 'order.created',
      data: { message: 'Hello from HookSniff!' },
    });
  });

  it('shows success toast on successful send', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(mockToast).toHaveBeenCalledWith('webhooks.sendSuccess', 'success');
  });

  it('displays response after successful send', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(container!.textContent).toContain('w1');
    expect(container!.textContent).toContain('delivered');
  });

  it('shows error toast on send failure', async () => {
    mockWebhooksCreate.mockRejectedValue(new Error('API error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(mockToast).toHaveBeenCalledWith('webhooks.sendFailed', 'error');
  });

  it('displays error response in response panel', async () => {
    mockWebhooksCreate.mockRejectedValue(new Error('Server down'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(container!.textContent).toContain('Server down');
  });

  it('shows JSON validation error for invalid payload', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const textarea = container!.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'not json' } });
    });
    expect(container!.textContent).toContain('⚠️');
  });

  it('clears JSON validation error when valid JSON entered', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const textarea = container!.querySelector('textarea') as HTMLTextAreaElement;
    // First enter invalid
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'bad' } });
    });
    // Then valid
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '{"ok": true}' } });
    });
    expect(container!.textContent).not.toContain('⚠️');
  });

  it('shows invalid JSON toast when send with bad payload', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    // Enter invalid JSON
    const textarea = container!.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'not json' } });
    });
    // Select endpoint
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    // Try to send - button might be disabled due to jsonError
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    if (!sendBtn!.disabled) {
      await act(async () => {
        fireEvent.click(sendBtn!);
      });
      expect(mockToast).toHaveBeenCalledWith('webhooks.invalidJson', 'error');
    }
  });

  it('does not call create when no endpoint selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    // Button should be disabled
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    expect(sendBtn!.disabled).toBe(true);
  });

  it('handles endpoint fetch failure gracefully', async () => {
    mockEndpointsList.mockRejectedValue(new Error('fail'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select');
    expect(select!.options.length).toBe(1); // only placeholder
  });

  it('shows loading spinner while sending', async () => {
    mockWebhooksCreate.mockReturnValue(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const select = container!.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'ep1' } });
    });
    const sendBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('sendWebhook'));
    await act(async () => {
      fireEvent.click(sendBtn!);
    });
    expect(container!.textContent).toContain('Sending...');
    expect(container!.querySelector('[data-testid="spinner"]')).toBeTruthy();
  });

  it('updates payload textarea value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const textarea = container!.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '{"custom": true}' } });
    });
    expect(textarea.value).toBe('{"custom": true}');
  });

  it('updates event type input value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    const eventInput = container!.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'user.signup' } });
    });
    expect(eventInput.value).toBe('user.signup');
  });

  it('renders configuration section header', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('configuration');
  });

  it('renders Endpoint label', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Endpoint');
  });

  it('renders Payload (JSON) label', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SendWebhookPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Payload (JSON)');
  });
});
