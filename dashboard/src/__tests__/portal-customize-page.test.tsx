// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';

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
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', props),
}));

const { default: PortalCustomizationPage } = await import('@/app/[locale]/[username]/portal-customize/page');

describe('PortalCustomizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({
      primary_color: '#6366f1',
      logo_url: '',
      company_name: 'Test Co',
      font_family: 'Inter',
      dark_mode: false,
      show_events: true,
      show_deliveries: true,
      allowed_events: [],
    });
  });

  it('renders loading state initially', async () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    render(React.createElement(PortalCustomizationPage));
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders header and save button', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getByText('🖼️ Portal Customization')).toBeTruthy();
    expect(screen.getAllByText('Save Changes').length).toBeGreaterThan(0);
  });

  it('renders branding section', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('🎨 Branding').length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue('Test Co').length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue('#6366f1').length).toBeGreaterThan(0);
  });

  it('renders features toggles', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('⚙️ Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dark Mode').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Show Events').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Show Deliveries').length).toBeGreaterThan(0);
  });

  it('renders allowed events section', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('📋 Allowed Events').length).toBeGreaterThan(0);
    expect(screen.getAllByText('All events allowed').length).toBeGreaterThan(0);
  });

  it('adds an event to allowed_events', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    const eventInputs = screen.getAllByPlaceholderText('order.created');
    const eventInput = eventInputs[eventInputs.length - 1]; // use last (loaded state)
    const addBtns = screen.getAllByText('Add');
    const addBtn = addBtns[addBtns.length - 1];

    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'order.created' } });
      fireEvent.click(addBtn);
    });

    expect(screen.getAllByText('order.created').length).toBeGreaterThan(0);
  });

  it('shows error toast when adding duplicate event', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    const eventInputs = screen.getAllByPlaceholderText('order.created');
    const eventInput = eventInputs[eventInputs.length - 1];
    const addBtns = screen.getAllByText('Add');
    const addBtn = addBtns[addBtns.length - 1];

    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'order.created' } });
      fireEvent.click(addBtn);
    });
    await act(async () => {
      fireEvent.change(eventInput, { target: { value: 'order.created' } });
      fireEvent.click(addBtn);
    });

    expect(mockToast).toHaveBeenCalledWith('Event already added', 'error');
  });

  it('renders preview section', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('👁️ Preview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Co Portal').length).toBeGreaterThan(0);
  });

  it('renders embed code section', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('📋 Embed Code').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Copy this code/).length).toBeGreaterThan(0);
  });

  it('renders React integration section', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('⚛️ React Integration').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/HookSniffPortal/).length).toBeGreaterThan(0);
  });

  it('saves configuration successfully', async () => {
    mockApiFetch.mockResolvedValue({});

    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });

    const saveBtns = screen.getAllByText('Save Changes');
    const saveBtn = saveBtns[saveBtns.length - 1];
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/portal/config', expect.objectContaining({
      method: 'POST',
      token: 'test-token',
    }));
    expect(mockToast).toHaveBeenCalledWith('Portal configuration saved!', 'success');
  });

  it('handles save error', async () => {
    mockApiFetch.mockRejectedValue(new Error('Save failed'));

    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });

    const saveBtns = screen.getAllByText('Save Changes');
    const saveBtn = saveBtns[saveBtns.length - 1];
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
  });

  it('handles font family change', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    const fontSelects = screen.getAllByDisplayValue('Inter');
    const fontSelect = fontSelects[fontSelects.length - 1];
    await act(async () => {
      fireEvent.change(fontSelect, { target: { value: 'Roboto' } });
    });
    expect(screen.getAllByDisplayValue('Roboto').length).toBeGreaterThan(0);
  });

  it('uses defaults when API returns empty config', async () => {
    mockApiFetch.mockResolvedValue({});

    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });

    expect(screen.getAllByText(/Portal Customization/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Portal/).length).toBeGreaterThan(0);
  });

  it('does not add empty event', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });

    const addBtns = screen.getAllByText('Add');
    const addBtn = addBtns[addBtns.length - 1];
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getAllByText('All events allowed').length).toBeGreaterThan(0);
  });

  it('renders font options', async () => {
    await act(async () => {
      render(React.createElement(PortalCustomizationPage));
    });
    expect(screen.getAllByText('Inter').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Roboto').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Open Sans').length).toBeGreaterThan(0);
  });
});
