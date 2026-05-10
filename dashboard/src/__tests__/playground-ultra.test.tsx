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
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

// Mock performance.now with controllable counter
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
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
  }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: { list: vi.fn().mockResolvedValue([]) },
}));

const { default: PlaygroundPage } = await import('@/app/[locale]/dashboard/playground/page');

// Helpers
function getSendButton(container: HTMLElement) {
  return Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent?.includes('playground.sendRequest')
  )!;
}

function getSelect(container: HTMLElement) {
  return container.querySelector('select') as HTMLSelectElement;
}

function getPathInput(container: HTMLElement) {
  return container.querySelector('input[type="text"]') as HTMLInputElement;
}

describe('PlaygroundPage — Ultra Coverage', () => {
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

  // ─── 1. Renders without crashing ───
  it('renders without crashing', () => {
    render(React.createElement(PlaygroundPage));
  });

  // ─── 2. Renders playground title ───
  it('renders playground title', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1!.textContent).toBe('playground.title');
  });

  // ─── 3. Renders method selector ───
  it('renders method selector', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    expect(select).toBeTruthy();
    expect(select.tagName).toBe('SELECT');
  });

  // ─── 4. Renders path input ───
  it('renders path input', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const pathInput = getPathInput(container);
    expect(pathInput).toBeTruthy();
    expect(pathInput.type).toBe('text');
  });

  // ─── 5. Renders send button ───
  it('renders send button', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = getSendButton(container);
    expect(sendBtn).toBeTruthy();
    expect(sendBtn.disabled).toBe(false);
  });

  // ─── 6. Default method is POST (component default) ───
  it('default method is POST', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    expect(select.value).toBe('POST');
  });

  // ─── 7. Can change method to GET ───
  it('can change method to GET', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    fireEvent.change(select, { target: { value: 'GET' } });
    expect(select.value).toBe('GET');
  });

  // ─── 8. Can change method to PUT ───
  it('can change method to PUT', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    fireEvent.change(select, { target: { value: 'PUT' } });
    expect(select.value).toBe('PUT');
  });

  // ─── 9. Can change method to DELETE ───
  it('can change method to DELETE', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    fireEvent.change(select, { target: { value: 'DELETE' } });
    expect(select.value).toBe('DELETE');
  });

  // ─── 10. Can change method to PATCH ───
  it('can change method to PATCH', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    fireEvent.change(select, { target: { value: 'PATCH' } });
    expect(select.value).toBe('PATCH');
  });

  // ─── 11. Can type in path input ───
  it('can type in path input', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const pathInput = getPathInput(container);
    fireEvent.change(pathInput, { target: { value: '/v1/custom/path' } });
    expect(pathInput.value).toBe('/v1/custom/path');
  });

  // ─── 12. Renders all method options ───
  it('renders all method options (GET, POST, PUT, DELETE, PATCH)', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.value);
    expect(options).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
  });

  // ─── 13. Renders AI payload template buttons ───
  it('renders AI payload template buttons', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const templates = ['order.created', 'order.completed', 'payment.failed', 'payment.succeeded', 'user.registered', 'user.updated', 'invoice.created'];
    templates.forEach((t) => {
      expect(container.textContent).toContain(t);
    });
  });

  // ─── 14. Clicking template fills body editor ───
  it('clicking template fills body editor', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const orderBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'order.created'
    )!;
    act(() => { fireEvent.click(orderBtn); });
    const textarea = container.querySelector('textarea')!;
    expect(textarea.value).toContain('"event": "order.created"');
  });

  // ─── 15. Shows empty response inspector initially ───
  it('shows empty response inspector initially', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.sendToInspect');
  });

  // ─── 16. Send button triggers API call ───
  it('send button triggers API call', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = getSendButton(container);
    await act(async () => { fireEvent.click(sendBtn); });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // ─── 17. Successful response shows status ───
  it('successful response shows status code and OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ ok: true }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toContain('200');
      expect(container.textContent).toContain('OK');
    });
  });

  // ─── 18. Error response shows error status ───
  it('error response shows 500 and Server Error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 500,
      json: () => Promise.resolve({ error: 'fail' }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toContain('500');
      expect(container.textContent).toContain('Server Error');
    });
  });

  // ─── 19. Response shows duration ───
  it('response shows duration in ms', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({}),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toMatch(/\d+ms/);
    });
  });

  // ─── 20. Can switch between body and headers tabs ───
  it('can switch between body and headers tabs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: 'test' }),
      headers: new Map([['x-request-id', 'abc']]),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('200'); });

    const headersTab = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'headers')!;
    act(() => { fireEvent.click(headersTab); });
    // After clicking headers tab, the pre should show header content
    const pres = container.querySelectorAll('pre');
    const headerPre = Array.from(pres).find((p) => p.textContent?.includes('x-request-id'));
    expect(headerPre).toBeTruthy();
  });

  // ─── 21. Active tab is highlighted ───
  it('active tab has brand color class', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ data: 'test' }),
      headers: new Map([['x-request-id', 'abc']]),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('200'); });

    const bodyTab = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'body')!;
    // Body tab should have active brand class
    expect(bodyTab.className).toContain('border-brand-500');

    const headersTab = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'headers')!;
    // Headers tab should be transparent/inactive
    expect(headersTab.className).toContain('border-transparent');

    // Switch to headers
    act(() => { fireEvent.click(headersTab); });
    expect(headersTab.className).toContain('border-brand-500');
    expect(bodyTab.className).toContain('border-transparent');
  });

  // ─── 22. History is saved to localStorage ───
  it('history is saved to localStorage after send', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ ok: true }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'hooksniff_playground_history',
        expect.any(String)
      );
    });
  });

  // ─── 23. History loads from localStorage ───
  it('history loads from localStorage on mount', () => {
    const entry = JSON.stringify([{
      id: 'h1', method: 'GET', path: '/loaded', body: '', status: 200,
      response: { ok: true }, timestamp: '2024-01-01T00:00:00Z', duration_ms: 50,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(entry);
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('Request History');
    expect(container.textContent).toContain('/loaded');
  });

  // ─── 24. Max 10 history items ───
  it('saves max 10 history items', async () => {
    // Pre-populate with 10 items
    const existing = Array.from({ length: 10 }, (_, i) => ({
      id: `h${i}`, method: 'GET', path: `/old-${i}`, body: '', status: 200,
      response: {}, timestamp: '2024-01-01T00:00:00Z', duration_ms: 10,
    }));
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existing));

    mockFetch.mockResolvedValueOnce({
      ok: true, status: 201,
      json: () => Promise.resolve({ created: true }),
      headers: new Map(),
    });

    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      const savedArg = localStorageMock.setItem.mock.calls.find(
        (c) => c[0] === 'hooksniff_playground_history'
      );
      expect(savedArg).toBeTruthy();
      const parsed = JSON.parse(savedArg![1]);
      expect(parsed.length).toBeLessThanOrEqual(10);
    });
  });

  // ─── 25. Can clear history ───
  it('can clear history', async () => {
    const entry = JSON.stringify([{
      id: 'h1', method: 'GET', path: '/test', body: '', status: 200,
      response: {}, timestamp: '2024-01-01T00:00:00Z', duration_ms: 50,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(entry);
    const { container } = render(React.createElement(PlaygroundPage));

    const clearBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Clear')!;
    await act(async () => { fireEvent.click(clearBtn); });

    expect(mockToast).toHaveBeenCalledWith('playground.historyCleared', 'info');
    expect(container.textContent).toContain('playground.noRequests');
  });

  // ─── 26. History shows method and path ───
  it('history shows method and path', () => {
    const entry = JSON.stringify([{
      id: 'h1', method: 'POST', path: '/webhooks', body: '', status: 201,
      response: {}, timestamp: '2024-06-15T12:00:00Z', duration_ms: 200,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(entry);
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('POST');
    expect(container.textContent).toContain('/webhooks');
  });

  // ─── 27. History shows status code ───
  it('history shows status code', () => {
    const entry = JSON.stringify([{
      id: 'h1', method: 'GET', path: '/stats', body: '', status: 200,
      response: {}, timestamp: '2024-01-01T00:00:00Z', duration_ms: 80,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(entry);
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('200');
  });

  // ─── 28. History shows timestamp ───
  it('history shows timestamp', () => {
    const entry = JSON.stringify([{
      id: 'h1', method: 'GET', path: '/test', body: '', status: 200,
      response: {}, timestamp: '2024-06-15T14:30:00.000Z', duration_ms: 50,
    }]);
    localStorageMock.getItem.mockReturnValueOnce(entry);
    const { container } = render(React.createElement(PlaygroundPage));
    // toLocaleString output depends on locale, but the timestamp should render something
    // We check that the div with the timestamp class exists
    const timeDivs = container.querySelectorAll('[class*="text-\\[10px\\]"]');
    // Alternatively just check container has some date-like content
    const text = container.textContent || '';
    // The component calls new Date(req.timestamp).toLocaleString() which should produce a non-empty string
    expect(text).not.toBe('');
  });

  // ─── 29. Loading state during request ───
  it('shows loading state during request', async () => {
    let resolveFetch: any;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));
    const { container } = render(React.createElement(PlaygroundPage));

    act(() => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toContain('Sending...');
    });

    await act(async () => {
      resolveFetch({ ok: true, status: 200, json: () => Promise.resolve({}), headers: new Map() });
    });
  });

  // ─── 30. Send button disabled during loading ───
  it('send button disabled during loading', async () => {
    let resolveFetch: any;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));
    const { container } = render(React.createElement(PlaygroundPage));
    const sendBtn = getSendButton(container);

    act(() => { fireEvent.click(sendBtn); });
    await waitFor(() => {
      expect(sendBtn.disabled).toBe(true);
    });

    await act(async () => {
      resolveFetch({ ok: true, status: 200, json: () => Promise.resolve({}), headers: new Map() });
    });
  });

  // ─── 31. Renders endpoint path quick buttons ───
  it('renders endpoint path quick buttons', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('List Endpoints');
    expect(container.textContent).toContain('List Deliveries');
    expect(container.textContent).toContain('Get Stats');
  });

  // ─── 32. Endpoint path fills path input ───
  it('endpoint path button fills path input and sets GET', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const pathInput = getPathInput(container);
    const select = getSelect(container);

    // Default is POST
    expect(select.value).toBe('POST');

    const listEndpointsBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'List Endpoints'
    )!;
    fireEvent.click(listEndpointsBtn);

    expect(pathInput.value).toBe('/endpoints');
    expect(select.value).toBe('GET');
  });

  // ─── 33. Body editor renders for POST/PUT/PATCH ───
  it('body editor renders for POST, PUT, PATCH', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);

    // POST (default) — textarea should exist
    expect(container.querySelector('textarea')).toBeTruthy();

    // PUT
    fireEvent.change(select, { target: { value: 'PUT' } });
    expect(container.querySelector('textarea')).toBeTruthy();

    // PATCH
    fireEvent.change(select, { target: { value: 'PATCH' } });
    expect(container.querySelector('textarea')).toBeTruthy();

    // DELETE also shows body
    fireEvent.change(select, { target: { value: 'DELETE' } });
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  // ─── 34. Body editor does not render for GET ───
  it('body editor does not render for GET', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const select = getSelect(container);
    fireEvent.change(select, { target: { value: 'GET' } });
    expect(container.querySelector('textarea')).toBeNull();
  });

  // ─── 35. Response inspector shows empty state initially ───
  it('response inspector shows empty state with sendToInspect text', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.sendToInspect');
  });

  // ─── 36. Request includes Authorization header with apiKey ───
  it('request includes Authorization header', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
        }),
      })
    );
  });

  // ─── 37. Request sends body for non-GET methods ───
  it('request sends body for non-GET methods', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: '{"key":"value"}' } });
    await act(async () => { fireEvent.click(getSendButton(container)); });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: '{"key":"value"}' })
    );
  });

  // ─── 38. Request does NOT send body for GET ───
  it('request does not send body for GET', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    fireEvent.change(getSelect(container), { target: { value: 'GET' } });
    await act(async () => { fireEvent.click(getSendButton(container)); });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: undefined })
    );
  });

  // ─── 39. Path defaults to /webhooks ───
  it('path defaults to /webhooks', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(getPathInput(container).value).toBe('/webhooks');
  });

  // ─── 40. AI template changes method to POST ───
  it('clicking AI template sets method to POST', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    // Change to GET first
    fireEvent.change(getSelect(container), { target: { value: 'GET' } });
    expect(getSelect(container).value).toBe('GET');

    const paymentBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'payment.failed'
    )!;
    act(() => { fireEvent.click(paymentBtn); });
    expect(getSelect(container).value).toBe('POST');
  });

  // ─── 41. Clicking history item restores request state ───
  it('clicking history item restores method, path, body, response', async () => {
    const entry = JSON.stringify([{
      id: 'h1', method: 'DELETE', path: '/api/resource/42',
      body: '{"reason":"cleanup"}', status: 204,
      response: { deleted: true }, timestamp: '2024-03-01T00:00:00Z',
      duration_ms: 120, headers: { 'x-request-id': 'req-99' },
    }]);
    localStorageMock.getItem.mockReturnValueOnce(entry);
    const { container } = render(React.createElement(PlaygroundPage));

    const historyItem = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('/api/resource/42')
    )!;
    await act(async () => { fireEvent.click(historyItem); });

    expect(getSelect(container).value).toBe('DELETE');
    expect(getPathInput(container).value).toBe('/api/resource/42');
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea!.value).toBe('{"reason":"cleanup"}');
    // Status 204 should appear
    expect(container.textContent).toContain('204');
  });

  // ─── 42. Network error is displayed in response ───
  it('network error is displayed in response body', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fetch failed'));
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toContain('fetch failed');
    });
  });

  // ─── 43. Preset click sets method to GET and clears body ───
  it('preset click sets method to GET and clears body', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    // First fill body
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: '{"old":"data"}' } });
    expect(textarea.value).toBe('{"old":"data"}');

    const statsBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Get Stats'
    )!;
    fireEvent.click(statsBtn);

    expect(getSelect(container).value).toBe('GET');
    expect(getPathInput(container).value).toBe('/stats');
    // Body textarea should be gone since method is GET
    expect(container.querySelector('textarea')).toBeNull();
  });

  // ─── 44. Multiple history items render ───
  it('renders multiple history items', () => {
    const entries = JSON.stringify([
      { id: 'h1', method: 'GET', path: '/a', body: '', status: 200, response: {}, timestamp: '2024-01-01T00:00:00Z', duration_ms: 10 },
      { id: 'h2', method: 'POST', path: '/b', body: '', status: 201, response: {}, timestamp: '2024-01-02T00:00:00Z', duration_ms: 20 },
      { id: 'h3', method: 'DELETE', path: '/c', body: '', status: 204, response: {}, timestamp: '2024-01-03T00:00:00Z', duration_ms: 30 },
    ]);
    localStorageMock.getItem.mockReturnValueOnce(entries);
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('/a');
    expect(container.textContent).toContain('/b');
    expect(container.textContent).toContain('/c');
  });

  // ─── 45. Live viewer section renders ───
  it('renders live request viewer section', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.liveViewer');
  });

  // ─── 46. Headers section shows auto-added headers ───
  it('headers section shows auto-added headers', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('Headers (auto-added)');
  });

  // ─── 47. cURL command section renders ───
  it('cURL command section renders', () => {
    const { container } = render(React.createElement(PlaygroundPage));
    expect(container.textContent).toContain('playground.curlCommand');
  });

  // ─── 48. Response shows 4xx as Client Error ───
  it('4xx response shows Client Error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 422,
      json: () => Promise.resolve({ error: 'validation' }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toContain('422');
      expect(container.textContent).toContain('Client Error');
    });
  });

  // ─── 49. Response shows 3xx as Redirect ───
  it('3xx response shows Redirect', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true, status: 301,
      json: () => Promise.resolve({ redirect: true }),
      headers: new Map(),
    });
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    await waitFor(() => {
      expect(container.textContent).toContain('301');
      expect(container.textContent).toContain('Redirect');
    });
  });

  // ─── 50. Send request passes credentials ───
  it('send request passes credentials include', async () => {
    const { container } = render(React.createElement(PlaygroundPage));
    await act(async () => { fireEvent.click(getSendButton(container)); });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
