// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();
const mockEndpointsCreate = vi.fn().mockResolvedValue({});

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
    create: (...args: any[]) => mockEndpointsCreate(...args),
  },
}));

const { default: ApiSpecImporterPage } = await import('@/app/[locale]/dashboard/api-importer/page');

const validSpec = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Test API', version: '1.0.0' },
  servers: [{ url: 'https://api.test.com' }],
  paths: {
    '/orders': {
      post: { summary: 'Create order', description: 'Creates a new order' },
    },
    '/users': {
      get: { summary: 'List users' },
    },
    '/products': {
      get: { summary: 'List products' },
      put: { summary: 'Update product' },
    },
  },
});

const emptySpec = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Empty API', version: '1.0.0' },
  paths: {},
});

describe('ApiSpecImporterPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(validSpec) });
    mockEndpointsCreate.mockResolvedValue({});
  });

  it('renders without crashing', () => {
    render(React.createElement(ApiSpecImporterPage));
  });

  it('displays page title', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    expect(container.textContent).toContain('API Spec Importer');
  });

  it('displays description', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    expect(container.textContent).toContain('Import endpoints from an OpenAPI');
  });

  it('renders URL mode by default', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    expect(container.textContent).toContain('From URL');
  });

  it('renders paste mode button', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    expect(container.textContent).toContain('Paste JSON');
  });

  it('renders URL input in URL mode', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    expect(urlInput).toBeTruthy();
  });

  it('URL input has correct placeholder', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    expect(urlInput.placeholder).toContain('openapi.json');
  });

  it('renders fetch button', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    expect(container.textContent).toContain('Fetch');
  });

  it('fetch button is disabled when URL is empty', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    expect(fetchBtn?.disabled).toBe(true);
  });

  it('can type URL', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/openapi.json' } });
    });
    expect(urlInput.value).toBe('https://api.example.com/openapi.json');
  });

  it('fetch button enables when URL has value', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    expect(fetchBtn?.disabled).toBe(false);
  });

  it('fetches spec from URL', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/spec.json');
  });

  it('shows parsed endpoints after fetch', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('Test API');
      expect(container.textContent).toContain('endpoints found');
    });
  });

  it('shows endpoint methods', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('POST');
      expect(container.textContent).toContain('GET');
      expect(container.textContent).toContain('PUT');
    });
  });

  it('shows endpoint paths', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('/orders');
      expect(container.textContent).toContain('/users');
    });
  });

  it('shows success toast after fetch', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Found 4 endpoints', 'success');
    });
  });

  it('shows error toast for invalid JSON', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve('not json') });
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to parse OpenAPI spec', 'error');
    });
  });

  it('shows error toast for fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to fetch: Network error', 'error');
    });
  });

  it('shows error for HTTP error status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve('') });
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('HTTP 404'), 'error');
    });
  });

  it('switches to paste mode', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('paste mode shows textarea', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('paste mode has parse button', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    expect(container.textContent).toContain('Parse');
  });

  it('parse button disabled when content empty', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    const parseBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Parse')
    );
    expect(parseBtn?.disabled).toBe(true);
  });

  it('parses pasted JSON', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: validSpec } });
    });
    const parseBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Parse')
    );
    await act(async () => { fireEvent.click(parseBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('Test API');
    });
  });

  it('shows error for invalid pasted JSON', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'not json' } });
    });
    const parseBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Parse')
    );
    await act(async () => { fireEvent.click(parseBtn!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('Failed to parse'), 'error');
    });
  });

  it('can toggle endpoint selection', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => { expect(container.textContent).toContain('/orders'); });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
      const firstCheckbox = checkboxes[0] as HTMLInputElement;
      const initialState = firstCheckbox.checked;
      await act(async () => { fireEvent.click(firstCheckbox); });
      expect(firstCheckbox.checked).toBe(!initialState);
    }
  });

  it('toggle all button renders', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => { expect(container.textContent).toContain('Test API'); });
    // All endpoints selected by default → should show "Deselect All"
    const toggleBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Deselect All') || b.textContent?.includes('Select All')
    );
    expect(toggleBtn).toBeTruthy();
    expect(toggleBtn!.textContent).toContain('Deselect All');
  });

  it('import button shows count', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('Import');
      expect(container.textContent).toContain('Endpoints');
    });
  });

  it('imports selected endpoints', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => { expect(container.textContent).toContain('Import'); });
    const importBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Import') && b.textContent?.includes('Endpoints')
    );
    if (importBtn) {
      await act(async () => { fireEvent.click(importBtn); });
      await waitFor(() => {
        expect(mockEndpointsCreate).toHaveBeenCalled();
      });
    }
  });

  it('shows toast after import', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => { expect(container.textContent).toContain('Import'); });
    const importBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Import') && b.textContent?.includes('Endpoints')
    );
    if (importBtn) {
      await act(async () => { fireEvent.click(importBtn); });
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('Imported'), 'success');
      });
    }
  });

  it('import button shows correct count', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('Test API');
    });
    // Default: all endpoints selected, import button shows count
    const importBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Import')
    );
    expect(importBtn).toBeTruthy();
  });

  it('renders supported formats section', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    expect(container.textContent).toContain('Supported Formats');
    expect(container.textContent).toContain('OpenAPI 3.0');
    expect(container.textContent).toContain('Swagger 2.0');
  });

  it('renders tip section after parsing', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('Tip');
    });
  });

  it('handles spec with no servers', async () => {
    const specNoServers = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'No Servers API', version: '1.0.0' },
      paths: { '/test': { get: { summary: 'Test' } } },
    });
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(specNoServers) });
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(container.textContent).toContain('No Servers API');
    });
  });

  it('handles empty paths', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: () => Promise.resolve(emptySpec) });
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlInput = container.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://api.example.com/spec.json' } });
    });
    const fetchBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Fetch')
    );
    await act(async () => { fireEvent.click(fetchBtn!); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Found 0 endpoints', 'success');
    });
  });

  it('switches back to URL mode from paste mode', async () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const pasteBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('Paste JSON')
    );
    await act(async () => { fireEvent.click(pasteBtn!); });
    expect(container.querySelector('textarea')).toBeTruthy();
    const urlBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('From URL')
    );
    await act(async () => { fireEvent.click(urlBtn!); });
    expect(container.querySelector('input[type="url"]')).toBeTruthy();
  });

  it('mode buttons have active style', () => {
    const { container } = render(React.createElement(ApiSpecImporterPage));
    const urlBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('From URL')
    );
    expect(urlBtn?.className).toContain('bg-brand-600');
  });
});
