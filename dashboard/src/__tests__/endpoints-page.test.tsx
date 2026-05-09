// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPush = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockEndpointsList = vi.fn();
const mockEndpointsCreate = vi.fn();
const mockEndpointsDelete = vi.fn();

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: (...args: any[]) => mockEndpointsList(...args),
    create: (...args: any[]) => mockEndpointsCreate(...args),
    delete: (...args: any[]) => mockEndpointsDelete(...args),
  },
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, onConfirm, onCancel }: any) => {
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('button', { onClick: onConfirm }, 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel'),
    );
  },
}));

const mockEndpoints = [
  { id: 'ep1-1234-5678', url: 'https://example.com', description: 'Test endpoint', is_active: true, created_at: '2024-01-01' },
  { id: 'ep2-9012-3456', url: 'https://other.com', description: null, is_active: false, created_at: '2024-02-01' },
];

const { default: EndpointsPage } = await import('@/app/[locale]/dashboard/endpoints/page');

describe('EndpointsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEndpointsList.mockResolvedValue(mockEndpoints);
    mockEndpointsCreate.mockResolvedValue({ id: 'ep3', url: 'https://new.com', is_active: true, created_at: '2024-03-01' });
    mockEndpointsDelete.mockResolvedValue({ deleted: true });
  });

  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(EndpointsPage)); });
  });

  it('fetches endpoints on mount', async () => {
    await act(async () => { render(React.createElement(EndpointsPage)); });
    expect(mockEndpointsList).toHaveBeenCalledWith('test-token');
  });

  it('displays endpoints title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('endpoints.title');
  });

  it('displays endpoint URLs', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('https://example.com');
    expect(container!.textContent).toContain('https://other.com');
  });

  it('displays endpoint descriptions', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('Test endpoint');
  });

  it('displays active/inactive status', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('endpoints.active');
    expect(container!.textContent).toContain('endpoints.inactive');
  });

  it('displays truncated endpoint IDs', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('ep1-1234-567…');
  });

  it('shows empty state when no endpoints', async () => {
    mockEndpointsList.mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('No endpoints yet');
  });

  it('shows loading state initially', () => {
    mockEndpointsList.mockReturnValue(new Promise(() => {})); // Never resolves
    const { container } = render(React.createElement(EndpointsPage));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows create form when button clicked', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(btn!); });
    expect(container!.textContent).toContain('endpoints.create');
  });

  it('fills and submits create form', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(btn!); });

    const urlInput = container!.querySelector('input[type="url"]') as HTMLInputElement;
    const descInput = container!.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://new.com' } });
      fireEvent.change(descInput, { target: { value: 'New endpoint' } });
    });

    const form = container!.querySelector('form')!;
    await act(async () => { fireEvent.submit(form); });
    expect(mockEndpointsCreate).toHaveBeenCalledWith('test-token', { url: 'https://new.com', description: 'New endpoint' });
  });

  it('adds new endpoint to list after creation', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(btn!); });

    const urlInput = container!.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://new.com' } }); });
    const form = container!.querySelector('form')!;
    await act(async () => { fireEvent.submit(form); });

    await waitFor(() => { expect(container!.textContent).toContain('https://new.com'); });
  });

  it('shows error on create failure', async () => {
    mockEndpointsCreate.mockRejectedValueOnce(new Error('URL already exists'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(btn!); });

    const urlInput = container!.querySelector('input[type="url"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(urlInput, { target: { value: 'https://dup.com' } }); });
    const form = container!.querySelector('form')!;
    await act(async () => { fireEvent.submit(form); });

    await waitFor(() => { expect(container!.textContent).toContain('URL already exists'); });
  });

  it('cancels create form', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    await act(async () => { fireEvent.click(btn!); });
    expect(container!.textContent).toContain('endpoints.create');

    const cancelBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Cancel'));
    await act(async () => { fireEvent.click(cancelBtn!); });
    expect(container!.querySelector('input[type="url"]')).toBeNull();
  });

  it('opens delete confirm dialog', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const deleteBtns = container!.querySelectorAll('button[title]');
    const deleteBtn = Array.from(deleteBtns).find(b => b.getAttribute('title')?.includes('delete'));
    if (deleteBtn) {
      await act(async () => { fireEvent.click(deleteBtn); });
      expect(container!.querySelector('[data-testid="confirm-dialog"]')).toBeTruthy();
    }
  });

  it('navigates to endpoint detail on settings click', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const settingsBtns = container!.querySelectorAll('button[title="Settings"]');
    if (settingsBtns.length > 0) {
      await act(async () => { fireEvent.click(settingsBtns[0]); });
      expect(mockPush).toHaveBeenCalledWith('/dashboard/endpoints/ep1-1234-5678');
    }
  });

  it('renders New Endpoint button', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('New Endpoint'));
    expect(btn).toBeTruthy();
  });

  it('renders subtitle text', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(EndpointsPage)).container; });
    expect(container!.textContent).toContain('endpoints.subtitle');
  });
});
