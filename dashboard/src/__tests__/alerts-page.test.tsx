// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123', logout: vi.fn() }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

// Mock ConfirmDialog to render its content when open
vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, message, confirmLabel, onConfirm, onCancel }: any) => {
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('span', null, message),
      React.createElement('button', { onClick: onConfirm }, confirmLabel),
      React.createElement('button', { onClick: onCancel }, 'Cancel'),
    );
  },
}));

const { default: AlertsPage } = await import('@/app/[locale]/[username]/alerts/page');

const MOCK_ALERTS = [
  { id: 'a1', name: 'High failure rate', condition: 'failure_rate', threshold: 10, channels: ['email'], is_active: true, created_at: '2024-01-01' },
  { id: 'a2', name: 'Slow latency', condition: 'latency', threshold: 500, channels: ['slack', 'webhook'], is_active: false, created_at: '2024-02-15' },
  { id: 'a3', name: 'Consecutive fails', condition: 'consecutive_failures', threshold: 5, channels: ['email', 'slack'], is_active: true, created_at: '2024-03-10' },
];

describe('AlertsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_ALERTS),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AlertsPage));
    });
  });

  it('fetches alerts on mount', async () => {
    await act(async () => {
      render(React.createElement(AlertsPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts'),
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('displays alerts title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('alerts.title');
  });

  it('displays alert names from API', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('High failure rate');
      expect(container!.textContent).toContain('Slow latency');
      expect(container!.textContent).toContain('Consecutive fails');
    });
  });

  it('shows empty state when no alerts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('No alert rules yet');
    });
  });

  it('shows loading state', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('common.loading');
  });

  it('renders new alert button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('alerts.newAlert');
  });

  it('opens create alert form', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    expect(container!.textContent).toContain('alerts.createTitle');
    expect(container!.textContent).toContain('Name');
    expect(container!.textContent).toContain('Condition');
    expect(container!.textContent).toContain('Threshold');
    expect(container!.textContent).toContain('Channels');
  });

  it('closes create form when toggle button clicked again', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const toggleBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(toggleBtn!);
    });
    expect(container!.textContent).toContain('alerts.createTitle');
    // Click again - now shows cancel
    const cancelBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.cancel')
    );
    await act(async () => {
      fireEvent.click(cancelBtn!);
    });
    expect(container!.textContent).not.toContain('alerts.createTitle');
  });

  it('fills create form fields', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    // Fill name
    const nameInput = container!.querySelector('input[type="text"]');
    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'My Alert' } });
    });
    expect((nameInput as HTMLInputElement).value).toBe('My Alert');
    // Fill threshold
    const thresholdInput = container!.querySelector('input[type="number"]');
    await act(async () => {
      fireEvent.change(thresholdInput!, { target: { value: '25' } });
    });
    expect((thresholdInput as HTMLInputElement).value).toBe('25');
  });

  it('changes condition select', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    const conditionSelect = container!.querySelector('select');
    await act(async () => {
      fireEvent.change(conditionSelect!, { target: { value: 'latency' } });
    });
    expect(conditionSelect!.value).toBe('latency');
  });

  it('toggles channel selection', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    // Find slack channel button
    const channelBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent?.includes('slack')
    );
    expect(channelBtns.length).toBeGreaterThanOrEqual(1);
    await act(async () => {
      fireEvent.click(channelBtns[0]);
    });
    // Slack should now be selected (in addition to email which is default)
  });

  it('submits create alert form', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    const nameInput = container!.querySelector('input[type="text"]');
    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'New Alert' } });
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/alerts'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  it('disables create button when name is empty', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    expect(submitBtn).toHaveProperty('disabled', true);
  });

  it('shows active/paused status badges', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('alerts.active');
      expect(container!.textContent).toContain('alerts.paused');
    });
  });

  it('displays condition labels correctly', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      // failure_rate shows "Failure Rate > 10%"
      expect(container!.textContent).toContain('Failure Rate >');
      expect(container!.textContent).toContain('10%');
      // latency shows "Avg Latency > 500ms"
      expect(container!.textContent).toContain('Avg Latency >');
      expect(container!.textContent).toContain('500ms');
      // consecutive_failures shows "Consecutive Failures > 5"
      expect(container!.textContent).toContain('Consecutive Failures >');
    });
  });

  it('displays channel icons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      // email icon 📧
      expect(container!.textContent).toContain('📧');
      // slack icon 💬
      expect(container!.textContent).toContain('💬');
      // webhook icon 🔗
      expect(container!.textContent).toContain('🔗');
    });
  });

  it('renders Test and Delete buttons for each alert', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      const testBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Test'
      );
      const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Delete'
      );
      expect(testBtns.length).toBe(3);
      expect(deleteBtns.length).toBe(3);
    });
  });

  it('calls test alert API', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      const testBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Test'
      );
      expect(testBtns.length).toBeGreaterThanOrEqual(1);
    });
    const testBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent === 'Test'
    );
    await act(async () => {
      fireEvent.click(testBtns[0]);
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts/a1/test'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('clicks delete and shows confirm dialog', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Delete'
      );
      expect(deleteBtns.length).toBeGreaterThanOrEqual(1);
    });
    const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => {
      fireEvent.click(deleteBtns[0]);
    });
    expect(container!.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
    expect(container!.textContent).toContain('alerts.deleteTitle');
    expect(container!.textContent).toContain('alerts.deleteConfirm');
  });

  it('confirms delete alert', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Delete'
      );
      expect(deleteBtns.length).toBeGreaterThanOrEqual(1);
    });
    const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => {
      fireEvent.click(deleteBtns[0]);
    });
    // Click confirm in dialog
    const confirmBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent?.includes('alerts.delete')
    );
    await act(async () => {
      fireEvent.click(confirmBtns[0]);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/alerts/a1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('cancels delete alert', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Delete'
      );
      expect(deleteBtns.length).toBeGreaterThanOrEqual(1);
    });
    const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => {
      fireEvent.click(deleteBtns[0]);
    });
    const cancelBtns = Array.from(container!.querySelectorAll('[data-testid="confirm-dialog"] button')).filter(
      (b: any) => b.textContent === 'Cancel'
    );
    await act(async () => {
      fireEvent.click(cancelBtns[0]);
    });
    expect(container!.querySelector('[data-testid="confirm-dialog"]')).toBeNull();
  });

  it('refreshes alerts after create', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const initialFetchCount = mockFetch.mock.calls.length;
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    const nameInput = container!.querySelector('input[type="text"]');
    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'New Alert' } });
    });
    // Mock POST success + GET refresh
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(MOCK_ALERTS) });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      // POST + refresh GET = at least 2 more calls than initial
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(initialFetchCount + 2);
    });
  });

  it('refreshes alerts after delete', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const initialFetchCount = mockFetch.mock.calls.length;
    await waitFor(() => {
      const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'Delete'
      );
      expect(deleteBtns.length).toBeGreaterThanOrEqual(1);
    });
    const deleteBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => {
      fireEvent.click(deleteBtns[0]);
    });
    // Mock DELETE success + refresh GET
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(MOCK_ALERTS) });
    const confirmBtns = Array.from(container!.querySelectorAll('button')).filter(
      b => b.textContent?.includes('alerts.delete')
    );
    await act(async () => {
      fireEvent.click(confirmBtns[0]);
    });
    await waitFor(() => {
      // DELETE + refresh GET = at least 2 more calls
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(initialFetchCount + 2);
    });
  });

  it('handles fetch alerts failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    // Should still render, just no alerts
    await waitFor(() => {
      expect(container!.textContent).toContain('alerts.title');
    });
  });

  it('handles non-ok response from fetch alerts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    await waitFor(() => {
      // Should show empty state since alerts weren't loaded
      expect(container!.textContent).toContain('No alert rules yet');
    });
  });

  it('creates alert with all channel options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    const nameInput = container!.querySelector('input[type="text"]');
    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'Multi-channel' } });
    });
    // Toggle slack
    const slackBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('slack')
    );
    await act(async () => {
      fireEvent.click(slackBtn!);
    });
    // Toggle webhook
    const webhookBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhook')
    );
    await act(async () => {
      fireEvent.click(webhookBtn!);
    });
    const submitBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => {
      fireEvent.click(submitBtn!);
    });
    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (c: any) => c[1]?.method === 'POST'
      );
      expect(postCall).toBeTruthy();
      const body = JSON.parse(postCall![1].body);
      expect(body.channels).toContain('email');
      expect(body.channels).toContain('slack');
      expect(body.channels).toContain('webhook');
    });
  });

  it('renders condition options in create form', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    const newAlertBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => {
      fireEvent.click(newAlertBtn!);
    });
    const select = container!.querySelector('select');
    const options = select!.querySelectorAll('option');
    expect(options.length).toBe(3);
  });
});
