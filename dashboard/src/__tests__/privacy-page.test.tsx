// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

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

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: PrivacyPage } = await import('@/app/[locale]/privacy/page');

describe('PrivacyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(PrivacyPage));
  });

  it('displays privacy policy title', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('privacy.title');
  });

  it('displays last updated date', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('privacy.lastUpdated');
  });

  it('renders introduction section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('1. Introduction');
  });

  it('renders information we collect section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('2. Information We Collect');
  });

  it('renders how we use your information section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('3. How We Use Your Information');
  });

  it('renders webhook payloads section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('4. Webhook Payloads');
  });

  it('renders data sharing section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('5. Data Sharing');
  });

  it('renders data security section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('6. Data Security');
  });

  it('renders data retention section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('7. Data Retention');
  });

  it('renders your rights section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('8. Your Rights');
  });

  it('renders contact section', () => {
    const { container } = render(React.createElement(PrivacyPage));
    expect(container.textContent).toContain('13. Contact');
    expect(container.textContent).toContain('privacy@hooksniff.vercel.app');
  });

  it('renders all 13 policy sections', () => {
    const { container } = render(React.createElement(PrivacyPage));
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(13);
  });
});
