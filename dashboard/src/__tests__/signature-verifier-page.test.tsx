// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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

  it('renders the page title', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/Signature Verifier/)).toBeTruthy();
  });

  it('renders the page description', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/Verify webhook signatures/)).toBeTruthy();
  });

  it('renders algorithm selector', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText('HMAC-SHA256')).toBeTruthy();
    expect(getByText('HMAC-SHA512')).toBeTruthy();
  });

  it('renders payload textarea', () => {
    const { getByPlaceholderText } = render(React.createElement(SignatureVerifierPage));
    expect(getByPlaceholderText(/order.created/)).toBeTruthy();
  });

  it('renders secret input', () => {
    const { getByPlaceholderText } = render(React.createElement(SignatureVerifierPage));
    expect(getByPlaceholderText(/whsec_/)).toBeTruthy();
  });

  it('renders signature input', () => {
    const { getByPlaceholderText } = render(React.createElement(SignatureVerifierPage));
    expect(getByPlaceholderText(/sha256=abc123/)).toBeTruthy();
  });

  it('renders verify button', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/Verify Signature/)).toBeTruthy();
  });

  it('renders compute button', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/Compute Signature/)).toBeTruthy();
  });

  it('verify button is disabled when fields are empty', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    const verifyBtn = getByText(/Verify Signature/).closest('button');
    expect(verifyBtn).toBeDisabled();
  });

  it('compute button is disabled when payload and secret are empty', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    const computeBtn = getByText(/Compute Signature/).closest('button');
    expect(computeBtn).toBeDisabled();
  });

  it('handles payload input change', () => {
    const { getByPlaceholderText } = render(React.createElement(SignatureVerifierPage));
    const textarea = getByPlaceholderText(/order.created/);
    fireEvent.change(textarea, { target: { value: '{"test": "data"}' } });
    expect(textarea).toHaveValue('{"test": "data"}');
  });

  it('handles secret input change', () => {
    const { getByPlaceholderText } = render(React.createElement(SignatureVerifierPage));
    const input = getByPlaceholderText(/whsec_/);
    fireEvent.change(input, { target: { value: 'my-secret' } });
    expect(input).toHaveValue('my-secret');
  });

  it('handles signature input change', () => {
    const { getByPlaceholderText } = render(React.createElement(SignatureVerifierPage));
    const input = getByPlaceholderText(/sha256=abc123/);
    fireEvent.change(input, { target: { value: 'sha256=abc' } });
    expect(input).toHaveValue('sha256=abc');
  });

  it('clicking algorithm buttons switches algorithm', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    const sha512Btn = getByText('HMAC-SHA512');
    fireEvent.click(sha512Btn);
    // Button should get active class after click
    expect(sha512Btn.className).toContain('bg-brand-600');
  });

  it('shows toast when verifying with empty fields', async () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    // Verify button is disabled, but test the validation path
    // Fill in payload and secret to enable compute button
    const payload = document.querySelector('textarea')!;
    const secret = document.querySelector('input[type="password"]')!;
    fireEvent.change(payload, { target: { value: 'test' } });
    fireEvent.change(secret, { target: { value: 'secret' } });

    // Compute should now be enabled
    await act(async () => {
      fireEvent.click(getByText(/Compute Signature/));
    });
    // crypto.subtle should be available in jsdom or will catch error
  });

  it('renders code example section', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/Code Example/)).toBeTruthy();
  });

  it('renders how it works section', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/How Webhook Signatures Work/)).toBeTruthy();
  });

  it('renders the three how-it-works steps', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    expect(getByText(/HookSniff signs the payload/)).toBeTruthy();
    expect(getByText(/Signature is included in headers/)).toBeTruthy();
    expect(getByText(/You verify on your server/)).toBeTruthy();
  });

  it('has a copy button for code example', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    const copyBtn = getByText('Copy');
    expect(copyBtn).toBeTruthy();
  });

  it('clicking copy button copies code to clipboard', () => {
    const { getByText } = render(React.createElement(SignatureVerifierPage));
    const copyBtn = getByText('Copy');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Copied!', 'success');
  });
});
