// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();

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
}));

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

const { default: SignatureVerifierPage } = await import('@/app/[locale]/dashboard/signature-verifier/page');

describe('SignatureVerifierPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    expect(container).toBeTruthy();
  });

  it('renders the page title heading', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const h1s = container.querySelectorAll('h1');
    const titles = Array.from(h1s).map(h => h.textContent);
    expect(titles.some(t => t?.includes('Signature Verifier'))).toBe(true);
  });

  it('renders the page description', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    expect(container.textContent).toContain('Verify webhook signatures to ensure payloads are authentic');
  });

  it('renders algorithm selector buttons', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const algButtons = Array.from(buttons).filter(b => b.textContent?.includes('HMAC-SHA'));
    expect(algButtons.length).toBeGreaterThanOrEqual(2);
    expect(algButtons.some(b => b.textContent === 'HMAC-SHA256')).toBe(true);
    expect(algButtons.some(b => b.textContent === 'HMAC-SHA512')).toBe(true);
  });

  it('renders payload textarea', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea!.placeholder).toContain('order.created');
  });

  it('renders secret input', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput!.placeholder).toContain('whsec_');
  });

  it('renders signature input', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const textInputs = container.querySelectorAll('input[type="text"]');
    expect(textInputs.length).toBeGreaterThanOrEqual(1);
    expect(textInputs[0].placeholder).toContain('sha256=abc123');
  });

  it('renders verify button', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const verifyBtn = Array.from(buttons).find(b => b.textContent?.includes('Verify Signature'));
    expect(verifyBtn).toBeTruthy();
  });

  it('renders compute button', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const computeBtn = Array.from(buttons).find(b => b.textContent?.includes('Compute Signature'));
    expect(computeBtn).toBeTruthy();
  });

  it('verify button is disabled when fields are empty', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const verifyBtn = Array.from(buttons).find(b => b.textContent?.includes('Verify Signature'));
    expect(verifyBtn!.disabled).toBe(true);
  });

  it('compute button is disabled when payload and secret are empty', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const computeBtn = Array.from(buttons).find(b => b.textContent?.includes('Compute Signature'));
    expect(computeBtn!.disabled).toBe(true);
  });

  it('handles payload input change', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('{"test": "data"}');
  });

  it('handles secret input change', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const input = container.querySelector('input[type="password"]')!;
    fireEvent.change(input, { target: { value: 'my-secret' } });
    expect((input as HTMLInputElement).value).toBe('my-secret');
  });

  it('handles signature input change', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const input = container.querySelectorAll('input[type="text"]')[0];
    fireEvent.change(input, { target: { value: 'sha256=abc' } });
    expect((input as HTMLInputElement).value).toBe('sha256=abc');
  });

  it('clicking SHA512 button switches algorithm', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const sha512Btn = Array.from(buttons).find(b => b.textContent === 'HMAC-SHA512')!;
    fireEvent.click(sha512Btn);
    expect(sha512Btn.className).toContain('bg-brand-600');
  });

  it('clicking SHA256 button keeps it active', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const sha256Btn = Array.from(buttons).find(b => b.textContent === 'HMAC-SHA256')!;
    expect(sha256Btn.className).toContain('bg-brand-600');
  });

  it('renders code example section', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    expect(container.textContent).toContain('Code Example — Node.js');
  });

  it('renders how it works section', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    expect(container.textContent).toContain('How Webhook Signatures Work');
  });

  it('renders the three how-it-works steps', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    expect(container.textContent).toContain('HookSniff signs the payload');
    expect(container.textContent).toContain('Signature is included in headers');
    expect(container.textContent).toContain('You verify on your server');
  });

  it('has a copy button for code example', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const copyBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'Copy');
    expect(copyBtn).toBeTruthy();
  });

  it('clicking copy button copies code to clipboard', () => {
    const { container } = render(React.createElement(SignatureVerifierPage));
    const buttons = container.querySelectorAll('button');
    const copyBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'Copy')!;
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Copied!', 'success');
  });
});
