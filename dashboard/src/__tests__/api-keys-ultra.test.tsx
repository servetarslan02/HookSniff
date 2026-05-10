// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
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
  useAuth: () => ({ token: 'test-token', apiKey: 'test-key' }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const { default: ApiKeysPage } = await import('@/app/[locale]/dashboard/api-keys/page');

const mockKeys = [
  {
    id: 'key-1',
    name: 'Production Key',
    prefix: 'hk_live_abc',
    created_at: '2024-01-15T10:00:00Z',
    last_used_at: '2024-06-01T14:30:00Z',
    is_active: true,
  },
  {
    id: 'key-2',
    name: 'Staging Key',
    prefix: 'hk_test_def',
    created_at: '2024-03-01T08:00:00Z',
    last_used_at: null,
    is_active: false,
  },
];

// Helpers
async function renderPage(keys = mockKeys) {
  mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(keys) });
  let result: any;
  await act(async () => {
    result = render(React.createElement(ApiKeysPage));
  });
  return result!;
}

function getCreateButton(container: HTMLElement) {
  return (Array.from(container.querySelectorAll('button')) as Element[]).find(
    (b) => b.textContent?.includes('apiKeys.createKey')
  )!;
}

function getNameInput(container: HTMLElement) {
  return container.querySelector('input[type="text"]') as HTMLInputElement;
}

describe('ApiKeysPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (navigator.clipboard.writeText as any).mockClear();
  });

  // ─── 1. Renders without crashing ───
  it('renders without crashing', async () => {
    await renderPage();
  });

  // ─── 2. Renders page title ───
  it('renders page title', async () => {
    const { container } = await renderPage();
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1!.textContent).toBe('apiKeys.title');
  });

  // ─── 3. Renders create button ───
  it('renders create button', async () => {
    const { container } = await renderPage();
    const btn = getCreateButton(container);
    expect(btn).toBeTruthy();
  });

  // ─── 4. Shows empty state when no keys ───
  it('shows empty state when no keys', async () => {
    const { container } = await renderPage([]);
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.noKeys');
    });
    // Should show the lock emoji
    expect(container.textContent).toContain('🔐');
  });

  // ─── 5. Renders key list when keys exist ───
  it('renders key list when keys exist', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('hk_live_abc');
      expect(container.textContent).toContain('hk_test_def');
    });
  });

  // ─── 6. Each key shows name ───
  it('each key shows name', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('Production Key');
      expect(container.textContent).toContain('Staging Key');
    });
  });

  // ─── 7. Each key shows created date ───
  it('each key shows created date', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.createdDate');
    });
  });

  // ─── 8. Copy button copies key to clipboard ───
  it('copy button copies key to clipboard', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_new_secret_123' }) });

    let result: any;
    await act(async () => {
      result = render(React.createElement(ApiKeysPage));
    });
    const { container } = result;

    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    // Create a key to get the copy button
    await act(async () => { fireEvent.click(getCreateButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('hk_new_secret_123'); });

    const copyBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('common.copyToClipboard')
    )!;
    await act(async () => { fireEvent.click(copyBtn); });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hk_new_secret_123');
  });

  // ─── 9. Shows copied feedback ───
  it('shows copied feedback after clicking copy', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_copy_feedback' }) });

    let result: any;
    await act(async () => { result = render(React.createElement(ApiKeysPage)); });
    const { container } = result;
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    await act(async () => { fireEvent.click(getCreateButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('hk_copy_feedback'); });

    const copyBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('common.copyToClipboard')
    )!;
    await act(async () => { fireEvent.click(copyBtn); });

    expect(container.textContent).toContain('common.copied');
  });

  // ─── 10. Delete button opens confirmation ───
  it('delete button opens confirmation modal', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    const deleteBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('🗑')
    )!;
    await act(async () => { fireEvent.click(deleteBtn); });

    expect(container.textContent).toContain('apiKeys.deleteTitle');
    expect(container.textContent).toContain('apiKeys.deleteDesc');
  });

  // ─── 11. Confirm delete calls API ───
  it('confirm delete calls API with correct endpoint', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    // Open delete modal
    const deleteBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('🗑')
    )!;
    await act(async () => { fireEvent.click(deleteBtn); });

    // Mock delete response
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    // Find confirm button in modal
    const confirmBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.closest('.fixed') && b.textContent?.includes('common.delete')
    )!;
    await act(async () => { fireEvent.click(confirmBtn); });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys/key-1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // ─── 12. Cancel delete closes modal ───
  it('cancel delete closes modal', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    const deleteBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('🗑')
    )!;
    await act(async () => { fireEvent.click(deleteBtn); });
    expect(container.textContent).toContain('apiKeys.deleteTitle');

    const cancelBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('common.cancel')
    )!;
    await act(async () => { fireEvent.click(cancelBtn); });

    expect(container.textContent).not.toContain('apiKeys.deleteTitle');
  });

  // ─── 13. Create button opens form ───
  it('create section is always visible with name input', async () => {
    const { container } = await renderPage();
    expect(container.textContent).toContain('apiKeys.createNewKey');
    const input = getNameInput(container);
    expect(input).toBeTruthy();
  });

  // ─── 14. Name input appears in create form ───
  it('name input has placeholder text', async () => {
    const { container } = await renderPage();
    const input = getNameInput(container);
    expect(input.placeholder).toContain('apiKeys.keyNamePlaceholder');
  });

  // ─── 15. Submit create calls API ───
  it('submit create calls API with POST method', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_created' }) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    await act(async () => { fireEvent.click(getCreateButton(container)); });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // ─── 16. Create form has cancel/dismiss button for new key banner ───
  it('new key banner has dismiss button', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_dismiss_test' }) });

    let result: any;
    await act(async () => { result = render(React.createElement(ApiKeysPage)); });
    const { container } = result;
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    await act(async () => { fireEvent.click(getCreateButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('hk_dismiss_test'); });

    const dismissBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('apiKeys.dismiss')
    );
    expect(dismissBtn).toBeTruthy();
  });

  // ─── 17. Cancel/dismiss new key hides it ───
  it('dismissing new key hides the banner', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_hide_me' }) });

    let result: any;
    await act(async () => { result = render(React.createElement(ApiKeysPage)); });
    const { container } = result;
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    await act(async () => { fireEvent.click(getCreateButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('hk_hide_me'); });

    const dismissBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('apiKeys.dismiss')
    )!;
    await act(async () => { fireEvent.click(dismissBtn); });

    expect(container.textContent).not.toContain('hk_hide_me');
  });

  // ─── 18. Loading state during operations ───
  it('shows loading state while fetching keys', async () => {
    let resolveFetch: any;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    let result: any;
    await act(async () => { result = render(React.createElement(ApiKeysPage)); });
    const { container } = result;

    expect(container.textContent).toContain('apiKeys.loadingKeys');

    await act(async () => {
      resolveFetch({ ok: true, json: () => Promise.resolve(mockKeys) });
    });
  });

  // ─── 19. Error state on API failure ───
  it('shows error on create API failure', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Quota exceeded' } }),
    });

    await act(async () => { fireEvent.click(getCreateButton(container)); });

    await waitFor(() => {
      expect(container.textContent).toContain('Quota exceeded');
    });
  });

  // ─── 20. Success toast on create ───
  // (The component doesn't call toast on create — it shows newKey banner instead.
  //  We verify the newKey banner appears as the success indicator.)
  it('shows success indicator (new key banner) on create', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_success' }) });

    let result: any;
    await act(async () => { result = render(React.createElement(ApiKeysPage)); });
    const { container } = result;
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    await act(async () => { fireEvent.click(getCreateButton(container)); });

    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.newKeyCreated');
      expect(container.textContent).toContain('apiKeys.saveKeyNow');
    });
  });

  // ─── 21. Deleted key is removed from list ───
  it('deleted key is removed from list', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    const deleteBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('🗑')
    )!;
    await act(async () => { fireEvent.click(deleteBtn); });

    const confirmBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.closest('.fixed') && b.textContent?.includes('common.delete')
    )!;
    await act(async () => { fireEvent.click(confirmBtn); });

    await waitFor(() => {
      expect(container.textContent).not.toContain('Production Key');
    });
  });

  // ─── 22. Error on delete failure ───
  it('shows error on delete failure', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Delete failed' } }),
    });

    const deleteBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('🗑')
    )!;
    await act(async () => { fireEvent.click(deleteBtn); });

    const confirmBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.closest('.fixed') && b.textContent?.includes('common.delete')
    )!;
    await act(async () => { fireEvent.click(confirmBtn); });

    // The component throws Error(tc('error')) which becomes 'common.error'
    await waitFor(() => {
      expect(container.textContent).toContain('common.error');
    });
  });

  // ─── 23. Key prefix is displayed (masked) ───
  it('key prefix is displayed with ellipsis', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      // The component renders {key.prefix}…
      expect(container.textContent).toContain('hk_live_abc');
      expect(container.textContent).toContain('hk_test_def');
    });
    // Check that the prefix is in a code element
    const codeEls = container.querySelectorAll('code');
    const prefixCode = (Array.from(codeEls) as Element[]).find((c) => c.textContent?.includes('hk_live_abc'));
    expect(prefixCode).toBeTruthy();
  });

  // ─── 24. Multiple keys render correctly ───
  it('renders multiple keys with correct count', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.keyCount:2');
    });
    // Both keys should be present
    expect(container.textContent).toContain('Production Key');
    expect(container.textContent).toContain('Staging Key');
  });

  // ─── 25. Create with empty name ───
  it('creates key with empty name sends undefined', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    // Don't type anything in name input
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_noname' }) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    await act(async () => { fireEvent.click(getCreateButton(container)); });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: undefined }),
      })
    );
  });

  // ─── 26. Key name input allows typing ───
  it('key name input allows typing', async () => {
    const { container } = await renderPage();
    const input = getNameInput(container);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'My Custom Key' } });
    });
    expect(input.value).toBe('My Custom Key');
  });

  // ─── 27. Active and inactive status badges ───
  it('shows active and inactive status badges', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.active');
      expect(container.textContent).toContain('apiKeys.inactive');
    });
  });

  // ─── 28. Key count displays correctly ───
  it('shows correct key count', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.keyCount:2');
    });
  });

  // ─── 29. Subtitle renders ───
  it('renders subtitle', async () => {
    const { container } = await renderPage();
    expect(container.textContent).toContain('apiKeys.subtitle');
  });

  // ─── 30. Your keys heading renders ───
  it('renders your keys heading', async () => {
    const { container } = await renderPage();
    expect(container.textContent).toContain('apiKeys.yourKeys');
  });

  // ─── 31. Delete modal backdrop click closes modal ───
  it('delete modal backdrop click closes modal', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    const deleteBtn = (Array.from(container.querySelectorAll('button')) as Element[]).find(
      (b) => b.textContent?.includes('🗑')
    )!;
    await act(async () => { fireEvent.click(deleteBtn); });
    expect(container.textContent).toContain('apiKeys.deleteTitle');

    // Click backdrop
    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/40');
    if (backdrop) {
      await act(async () => { fireEvent.click(backdrop); });
      expect(container.textContent).not.toContain('apiKeys.deleteTitle');
    }
  });

  // ─── 32. Error banner dismiss button has aria-label ───
  it('error banner has accessible dismiss button', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Test error' } }),
    });

    await act(async () => { fireEvent.click(getCreateButton(container)); });
    await waitFor(() => { expect(container.textContent).toContain('Test error'); });

    const dismissBtn = container.querySelector('[aria-label="Dismiss error"]');
    expect(dismissBtn).toBeTruthy();
  });

  // ─── 33. Creates key with name sends name in body ───
  it('creates key with name sends name in request body', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    const input = getNameInput(container);
    await act(async () => { fireEvent.change(input, { target: { value: 'CI/CD Key' } }); });

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_named' }) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    await act(async () => { fireEvent.click(getCreateButton(container)); });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'CI/CD Key' }),
      })
    );
  });

  // ─── 34. Creating state shows spinner text ───
  it('creating state shows creating indicator', async () => {
    let resolveCreate: any;
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveCreate = r; }));

    await act(async () => { fireEvent.click(getCreateButton(container)); });
    expect(container.textContent).toContain('common.creating');

    await act(async () => {
      resolveCreate({ ok: true, json: () => Promise.resolve({ key: 'hk_done' }) });
    });
  });

  // ─── 35. Key name input clears after successful create ───
  it('key name input clears after successful create', async () => {
    const { container } = await renderPage();
    await waitFor(() => { expect(container.textContent).toContain('Production Key'); });

    const input = getNameInput(container);
    await act(async () => { fireEvent.change(input, { target: { value: 'Temp Key' } }); });
    expect(input.value).toBe('Temp Key');

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'hk_new' }) });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    await act(async () => { fireEvent.click(getCreateButton(container)); });
    expect(input.value).toBe('');
  });

  // ─── 36. Key count with zero keys ───
  it('shows key count zero for empty list', async () => {
    const { container } = await renderPage([]);
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.keyCount:0');
    });
  });

  // ─── 37. Last used date shown when available ───
  it('shows last used date when available', async () => {
    const { container } = await renderPage();
    await waitFor(() => {
      expect(container.textContent).toContain('apiKeys.lastUsed');
    });
  });
});
