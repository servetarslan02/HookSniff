// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockEndpointsList = vi.fn();
const mockEndpointsCreate = vi.fn();
const mockEndpointsDelete = vi.fn();
const mockToast = vi.fn();
const mockPush = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, onConfirm, onCancel, title }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('button', { onClick: onConfirm }, 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel'),
    ) : null,
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
    create: (...args: any[]) => mockEndpointsCreate(...args),
    delete: (...args: any[]) => mockEndpointsDelete(...args),
  },
}));

const mockEndpoints = [
  { id: 'ep-1', url: 'https://example.com/hook', description: 'Production', is_active: true, created_at: '2024-01-01' },
  { id: 'ep-2', url: 'https://staging.example.com/hook', description: 'Staging', is_active: false, created_at: '2024-02-01' },
  { id: 'ep-3', url: 'https://dev.example.com/hook', description: '', is_active: true, created_at: '2024-03-01' },
];

const { default: EndpointsPage } = await import('@/app/[locale]/[username]/endpoints/page');

describe('EndpointsPage — Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockEndpointsCreate.mockResolvedValue({ id: 'ep-new', url: 'https://new.com', is_active: true, created_at: '2024-04-01' });
    mockEndpointsDelete.mockResolvedValue({});
  });

  // === Render tests ===
  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(EndpointsPage)); });
  });

  it('displays endpoints title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('endpoints.title');
  });

  it('fetches endpoints on mount', async () => {
    await act(async () => { render(React.createElement(EndpointsPage)); });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  it('renders all endpoints', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('https://example.com/hook');
    expect(container!.textContent).toContain('https://staging.example.com/hook');
    expect(container!.textContent).toContain('https://dev.example.com/hook');
  });

  it('renders endpoint descriptions', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('Production');
    expect(container!.textContent).toContain('Staging');
  });

  it('shows active/inactive status', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('endpoints.active');
  });

  it('renders new endpoint button', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('New Endpoint');
  });

  // === Create endpoint tests ===
  it('shows create form when button clicked', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const createButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(createButton!); });

    expect(container!.textContent).toContain('endpoints.create');
    expect(container!.querySelector('input[type="url"]')).toBeTruthy();
  });

  it('creates new endpoint', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const createButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(createButton!); });

    const urlInput = container!.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://new.com' } }); });

    const submitButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('common.create'));
    await act(async () => { fireEvent.click(submitButton!); });

    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token', { url: 'https://new.com', description: undefined });
  });

  it('creates endpoint with description', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const createButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(createButton!); });

    const urlInput = container!.querySelector('input[type="url"]') as HTMLInputElement;
    const descInput = container!.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://new.com' } });
      fireEvent.change(descInput, { target: { value: 'My endpoint' } });
    });

    const submitButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('common.create'));
    await act(async () => { fireEvent.click(submitButton!); });

    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token', { url: 'https://new.com', description: 'My endpoint' });
  });

  it('handles create error', async () => {
    mockEndpointsCreate.mockRejectedValueOnce(new Error('URL already exists'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const createButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(createButton!); });

    const urlInput = container!.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://dup.com' } }); });

    const submitButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('common.create'));
    await act(async () => { fireEvent.click(submitButton!); });

    expect(container!.textContent).toContain('URL already exists');
  });

  it('cancels create form', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const createButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(createButton!); });
    expect(container!.textContent).toContain('endpoints.create');

    const cancelButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Cancel'));
    await act(async () => { fireEvent.click(cancelButton!); });
    expect(container!.textContent).not.toContain('endpoints.create');
  });

  // === Delete endpoint tests ===
  it('shows delete confirmation', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const deleteButtons = Array.from(container!.querySelectorAll('button')).filter(b => b.title === 'endpoints.deleteTitle');
    await act(async () => { fireEvent.click(deleteButtons[0]); });

    expect(container!.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
  });

  it('deletes endpoint on confirm', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const deleteButtons = Array.from(container!.querySelectorAll('button')).filter(b => b.title === 'endpoints.deleteTitle');
    await act(async () => { fireEvent.click(deleteButtons[0]); });

    const confirmButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Confirm');
    await act(async () => { fireEvent.click(confirmButton!); });

    expect(mockEndpointsDelete).toHaveBeenCalledWith('test-token', 'ep-1');
  });

  it('cancels delete on cancel', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const deleteButtons = Array.from(container!.querySelectorAll('button')).filter(b => b.title === 'endpoints.deleteTitle');
    await act(async () => { fireEvent.click(deleteButtons[0]); });

    const cancelButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Cancel');
    await act(async () => { fireEvent.click(cancelButton!); });

    expect(mockEndpointsDelete).not.toHaveBeenCalled();
  });

  // === Bulk select tests ===
  it('renders select all checkbox when multiple endpoints', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const selectAll = container!.querySelector('input[type="checkbox"]');
    expect(selectAll).toBeTruthy();
  });

  it('selects all endpoints', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const selectAll = container!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async () => { fireEvent.click(selectAll); });

    expect(container!.textContent).toContain('Delete 3 selected');
  });

  it('deselects all endpoints', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const selectAll = container!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async () => { fireEvent.click(selectAll); });
    await act(async () => { fireEvent.click(selectAll); });

    expect(container!.textContent).not.toContain('Delete');
  });

  it('bulk deletes selected endpoints', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const selectAll = container!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async () => { fireEvent.click(selectAll); });

    const bulkDeleteButton = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Delete 3 selected'));
    await act(async () => { fireEvent.click(bulkDeleteButton!); });

    expect(mockEndpointsDelete).toHaveBeenCalledTimes(3);
    expect(mockToast).toHaveBeenCalledWith('Deleted 3 endpoints', 'success');
  });

  // === Empty state ===
  it('shows empty state when no endpoints', async () => {
    mockEndpointsList.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('No endpoints yet');
  });

  // === Loading state ===
  it('shows loading state', async () => {
    mockEndpointsList.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === Navigation ===
  it('navigates to endpoint settings', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });

    const settingsButtons = Array.from(container!.querySelectorAll('button')).filter(b => b.title === 'Settings');
    await act(async () => { fireEvent.click(settingsButtons[0]); });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/endpoints/ep-1');
  });
});
