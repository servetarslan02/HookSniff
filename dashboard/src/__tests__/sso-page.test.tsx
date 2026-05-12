// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor, cleanup } from '@testing-library/react';

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

import SsoSettingsPage from '@/app/[locale]/[username]/sso/page';

describe('SsoSettingsPage', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({});
  });

  it('renders loading state initially', async () => {
    mockApiFetch.mockImplementation(() => new Promise(() => {}));
    const { container } = render(<SsoSettingsPage />);
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders page header after loading', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText(/SSO \/ SAML/)).toBeTruthy();
    });
  });

  it('shows description text', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText(/Configure Single Sign-On/)).toBeTruthy();
    });
  });

  it('renders provider selection buttons', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('SAML 2.0')).toBeTruthy();
      expect(getByText('OpenID Connect')).toBeTruthy();
    });
  });

  it('shows SAML provider description', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText(/Okta, OneLogin, Azure AD/)).toBeTruthy();
    });
  });

  it('shows OIDC provider description', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText(/Auth0, Keycloak, AWS Cognito/)).toBeTruthy();
    });
  });

  it('renders SAML configuration fields by default', async () => {
    const { getByText, getByPlaceholderText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('SAML Configuration')).toBeTruthy();
      expect(getByPlaceholderText('https://idp.example.com/metadata.xml')).toBeTruthy();
      expect(getByPlaceholderText('urn:hooksniff:sp')).toBeTruthy();
      expect(getByPlaceholderText('https://idp.example.com/sso')).toBeTruthy();
    });
  });

  it('renders certificate textarea for SAML', async () => {
    const { getByPlaceholderText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByPlaceholderText(/BEGIN CERTIFICATE/)).toBeTruthy();
    });
  });

  it('switches to OIDC configuration when OIDC is selected', async () => {
    const { getByText, getByPlaceholderText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('SAML 2.0')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.click(getByText('OpenID Connect'));
    });
    await waitFor(() => {
      expect(getByText('OpenID Connect Configuration')).toBeTruthy();
      expect(getByPlaceholderText('https://accounts.google.com')).toBeTruthy();
      expect(getByPlaceholderText('your-client-id')).toBeTruthy();
      expect(getByPlaceholderText('your-client-secret')).toBeTruthy();
    });
  });

  it('renders enable SSO toggle', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('Enable SSO')).toBeTruthy();
    });
  });

  it('shows SSO description text', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText(/When enabled, all team members must authenticate via SSO/)).toBeTruthy();
    });
  });

  it('renders save configuration button', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('Save Configuration')).toBeTruthy();
    });
  });

  it('renders the business plan info', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText(/SSO is available on the/)).toBeTruthy();
      expect(getByText('Business')).toBeTruthy();
    });
  });

  it('calls apiFetch on save with SAML config', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('Save Configuration')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.click(getByText('Save Configuration'));
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/sso/config', expect.objectContaining({
        method: 'POST',
        token: 'test-token',
      }));
      expect(mockToast).toHaveBeenCalledWith('SSO configuration saved!', 'success');
    });
  });

  it('shows error toast on save failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Save failed'));
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('Save Configuration')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.click(getByText('Save Configuration'));
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
    });
  });

  it('populates fields from fetched SAML config', async () => {
    mockApiFetch.mockResolvedValue({
      provider: 'saml',
      enabled: true,
      metadata_url: 'https://idp.example.com/metadata.xml',
      entity_id: 'urn:test:sp',
      sso_url: 'https://idp.example.com/sso',
      certificate_set: true,
    });
    const { getByDisplayValue } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByDisplayValue('https://idp.example.com/metadata.xml')).toBeTruthy();
      expect(getByDisplayValue('urn:test:sp')).toBeTruthy();
      expect(getByDisplayValue('https://idp.example.com/sso')).toBeTruthy();
    });
  });

  it('populates fields from fetched OIDC config', async () => {
    mockApiFetch.mockResolvedValue({
      provider: 'oidc',
      enabled: true,
      issuer_url: 'https://accounts.google.com',
      client_id: 'my-client-id',
    });
    const { getByDisplayValue } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByDisplayValue('https://accounts.google.com')).toBeTruthy();
      expect(getByDisplayValue('my-client-id')).toBeTruthy();
    });
  });

  it('allows toggling SSO enable checkbox', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('Enable SSO')).toBeTruthy();
    });
    const toggle = document.querySelector('input[type="checkbox"]');
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle!);
  });

  it('allows editing metadata URL', async () => {
    const { getByPlaceholderText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      const input = getByPlaceholderText('https://idp.example.com/metadata.xml');
      fireEvent.change(input, { target: { value: 'https://new-idp.com/metadata.xml' } });
      expect(input.value).toBe('https://new-idp.com/metadata.xml');
    });
  });

  it('allows editing entity ID', async () => {
    const { getByPlaceholderText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      const input = getByPlaceholderText('urn:hooksniff:sp');
      fireEvent.change(input, { target: { value: 'urn:custom:sp' } });
      expect(input.value).toBe('urn:custom:sp');
    });
  });

  it('sends correct body for OIDC provider on save', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('OpenID Connect')).toBeTruthy();
    });
    await act(async () => {
      fireEvent.click(getByText('OpenID Connect'));
    });
    await act(async () => {
      fireEvent.click(getByText('Save Configuration'));
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/sso/config', expect.objectContaining({
        body: expect.objectContaining({ provider: 'oidc' }),
      }));
    });
  });

  it('shows upgrade link', async () => {
    const { getByText } = render(<SsoSettingsPage />);
    await waitFor(() => {
      expect(getByText('Upgrade now')).toBeTruthy();
    });
  });
});
