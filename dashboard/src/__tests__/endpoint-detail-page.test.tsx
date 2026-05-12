// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'endpoint-123' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockList = vi.fn().mockResolvedValue([
  {
    id: 'endpoint-123',
    url: 'https://example.com/webhook',
    description: 'Test',
    is_active: true,
    created_at: '2024-01-01',
    retry_policy: {
      max_attempts: 5,
      backoff: 'exponential',
      initial_delay_secs: 10,
      max_delay_secs: 3600,
    },
  },
]);
const mockUpdateRetryPolicy = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: mockList,
    updateRetryPolicy: mockUpdateRetryPolicy,
  },
}));

const { default: EndpointSettingsPage } = await import('@/app/[locale]/[username]/endpoints/[id]/page');

describe('EndpointSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue([
      {
        id: 'endpoint-123',
        url: 'https://example.com/webhook',
        description: 'Test',
        is_active: true,
        created_at: '2024-01-01',
        retry_policy: {
          max_attempts: 5,
          backoff: 'exponential',
          initial_delay_secs: 10,
          max_delay_secs: 3600,
        },
      },
    ]);
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
  });

  it('fetches endpoint on mount', async () => {
    await act(async () => {
      render(React.createElement(EndpointSettingsPage));
    });
    expect(mockList).toHaveBeenCalledWith('test-token');
  });

  it('displays endpoint settings title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(EndpointSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Endpoint Settings');
  });

  it('shows loading state initially', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    act(() => {
      const result = render(React.createElement(EndpointSettingsPage));
      container = result.container;
    });
    expect(container!.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders retry policy section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(EndpointSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Retry Policy');
  });
});
