// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockEndpointsList = vi.fn();
const mockUpdateRetryPolicy = vi.fn();
const mockDeleteEndpoint = vi.fn();
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockPush = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ep-123' }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
    updateRetryPolicy: (...args: any[]) => mockUpdateRetryPolicy(...args),
    delete: (...args: any[]) => mockDeleteEndpoint(...args),
  },
}));

const mockEndpoint = {
  id: 'ep-123',
  url: 'https://example.com/webhook',
  description: 'Test endpoint',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  signing_secret: 'whsec_abc123def456ghi789',
  routing_strategy: 'single',
  avg_response_ms: 45,
  failure_streak: 0,
  retry_policy: {
    max_attempts: 5,
    backoff: 'exponential',
    initial_delay_secs: 10,
    max_delay_secs: 3600,
  },
};

const { default: EndpointSettingsPage } = await import('@/app/[locale]/[username]/endpoints/[id]/page');

describe('EndpointSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue([mockEndpoint]);
    mockUpdateRetryPolicy.mockResolvedValue({});
    mockDeleteEndpoint.mockResolvedValue({});
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ signing_secret: 'new_secret_xyz' }) });
  });

  // === Render tests ===
  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(EndpointSettingsPage)); });
  });

  it('displays endpoint URL', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('https://example.com/webhook');
  });

  it('displays Endpoint Settings title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Endpoint Settings');
  });

  it('fetches endpoint on mount', async () => {
    await act(async () => { render(React.createElement(EndpointSettingsPage)); });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  // === Retry Policy tests ===
  it('renders retry policy section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Retry Policy');
    expect(container!.textContent).toContain('Max Attempts');
    expect(container!.textContent).toContain('Backoff Strategy');
  });

  it('loads retry policy from endpoint', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    const numberInput = container!.querySelector('input[type="number"]') as HTMLInputElement;
    expect(numberInput.value).toBe('5');
  });

  it('renders backoff options', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Exponential');
    expect(container!.textContent).toContain('Linear');
    expect(container!.textContent).toContain('Fixed');
  });

  it('renders retry schedule preview', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Retry Schedule Preview');
  });

  it('saves retry policy', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const saveButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Save Retry Policy'));
    await act(async () => { fireEvent.click(saveButton!); });

    expect(mockUpdateRetryPolicy).toHaveBeenCalledWith('test-token', 'ep-123', expect.objectContaining({
      max_attempts: 5,
      backoff: 'exponential',
    }));
    expect(mockToast).toHaveBeenCalledWith('Retry policy updated!', 'success');
  });

  it('handles save retry policy error', async () => {
    mockUpdateRetryPolicy.mockRejectedValueOnce(new Error('Save failed'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const saveButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Save Retry Policy'));
    await act(async () => { fireEvent.click(saveButton!); });

    expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
  });

  // === Signing Secret tests ===
  it('renders signing secret section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Signing Secret');
    expect(container!.textContent).toContain('Rotate Secret');
  });

  it('shows masked signing secret', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('whsec_abc12');
    expect(container!.textContent).toContain('*');
  });

  it('shows rotate confirmation modal', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const rotateButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Rotate Secret'));
    await act(async () => { fireEvent.click(rotateButton!); });

    expect(container!.textContent).toContain('Rotate Signing Secret?');
    expect(container!.textContent).toContain('old secret will remain valid');
  });

  it('rotates signing secret', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    // Click the first "Rotate Secret" button (in the card, not modal)
    const buttons = container!.querySelectorAll('button');
    const rotateBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'Rotate Secret');
    expect(rotateBtn).toBeTruthy();
    await act(async () => { fireEvent.click(rotateBtn!); });

    // Modal should appear, click the confirm button inside it
    const modalButtons = container!.querySelectorAll('.fixed button');
    const confirmBtn = Array.from(modalButtons).find(b => b.textContent?.trim() === 'Rotate Secret');
    expect(confirmBtn).toBeTruthy();
    await act(async () => { fireEvent.click(confirmBtn!); });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles rotate secret error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const buttons = container!.querySelectorAll('button');
    const rotateBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'Rotate Secret');
    await act(async () => { fireEvent.click(rotateBtn!); });

    const modalButtons = container!.querySelectorAll('.fixed button');
    const confirmBtn = Array.from(modalButtons).find(b => b.textContent?.trim() === 'Rotate Secret');
    await act(async () => { fireEvent.click(confirmBtn!); });

    expect(mockToast).toHaveBeenCalledWith('Rotation failed', 'error');
  });

  it('cancels rotate modal', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const rotateButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Rotate Secret') && !b.textContent?.includes('?'));
    await act(async () => { fireEvent.click(rotateButton!); });
    expect(container!.textContent).toContain('Rotate Signing Secret?');

    const cancelButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Cancel'));
    await act(async () => { fireEvent.click(cancelButton!); });
    expect(container!.textContent).not.toContain('Rotate Signing Secret?');
  });

  // === Rate Limit tests ===
  it('renders rate limit info', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Rate Limits');
    expect(container!.textContent).toContain('API Requests');
    expect(container!.textContent).toContain('Avg Response');
    expect(container!.textContent).toContain('Failure Streak');
  });

  it('displays avg response time', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('45');
    expect(container!.textContent).toContain('ms');
  });

  // === Test Webhook tests ===
  it('renders test webhook section', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.textContent).toContain('Test Webhook');
    expect(container!.textContent).toContain('Send Test Webhook');
  });

  it('sends test webhook', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const testButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Send Test Webhook'));
    await act(async () => { fireEvent.click(testButton!); });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('handles test webhook error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });

    const testButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Send Test Webhook'));
    await act(async () => { fireEvent.click(testButton!); });

    expect(mockToast).toHaveBeenCalledWith('Failed to send', 'error');
  });

  // === Navigation tests ===
  it('renders back button', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    const backButton = container!.querySelector('svg');
    expect(backButton).toBeTruthy();
  });

  // === Endpoint not found ===
  it('redirects when endpoint not found', async () => {
    mockEndpointsList.mockResolvedValueOnce([]);
    await act(async () => { render(React.createElement(EndpointSettingsPage)); });
    expect(mockToast).toHaveBeenCalledWith('Endpoint not found', 'error');
    expect(mockPush).toHaveBeenCalledWith('/dashboard/endpoints');
  });

  // === Loading state ===
  it('shows loading state', async () => {
    mockEndpointsList.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === No retry policy ===
  it('uses defaults when no retry policy', async () => {
    mockEndpointsList.mockResolvedValueOnce([{ ...mockEndpoint, retry_policy: null }]);
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointSettingsPage)).container; });
    const numberInput = container!.querySelector('input[type="number"]') as HTMLInputElement;
    expect(numberInput.value).toBe('5');
  });
});
