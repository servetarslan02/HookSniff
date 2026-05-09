// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

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

const { default: ContactPage } = await import('@/app/[locale]/contact/page');

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(ContactPage));
  });

  it('displays contact title', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Contact Us');
  });

  it('renders contact description', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Have a question or need help?');
  });

  it('renders email link', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('support@hooksniff.vercel.app');
  });

  it('renders contact form with inputs', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Send us a message');
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders name input', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).toBeTruthy();
  });

  it('renders email input', () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();
  });

  it('renders subject select', () => {
    const { container } = render(React.createElement(ContactPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('renders message textarea', () => {
    const { container } = render(React.createElement(ContactPage));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('renders submit button', () => {
    const { container } = render(React.createElement(ContactPage));
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
    expect(button!.textContent).toContain('sendMessage');
  });

  it('renders contact info cards', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Email');
    expect(container.textContent).toContain('Location');
    expect(container.textContent).toContain('Response Time');
  });
});
