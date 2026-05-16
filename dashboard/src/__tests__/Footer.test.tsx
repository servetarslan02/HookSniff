// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Footer from '@/components/Footer';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      github: 'GitHub',
      docs: 'Docs',
      status: 'Status',
      about: 'About',
      faq: 'FAQ',
      contact: 'Contact',
      terms: 'Terms',
      privacy: 'Privacy',
      copyright: '© 2024 HookSniff',
    };
    return map[key] || key;
  },
}));

// Mock i18n navigation Link
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

describe('Footer', () => {
  it('renders without crashing', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeTruthy();
  });

  it('renders the hook emoji', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain('🪝');
  });

  it('renders footer links', () => {
    const { container } = render(<Footer />);
    const text = container.textContent!;
    expect(text).toContain('GitHub');
    expect(text).toContain('Docs');
    expect(text).toContain('Status');
    expect(text).toContain('About');
    expect(text).toContain('FAQ');
    expect(text).toContain('Contact');
    expect(text).toContain('Terms');
    expect(text).toContain('Privacy');
  });

  it('renders copyright text', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain('© 2024 HookSniff');
  });

  it('renders as a footer element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeTruthy();
  });
});
