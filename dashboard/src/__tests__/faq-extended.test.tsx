// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'test@test.com', plan: 'pro' } }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: FAQPage } = await import('@/app/[locale]/faq/page');

describe('FAQPage - Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === Categories ===
  it('renders all five category tabs', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('catGeneral');
    expect(container.textContent).toContain('catGettingStarted');
    expect(container.textContent).toContain('catBilling');
    expect(container.textContent).toContain('catTechnical');
    expect(container.textContent).toContain('catSecurity');
  });

  it('renders category tab buttons', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const catButtons = buttons.filter(b =>
      b.textContent?.includes('catGeneral') ||
      b.textContent?.includes('catGettingStarted') ||
      b.textContent?.includes('catBilling') ||
      b.textContent?.includes('catTechnical') ||
      b.textContent?.includes('catSecurity')
    );
    expect(catButtons.length).toBe(5);
  });

  it('default category is catGeneral', () => {
    const { container } = render(React.createElement(FAQPage));
    // Default active category should show General questions
    expect(container.textContent).toContain('q1');
    expect(container.textContent).toContain('q2');
    expect(container.textContent).toContain('q3');
  });

  // === Category Selection ===
  it('switches to GettingStarted category on click', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const gettingStartedBtn = buttons.find(b => b.textContent?.includes('catGettingStarted'));

    act(() => {
      fireEvent.click(gettingStartedBtn!);
    });

    expect(container.textContent).toContain('q4');
    expect(container.textContent).toContain('q5');
  });

  it('switches to Billing category on click', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const billingBtn = buttons.find(b => b.textContent?.includes('catBilling'));

    act(() => {
      fireEvent.click(billingBtn!);
    });

    expect(container.textContent).toContain('q6');
    expect(container.textContent).toContain('q7');
    expect(container.textContent).toContain('q8');
  });

  it('switches to Technical category on click', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const technicalBtn = buttons.find(b => b.textContent?.includes('catTechnical'));

    act(() => {
      fireEvent.click(technicalBtn!);
    });

    expect(container.textContent).toContain('q9');
    expect(container.textContent).toContain('q10');
    expect(container.textContent).toContain('q11');
    expect(container.textContent).toContain('q12');
  });

  it('switches to Security category on click', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const securityBtn = buttons.find(b => b.textContent?.includes('catSecurity'));

    act(() => {
      fireEvent.click(securityBtn!);
    });

    expect(container.textContent).toContain('q13');
    expect(container.textContent).toContain('q14');
    expect(container.textContent).toContain('q15');
  });

  it('hides previous category questions when switching', () => {
    const { container } = render(React.createElement(FAQPage));
    // Default: catGeneral shows q1, q2, q3
    expect(container.textContent).toContain('q1');

    // Switch to Billing
    const buttons = Array.from(container.querySelectorAll('button'));
    const billingBtn = buttons.find(b => b.textContent?.includes('catBilling'));
    act(() => {
      fireEvent.click(billingBtn!);
    });

    // q1 should no longer be visible (it's filtered out)
    expect(container.textContent).not.toContain('q1');
    expect(container.textContent).toContain('q6');
  });

  // === Accordion Expand/Collapse ===
  it('accordion is collapsed by default', () => {
    const { container } = render(React.createElement(FAQPage));
    // Answer should not be visible initially (the accordion content)
    // q1 answer is 'a1' — check that the answer div is not rendered
    const answerDivs = container.querySelectorAll('.border-t');
    // No answer should be visible for any FAQ item initially
    expect(answerDivs.length).toBe(0);
  });

  it('expands accordion on click', () => {
    const { container } = render(React.createElement(FAQPage));
    // Find the first FAQ accordion button (q1)
    const buttons = Array.from(container.querySelectorAll('button'));
    const q1Button = buttons.find(b => b.textContent?.includes('q1'));
    expect(q1Button).toBeTruthy();

    act(() => {
      fireEvent.click(q1Button!);
    });

    // Answer 'a1' should now be visible
    expect(container.textContent).toContain('a1');
  });

  it('collapses accordion on second click', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const q1Button = buttons.find(b => b.textContent?.includes('q1'));

    // Open
    act(() => {
      fireEvent.click(q1Button!);
    });
    expect(container.textContent).toContain('a1');

    // Close
    act(() => {
      fireEvent.click(q1Button!);
    });
    // a1 text should no longer be in the answer area
    const answerDivs = container.querySelectorAll('.border-t');
    expect(answerDivs.length).toBe(0);
  });

  it('can open multiple accordions', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const q1Button = buttons.find(b => b.textContent?.includes('q1'));
    const q2Button = buttons.find(b => b.textContent?.includes('q2'));

    act(() => {
      fireEvent.click(q1Button!);
      fireEvent.click(q2Button!);
    });

    expect(container.textContent).toContain('a1');
    expect(container.textContent).toContain('a2');
  });

  it('accordion SVG rotates when open', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const q1Button = buttons.find(b => b.textContent?.includes('q1'));

    act(() => {
      fireEvent.click(q1Button!);
    });

    const svg = q1Button!.querySelector('svg');
    expect(svg?.classList.contains('rotate-180')).toBe(true);
  });

  it('accordion SVG does not rotate when closed', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const q1Button = buttons.find(b => b.textContent?.includes('q1'));

    const svg = q1Button!.querySelector('svg');
    expect(svg?.classList.contains('rotate-180')).toBe(false);
  });

  // === Question/Answer Display ===
  it('displays question text for each FAQ', () => {
    const { container } = render(React.createElement(FAQPage));
    // Default category is catGeneral: q1, q2, q3
    expect(container.textContent).toContain('q1');
    expect(container.textContent).toContain('q2');
    expect(container.textContent).toContain('q3');
  });

  it('displays answer text when expanded', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const q1Button = buttons.find(b => b.textContent?.includes('q1'));

    act(() => {
      fireEvent.click(q1Button!);
    });

    expect(container.textContent).toContain('a1');
  });

  // === All Categories Rendered ===
  it('renders correct number of questions for catGeneral (3)', () => {
    const { container } = render(React.createElement(FAQPage));
    // catGeneral has q1, q2, q3 — count accordion buttons (excluding category tabs)
    const buttons = Array.from(container.querySelectorAll('button'));
    const faqButtons = buttons.filter(b =>
      b.textContent?.match(/^q[0-9]+$/)
    );
    expect(faqButtons.length).toBe(3);
  });

  it('renders correct number of questions for catGettingStarted (2)', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = () => Array.from(container.querySelectorAll('button'));
    const gettingStartedBtn = buttons().find(b => b.textContent?.includes('catGettingStarted'));
    act(() => { fireEvent.click(gettingStartedBtn!); });

    const faqButtons = buttons().filter(b => b.textContent?.match(/^q[0-9]+$/));
    expect(faqButtons.length).toBe(2);
  });

  it('renders correct number of questions for catBilling (3)', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = () => Array.from(container.querySelectorAll('button'));
    const billingBtn = buttons().find(b => b.textContent?.includes('catBilling'));
    act(() => { fireEvent.click(billingBtn!); });

    const faqButtons = buttons().filter(b => b.textContent?.match(/^q[0-9]+$/));
    expect(faqButtons.length).toBe(3);
  });

  it('renders correct number of questions for catTechnical (4)', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = () => Array.from(container.querySelectorAll('button'));
    const technicalBtn = buttons().find(b => b.textContent?.includes('catTechnical'));
    act(() => { fireEvent.click(technicalBtn!); });

    const faqButtons = buttons().filter(b => b.textContent?.match(/^q[0-9]+$/));
    expect(faqButtons.length).toBe(4);
  });

  it('renders correct number of questions for catSecurity (3)', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = () => Array.from(container.querySelectorAll('button'));
    const securityBtn = buttons().find(b => b.textContent?.includes('catSecurity'));
    act(() => { fireEvent.click(securityBtn!); });

    const faqButtons = buttons().filter(b => b.textContent?.match(/^q[0-9]+$/));
    expect(faqButtons.length).toBe(3);
  });

  // === Navigation ===
  it('renders HookSniff branding', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('HookSniff');
  });

  it('renders FAQ breadcrumb', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('FAQ');
  });

  it('renders LanguageSwitcher', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('LanguageSwitcher');
  });

  // === Still Have Questions Section ===
  it('renders still have questions section', () => {
    const { container } = render(React.createElement(FAQPage));
    expect(container.textContent).toContain('stillHaveQuestions');
    expect(container.textContent).toContain('cantFindAnswer');
    expect(container.textContent).toContain('contactSupport');
  });

  it('contact support links to /contact', () => {
    const { container } = render(React.createElement(FAQPage));
    const contactLink = container.querySelector('a[href="/contact"]');
    expect(contactLink).toBeTruthy();
  });

  // === Responsive Layout ===
  it('has min-h-screen class', () => {
    const { container } = render(React.createElement(FAQPage));
    const outerDiv = container.querySelector('.min-h-screen');
    expect(outerDiv).toBeTruthy();
  });

  it('has max-w-4xl content container', () => {
    const { container } = render(React.createElement(FAQPage));
    const contentDiv = container.querySelector('.max-w-4xl');
    expect(contentDiv).toBeTruthy();
  });

  it('category tabs use flex-wrap for responsiveness', () => {
    const { container } = render(React.createElement(FAQPage));
    const flexWrap = container.querySelector('.flex-wrap');
    expect(flexWrap).toBeTruthy();
  });

  // === Accordion Styling ===
  it('accordion has border styling', () => {
    const { container } = render(React.createElement(FAQPage));
    const accordion = container.querySelector('.border.border-gray-200');
    expect(accordion).toBeTruthy();
  });

  it('accordion has rounded-sm corners', () => {
    const { container } = render(React.createElement(FAQPage));
    const accordion = container.querySelector('.rounded-xl');
    expect(accordion).toBeTruthy();
  });

  // === Multiple category switches ===
  it('can switch between all categories sequentially', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = () => Array.from(container.querySelectorAll('button'));

    // Start with catGeneral
    expect(container.textContent).toContain('q1');

    // Switch to GettingStarted
    act(() => { fireEvent.click(buttons().find(b => b.textContent?.includes('catGettingStarted'))!); });
    expect(container.textContent).toContain('q4');

    // Switch to Billing
    act(() => { fireEvent.click(buttons().find(b => b.textContent?.includes('catBilling'))!); });
    expect(container.textContent).toContain('q6');

    // Switch to Technical
    act(() => { fireEvent.click(buttons().find(b => b.textContent?.includes('catTechnical'))!); });
    expect(container.textContent).toContain('q9');

    // Switch to Security
    act(() => { fireEvent.click(buttons().find(b => b.textContent?.includes('catSecurity'))!); });
    expect(container.textContent).toContain('q13');

    // Switch back to General
    act(() => { fireEvent.click(buttons().find(b => b.textContent?.includes('catGeneral'))!); });
    expect(container.textContent).toContain('q1');
  });

  // === Active category styling ===
  it('active category button has different styling', () => {
    const { container } = render(React.createElement(FAQPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const generalBtn = buttons.find(b => b.textContent?.includes('catGeneral'));
    // The default active category should have bg-brand-600 class
    expect(generalBtn?.className).toContain('bg-brand-600');
  });
});
