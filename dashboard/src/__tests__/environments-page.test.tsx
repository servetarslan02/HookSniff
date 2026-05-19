// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockToast = vi.fn();
const mockInvalidateQueries = vi.fn();

const MOCK_ENVS = [
  {
    id: 'env-1',
    customer_id: 'cust-1',
    name: 'Production',
    slug: 'production',
    description: 'Live environment',
    is_default: true,
    color: '#22c55e',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    variable_count: 3,
  },
  {
    id: 'env-2',
    customer_id: 'cust-1',
    name: 'Staging',
    slug: 'staging',
    description: null,
    is_default: false,
    color: '#3b82f6',
    created_at: '2026-05-02T00:00:00Z',
    updated_at: '2026-05-02T00:00:00Z',
    variable_count: 0,
  },
];

const MOCK_VARIABLES = [
  { id: 'var-1', environment_id: 'env-1', key: 'API_KEY', value: 'sk-123', is_secret: true, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 'var-2', environment_id: 'env-1', key: 'WEBHOOK_URL', value: 'https://hooks.example.com', is_secret: false, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
];

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'test@test.com' } }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@tanstack/react-query', () => {
  let queryFn: ((...args: any[]) => any) | null = null;
  let queryEnabled = false;
  let mutationFn: ((...args: any[]) => any) | null = null;
  let mutationOnSuccess: (() => void) | null = null;

  return {
    useQuery: (opts: any) => {
      queryFn = opts.queryFn;
      queryEnabled = opts.enabled;
      // Return mock data based on queryKey
      if (opts.queryKey?.[0] === 'environments') {
        return { data: MOCK_ENVS, isLoading: false, error: null, refetch: vi.fn() };
      }
      if (opts.queryKey?.[0] === 'environment-variables') {
        return { data: MOCK_VARIABLES, isLoading: false };
      }
      return { data: [], isLoading: false, error: null, refetch: vi.fn() };
    },
    useMutation: (opts: any) => {
      mutationFn = opts.mutationFn;
      mutationOnSuccess = opts.onSuccess;
      return {
        mutate: vi.fn().mockImplementation((...args: any[]) => {
          opts.onSuccess?.();
        }),
        isPending: false,
      };
    },
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

vi.mock('@/lib/api', () => ({
  environmentsApi: {
    list: vi.fn().mockResolvedValue(MOCK_ENVS),
    get: vi.fn().mockResolvedValue(MOCK_ENVS[0]),
    create: vi.fn().mockResolvedValue({ ...MOCK_ENVS[0], id: 'env-new' }),
    update: vi.fn().mockResolvedValue(MOCK_ENVS[0]),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    listVariables: vi.fn().mockResolvedValue(MOCK_VARIABLES),
    createVariable: vi.fn().mockResolvedValue(MOCK_VARIABLES[0]),
    deleteVariable: vi.fn().mockResolvedValue({ deleted: true }),
  },
}));

const { default: EnvironmentsPage } = await import('@/app/[locale]/(dashboard)/environments/page');

describe('EnvironmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container).toBeTruthy();
  });

  it('renders page title', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container.textContent).toContain('title');
  });

  it('renders environment cards', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container.textContent).toContain('Production');
    expect(container.textContent).toContain('Staging');
  });

  it('shows slug for each environment', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container.textContent).toContain('production');
    expect(container.textContent).toContain('staging');
  });

  it('shows default badge for default environment', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container.textContent).toContain('default');
  });

  it('shows variable count', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container.textContent).toContain('3');
    expect(container.textContent).toContain('0');
  });

  it('shows description when present', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    expect(container.textContent).toContain('Live environment');
  });

  it('renders new environment button', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('newEnvironment'));
    expect(btn).toBeTruthy();
  });

  it('opens create modal on button click', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('newEnvironment'))!;
    fireEvent.click(btn);
    expect(container.textContent).toContain('createEnvironment');
  });

  it('shows edit button for each environment', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const editBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent?.includes('edit'));
    expect(editBtns.length).toBe(2);
  });

  it('shows delete button for each environment', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'delete');
    expect(deleteBtns.length).toBe(2);
  });

  it('opens delete confirmation on delete click', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const deleteBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'delete')!;
    fireEvent.click(deleteBtn);
    expect(container.textContent).toContain('confirmDeleteTitle');
    expect(container.textContent).toContain('confirmDeleteDesc');
  });

  it('shows edit modal with pre-filled data', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const editBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('edit'))!;
    fireEvent.click(editBtn);
    expect(container.textContent).toContain('editEnvironment');
  });

  it('opens variables panel on variable count click', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const varBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('variables'))!;
    fireEvent.click(varBtn);
    expect(container.textContent).toContain('addVariable');
  });

  it('shows variables in panel', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const varBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('variables'))!;
    fireEvent.click(varBtn);
    expect(container.textContent).toContain('API_KEY');
    expect(container.textContent).toContain('WEBHOOK_URL');
  });

  it('shows secret indicator for secret variables', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const varBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('variables'))!;
    fireEvent.click(varBtn);
    // Secret value should be hidden
    expect(container.textContent).toContain('••••••••');
  });

  it('shows color dot for each environment', () => {
    const { container } = render(React.createElement(EnvironmentsPage));
    const dots = container.querySelectorAll('[style*="background-color"]');
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });
});
