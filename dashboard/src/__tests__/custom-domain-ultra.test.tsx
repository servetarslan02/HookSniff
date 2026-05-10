// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: CustomDomainPage } = await import('@/app/[locale]/dashboard/custom-domain/page');

describe('CustomDomainPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === Page Header ===
  it('renders page header with emoji', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('🌐');
    expect(container.textContent).toContain('Custom Domain');
  });

  it('renders description text', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('Use your own domain');
    expect(container.textContent).toContain('White-label');
  });

  // === Add Domain Section ===
  it('renders add domain section', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('Add Domain');
  });

  it('renders domain input', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('placeholder')).toBe('webhooks.yourcompany.com');
  });

  it('renders Add Domain button', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    expect(btn).toBeTruthy();
  });

  it('disables Add Domain button when input empty', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    expect(btn).toHaveProperty('disabled', true);
  });

  it('enables Add Domain button when domain entered', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    expect(btn!.disabled).toBe(false);
  });

  // === Domain Input Sanitization ===
  it('converts domain to lowercase', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'WEBHOOKS.Example.COM' } });
    expect(input.value).toBe('webhooks.example.com');
  });

  it('strips invalid characters from domain', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'web hooks@exa!mple.com' } });
    expect(input.value).toBe('webhooksexample.com');
  });

  it('allows dots and hyphens in domain', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'my-webhooks.example-site.com' } });
    expect(input.value).toBe('my-webhooks.example-site.com');
  });

  // === Add Domain API ===
  it('calls apiFetch on add domain', async () => {
    mockApiFetch.mockResolvedValue({
      id: 'dom_123',
      domain: 'webhooks.example.com',
      cname_target: 'cname.hooksniff.dev',
      txt_record: 'hs-verify-abc123',
    });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/custom-domains', expect.objectContaining({
        method: 'POST',
        body: { domain: 'webhooks.example.com' },
        token: 'test-token',
      }));
    });
  });

  it('shows DNS records after adding domain', async () => {
    mockApiFetch.mockResolvedValue({
      id: 'dom_123',
      domain: 'webhooks.example.com',
      cname_target: 'cname.hooksniff.dev',
      txt_record: 'hs-verify-abc123',
    });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('DNS Records');
      expect(container.textContent).toContain('CNAME');
      expect(container.textContent).toContain('cname.hooksniff.dev');
      expect(container.textContent).toContain('TXT');
      expect(container.textContent).toContain('hs-verify-abc123');
    });
  });

  it('shows success toast after adding domain', async () => {
    mockApiFetch.mockResolvedValue({
      id: 'dom_123',
      domain: 'webhooks.example.com',
      cname_target: 'cname.hooksniff.dev',
      txt_record: 'hs-verify-abc123',
    });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Domain added! Add the DNS records below.', 'success');
    });
  });

  it('shows error toast on add domain failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Domain already exists'));
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Domain already exists', 'error');
    });
  });

  // === DNS Records Table ===
  it('renders DNS table headers', async () => {
    mockApiFetch.mockResolvedValue({
      id: 'dom_123',
      cname_target: 'cname.hooksniff.dev',
      txt_record: 'hs-verify-abc123',
    });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      const headers = container.querySelectorAll('th');
      const texts = Array.from(headers).map(h => h.textContent);
      expect(texts).toContain('Type');
      expect(texts).toContain('Name');
      expect(texts).toContain('Value');
      expect(texts).toContain('Copy');
    });
  });

  it('renders copy buttons for DNS records', async () => {
    mockApiFetch.mockResolvedValue({
      id: 'dom_123',
      cname_target: 'cname.hooksniff.dev',
      txt_record: 'hs-verify-abc123',
    });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      const copyBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent?.includes('Copy'));
      expect(copyBtns.length).toBe(2); // CNAME + TXT
    });
  });

  // === Verify ===
  it('renders verify button after adding domain', async () => {
    mockApiFetch.mockResolvedValue({
      id: 'dom_123',
      cname_target: 'cname.hooksniff.dev',
      txt_record: 'hs-verify-abc123',
    });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    await waitFor(() => {
      const verifyBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Verify Domain'));
      expect(verifyBtn).toBeTruthy();
    });
  });

  it('calls verify API on verify click', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ id: 'dom_123', cname_target: 'cname.hooksniff.dev', txt_record: 'hs-verify-abc123' })
      .mockResolvedValueOnce({ verified: true, message: 'Domain verified!' });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Verify Domain');
    });
    const verifyBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Verify Domain'));
    await act(async () => {
      fireEvent.click(verifyBtn!);
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/custom-domains/dom_123/verify', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('shows verified status on success', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ id: 'dom_123', cname_target: 'cname.hooksniff.dev', txt_record: 'hs-verify-abc123' })
      .mockResolvedValueOnce({ verified: true, message: 'Domain verified!' });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Verify Domain');
    });
    const verifyBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Verify Domain'));
    await act(async () => {
      fireEvent.click(verifyBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Verified');
      expect(mockToast).toHaveBeenCalledWith('Domain verified!', 'success');
    });
  });

  it('shows error status on verification failure', async () => {
    mockApiFetch
      .mockResolvedValueOnce({ id: 'dom_123', cname_target: 'cname.hooksniff.dev', txt_record: 'hs-verify-abc123' })
      .mockResolvedValueOnce({ verified: false, issues: ['CNAME not found', 'TXT record mismatch'] });
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Verify Domain');
    });
    const verifyBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Verify Domain'));
    await act(async () => {
      fireEvent.click(verifyBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Verification failed');
      expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('CNAME not found'), 'error');
    });
  });

  // === How It Works ===
  it('renders how it works section', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('How it works');
    expect(container.textContent).toContain('Add your domain');
    expect(container.textContent).toContain('Add DNS records');
    expect(container.textContent).toContain('Verify & go live');
  });

  it('renders step numbers', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('3');
  });

  // === No DNS records initially ===
  it('does not show DNS records section initially', () => {
    const { container } = render(React.createElement(CustomDomainPage));
    expect(container.textContent).not.toContain('DNS Records');
  });

  // === Saving state ===
  it('shows saving state during add domain', async () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(CustomDomainPage));
    const input = container.querySelector('input[type="text"]')!;
    fireEvent.change(input, { target: { value: 'webhooks.example.com' } });
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add Domain');
    await act(async () => {
      fireEvent.click(btn!);
    });
    // Button should be disabled during save
    expect(btn!.disabled).toBe(true);
  });
});
