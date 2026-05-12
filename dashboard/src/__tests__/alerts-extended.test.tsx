// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockAlertsList = vi.fn();
const mockAlertsCreate = vi.fn();
const mockAlertsDelete = vi.fn();
const mockAlertsTest = vi.fn();

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

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/api', () => ({
  alertsApi: {
    list: (...args: any[]) => mockAlertsList(...args),
    create: (...args: any[]) => mockAlertsCreate(...args),
    delete: (...args: any[]) => mockAlertsDelete(...args),
    test: (...args: any[]) => mockAlertsTest(...args),
  },
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, onConfirm, onCancel, confirmLabel }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('button', { onClick: onConfirm }, confirmLabel || 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel')
    ) : null,
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: AlertsPage } = await import('@/app/[locale]/[username]/alerts/page');

const mockAlerts = [
  { id: 'a1', name: 'High Failure Rate', condition: 'failure_rate', threshold: 10, channels: ['email', 'slack'], is_active: true },
  { id: 'a2', name: 'Slow Latency', condition: 'latency', threshold: 5000, channels: ['webhook'], is_active: false },
  { id: 'a3', name: 'Too Many Failures', condition: 'consecutive_failures', threshold: 5, channels: ['email'], is_active: true },
];

describe('AlertsPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlertsList.mockResolvedValue(mockAlerts);
    mockAlertsCreate.mockResolvedValue({});
    mockAlertsDelete.mockResolvedValue({});
    mockAlertsTest.mockResolvedValue({});
  });

  // === Render ===
  it('renders without crashing', () => {
    render(React.createElement(AlertsPage));
  });

  it('displays title', () => {
    const { container } = render(React.createElement(AlertsPage));
    expect(container.textContent).toContain('alerts.title');
  });

  it('renders new alert button', () => {
    const { container } = render(React.createElement(AlertsPage));
    expect(container.textContent).toContain('alerts.newAlert');
  });

  // === Alert list ===
  it('renders alert list', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
      expect(container.textContent).toContain('Slow Latency');
    });
  });

  it('renders active badge', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.active');
    });
  });

  it('renders paused badge', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.paused');
    });
  });

  it('renders condition labels', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Failure Rate >');
    });
  });

  it('renders threshold values', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('10');
      expect(container.textContent).toContain('5000');
    });
  });

  it('renders channel icons', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('📧');
      expect(container.textContent).toContain('💬');
    });
  });

  it('renders test button for each alert', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const testButtons = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('Test')
      );
      expect(testButtons.length).toBe(3);
    });
  });

  it('renders delete button for each alert', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('Delete')
      );
      expect(deleteButtons.length).toBe(3);
    });
  });

  // === Empty state ===
  it('shows empty state when no alerts', async () => {
    mockAlertsList.mockResolvedValue([]);
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('No alert rules yet');
    });
  });

  // === Loading state ===
  it('shows loading state', () => {
    mockAlertsList.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(AlertsPage));
    expect(container.textContent).toContain('common.loading');
  });

  // === Create form ===
  it('shows create form on button click', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => {
      fireEvent.click(newAlertButton!);
    });

    expect(container.textContent).toContain('alerts.createTitle');
  });

  it('hides create form on second click', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });
    expect(container.textContent).toContain('alerts.createTitle');

    await act(async () => { fireEvent.click(newAlertButton!); });
    expect(container.textContent).not.toContain('alerts.createTitle');
  });

  it('renders form fields', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });

    expect(container.textContent).toContain('Name');
    expect(container.textContent).toContain('Condition');
    expect(container.textContent).toContain('Threshold');
    expect(container.textContent).toContain('Channels');
  });

  it('renders condition options', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });

    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('failure_rate');
    expect(options).toContain('latency');
    expect(options).toContain('consecutive_failures');
  });

  it('renders channel toggle buttons', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });

    expect(container.textContent).toContain('slack');
    expect(container.textContent).toContain('email');
    expect(container.textContent).toContain('webhook');
  });

  it('toggles channel selection', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });

    const slackButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('slack')
    );

    await act(async () => {
      fireEvent.click(slackButton!);
    });

    // Slack should now be selected (in addition to email which is default)
    // Button should have brand styling
    expect(slackButton!.className).toContain('brand');
  });

  // === Create alert ===
  it('creates alert', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'My Alert' } });
    });

    const thresholdInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(thresholdInput, { target: { value: '20' } });
    });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.create')
    );

    await act(async () => { fireEvent.click(createButton!); });

    expect(mockAlertsCreate).toHaveBeenCalledWith('test-token', {
      name: 'My Alert',
      condition: 'failure_rate',
      threshold: 20,
      channels: ['email'],
    });
  });

  it('disables create when name is empty', async () => {
    const { container } = render(React.createElement(AlertsPage));

    const newAlertButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.newAlert')
    );

    await act(async () => { fireEvent.click(newAlertButton!); });

    const createButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('alerts.create')
    );

    expect(createButton!.disabled).toBe(true);
  });

  // === Test alert ===
  it('tests alert on test click', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
    });

    const testButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Test')
    );

    await act(async () => {
      fireEvent.click(testButtons[0]);
    });

    expect(mockAlertsTest).toHaveBeenCalledWith('test-token', 'a1');
  });

  it('shows toast after test', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
    });

    const testButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Test')
    );

    await act(async () => {
      fireEvent.click(testButtons[0]);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('alerts.testSent', 'success');
    });
  });

  // === Delete alert ===
  it('opens confirm dialog on delete click', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
    });

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Delete')
    );

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(container.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
  });

  it('deletes alert on confirm', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
    });

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Delete')
    );

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    const confirmButton = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    expect(mockAlertsDelete).toHaveBeenCalledWith('test-token', 'a1');
  });

  it('cancels delete on cancel click', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
    });

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Delete')
    );

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    const cancelButton = Array.from(
      container.querySelector('[data-testid="confirm-dialog"]')!.querySelectorAll('button')
    ).find((b) => b.textContent === 'Cancel');

    await act(async () => {
      fireEvent.click(cancelButton!);
    });

    expect(mockAlertsDelete).not.toHaveBeenCalled();
  });

  // === Latency condition ===
  it('renders latency condition label', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Avg Latency >');
    });
  });

  // === Consecutive failures condition ===
  it('renders consecutive failures condition label', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Consecutive Failures >');
    });
  });

  // === Failure rate percentage suffix ===
  it('shows % suffix for failure rate', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      // failure_rate alert has threshold 10, should show "10%"
      const alertItems = container.querySelectorAll('.px-6.py-4');
      const failureRateAlert = Array.from(alertItems).find((el) =>
        el.textContent?.includes('Failure Rate >')
      );
      expect(failureRateAlert?.textContent).toContain('%');
    });
  });

  // === Latency ms suffix ===
  it('shows ms suffix for latency', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const alertItems = container.querySelectorAll('.px-6.py-4');
      const latencyAlert = Array.from(alertItems).find((el) =>
        el.textContent?.includes('Avg Latency >')
      );
      expect(latencyAlert?.textContent).toContain('ms');
    });
  });
});
