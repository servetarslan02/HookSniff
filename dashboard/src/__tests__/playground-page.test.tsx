// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

// Mock performance.now
let perfCounter = 0;
vi.spyOn(performance, 'now').mockImplementation(() => (perfCounter += 100));

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

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

const { default: PlaygroundPage } = await import('@/app/[locale]/dashboard/playground/page');

describe('PlaygroundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    perfCounter = 0;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Map([['content-type', 'application/json']]),
    });
  });

  it('renders without crashing', () => {
    render(React.createElement(PlaygroundPage));
  });

  it('displays playground title', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.title');
  });

  it('renders request section', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.request');
  });

  it('renders response inspector', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.responseInspector');
  });

  it('renders cURL command section', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.curlCommand');
  });

  it('renders AI payload generator', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('AI Payload Generator');
  });

  it('renders quick presets', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.quickPresets');
  });

  it('renders send request button', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.sendRequest');
  });

  it('renders method selector with all methods', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
    const options = select!.querySelectorAll('option');
    const methodTexts = Array.from(options).map(o => o.textContent);
    expect(methodTexts).toContain('GET');
    expect(methodTexts).toContain('POST');
    expect(methodTexts).toContain('PUT');
    expect(methodTexts).toContain('DELETE');
    expect(methodTexts).toContain('PATCH');
  });

  it('changes method selector', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'GET' } });
    expect(select.value).toBe('GET');
  });

  it('changes path input', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const pathInput = container.querySelector('input[type="text"]')! as HTMLInputElement;
    fireEvent.change(pathInput, { target: { value: '/v1/custom' } });
    expect(pathInput.value).toBe('/v1/custom');
  });

  it('shows body textarea for non-GET methods', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('hides body textarea when method is GET', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'GET' } });
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeNull();
  });

  it('changes body textarea', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: '{"test": true}' } });
    expect(textarea.value).toBe('{"test": true}');
  });

  it('sends request successfully', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/webhooks'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('displays response after successful request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Map([['content-type', 'application/json']]),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('200');
      expect(container.textContent).toContain('OK');
    });
  });

  it('handles request error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Network failure');
    });
  });

  it('shows loading spinner during request', async () => {
    let resolveFetch: any;
    mockFetch.mockReturnValueOnce(new Promise(r => { resolveFetch = r; }));
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    act(() => {
      fireEvent.click(sendBtn);
    });
    // Button should show loading state
    await waitFor(() => {
      expect(container.textContent).toContain('Sending...');
    });
    // Resolve
    await act(async () => {
      resolveFetch({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        headers: new Map(),
      });
    });
  });

  it('sends GET request without body', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'GET' } });
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET', body: undefined })
      );
    });
  });

  it('clicks a preset and updates path/method', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const presetBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'List Endpoints' || b.textContent === 'List Deliveries' || b.textContent === 'Get Stats'
    );
    expect(presetBtns.length).toBe(3);
    fireEvent.click(presetBtns[0]); // List Endpoints
    const pathInput = container.querySelector('input[type="text"]')! as HTMLInputElement;
    expect(pathInput.value).toBe('/endpoints');
  });

  it('selects AI payload generator event and fills body', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const aiBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'order.created'
    );
    expect(aiBtn).toBeTruthy();
    act(() => {
      fireEvent.click(aiBtn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"order.created"');
    expect(mockToast).toHaveBeenCalledWith('Generated order.created payload', 'success');
  });

  it('generates different AI payloads for different events', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const paymentBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'payment.failed'
    );
    act(() => {
      fireEvent.click(paymentBtn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"payment.failed"');
    expect(textarea!.value).toContain('card_declined');
  });

  it('generates payment.succeeded payload', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'payment.succeeded'
    );
    act(() => {
      fireEvent.click(btn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"payment.succeeded"');
  });

  it('generates user.registered payload', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'user.registered'
    );
    act(() => {
      fireEvent.click(btn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"user.registered"');
  });

  it('generates user.updated payload', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'user.updated'
    );
    act(() => {
      fireEvent.click(btn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"user.updated"');
  });

  it('generates invoice.created payload', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'invoice.created'
    );
    act(() => {
      fireEvent.click(btn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"invoice.created"');
  });

  it('generates order.completed payload', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const btn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'order.completed'
    );
    act(() => {
      fireEvent.click(btn!);
    });
    const textarea = container.querySelector('textarea');
    expect(textarea!.value).toContain('"order.completed"');
  });

  it('copies curl command to clipboard', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const copyBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Copy')
    );
    expect(copyBtn).toBeTruthy();
    await act(async () => {
      fireEvent.click(copyBtn!);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('playground.curlCopied', 'success');
  });

  it('displays curl command in pre block', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const preBlocks = container.querySelectorAll('pre');
    const curlPre = Array.from(preBlocks).find(p => p.textContent?.includes('curl'));
    expect(curlPre).toBeTruthy();
    expect(curlPre!.textContent).toContain('curl -X POST');
  });

  it('updates curl command when method changes', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = container.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'DELETE' } });
    const preBlocks = container.querySelectorAll('pre');
    const curlPre = Array.from(preBlocks).find(p => p.textContent?.includes('curl'));
    expect(curlPre!.textContent).toContain('curl -X DELETE');
  });

  it('shows empty history initially', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.noRequests');
  });

  it('saves request to history after send', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'hooksniff_playground_history',
        expect.any(String)
      );
    });
  });

  it('loads history from localStorage on mount', () => {
    const historyEntry = JSON.stringify([{
      id: 'h1',
      method: 'GET',
      path: '/test',
      body: '',
      status: 200,
      response: { ok: true },
      timestamp: '2024-01-01T00:00:00Z',
      duration_ms: 150,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(historyEntry);
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('Request History');
  });

  it('selects from history and restores request', async () => {
    const historyEntry = JSON.stringify([{
      id: 'h1',
      method: 'GET',
      path: '/saved-path',
      body: '{"saved": true}',
      status: 200,
      response: { ok: true },
      timestamp: '2024-01-01T00:00:00Z',
      duration_ms: 150,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(historyEntry);
    const { container } = render(React.createElement(PlaygroundPage));
    const historyBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('/saved-path')
    );
    expect(historyBtn).toBeTruthy();
    await act(async () => {
      fireEvent.click(historyBtn!);
    });
    const pathInput = container.querySelector('input[type="text"]')! as HTMLInputElement;
    expect(pathInput.value).toBe('/saved-path');
  });

  it('clears history', async () => {
    const historyEntry = JSON.stringify([{
      id: 'h1',
      method: 'GET',
      path: '/test',
      body: '',
      status: 200,
      response: {},
      timestamp: '2024-01-01T00:00:00Z',
      duration_ms: 100,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(historyEntry);
    const { container } = render(React.createElement(PlaygroundPage));
    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent === 'Clear'
    );
    expect(clearBtn).toBeTruthy();
    await act(async () => {
      fireEvent.click(clearBtn!);
    });
    expect(mockToast).toHaveBeenCalledWith('playground.historyCleared', 'info');
    expect(container.textContent).toContain('playground.noRequests');
  });

  it('displays history items with method badge', () => {
    const historyEntry = JSON.stringify([{
      id: 'h1',
      method: 'POST',
      path: '/webhooks',
      body: '',
      status: 201,
      response: {},
      timestamp: '2024-01-01T00:00:00Z',
      duration_ms: 200,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(historyEntry);
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('POST');
    expect(container.textContent).toContain('/webhooks');
  });

  it('shows ResponseInspector empty state', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.sendToInspect');
  });

  it('switches ResponseInspector tabs to headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
      headers: new Map([['x-request-id', 'abc123']]),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    // Send request first
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      // Find headers tab
      const headersTab = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent === 'headers'
      );
      expect(headersTab).toBeTruthy();
      act(() => {
        fireEvent.click(headersTab!);
      });
    });
  });

  it('shows body tab content by default after response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
      headers: new Map([['content-type', 'application/json']]),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      const preBlocks = container.querySelectorAll('pre');
      const jsonPre = Array.from(preBlocks).find(p => p.textContent?.includes('"hello"'));
      expect(jsonPre).toBeTruthy();
    });
  });

  it('shows response status badge for 2xx', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ created: true }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('201');
    });
  });

  it('shows response status badge for 4xx', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('404');
      expect(container.textContent).toContain('Client Error');
    });
  });

  it('shows response status badge for 5xx', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('500');
      expect(container.textContent).toContain('Server Error');
    });
  });

  it('displays duration after request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('ms');
    });
  });

  it('renders live request viewer section', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.liveViewer');
  });

  it('renders preset buttons for all endpoints', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('List Endpoints');
    expect(container.textContent).toContain('List Deliveries');
    expect(container.textContent).toContain('Get Stats');
  });

  it('renders all AI payload generator buttons', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const eventTypes = ['order.created', 'order.completed', 'payment.failed', 'payment.succeeded', 'user.registered', 'user.updated', 'invoice.created'];
    eventTypes.forEach(et => {
      expect(container.textContent).toContain(et);
    });
  });

  it('handles non-JSON response gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON')),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('playground.sendRequest')
    )!;
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => {
      // Should still show status
      expect(container.textContent).toContain('200');
    });
  });
});
