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

const { default: TermsPage } = await import('@/app/[locale]/terms/page');

describe('TermsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(TermsPage));
  });

  it('displays terms title', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('terms.title');
  });

  it('displays last updated date', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('terms.lastUpdated');
  });

  it('renders acceptance of terms section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('1. Acceptance of Terms');
  });

  it('renders description of service section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('2. Description of Service');
  });

  it('renders account registration section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('3. Account Registration');
  });

  it('renders acceptable use section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('5. Acceptable Use');
  });

  it('renders service level section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('7. Service Level');
  });

  it('renders payment and billing section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('9. Payment and Billing');
  });

  it('renders limitation of liability section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('11. Limitation of Liability');
  });

  it('renders termination section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('13. Termination');
  });

  it('renders governing law section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('15. Governing Law');
  });

  it('renders contact section', () => {
    const { container } = render(React.createElement(TermsPage));
    expect(container.textContent).toContain('16. Contact');
    expect(container.textContent).toContain('legal@hooksniff.vercel.app');
  });

  it('renders all 16 terms sections', () => {
    const { container } = render(React.createElement(TermsPage));
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(16);
  });
});
