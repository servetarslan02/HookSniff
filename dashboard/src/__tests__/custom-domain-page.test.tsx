// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();
const mockApiFetch = vi.fn();

// Realistic translation mock — returns actual English text so assertions work
const TRANSLATIONS: Record<string, string> = {
  'customDomain.title': '🌐 Custom Domain',
  'customDomain.subtitle': 'Use your own domain for the webhook portal. White-label your customers\' experience.',
  'customDomain.addDomain': 'Add Domain',
  'customDomain.placeholder': 'webhooks.yourcompany.com',
  'customDomain.addDomainBtn': 'Add Domain',
  'customDomain.dnsRecords': 'DNS Records',
  'customDomain.dnsRecordsDesc': 'Add these records to your DNS provider (Cloudflare, Route53, etc.)',
  'customDomain.colType': 'Type',
  'customDomain.colName': 'Name',
  'customDomain.colValue': 'Value',
  'customDomain.colCopy': 'Copy',
  'customDomain.copy': '📋 Copy',
  'customDomain.domainAdded': 'Domain added! Add the DNS records below.',
  'customDomain.failedToAdd': 'Could not add the domain. Please check the domain name and try again.',
  'customDomain.verifying': 'Verifying…',
  'customDomain.adding': 'Adding…',
  'customDomain.verifyDomain': '✓ Verify Domain',
  'customDomain.verified': 'Verified! SSL provisioning…',
  'customDomain.verificationFailedCheck': 'Verification failed — check DNS records',
  'customDomain.copied': 'Copied!',
  'customDomain.domainVerified': 'Domain verified!',
  'customDomain.verificationFailed': 'Verification failed',
  'customDomain.verificationFailedPrefix': 'Verification failed:',
  'customDomain.howItWorks': 'How it works',
  'customDomain.step1Title': 'Add your domain',
  'customDomain.step1Desc': 'Enter the domain you want to use (e.g., webhooks.yourcompany.com)',
  'customDomain.step2Title': 'Add DNS records',
  'customDomain.step2Desc': 'We\'ll give you CNAME and TXT records to add to your DNS provider',
  'customDomain.step3Title': 'Verify & go live',
  'customDomain.step3Desc': 'We verify ownership and automatically provision an SSL certificate',
  'customDomain.existingDomains': 'Your Domains',
  'customDomain.domainDeleted': 'Domain removed',
  'customDomain.failedToDelete': 'Failed to delete domain',
  'customDomain.delete': 'Remove',
  'customDomain.pending': 'Pending',
  'customDomain.invalidDomain': 'Please enter a valid domain (e.g., hooks.example.com)',
  'customDomain.confirmDelete': 'Confirm',
  'customDomain.cancel': 'Cancel',
  'customDomain.dnsPropagationHint': 'DNS changes can take 5–30 minutes to propagate. Wait before verifying.',
  'customDomain.sslActive': 'SSL Active',
  'customDomain.loadError': 'Could not load your domains',
  'customDomain.retry': 'Retry',
  'customDomain.noDomains': 'No domains yet',
  'customDomain.noDomainsDesc': 'Add a custom domain to white-label your webhook portal.',
};

vi.mock('next-intl', () => ({
  useTranslations: (_ns?: string) => (key: string) => {
    const fullKey = _ns ? `${_ns}.${key}` : key;
    return TRANSLATIONS[fullKey] ?? fullKey;
  },
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

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
  },
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

const { default: CustomDomainPage } = await import('@/app/[locale]/(dashboard)/custom-domain/page');

const MOCK_DOMAIN_RESPONSE = {
  id: 'dom_123',
  domain: 'webhooks.example.com',
  cname_target: 'custom.hooksniff.com',
  txt_record: 'hooksniff-verify=abc123',
  instructions: {},
};

const MOCK_VERIFY_SUCCESS = {
  verified: true,
  message: 'Domain verified successfully!',
};

const MOCK_VERIFY_FAIL = {
  verified: false,
  issues: ['CNAME record not found', 'TXT record mismatch'],
  hint: 'Check your DNS settings',
};

describe('CustomDomainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: apiFetch for GET /custom-domains returns empty list
    mockApiFetch.mockImplementation((path: string) => {
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });
  });

  it('renders without crashing', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container).toBeTruthy();
  });

  it('renders the page title', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const h1s = container.querySelectorAll('h1');
    expect(Array.from(h1s).some(h => h.textContent?.includes('Custom Domain'))).toBe(true);
  });

  it('renders the page description', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('Use your own domain for the webhook portal');
  });

  it('renders the domain input', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input!.placeholder).toContain('webhooks.yourcompany.com');
  });

  it('renders add domain button', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'));
    expect(addBtn).toBeTruthy();
  });

  it('add domain button is disabled when input is empty', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'));
    expect(addBtn!.disabled).toBe(true);
  });

  it('handles domain input change', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    expect((input as HTMLInputElement).value).toBe('webhooks.example.com');
  });

  it('sanitizes domain input to lowercase', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'WebHooks.Example.COM' } });
    expect((input as HTMLInputElement).value).toBe('webhooks.example.com');
  });

  it('strips invalid characters from domain input', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'web hooks@exa!mple.com' } });
    expect((input as HTMLInputElement).value).toBe('webhooksexample.com');
  });

  it('adds domain successfully', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/custom-domains', expect.objectContaining({
        method: 'POST',
        body: { domain: 'webhooks.example.com' },
        token: 'test-token',
      }));
      expect(mockToast).toHaveBeenCalledWith('Domain added! Add the DNS records below.', 'success');
    });
  });

  it('shows DNS records after adding domain', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('DNS Records');
      expect(container.textContent).toContain('CNAME');
      expect(container.textContent).toContain('TXT');
    });
  });

  it('displays CNAME record correctly', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('custom.hooksniff.com');
    });
  });

  it('displays TXT record correctly', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('hooksniff-verify=abc123');
      expect(container.textContent).toContain('_hooksniff.webhooks.example.com');
    });
  });

  it('shows verify button after adding domain', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      const allButtons = container.querySelectorAll('button');
      const verifyBtn = Array.from(allButtons).find(b => b.textContent?.includes('Verify Domain'));
      expect(verifyBtn).toBeTruthy();
    });
  });

  it('verifies domain successfully', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      if (path.includes('/verify')) return Promise.resolve(MOCK_VERIFY_SUCCESS);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      const allButtons = container.querySelectorAll('button');
      const verifyBtn = Array.from(allButtons).find(b => b.textContent?.includes('Verify Domain'));
      expect(verifyBtn).toBeTruthy();
    });

    const allButtons = container.querySelectorAll('button');
    const verifyBtn = Array.from(allButtons).find(b => b.textContent?.includes('Verify Domain'))!;

    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Verified!');
      expect(mockToast).toHaveBeenCalledWith('Domain verified successfully!', 'success');
    });
  });

  it('shows error when verification fails', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      if (path.includes('/verify')) return Promise.resolve(MOCK_VERIFY_FAIL);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      const allButtons = container.querySelectorAll('button');
      const verifyBtn = Array.from(allButtons).find(b => b.textContent?.includes('Verify Domain'));
      expect(verifyBtn).toBeTruthy();
    });

    const allButtons = container.querySelectorAll('button');
    const verifyBtn = Array.from(allButtons).find(b => b.textContent?.includes('Verify Domain'))!;

    await act(async () => {
      fireEvent.click(verifyBtn);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Verification failed');
    });
  });

  it('handles add domain API error', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.reject(new Error('Domain already registered'));
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'duplicate.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Domain already registered', 'error');
    });
  });

  it('does not add domain when input is empty', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'));
    expect(addBtn!.disabled).toBe(true);
    expect(mockApiFetch).not.toHaveBeenCalledWith('/custom-domains', expect.objectContaining({ method: 'POST' }));
  });

  it('renders how it works section', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('How it works');
  });

  it('renders all three how-it-works steps', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('Add your domain');
    expect(container.textContent).toContain('Add DNS records');
    expect(container.textContent).toContain('Verify & go live');
  });

  it('sends correct API request when adding domain', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains' && opts?.method === 'POST') return Promise.resolve(MOCK_DOMAIN_RESPONSE);
      if (path === '/custom-domains') return Promise.resolve([]);
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/custom-domains', expect.objectContaining({
        method: 'POST',
        body: { domain: 'webhooks.example.com' },
        token: 'test-token',
      }));
    });
  });

  it('shows empty state when no domains exist', async () => {
    mockApiFetch.mockResolvedValue([]);
    const { container } = render(React.createElement(CustomDomainPage));

    await waitFor(() => {
      expect(container.textContent).toContain('No domains yet');
    });
  });

  it('shows loading error with retry button on fetch failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(CustomDomainPage));

    await waitFor(() => {
      expect(container.textContent).toContain('Could not load your domains');
      const retryBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Retry'));
      expect(retryBtn).toBeTruthy();
    });
  });

  it('renders existing domains list', async () => {
    mockApiFetch.mockResolvedValue([
      {
        id: 'dom_1',
        domain: 'hooks.example.com',
        verified: true,
        ssl_active: true,
        cname_target: 'cname.vercel-dns.com',
        txt_record: 'hooksniff-verify=abc',
        verified_at: '2026-05-19T10:00:00Z',
        created_at: '2026-05-19T09:00:00Z',
      },
    ]);

    const { container } = render(React.createElement(CustomDomainPage));

    await waitFor(() => {
      expect(container.textContent).toContain('hooks.example.com');
      expect(container.textContent).toContain('SSL');
    });
  });

  it('shows pending status for unverified domains', async () => {
    mockApiFetch.mockResolvedValue([
      {
        id: 'dom_2',
        domain: 'pending.example.com',
        verified: false,
        ssl_active: false,
        cname_target: 'cname.vercel-dns.com',
        txt_record: 'hooksniff-verify=xyz',
        verified_at: null,
        created_at: '2026-05-19T09:00:00Z',
      },
    ]);

    const { container } = render(React.createElement(CustomDomainPage));

    await waitFor(() => {
      expect(container.textContent).toContain('pending.example.com');
      expect(container.textContent).toContain('Pending');
      // Should show DNS records for unverified domains
      expect(container.textContent).toContain('cname.vercel-dns.com');
    });
  });

  it('shows delete confirmation', async () => {
    mockApiFetch.mockResolvedValue([
      {
        id: 'dom_1',
        domain: 'delete-me.example.com',
        verified: false,
        ssl_active: false,
        cname_target: 'cname.vercel-dns.com',
        txt_record: 'hooksniff-verify=abc',
        verified_at: null,
        created_at: '2026-05-19T09:00:00Z',
      },
    ]);

    const { container } = render(React.createElement(CustomDomainPage));

    await waitFor(() => {
      expect(container.textContent).toContain('delete-me.example.com');
    });

    const removeBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Remove'));
    expect(removeBtn).toBeTruthy();

    await act(async () => {
      fireEvent.click(removeBtn!);
    });

    // Should show confirm/cancel buttons
    expect(container.textContent).toContain('Confirm');
    expect(container.textContent).toContain('Cancel');
  });

  it('deletes domain successfully', async () => {
    mockApiFetch.mockImplementation((path: string, opts?: any) => {
      if (path === '/custom-domains') return Promise.resolve([
        {
          id: 'dom_1',
          domain: 'delete-me.example.com',
          verified: false,
          ssl_active: false,
          cname_target: 'cname.vercel-dns.com',
          txt_record: 'hooksniff-verify=abc',
          verified_at: null,
          created_at: '2026-05-19T09:00:00Z',
        },
      ]);
      if (path === '/custom-domains/dom_1' && opts?.method === 'DELETE') return Promise.resolve({ deleted: true });
      return Promise.reject(new Error('Unhandled: ' + path));
    });

    const { container } = render(React.createElement(CustomDomainPage));

    await waitFor(() => {
      expect(container.textContent).toContain('delete-me.example.com');
    });

    const removeBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Remove'));

    await act(async () => {
      fireEvent.click(removeBtn!);
    });

    const confirmBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Confirm'));

    await act(async () => {
      fireEvent.click(confirmBtn!);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Domain removed', 'success');
    });
  });
});
