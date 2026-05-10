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

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || ''}`),
}));

const { default: ContactPage } = await import('@/app/[locale]/contact/page');

describe('ContactPage Ultra', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  // 1. Renders without crashing
  it('renders without crashing', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container).toBeTruthy();
  });

  // 2. Renders contact title
  it('renders contact title', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Contact Us');
  });

  // 3. Renders description text
  it('renders description text', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain("Have a question or need help? We'd love to hear from you.");
  });

  // 4. Renders email info card
  it('renders email info card', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Email');
    expect(container.textContent).toContain('support@hooksniff.vercel.app');
  });

  // 5. Renders location info card
  it('renders location info card', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Location');
    expect(container.textContent).toContain('Turkey');
  });

  // 6. Renders response time info card
  it('renders response time info card', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Response Time');
    expect(container.textContent).toContain('Usually within 24 hours');
  });

  // 7. Renders name input
  it('renders name input', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).toBeTruthy();
  });

  // 8. Renders email input
  it('renders email input', () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();
  });

  // 9. Renders subject select
  it('renders subject select', () => {
    const { container } = render(React.createElement(ContactPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  // 10. Renders message textarea
  it('renders message textarea', () => {
    const { container } = render(React.createElement(ContactPage));
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  // 11. Renders submit button
  it('renders submit button', () => {
    const { container } = render(React.createElement(ContactPage));
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
  });

  // 12. Name input has autoComplete="name"
  it('name input has autoComplete="name"', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(nameInput.getAttribute('autocomplete')).toBe('name');
  });

  // 13. Email input has autoComplete="email"
  it('email input has autoComplete="email"', () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.getAttribute('autocomplete')).toBe('email');
  });

  // 14. Submit button shows sending text when loading
  it('submit button shows sending text when loading', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

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

    const button = container.querySelector('button[type="submit"]')!;
    expect(button.textContent).toContain('sending');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  // 15. Submit button is disabled when sending
  it('submit button is disabled when sending', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

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

    const button = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  // 16. Successful submit shows success banner
  it('successful submit shows success banner', async () => {
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

    expect(container.textContent).toContain('Message sent');
  });

  // 17. Failed submit shows error banner
  it('failed submit shows error banner', async () => {
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

  // 18. Success banner contains correct text
  it('success banner contains correct text', async () => {
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

    expect(container.textContent).toContain("We'll get back to you soon");
  });

  // 19. Error banner contains email fallback
  it('error banner contains email fallback', async () => {
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

    expect(container.textContent).toContain('support@hooksniff.vercel.app');
  });

  // 20. Form clears after successful submit
  it('form clears after successful submit', async () => {
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

    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(textarea.value).toBe('');
  });

  // 21. Status resets after error
  it('status resets after error so button becomes re-enabled', async () => {
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

    const button = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain('sendMessage');
  });

  // 22. All subject options are rendered
  it('all subject options are rendered', () => {
    const { container } = render(React.createElement(ContactPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain('');
    expect(options).toContain('general');
    expect(options).toContain('technical');
    expect(options).toContain('billing');
    expect(options).toContain('enterprise');
    expect(options).toContain('bug');
    expect(options).toContain('feature');
  });

  // 23. Form has required attributes on inputs
  it('form has required attributes on inputs', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const select = container.querySelector('select') as HTMLSelectElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    expect(nameInput.required).toBe(true);
    expect(emailInput.required).toBe(true);
    expect(select.required).toBe(true);
    expect(textarea.required).toBe(true);
  });

  // 24. Navigation bar renders
  it('navigation bar renders', () => {
    const { container } = render(React.createElement(ContactPage));
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  // 25. HookSniff branding in nav
  it('HookSniff branding in nav', () => {
    const { container } = render(React.createElement(ContactPage));
    const nav = container.querySelector('nav')!;
    expect(nav.textContent).toContain('HookSniff');
  });

  // 26. LanguageSwitcher is rendered
  it('LanguageSwitcher is rendered', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('LanguageSwitcher');
  });

  // 27. Sending status shows loading text
  it('sending status shows loading text', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

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

    expect(container.textContent).toContain('sending');
    expect(container.textContent).not.toContain('sendMessage');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });
});
