// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: SchemasPage } = await import('@/app/[locale]/[username]/schemas/page');

const MOCK_SCHEMAS = [
  { id: 'sch_1', name: 'Order Schema', version: '1.0.0', created_at: '2024-01-15' },
  { id: 'sch_2', name: 'Payment Schema', version: '2.1.0', created_at: '2024-02-20' },
  { id: 'sch_3', name: 'User Schema', version: '1.3.2', created_at: '2024-03-10' },
];

describe('SchemasPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({ schemas: MOCK_SCHEMAS });
  });

  // === Loading State ===
  it('shows loading text initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(SchemasPage));
    expect(container.textContent).toContain('Loading...');
  });

  // === Page Content ===
  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('📋 Schemas');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Define and validate event schemas');
    });
  });

  // === Schema List ===
  it('renders all schemas', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Order Schema');
      expect(container.textContent).toContain('Payment Schema');
      expect(container.textContent).toContain('User Schema');
    });
  });

  it('renders schema versions', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('v1.0.0');
      expect(container.textContent).toContain('v2.1.0');
      expect(container.textContent).toContain('v1.3.2');
    });
  });

  it('renders schema creation dates', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('2024-01-15');
      expect(container.textContent).toContain('2024-02-20');
      expect(container.textContent).toContain('2024-03-10');
    });
  });

  // === Empty State ===
  it('shows empty state when no schemas', async () => {
    mockApiFetch.mockResolvedValue({ schemas: [] });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('No schemas registered yet');
      expect(container.textContent).toContain('Register a schema to start validating');
    });
  });

  it('shows empty state with correct styling', async () => {
    mockApiFetch.mockResolvedValue({ schemas: [] });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      const emptyDiv = container.querySelector('.text-center.py-12');
      expect(emptyDiv).toBeTruthy();
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      // Should show empty state (schemas defaults to [])
      expect(container.textContent).toContain('No schemas registered yet');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/schemas/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // === Single Schema ===
  it('renders single schema correctly', async () => {
    mockApiFetch.mockResolvedValue({ schemas: [MOCK_SCHEMAS[0]] });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Order Schema');
      const schemaDivs = container.querySelectorAll('.bg-white.dark\\:bg-slate-800.rounded-xl');
      expect(schemaDivs.length).toBe(1);
    });
  });

  // === API Call ===
  it('calls apiFetch with correct endpoint', async () => {
    await act(async () => {
      render(React.createElement(SchemasPage));
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/schemas', { token: 'test-token' });
    });
  });

  // === API returns null schemas ===
  it('handles null schemas in response', async () => {
    mockApiFetch.mockResolvedValue({ schemas: null });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SchemasPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('No schemas registered yet');
    });
  });
});
