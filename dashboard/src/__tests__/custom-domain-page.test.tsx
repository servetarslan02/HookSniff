// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();
const mockApiFetch = vi.fn();

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
    mockApiFetch.mockResolvedValue(MOCK_DOMAIN_RESPONSE);
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
    mockApiFetch.mockResolvedValue(MOCK_DOMAIN_RESPONSE);
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
    mockApiFetch.mockResolvedValue(MOCK_DOMAIN_RESPONSE);
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
    mockApiFetch.mockResolvedValue(MOCK_DOMAIN_RESPONSE);
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
    mockApiFetch.mockResolvedValue(MOCK_DOMAIN_RESPONSE);
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
    mockApiFetch
      .mockResolvedValueOnce(MOCK_DOMAIN_RESPONSE)
      .mockResolvedValueOnce(MOCK_VERIFY_SUCCESS);

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
    mockApiFetch
      .mockResolvedValueOnce(MOCK_DOMAIN_RESPONSE)
      .mockResolvedValueOnce(MOCK_VERIFY_FAIL);

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
    mockApiFetch.mockRejectedValue(new Error('Invalid domain'));

    const { container } = render(React.createElement(CustomDomainPage));

    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'bad-domain' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Invalid domain', 'error');
    });
  });

  it('does not add domain when input is empty', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'));
    expect(addBtn!.disabled).toBe(true);
    expect(mockApiFetch).not.toHaveBeenCalled();
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
    mockApiFetch.mockResolvedValue(MOCK_DOMAIN_RESPONSE);
    const { container } = render(React.createElement(CustomDomainPage));

    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });

    const buttons = container.querySelectorAll('button');
    const addBtn = Array.from(buttons).find(b => b.textContent?.includes('Add Domain'))!;

    await act(async () => {
      fireEvent.click(addBtn);
    });

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/custom-domains', {
        method: 'POST',
        body: { domain: 'webhooks.example.com' },
        token: 'test-token',
      });
    });
  });
});
