// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: ContactPage } = await import('@/app/[locale]/contact/page');

describe('ContactPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  // === Form input interactions ===
  it('updates name field on change', async () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Servet' } });
    });
    expect(nameInput.value).toBe('Servet');
  });

  it('updates email field on change', async () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'servet@test.com' } });
    });
    expect(emailInput.value).toBe('servet@test.com');
  });

  it('updates subject select on change', async () => {
    const { container } = render(React.createElement(ContactPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'technical' } });
    });
    expect(select.value).toBe('technical');
  });

  it('updates message textarea on change', async () => {
    const { container } = render(React.createElement(ContactPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'I need help with webhooks' } });
    });
    expect(textarea.value).toBe('I need help with webhooks');
  });

  // === Subject options ===
  it('renders all subject options', () => {
    const { container } = render(React.createElement(ContactPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('');
    expect(options).toContain('general');
    expect(options).toContain('technical');
    expect(options).toContain('billing');
    expect(options).toContain('enterprise');
    expect(options).toContain('bug');
    expect(options).toContain('feature');
  });

  // === Sending state ===
  it('shows sending text while submitting', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Hello' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('sending');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('disables submit button while sending', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Hello' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  // === Form reset after success ===
  it('resets form state after successful submission', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Help me' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    // Status changes to 'sent', success message should show
    await waitFor(() => {
      expect(container.textContent).toContain('sent');
    });
  });

  // === API URL construction ===
  it('sends POST to correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(ContactPage));

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      fireEvent.change(textarea, { target: { value: 'Hello' } });
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/contact'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // === Nav elements ===
  it('renders breadcrumb navigation', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('HookSniff');
    expect(container.textContent).toContain('Contact');
  });

  it('renders back to home link', () => {
    const { container } = render(React.createElement(ContactPage));
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).toBeTruthy();
  });

  // === Autocomplete attributes ===
  it('name input has autocomplete name', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(nameInput.autocomplete).toBe('name');
  });

  it('email input has autocomplete email', () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.autocomplete).toBe('email');
  });

  // === Required fields ===
  it('name input is required', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(nameInput.required).toBe(true);
  });

  it('email input is required', () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it('textarea is required', () => {
    const { container } = render(React.createElement(ContactPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.required).toBe(true);
  });

  it('select is required', () => {
    const { container } = render(React.createElement(ContactPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.required).toBe(true);
  });

  // === Contact info ===
  it('renders email address', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('support@hooksniff.vercel.app');
  });

  it('renders Turkey location', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('Turkey');
  });

  it('renders response time info', () => {
    const { container } = render(React.createElement(ContactPage));
    expect(container.textContent).toContain('24 hours');
  });

  // === Placeholder texts ===
  it('name input has placeholder', () => {
    const { container } = render(React.createElement(ContactPage));
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(nameInput.placeholder).toBeTruthy();
  });

  it('email input has placeholder', () => {
    const { container } = render(React.createElement(ContactPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.placeholder).toBeTruthy();
  });

  it('textarea has placeholder', () => {
    const { container } = render(React.createElement(ContactPage));
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBeTruthy();
  });

  // === Select with all options filled ===
  it('submits with all subject options', async () => {
    for (const subject of ['general', 'technical', 'billing', 'enterprise', 'bug', 'feature']) {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      const { container } = render(React.createElement(ContactPage));

      const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const select = container.querySelector('select') as HTMLSelectElement;
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(select, { target: { value: subject } });
        fireEvent.change(textarea, { target: { value: 'Hello' } });
      });

      const form = container.querySelector('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/contact'),
        expect.objectContaining({
          body: JSON.stringify({ name: 'Test', email: 'test@test.com', subject, message: 'Hello' }),
        })
      );
    }
  });
});
