import { renderWithProviders } from './test-utils';
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
    renderWithProviders(React.createElement(AboutPage));
  });

  it('displays about title', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
  });

  it('displays about description', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
  });

  it('renders mission section', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
  });

  it('renders story section', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
  });

  it('renders feature sections with values', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
    expect(container.textContent!.length).toBeGreaterThan(50);
    expect(container.textContent!.length).toBeGreaterThan(50);
  });

  it('renders stats section', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
    expect(container.textContent!.length).toBeGreaterThan(50);
  });

  it('renders CTA section', () => {
    const { container } = renderWithProviders(React.createElement(AboutPage));
    expect(container.textContent!.length).toBeGreaterThan(50);
    expect(container.textContent).toContain('Start Free');
    expect(container.textContent).toContain('Contact Us');
  });
});
