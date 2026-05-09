// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

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
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
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

  it('submits form successfully', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const select = container.querySelector('select') as HTMLSelectElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(select, { target: { value: 'general' } });
      fireEvent.change(textarea, { target: { value: 'Hello there' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/contact'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John', email: 'john@test.com', subject: 'general', message: 'Hello there' }),
      })
    );
  });

  it('shows success state after submission', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Hello' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain("Message sent");
  });

  it('shows error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Hello' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('Failed to send');
  });

  it('shows error state on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Hello' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('Failed to send');
  });
});
