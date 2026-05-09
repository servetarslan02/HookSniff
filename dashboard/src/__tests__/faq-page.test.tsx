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

const { default: FAQPage } = await import('@/app/[locale]/faq/page');

describe('FAQPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(FAQPage));
  });

  it('displays FAQ title', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('faqTitle');
  });

  it('displays FAQ subtitle', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('faqSubtitle');
  });

  it('renders FAQ category tabs', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('catGeneral');
    expect(container.textContent).toContain('catGettingStarted');
    expect(container.textContent).toContain('catBilling');
    expect(container.textContent).toContain('catTechnical');
    expect(container.textContent).toContain('catSecurity');
  });

  it('renders FAQ questions for default category', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('q1');
    expect(container.textContent).toContain('q2');
    expect(container.textContent).toContain('q3');
  });

  it('renders still have questions section', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('stillHaveQuestions');
    expect(container.textContent).toContain('cantFindAnswer');
    expect(container.textContent).toContain('contactSupport');
  });

  it('renders FAQ accordion buttons', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = container.querySelectorAll('button');
    // Should have category tab buttons + FAQ accordion buttons
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });
});
