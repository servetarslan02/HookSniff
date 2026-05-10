// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
  },
  endpointsApi: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({}),
  },
  portalApi: {
    get: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}));

import PortalCustomizationPage from '@/app/[locale]/dashboard/portal-customize/page';

describe('PortalCustomizationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({});
  });

  it('renders loading state initially', async () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<PortalCustomizationPage />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders page header after loading', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Portal Customization/)).toBeTruthy();
    });
  });

  it('shows description text', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Customize the look and feel/)).toBeTruthy();
    });
  });

  it('renders save button', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText('Save Changes')).toBeTruthy();
    });
  });

  it('renders branding section', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Branding/)).toBeTruthy();
    });
  });

  it('renders company name input', async () => {
    const { getByPlaceholderText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('My Company')).toBeTruthy();
    });
  });

  it('renders logo URL input', async () => {
    const { getByPlaceholderText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('https://example.com/logo.png')).toBeTruthy();
    });
  });

  it('renders primary color picker', async () => {
    const { container } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      const colorInput = container.querySelector('input[type="color"]');
      expect(colorInput).toBeTruthy();
    });
  });

  it('renders font family selector', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText('Inter')).toBeTruthy();
    });
  });

  it('renders features section with toggles', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Features/)).toBeTruthy();
      expect(getByText('Dark Mode')).toBeTruthy();
      expect(getByText('Show Events')).toBeTruthy();
      expect(getByText('Show Deliveries')).toBeTruthy();
    });
  });

  it('renders allowed events section', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Allowed Events/)).toBeTruthy();
      expect(getByText(/Leave empty to show all events/)).toBeTruthy();
    });
  });

  it('renders event input with add button', async () => {
    const { getByPlaceholderText, getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('order.created')).toBeTruthy();
      expect(getByText('Add')).toBeTruthy();
    });
  });

  it('adds an event when clicking Add', async () => {
    const { getByPlaceholderText, getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('order.created')).toBeTruthy();
    });
    fireEvent.change(getByPlaceholderText('order.created'), { target: { value: 'order.created' } });
    fireEvent.click(getByText('Add'));
    await waitFor(() => {
      expect(getByText('order.created')).toBeTruthy();
    });
  });

  it('adds event on Enter key press', async () => {
    const { getByPlaceholderText, getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('order.created')).toBeTruthy();
    });
    const input = getByPlaceholderText('order.created');
    fireEvent.change(input, { target: { value: 'payment.completed' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(getByText('payment.completed')).toBeTruthy();
    });
  });

  it('removes an event when clicking remove button', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('order.created')).toBeTruthy();
    });
    fireEvent.change(getByPlaceholderText('order.created'), { target: { value: 'test.event' } });
    fireEvent.click(getByText('Add'));
    await waitFor(() => {
      expect(getByText('test.event')).toBeTruthy();
    });
    const removeBtn = document.querySelector('[aria-label="Remove test.event event"]');
    expect(removeBtn).toBeTruthy();
    fireEvent.click(removeBtn!);
    await waitFor(() => {
      expect(queryByText('test.event')).toBeNull();
    });
  });

  it('shows "All events allowed" when no events are added', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText('All events allowed')).toBeTruthy();
    });
  });

  it('renders preview section', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Preview/)).toBeTruthy();
    });
  });

  it('renders embed code section', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/Embed Code/)).toBeTruthy();
    });
  });

  it('renders react integration section', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText(/React Integration/)).toBeTruthy();
    });
  });

  it('calls apiFetch on save and shows success toast', async () => {
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText('Save Changes')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.click(getByText('Save Changes'));
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/portal/config', expect.objectContaining({
        method: 'POST',
        token: 'test-token',
      }));
      expect(mockToast).toHaveBeenCalledWith('Portal configuration saved!', 'success');
    });
  });

  it('shows error toast on save failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Save failed'));
    const { getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText('Save Changes')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.click(getByText('Save Changes'));
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
    });
  });

  it('populates config from fetched data', async () => {
    mockApiFetch.mockResolvedValue({
      primary_color: '#ff0000',
      company_name: 'Test Corp',
      logo_url: 'https://example.com/logo.png',
      font_family: 'Roboto',
      dark_mode: true,
      show_events: false,
      show_deliveries: false,
      allowed_events: ['order.created'],
    });
    const { getByDisplayValue, getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByDisplayValue('Test Corp')).toBeTruthy();
      expect(getByDisplayValue('https://example.com/logo.png')).toBeTruthy();
      expect(getByText('order.created')).toBeTruthy();
    });
  });

  it('allows editing company name', async () => {
    const { getByPlaceholderText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      const input = getByPlaceholderText('My Company');
      fireEvent.change(input, { target: { value: 'Acme Corp' } });
      expect(input).toHaveValue('Acme Corp');
    });
  });

  it('allows editing primary color via text input', async () => {
    const { container } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      const textInputs = container.querySelectorAll('input[type="text"]');
      // Find the color text input (has font-mono class and value like #6366f1)
      const colorTextInput = Array.from(textInputs).find(
        (i) => (i as HTMLInputElement).value === '#6366f1'
      );
      expect(colorTextInput).toBeTruthy();
      fireEvent.change(colorTextInput!, { target: { value: '#ff0000' } });
      expect(colorTextInput).toHaveValue('#ff0000');
    });
  });

  it('does not add empty event', async () => {
    const { getByText, getByPlaceholderText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByText('Add')).toBeTruthy();
    });
    fireEvent.click(getByText('Add'));
    // Should still show "All events allowed"
    expect(getByText('All events allowed')).toBeTruthy();
  });

  it('shows error toast for duplicate event', async () => {
    const { getByPlaceholderText, getByText } = render(<PortalCustomizationPage />);
    await waitFor(() => {
      expect(getByPlaceholderText('order.created')).toBeTruthy();
    });
    fireEvent.change(getByPlaceholderText('order.created'), { target: { value: 'order.created' } });
    fireEvent.click(getByText('Add'));
    await waitFor(() => {
      expect(getByText('order.created')).toBeTruthy();
    });
    // Try adding again
    fireEvent.change(getByPlaceholderText('order.created'), { target: { value: 'order.created' } });
    fireEvent.click(getByText('Add'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Event already added', 'error');
    });
  });
});
