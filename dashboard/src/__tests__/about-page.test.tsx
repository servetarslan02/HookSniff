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

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: AboutPage } = await import('@/app/[locale]/about/page');

describe('AboutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(AboutPage));
  });

  it('displays about title', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('About HookSniff');
  });

  it('displays about description', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('Reliable webhook delivery infrastructure');
  });

  it('renders mission section', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('Our Mission');
  });

  it('renders story section', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('Our Story');
  });

  it('renders feature sections with values', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('Security First');
    expect(container.textContent).toContain('Transparent Pricing');
    expect(container.textContent).toContain('Global Infrastructure');
  });

  it('renders stats section', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('99.97%');
    expect(container.textContent).toContain('<50ms');
  });

  it('renders CTA section', () => {
    const { container } = render(React.createElement(AboutPage));
    expect(container.textContent).toContain('Ready to get started?');
    expect(container.textContent).toContain('Start Free');
    expect(container.textContent).toContain('Contact Us');
  });
});
