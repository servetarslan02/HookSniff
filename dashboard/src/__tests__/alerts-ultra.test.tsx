// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

// --- Mocks ---
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
  default: ({ open, title, message, confirmLabel, onConfirm, onCancel, variant: _variant }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('span', null, message),
      React.createElement('button', { onClick: onConfirm }, confirmLabel || 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel'),
    ) : null,
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: AlertsPage } = await import('@/app/[locale]/[username]/alerts/page');

// --- Test Data ---
const mockAlerts = [
  {
    id: 'alert_1',
    name: 'High Failure Rate',
    condition: 'failure_rate',
    threshold: 10,
    channels: ['email', 'slack'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'alert_2',
    name: 'Slow Endpoints',
    condition: 'latency',
    threshold: 5000,
    channels: ['webhook'],
    is_active: false,
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'alert_3',
    name: 'Repeated Failures',
    condition: 'consecutive_failures',
    threshold: 5,
    channels: ['email'],
    is_active: true,
    created_at: '2024-03-10T00:00:00Z',
  },
];

describe('AlertsPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlertsList.mockResolvedValue(mockAlerts);
    mockAlertsCreate.mockResolvedValue({});
    mockAlertsDelete.mockResolvedValue({});
    mockAlertsTest.mockResolvedValue({});
  });

  // 1. Renders without crashing
  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AlertsPage));
    });
  });

  // 2. Renders alerts title
  it('renders alerts title', async () => {
    const { container } = render(React.createElement(AlertsPage));
    expect(container.textContent).toContain('alerts.title');
  });

  // 3. Shows empty state when no alerts
  it('shows empty state when no alerts', async () => {
    mockAlertsList.mockResolvedValue([]);
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('No alert rules yet');
    });
  });

  // 4. Renders alert list
  it('renders alert list with all alerts', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('High Failure Rate');
      expect(container.textContent).toContain('Slow Endpoints');
      expect(container.textContent).toContain('Repeated Failures');
    });
  });

  // 5. Each alert shows name
  it('each alert shows name', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const alertItems = container.querySelectorAll('.px-6.py-4');
      expect(alertItems.length).toBeGreaterThanOrEqual(3);
    });
  });

  // 6. Each alert shows condition label
  it('each alert shows condition label', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Failure Rate >');
      expect(container.textContent).toContain('Avg Latency >');
      expect(container.textContent).toContain('Consecutive Failures >');
    });
  });

  // 7. Each alert shows threshold
  it('each alert shows threshold value', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      // failure_rate: 10%, latency: 5000ms, consecutive: 5
      expect(container.textContent).toContain('10');
      expect(container.textContent).toContain('5000');
      expect(container.textContent).toContain('5');
    });
  });

  // 8. Each alert shows channels
  it('each alert shows channel icons', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('📧'); // email
      expect(container.textContent).toContain('💬'); // slack
      expect(container.textContent).toContain('🔗'); // webhook
    });
  });

  // 9. Create button opens form
  it('create button opens form', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    expect(container.textContent).toContain('alerts.createTitle');
    expect(container.textContent).toContain('Name');
    expect(container.textContent).toContain('Condition');
    expect(container.textContent).toContain('Threshold');
    expect(container.textContent).toContain('Channels');
  });

  // 10. Name input in create form
  it('name input accepts text', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'My Custom Alert' } });
    });
    expect(nameInput.value).toBe('My Custom Alert');
  });

  // 11. Condition select/input
  it('condition select has correct options', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain('failure_rate');
    expect(options).toContain('latency');
    expect(options).toContain('consecutive_failures');
  });

  // 12. Threshold input
  it('threshold input accepts number', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const thresholdInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(thresholdInput, { target: { value: '42' } });
    });
    expect(thresholdInput.value).toBe('42');
  });

  // 13. Channel selection (email/webhook)
  it('channel toggle buttons work', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    // email is selected by default
    // Toggle slack on
    const slackBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('slack')
    );
    await act(async () => { fireEvent.click(slackBtn!); });
    expect(slackBtn!.className).toContain('brand');
    // Toggle email off
    const emailBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('email')
    );
    await act(async () => { fireEvent.click(emailBtn!); });
    // email should no longer have brand styling
    expect(emailBtn!.className).not.toContain('brand');
  });

  // 14. Submit creates alert
  it('submit creates alert with form data', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Alert' } });
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => { fireEvent.click(submitBtn!); });
    expect(mockAlertsCreate).toHaveBeenCalledWith('test-token', {
      name: 'Test Alert',
      condition: 'failure_rate',
      threshold: 10,
      channels: ['email'],
    });
  });

  // 15. Cancel closes form
  it('cancel closes create form', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    expect(container.textContent).toContain('alerts.createTitle');
    // The button text changes to "cancel"
    const cancelBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.cancel')
    );
    await act(async () => { fireEvent.click(cancelBtn!); });
    expect(container.textContent).not.toContain('alerts.createTitle');
  });

  // 16. Delete button works
  it('delete button opens confirm dialog', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    expect(container.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
    expect(container.textContent).toContain('alerts.deleteTitle');
    expect(container.textContent).toContain('alerts.deleteConfirm');
  });

  // 17. Delete confirmation calls API
  it('confirm delete calls API', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    const confirmBtn = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => { fireEvent.click(confirmBtn!); });
    expect(mockAlertsDelete).toHaveBeenCalledWith('test-token', 'alert_1');
  });

  // 18. Test button sends test alert
  it('test button sends test alert', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const testBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Test'
    );
    await act(async () => { fireEvent.click(testBtns[0]); });
    expect(mockAlertsTest).toHaveBeenCalledWith('test-token', 'alert_1');
  });

  // 19. Loading state
  it('shows loading state', () => {
    mockAlertsList.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(AlertsPage));
    expect(container.textContent).toContain('common.loading');
  });

  // 20. Error handling on fetch failure
  it('handles fetch failure gracefully', async () => {
    mockAlertsList.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(AlertsPage));
    // Should still render page with empty state
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.title');
      expect(container.textContent).toContain('No alert rules yet');
    });
  });

  // --- Additional uncovered paths ---

  // Test alert shows success toast
  it('shows success toast after test alert', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const testBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Test'
    );
    await act(async () => { fireEvent.click(testBtns[0]); });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('alerts.testSent', 'success');
    });
  });

  // Cancel delete
  it('cancel delete closes dialog without calling API', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    const cancelBtn = Array.from(
      container.querySelector('[data-testid="confirm-dialog"]')!.querySelectorAll('button')
    ).find(b => b.textContent === 'Cancel');
    await act(async () => { fireEvent.click(cancelBtn!); });
    expect(mockAlertsDelete).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="confirm-dialog"]')).toBeNull();
  });

  // Refreshes alerts after create
  it('refreshes alerts after successful create', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(mockAlertsList).toHaveBeenCalledTimes(1); });
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Refresh Test' } });
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => { fireEvent.click(submitBtn!); });
    await waitFor(() => {
      expect(mockAlertsList).toHaveBeenCalledTimes(2); // initial + refresh
    });
  });

  // Refreshes alerts after delete
  it('refreshes alerts after successful delete', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(mockAlertsList).toHaveBeenCalledTimes(1); });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    const confirmBtn = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => { fireEvent.click(confirmBtn!); });
    await waitFor(() => {
      expect(mockAlertsList).toHaveBeenCalledTimes(2); // initial + refresh
    });
  });

  // Active/paused badges
  it('shows active and paused status badges', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.active');
      expect(container.textContent).toContain('alerts.paused');
    });
  });

  // Failure rate shows % suffix
  it('shows % suffix for failure_rate condition', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const alertItems = container.querySelectorAll('.px-6');
      const failureAlert = Array.from(alertItems).find(el =>
        el.textContent?.includes('Failure Rate >')
      );
      expect(failureAlert?.textContent).toContain('%');
    });
  });

  // Latency shows ms suffix
  it('shows ms suffix for latency condition', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const alertItems = container.querySelectorAll('.px-6');
      const latencyAlert = Array.from(alertItems).find(el =>
        el.textContent?.includes('Avg Latency >')
      );
      expect(latencyAlert?.textContent).toContain('ms');
    });
  });

  // Consecutive failures has no suffix
  it('shows no suffix for consecutive_failures condition', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const alertItems = container.querySelectorAll('.px-6');
      const consecAlert = Array.from(alertItems).find(el =>
        el.textContent?.includes('Consecutive Failures >')
      );
      expect(consecAlert?.textContent).toContain('5');
      expect(consecAlert?.textContent).not.toContain('5%');
      expect(consecAlert?.textContent).not.toContain('5ms');
    });
  });

  // Create with all channels
  it('creates alert with all three channels', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Multi-Channel' } });
    });
    // Toggle slack on
    const slackBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('slack')
    );
    await act(async () => { fireEvent.click(slackBtn!); });
    // Toggle webhook on
    const webhookBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('webhook')
    );
    await act(async () => { fireEvent.click(webhookBtn!); });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => { fireEvent.click(submitBtn!); });
    expect(mockAlertsCreate).toHaveBeenCalledWith('test-token', {
      name: 'Multi-Channel',
      condition: 'failure_rate',
      threshold: 10,
      channels: ['email', 'slack', 'webhook'],
    });
  });

  // Create with changed condition
  it('creates alert with changed condition and threshold', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Latency Alert' } });
    });
    const conditionSelect = container.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(conditionSelect, { target: { value: 'latency' } });
    });
    const thresholdInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(thresholdInput, { target: { value: '3000' } });
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => { fireEvent.click(submitBtn!); });
    expect(mockAlertsCreate).toHaveBeenCalledWith('test-token', {
      name: 'Latency Alert',
      condition: 'latency',
      threshold: 3000,
      channels: ['email'],
    });
  });

  // Disabled create when name empty
  it('disables create button when name is empty', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    expect(submitBtn).toHaveProperty('disabled', true);
  });

  // Create form resets after successful create
  it('resets form after successful create', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Temp Alert' } });
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => { fireEvent.click(submitBtn!); });
    // Form should be hidden after successful create
    await waitFor(() => {
      expect(container.textContent).not.toContain('alerts.createTitle');
    });
  });

  // Test button for each alert
  it('renders test button for each alert', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const testBtns = Array.from(container.querySelectorAll('button')).filter(
        b => b.textContent === 'Test'
      );
      expect(testBtns.length).toBe(3);
    });
  });

  // Delete button for each alert
  it('renders delete button for each alert', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => {
      const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
        b => b.textContent === 'Delete'
      );
      expect(deleteBtns.length).toBe(3);
    });
  });

  // Description text
  it('renders description text', () => {
    const { container } = render(React.createElement(AlertsPage));
    expect(container.textContent).toContain('Get notified when webhooks fail');
  });

  // Condition select changes value
  it('changing condition select updates form', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'consecutive_failures' } });
    });
    expect(select.value).toBe('consecutive_failures');
  });

  // Delete second alert
  it('deletes the correct alert when multiple exist', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('Slow Endpoints'); });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    // Click second delete button (for alert_2)
    await act(async () => { fireEvent.click(deleteBtns[1]); });
    const confirmBtn = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => { fireEvent.click(confirmBtn!); });
    expect(mockAlertsDelete).toHaveBeenCalledWith('test-token', 'alert_2');
  });

  // Test alert for second alert
  it('tests the correct alert when multiple exist', async () => {
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('Slow Endpoints'); });
    const testBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Test'
    );
    await act(async () => { fireEvent.click(testBtns[1]); });
    expect(mockAlertsTest).toHaveBeenCalledWith('test-token', 'alert_2');
  });

  // Handles create failure gracefully
  it('handles create failure gracefully', async () => {
    mockAlertsCreate.mockRejectedValue(new Error('Server error'));
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Will Fail' } });
    });
    const submitBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.create')
    );
    await act(async () => { fireEvent.click(submitBtn!); });
    // Should not crash, form should still be visible
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.createTitle');
    });
  });

  // Handles delete failure gracefully
  it('handles delete failure gracefully', async () => {
    mockAlertsDelete.mockRejectedValue(new Error('Server error'));
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Delete'
    );
    await act(async () => { fireEvent.click(deleteBtns[0]); });
    const confirmBtn = container.querySelector('[data-testid="confirm-dialog"] button');
    await act(async () => { fireEvent.click(confirmBtn!); });
    // Should not crash
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.title');
    });
  });

  // Handles test failure gracefully
  it('handles test failure gracefully', async () => {
    mockAlertsTest.mockRejectedValue(new Error('Server error'));
    const { container } = render(React.createElement(AlertsPage));
    await waitFor(() => { expect(container.textContent).toContain('High Failure Rate'); });
    const testBtns = Array.from(container.querySelectorAll('button')).filter(
      b => b.textContent === 'Test'
    );
    await act(async () => { fireEvent.click(testBtns[0]); });
    // Should not crash
    await waitFor(() => {
      expect(container.textContent).toContain('alerts.title');
    });
  });

  // Default threshold value
  it('default threshold is 10', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const thresholdInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    expect(thresholdInput.value).toBe('10');
  });

  // Default condition is failure_rate
  it('default condition is failure_rate', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('failure_rate');
  });

  // Default channels include email
  it('default channels include email', async () => {
    const { container } = render(React.createElement(AlertsPage));
    const createBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('alerts.newAlert')
    );
    await act(async () => { fireEvent.click(createBtn!); });
    // email button should have brand styling (selected by default)
    const emailBtn = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('email')
    );
    expect(emailBtn!.className).toContain('brand');
  });
});
