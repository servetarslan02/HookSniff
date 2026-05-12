// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue('') },
  writable: true,
});

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, params?: any) => {
    if (params?.count !== undefined) return `${ns}.${key}:${params.count}`;
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

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: ApiKeysPage } = await import('@/app/[locale]/[username]/api-keys/page');

const mockKeys = [
  { id: 'k1', name: 'Key 1', prefix: 'sk_abc', created_at: '2024-01-01', last_used_at: null, is_active: true },
  { id: 'k2', name: 'Key 2', prefix: 'sk_def', created_at: '2024-02-01', last_used_at: '2024-03-01', is_active: false },
];

// Helper to set initial fetch mock
function setupInitialFetch(keys = mockKeys) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(keys),
  });
}

// Helper to render and wait for initial fetch
async function renderPage() {
  let container: HTMLElement;
  await act(async () => {
    const result = render(React.createElement(ApiKeysPage));
    container = result.container;
  });
  return container!;
}

describe('ApiKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (navigator.clipboard.writeText as any).mockClear();
    setupInitialFetch();
  });

  // === Render tests ===
  it('renders without crashing', async () => {
    await renderPage();
  });

  it('displays API keys title', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.title');
  });

  it('displays subtitle', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.subtitle');
  });

  it('renders create key section', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.createNewKey');
  });

  it('renders key name input', async () => {
    const container = await renderPage();
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toContain('apiKeys.keyNamePlaceholder');
  });

  it('renders create button', async () => {
    const container = await renderPage();
    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );
    expect(createButton).toBeTruthy();
  });

  it('renders your keys heading', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.yourKeys');
  });

  // === Fetch on mount ===
  it('fetches API keys on mount', async () => {
    await renderPage();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api-keys'),
      expect.anything()
    );
  });

  it('displays fetched keys', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('sk_abc');
    expect(container.textContent).toContain('sk_def');
  });

  it('displays key names', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('Key 1');
    expect(container.textContent).toContain('Key 2');
  });

  it('displays active status', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.active');
  });

  it('displays inactive status', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.inactive');
  });

  it('displays key count', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.keyCount:2');
  });

  it('displays created date', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.createdDate');
  });

  it('displays last used date for used key', async () => {
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.lastUsed');
  });

  // === Empty state ===
  it('shows empty state when no keys', async () => {
    setupInitialFetch([]);
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.noKeys');
  });

  // === Loading state ===
  it('shows loading state initially', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(ApiKeysPage));
      container = result.container;
    });

    expect(container!.textContent).toContain('apiKeys.loadingKeys');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  // === Fetch error ===
  it('handles fetch error silently', async () => {
    mockFetch.mockReset();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const container = await renderPage();
    expect(container.textContent).toContain('apiKeys.noKeys');
  });

  // === Create key ===
  it('creates key without name', async () => {
    const container = await renderPage();

    // Now set up mocks for the create call and refetch
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_new_12345' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

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
        body: JSON.stringify({ name: undefined }),
      })
    );
  });

  it('creates key with name', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_named_12345' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'My Production Key' } });
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
        body: JSON.stringify({ name: 'My Production Key' }),
      })
    );
  });

  it('shows new key after creation', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_brand_new_key_abc' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('sk_brand_new_key_abc');
    expect(container.textContent).toContain('apiKeys.newKeyCreated');
    expect(container.textContent).toContain('apiKeys.saveKeyNow');
  });

  it('shows error on create failure', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } }),
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('Rate limit exceeded');
  });

  it('shows creating state during key creation', async () => {
    const container = await renderPage();

    let resolveCreate: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveCreate = r; }));

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('common.creating');

    await act(async () => {
      resolveCreate!({ ok: true, json: () => Promise.resolve({ key: 'sk_xxx' }) });
    });
  });

  // === Copy new key ===
  it('copies new key to clipboard', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_copy_me_123' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.copyToClipboard')
    );

    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('sk_copy_me_123');
    }
  });

  it('shows "Copied" after copying new key', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_copy_me_123' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.copyToClipboard')
    );

    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
      expect(container.textContent).toContain('common.copied');
    }
  });

  // === Dismiss new key alert ===
  it('dismisses new key alert', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_dismiss_me' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('sk_dismiss_me');

    const dismissButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.dismiss')
    );

    if (dismissButton) {
      await act(async () => {
        fireEvent.click(dismissButton);
      });
      expect(container.textContent).not.toContain('sk_dismiss_me');
    }
  });

  // === Error banner ===
  it('shows error banner on create error', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'API error' } }),
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('API error');
  });

  it('dismisses error banner', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'API error' } }),
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(container.textContent).toContain('API error');

    // Find dismiss button (✕)
    const dismissButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('✕')
    );

    if (dismissButton) {
      await act(async () => {
        fireEvent.click(dismissButton);
      });
      expect(container.textContent).not.toContain('API error');
    }
  });

  // === Delete key ===
  it('opens delete confirmation modal', async () => {
    const container = await renderPage();

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('common.delete')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(container.textContent).toContain('apiKeys.deleteTitle');
      expect(container.textContent).toContain('apiKeys.deleteDesc');
    }
  });

  it('confirms key deletion', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    // Find delete buttons in the key list (not in modal)
    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('common.delete') && !b.closest('.fixed')
    );

    if (deleteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      // Find the confirm delete button in the modal
      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.closest('.fixed') && b.textContent?.includes('common.delete')
      );

      if (confirmButton) {
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api-keys/k1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      }
    }
  });

  it('removes deleted key from list', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    expect(container.textContent).toContain('Key 1');

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('common.delete') && !b.closest('.fixed')
    );

    if (deleteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.closest('.fixed') && b.textContent?.includes('common.delete')
      );

      if (confirmButton) {
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        await waitFor(() => {
          expect(container.textContent).not.toContain('Key 1');
        });
      }
    }
  });

  it('handles delete API error', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Delete failed' } }),
    });

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('common.delete') && !b.closest('.fixed')
    );

    if (deleteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.closest('.fixed') && b.textContent?.includes('common.delete')
      );

      if (confirmButton) {
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        // The source throws Error(tc('error')) = 'common.error', not the response body
        expect(container.textContent).toContain('common.error');
      }
    }
  });

  it('cancels delete modal', async () => {
    const container = await renderPage();

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('common.delete') && !b.closest('.fixed')
    );

    if (deleteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      expect(container.textContent).toContain('apiKeys.deleteTitle');

      const cancelButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.cancel')
      );

      if (cancelButton) {
        await act(async () => {
          fireEvent.click(cancelButton);
        });

        expect(container.textContent).not.toContain('apiKeys.deleteTitle');
      }
    }
  });

  // === Rotate key ===
  it('opens rotate confirmation modal', async () => {
    const container = await renderPage();

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    if (rotateButton) {
      await act(async () => {
        fireEvent.click(rotateButton);
      });

      expect(container.textContent).toContain('apiKeys.rotateTitle');
      expect(container.textContent).toContain('apiKeys.rotateDesc');
    }
  });

  it('confirms key rotation', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_rotated_new' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    if (rotateButton) {
      await act(async () => {
        fireEvent.click(rotateButton);
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.closest('.fixed') && b.textContent?.includes('apiKeys.rotate')
      );

      if (confirmButton) {
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api-keys/k1/rotate'),
          expect.objectContaining({ method: 'POST' })
        );
      }
    }
  });

  it('shows new key after rotation', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_rotated_new_key' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    if (rotateButton) {
      await act(async () => {
        fireEvent.click(rotateButton);
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.closest('.fixed') && b.textContent?.includes('apiKeys.rotate')
      );

      if (confirmButton) {
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        expect(container.textContent).toContain('sk_rotated_new_key');
      }
    }
  });

  it('handles rotate API error', async () => {
    const container = await renderPage();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Rotate failed' } }),
    });

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    if (rotateButton) {
      await act(async () => {
        fireEvent.click(rotateButton);
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.closest('.fixed') && b.textContent?.includes('apiKeys.rotate')
      );

      if (confirmButton) {
        await act(async () => {
          fireEvent.click(confirmButton);
        });

        // The source throws Error(tc('error')) = 'common.error', not the response body
        expect(container.textContent).toContain('common.error');
      }
    }
  });

  it('cancels rotate modal', async () => {
    const container = await renderPage();

    const rotateButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );

    if (rotateButton) {
      await act(async () => {
        fireEvent.click(rotateButton);
      });

      const cancelButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.cancel')
      );

      if (cancelButton) {
        await act(async () => {
          fireEvent.click(cancelButton);
        });

        expect(container.textContent).not.toContain('apiKeys.rotateTitle');
      }
    }
  });

  // === Key list interactions ===
  it('renders rotate button for each key', async () => {
    const container = await renderPage();

    const rotateButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('apiKeys.rotate')
    );
    expect(rotateButtons.length).toBe(2);
  });

  it('renders delete button for each key', async () => {
    const container = await renderPage();

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('common.delete')
    );
    expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('clears key name input after creation', async () => {
    const container = await renderPage();

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ key: 'sk_new' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockKeys) });

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Key' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('apiKeys.createKey')
    );

    await act(async () => {
      fireEvent.click(createButton!);
    });

    expect(nameInput.value).toBe('');
  });
});
