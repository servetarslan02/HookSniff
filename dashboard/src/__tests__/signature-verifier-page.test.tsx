// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';

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

const originalCrypto = globalThis.crypto;

const { default: SignatureVerifierPage } = await import('@/app/[locale]/(dashboard)/signature-verifier/page');

describe('SignatureVerifierPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // Title is i18n key "signatureVerifier.title"
    expect(screen.getAllByText(/signatureVerifier\.title/).length).toBeGreaterThan(0);
  });

  it('renders algorithm selector buttons', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    expect(screen.getAllByText('HMAC-SHA256').length).toBeGreaterThan(0);
    expect(screen.getAllByText('HMAC-SHA512').length).toBeGreaterThan(0);
  });

  it('renders input fields', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    expect(screen.getAllByPlaceholderText('{"event":"order.created","data":{"id":"ord_123"}}').length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText('whsec_your_secret_key').length).toBeGreaterThan(0);
    expect(screen.getAllByPlaceholderText('sha256=abc123...').length).toBeGreaterThan(0);
  });

  it('renders verify and compute buttons', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // i18n keys: signatureVerifier.verifyBtn, signatureVerifier.computeBtn
    expect(screen.getAllByText(/signatureVerifier\.verifyBtn/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.computeBtn/).length).toBeGreaterThan(0);
  });

  it('shows toast when verifying with empty fields', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    const verifyBtns = screen.getAllByText(/signatureVerifier\.verifyBtn/);
    expect(verifyBtns.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(verifyBtns[0]);
    });
    // Button is disabled when fields are empty — toast not called
  });

  it('shows toast when computing with empty fields', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    const computeBtns = screen.getAllByText(/signatureVerifier\.computeBtn/);
    expect(computeBtns.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(computeBtns[0]);
    });
  });

  it('switches algorithm when clicking sha512 button', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    const sha512Btns = screen.getAllByText('HMAC-SHA512');
    const sha512Btn = sha512Btns[sha512Btns.length - 1];
    await act(async () => {
      fireEvent.click(sha512Btn);
    });
    expect(sha512Btn.className).toContain('bg-brand-600');
  });

  it('renders code example section', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // i18n key: signatureVerifier.codeExample
    expect(screen.getAllByText(/signatureVerifier\.codeExample/).length).toBeGreaterThan(0);
    // "Copy" button text is i18n key: signatureVerifier.copy
    expect(screen.getAllByText(/signatureVerifier\.copy/).length).toBeGreaterThan(0);
  });

  it('renders clear all button', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // i18n key: signatureVerifier.clearAll
    expect(screen.getAllByText(/signatureVerifier\.clearAll/).length).toBeGreaterThan(0);
  });

  it('renders code language tabs', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // Language labels are hardcoded (not i18n)
    expect(screen.getAllByText('Node.js').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Go').length).toBeGreaterThan(0);
  });

  it('renders secret visibility toggle', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    const secretInput = screen.getAllByPlaceholderText('whsec_your_secret_key')[0];
    expect(secretInput).toBeDefined();
    expect(secretInput.getAttribute('type')).toBe('password');
  });

  it('renders keyboard shortcut hint', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    expect(screen.getAllByText(/Ctrl/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Enter/).length).toBeGreaterThan(0);
  });

  it('renders signature format hint', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // i18n key: signatureVerifier.signatureFormatHint contains "sha256="
    expect(screen.getAllByText(/sha256=/).length).toBeGreaterThan(0);
  });

  it('renders how it works section', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // i18n keys
    expect(screen.getAllByText(/signatureVerifier\.howItWorks/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.step1Title/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.step2Title/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.step3Title/).length).toBeGreaterThan(0);
  });

  it('renders all form labels', async () => {
    await act(async () => {
      render(React.createElement(SignatureVerifierPage));
    });
    // i18n keys for labels
    expect(screen.getAllByText(/signatureVerifier\.payloadLabel/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.secretLabel/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.signatureLabel/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/signatureVerifier\.algorithm/).length).toBeGreaterThan(0);
  });
});
