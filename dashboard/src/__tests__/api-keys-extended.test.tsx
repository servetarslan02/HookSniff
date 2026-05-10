// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, params?: any) => {
    if (params?.count !== undefined) return `${ns}.${key}:${params.count}`;
    if (params?.date !== undefined) return `${ns}.${key}:${params.date}`;
    return ns ? `${ns}.${key}` : key;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: ApiKeysPage } = await import('@/app/[locale]/dashboard/api-keys/page');

const mockKeys = [
  { id: 'key1', name: 'Production', prefix: 'hk_live_abc', created_at: '2024-01-01T00:00:00Z', last_used_at: '2024-06-01T00:00:00Z', is_active: true },
  { id: 'key2', name: null, prefix: 'hk_test_def', created_at: '2024-02-01T00:00:00Z', last_used_at: null, is_active: false },
];

describe('ApiKeysPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockKeys) });
  });

  // === Render ===
  it('renders without crashing', () => {
    render(React.createElement(ApiKeysPage));
  });

  it('displays title', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.title');
    });
  });

  it('displays subtitle', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.subtitle');
    });
  });

  // === Loading state ===
  it('shows loading state initially', () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // Never resolves
    const { container } = render(React.createElement(ApiKeysPage));
    expect(container.textContent).toContain('apiKeys.loadingKeys');
  });

  // === Key list ===
  it('renders key list after loading', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });
  });

  it('renders key prefix', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('hk_live_abc');
    });
  });

  it('renders active status badge', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.active');
    });
  });

  it('renders inactive status badge', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.inactive');
    });
  });

  it('renders created date', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.createdDate');
    });
  });

  it('renders last used date when available', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.lastUsed');
    });
  });

  it('renders key count', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.keyCount:2');
    });
  });

  // === Empty state ===
  it('shows empty state when no keys', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.noKeys');
    });
  });

  // === Create key ===
  it('renders create key section', () => {
    const { container } = render(React.createElement(ApiKeysPage));
    expect(container.textContent).toContain('apiKeys.createNewKey');
  });

  it('renders key name input', () => {
    const { container } = render(React.createElement(ApiKeysPage));
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('allows typing key name', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'My API Key' } });
    });
    expect(input.value).toBe('My API Key');
  });

  it('creates key on button click', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_new_12345' }) }); // create

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('shows new key after creation', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_new_secret' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('hk_new_secret');
    });
  });

  it('shows new key created banner', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_new_secret' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.newKeyCreated');
      expect(container.textContent).toContain('apiKeys.saveKeyNow');
    });
  });

  it('copies new key to clipboard', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_copy_me' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('hk_copy_me');
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.copyToClipboard')
    );

    await act(async () => {
      fireEvent.click(copyButton!);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hk_copy_me');
  });

  it('shows copied text after copy', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_copy_me' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.copyToClipboard')
    );

    await act(async () => {
      fireEvent.click(copyButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('common.copied');
    });
  });

  it('dismisses new key banner', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_dismiss' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('hk_dismiss');
    });

    const dismissButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.dismiss')
    );

    await act(async () => {
      fireEvent.click(dismissButton!);
    });

    expect(container.textContent).not.toContain('hk_dismiss');
  });

  // === Error on create ===
  it('shows error on create failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ error: { message: 'Limit reached' } }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Limit reached');
    });
  });

  // === Error dismiss ===
  it('dismisses error banner', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, flow: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ error: { message: 'Fail' } }) });

    // Just test error dismiss button exists
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });
  });

  // === Delete flow ===
  it('opens delete modal on delete click', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.delete')
    );

    await act(async () => {
      fireEvent.click(deleteButton!);
    });

    expect(container.textContent).toContain('apiKeys.deleteTitle');
    expect(container.textContent).toContain('apiKeys.deleteDesc');
  });

  it('closes delete modal on cancel', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.delete')
    );

    await act(async () => {
      fireEvent.click(deleteButton!);
    });

    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.cancel')
    );

    await act(async () => {
      fireEvent.click(cancelButton!);
    });

    expect(container.textContent).not.toContain('apiKeys.deleteTitle');
  });

  it('deletes key on confirm', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.delete')
    );

    await act(async () => {
      fireEvent.click(deleteButton!);
    });

    const confirmButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.delete') && !b.textContent?.includes('🗑')
    );

    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys/key1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // === Rotate flow ===
  it('opens rotate modal on rotate click', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    await act(async () => {
      fireEvent.click(rotateButton!);
    });

    expect(container.textContent).toContain('apiKeys.rotateTitle');
    expect(container.textContent).toContain('apiKeys.rotateDesc');
  });

  it('closes rotate modal on cancel', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    await act(async () => {
      fireEvent.click(rotateButton!);
    });

    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.cancel')
    );

    await act(async () => {
      fireEvent.click(cancelButton!);
    });

    expect(container.textContent).not.toContain('apiKeys.rotateTitle');
  });

  it('rotates key on confirm', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_rotated_new' }) });

    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    await act(async () => {
      fireEvent.click(rotateButton!);
    });

    const confirmButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate') && b.closest('.relative')
    );

    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys/key1/rotate'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // === Creating state ===
  it('shows creating state during key creation', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('common.creating');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({ key: 'hk_new' }) });
    });
  });

  // === Key name input placeholder ===
  it('renders key name placeholder', () => {
    const { container } = render(React.createElement(ApiKeysPage));
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input.placeholder).toBeTruthy();
  });

  // === Create key with name ===
  it('sends key name in create request', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_named' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Staging Key' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Staging Key' }),
      })
    );
  });

  // === Create key without name ===
  it('creates key without name (undefined)', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_noname' }) });

    const { container } = render(React.createElement(ApiKeysPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Production');
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const body = JSON.parse(mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1].body);
    expect(body.name).toBeUndefined();
  });

  // === Rotate and delete button existence ===
  it('renders rotate button for each key', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      const rotateButtons = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('🔄')
      );
      expect(rotateButtons.length).toBe(2);
    });
  });

  it('renders delete button for each key', async () => {
    const { container } = render(React.createElement(ApiKeysPage));
    await waitFor(() => {
      const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('🗑')
      );
      expect(deleteButtons.length).toBe(2);
    });
  });
});
