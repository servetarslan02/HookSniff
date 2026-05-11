// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const { default: SdksPage } = await import('@/app/[locale]/docs/sdk-libraries/page');

describe('SdksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(SdksPage));
  });

  it('displays SDKs title', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('docs.sdks');
  });

  it('renders Python SDK section', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('Python SDK');
    expect(container.textContent).toContain('pip install hooksniff');
    expect(container.textContent).toContain('import hooksniff');
  });

  it('renders Node.js SDK section', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('Node.js SDK');
    expect(container.textContent).toContain('npm install hooksniff-sdk');
    expect(container.textContent).toContain("import { HookSniff } from 'hooksniff-sdk'");
  });

  it('renders Python SDK quick start code', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('docs.quickStartSdk');
    expect(container.textContent).toContain('hooksniff.Client');
    expect(container.textContent).toContain('client.endpoints.create');
    expect(container.textContent).toContain('client.webhooks.send');
  });

  it('renders Python signature verification', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('docs.verifySignatures');
    expect(container.textContent).toContain('hooksniff.verify_signature');
  });

  it('renders Python error handling', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('docs.errorHandling');
    expect(container.textContent).toContain('hooksniff.RateLimitError');
    expect(container.textContent).toContain('hooksniff.AuthenticationError');
  });

  it('renders Node.js signature verification', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('verifySignature');
    expect(container.textContent).toContain('express');
  });

  it('renders TypeScript support section', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('docs.typescriptSupport');
    expect(container.textContent).toContain('Endpoint');
    expect(container.textContent).toContain('Delivery');
    expect(container.textContent).toContain('WebhookEvent');
  });

  it('renders community SDKs section', () => {
    const { container } = render(React.createElement(SdksPage));
    expect(container.textContent).toContain('docs.communitySdks');
    expect(container.textContent).toContain('Go');
    expect(container.textContent).toContain('Ruby');
    expect(container.textContent).toContain('PHP');
    expect(container.textContent).toContain('Rust');
  });

  it('renders code blocks', () => {
    const { container } = render(React.createElement(SdksPage));
    const codeBlocks = container.querySelectorAll('pre');
    expect(codeBlocks.length).toBeGreaterThanOrEqual(6);
  });
});
