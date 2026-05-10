// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}));

const { default: PortalCustomizationPage } = await import('@/app/[locale]/dashboard/portal-customize/page');

const MOCK_CONFIG = {
  primary_color: '#6366f1',
  logo_url: 'https://example.com/logo.png',
  company_name: 'TestCorp',
  font_family: 'Inter',
  dark_mode: false,
  show_events: true,
  show_deliveries: true,
  allowed_events: ['order.created', 'payment.completed'],
};

describe('PortalCustomizationPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue(MOCK_CONFIG);
  });

  // === Loading State ===
  it('shows loading skeleton initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(PortalCustomizationPage));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === Config Loading ===
  it('loads config from API on mount', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/portal/config', { token: 'test-token' });
    });
  });

  it('renders header with title and save button', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Portal Customization');
      const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Changes');
      expect(saveBtn).toBeTruthy();
    });
  });

  // === Branding Section ===
  it('renders branding section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Branding');
      expect(container.textContent).toContain('Company Name');
      expect(container.textContent).toContain('Logo URL');
      expect(container.textContent).toContain('Primary Color');
      expect(container.textContent).toContain('Font Family');
    });
  });

  it('populates company name from config', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const input = container.querySelector('input[type="text"][placeholder="My Company"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('TestCorp');
    });
  });

  it('populates logo URL from config', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const input = container.querySelector('input[type="url"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('https://example.com/logo.png');
    });
  });

  it('shows color picker with correct value', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeTruthy();
      expect(colorInput.value).toBe('#6366f1');
    });
  });

  it('shows font family select with correct value', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
      expect(select.value).toBe('Inter');
    });
  });

  it('renders all font options', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options).map(o => o.value);
      expect(options).toContain('Inter');
      expect(options).toContain('Roboto');
      expect(options).toContain('Open Sans');
      expect(options).toContain('Lato');
      expect(options).toContain('Poppins');
      expect(options).toContain('Source Code Pro');
      expect(options).toContain('JetBrains Mono');
      expect(options).toContain('system-ui');
    });
  });

  // === Features Section ===
  it('renders features section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Features');
      expect(container.textContent).toContain('Dark Mode');
      expect(container.textContent).toContain('Show Events');
      expect(container.textContent).toContain('Show Deliveries');
    });
  });

  it('shows toggle states correctly', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      // dark_mode: false, show_events: true, show_deliveries: true
      expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
      expect((checkboxes[2] as HTMLInputElement).checked).toBe(true);
    });
  });

  // === Allowed Events Section ===
  it('renders allowed events section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Allowed Events');
      expect(container.textContent).toContain('order.created');
      expect(container.textContent).toContain('payment.completed');
    });
  });

  it('adds new event on Add button click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
    const eventInput = container.querySelector('input[placeholder="order.created"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'user.deleted' } });
    });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    expect(container.textContent).toContain('user.deleted');
  });

  it('adds event on Enter key press', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
    const eventInput = container.querySelector('input[placeholder="order.created"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'invoice.sent' } });
      fireEvent.keyDown(eventInput, { key: 'Enter' });
    });
    expect(container.textContent).toContain('invoice.sent');
  });

  it('does not add empty event', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add');
    const eventsBefore = container.querySelectorAll('.font-mono.inline-flex').length;
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    const eventsAfter = container.querySelectorAll('.font-mono.inline-flex').length;
    expect(eventsAfter).toBe(eventsBefore);
  });

  it('removes event on remove button click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
    const removeBtns = container.querySelectorAll('[aria-label^="Remove"]');
    expect(removeBtns.length).toBe(2);
    await act(async () => {
      fireEvent.click(removeBtns[0]);
    });
    // The event should be removed from the allowed_events tags
    // (but may still appear in the preview section which is static)
    const allowedSection = container.querySelector('.flex.flex-wrap.gap-2');
    if (allowedSection) {
      expect(allowedSection.textContent).not.toContain('order.created');
      expect(allowedSection.textContent).toContain('payment.completed');
    }
  });

  // === Preview Section ===
  it('renders preview section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Preview');
      expect(container.textContent).toContain('Portal');
    });
  });

  it('shows company name in preview', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('TestCorp Portal');
    });
  });

  it('shows logo image in preview when URL set', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const img = container.querySelector('img[alt="Logo"]');
      expect(img).toBeTruthy();
      expect(img!.getAttribute('src')).toBe('https://example.com/logo.png');
    });
  });

  it('shows emoji when no logo URL', async () => {
    mockApiFetch.mockResolvedValue({ ...MOCK_CONFIG, logo_url: '' });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🪝');
    });
  });

  // === Embed Code Section ===
  it('renders embed code section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Embed Code');
      expect(container.textContent).toContain('iframe');
    });
  });

  it('shows copy button for embed code', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const copyBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Copy');
      expect(copyBtns.length).toBeGreaterThanOrEqual(2); // Embed + React
    });
  });

  // === React Integration Section ===
  it('renders React integration section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('React Integration');
      expect(container.textContent).toContain('HookSniffPortal');
    });
  });

  // === Save ===
  it('calls apiFetch on save', async () => {
    mockApiFetch.mockResolvedValue({});
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Changes');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Changes');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/portal/config', expect.objectContaining({
        method: 'POST',
        token: 'test-token',
      }));
      expect(mockToast).toHaveBeenCalledWith('Portal configuration saved!', 'success');
    });
  });

  it('shows saving state during save', async () => {
    // First call (fetchConfig) returns config, second call (save) hangs
    mockApiFetch
      .mockResolvedValueOnce(MOCK_CONFIG)
      .mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Changes');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Changes');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Saving...');
    });
  });

  it('shows error toast on save failure', async () => {
    // First call (fetchConfig) returns config, second call (save) fails
    mockApiFetch
      .mockResolvedValueOnce(MOCK_CONFIG)
      .mockRejectedValueOnce(new Error('Save failed'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Changes');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Changes');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
    });
  });

  // === Config with defaults ===
  it('uses defaults when API returns empty config', async () => {
    mockApiFetch.mockResolvedValue({});
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      // Should use default primary_color #6366f1
      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput.value).toBe('#6366f1');
    });
  });

  it('uses defaults when API returns null fields', async () => {
    mockApiFetch.mockResolvedValue({ primary_color: null, font_family: null });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('Inter'); // default
    });
  });

  // === Dark mode in preview ===
  it('applies dark mode class in preview when enabled', async () => {
    mockApiFetch.mockResolvedValue({ ...MOCK_CONFIG, dark_mode: true });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      const darkContent = container.querySelector('.bg-slate-900.text-white');
      expect(darkContent).toBeTruthy();
    });
  });

  // === Show/hide events and deliveries in preview ===
  it('hides events section in preview when show_events is false', async () => {
    mockApiFetch.mockResolvedValue({ ...MOCK_CONFIG, show_events: false });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).not.toContain('Event Subscriptions');
    });
  });

  it('hides deliveries section in preview when show_deliveries is false', async () => {
    mockApiFetch.mockResolvedValue({ ...MOCK_CONFIG, show_deliveries: false });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).not.toContain('Recent Deliveries');
    });
  });

  // === Input interactions ===
  it('updates company name on input change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('TestCorp');
    });
    const input = container.querySelector('input[placeholder="My Company"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'NewCorp' } });
    });
    // Preview should update
    expect(container.textContent).toContain('NewCorp Portal');
  });

  it('updates primary color on color input change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('TestCorp');
    });
    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    });
    expect(colorInput.value).toBe('#ff0000');
  });

  it('updates font family on select change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('TestCorp');
    });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'Roboto' } });
    });
    expect(select.value).toBe('Roboto');
  });

  // === No token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: null }),
    }));
    vi.doMock('next-intl', () => ({
      useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
    }));
    vi.doMock('@/i18n/navigation', () => ({
      useRouter: () => ({ push: vi.fn() }),
    }));
    vi.doMock('@/lib/api', () => ({
      apiFetch: (...args: unknown[]) => mockApiFetch(...args),
    }));
    vi.doMock('@/components/Toast', () => ({
      useToast: () => ({ toast: mockToast }),
    }));
    vi.doMock('next/image', () => ({
      default: (props: any) => React.createElement('img', props),
    }));

    const { default: PageNoToken } = await import('@/app/[locale]/dashboard/portal-customize/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // === Allowed events empty state ===
  it('shows "All events allowed" when no events configured', async () => {
    mockApiFetch.mockResolvedValue({ ...MOCK_CONFIG, allowed_events: [] });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('All events allowed');
    });
  });

  // === Duplicate event prevention ===
  it('shows error toast when adding duplicate event', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(PortalCustomizationPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
    const eventInput = container.querySelector('input[placeholder="order.created"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'order.created' } });
    });
    const addBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Add');
    await act(async () => {
      fireEvent.click(addBtn!);
    });
    expect(mockToast).toHaveBeenCalledWith('Event already added', 'error');
  });
});
