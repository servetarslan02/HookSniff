// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: SsoSettingsPage } = await import('@/app/[locale]/[username]/sso/page');

const MOCK_SAML_CONFIG = {
  provider: 'saml',
  enabled: true,
  metadata_url: 'https://idp.example.com/metadata.xml',
  entity_id: 'urn:hooksniff:sp',
  sso_url: 'https://idp.example.com/sso',
  certificate_set: true,
};

const MOCK_OIDC_CONFIG = {
  provider: 'oidc',
  enabled: false,
  issuer_url: 'https://accounts.google.com',
  client_id: 'my-client-id',
  client_secret_set: true,
};

describe('SsoSettingsPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue(MOCK_SAML_CONFIG);
  });

  // === Loading State ===
  it('shows loading skeleton initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(SsoSettingsPage));
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  // === Page Header ===
  it('renders page header with emoji', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🔐');
      expect(container.textContent).toContain('SSO / SAML');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Configure Single Sign-On');
      expect(container.textContent).toContain('Enterprise plan required');
    });
  });

  // === Provider Selection ===
  it('renders SAML provider option', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('SAML 2.0');
      expect(container.textContent).toContain('Okta, OneLogin, Azure AD');
    });
  });

  it('renders OIDC provider option', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('OpenID Connect');
      expect(container.textContent).toContain('Auth0, Keycloak');
    });
  });

  it('renders provider icons', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🏛️');
      expect(container.textContent).toContain('🔑');
    });
  });

  it('highlights selected provider', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      const samlBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('SAML 2.0'));
      expect(samlBtn!.className).toContain('border-brand-500');
    });
  });

  // === SAML Config ===
  it('renders SAML configuration fields when SAML selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('SAML Configuration');
      expect(container.textContent).toContain('Metadata URL');
      expect(container.textContent).toContain('Entity ID');
      expect(container.textContent).toContain('SSO URL');
      expect(container.textContent).toContain('X.509 Certificate');
    });
  });

  it('populates SAML fields from config', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      const inputs = container.querySelectorAll('input');
      const metadataInput = Array.from(inputs).find(i => i.placeholder?.includes('metadata.xml'));
      expect(metadataInput!.value).toBe('https://idp.example.com/metadata.xml');
    });
  });

  // === OIDC Config ===
  it('renders OIDC configuration fields when OIDC selected', async () => {
    mockApiFetch.mockResolvedValue(MOCK_OIDC_CONFIG);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('OpenID Connect Configuration');
      expect(container.textContent).toContain('Issuer URL');
      expect(container.textContent).toContain('Client ID');
      expect(container.textContent).toContain('Client Secret');
    });
  });

  it('switches to OIDC on click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('OpenID Connect');
    });
    const oidcBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('OpenID Connect'));
    await act(async () => {
      fireEvent.click(oidcBtn!);
    });
    expect(container.textContent).toContain('OpenID Connect Configuration');
  });

  // === Enable Toggle ===
  it('renders enable SSO toggle', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Enable SSO');
      expect(container.textContent).toContain('all team members must authenticate via SSO');
    });
  });

  it('toggle reflects enabled state from config', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  it('toggles enable state on click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Enable SSO');
    });
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.click(checkbox);
    });
    expect(checkbox.checked).toBe(false);
  });

  // === Save ===
  it('renders save button', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Configuration');
      expect(saveBtn).toBeTruthy();
    });
  });

  it('calls apiFetch on save with SAML config', async () => {
    mockApiFetch.mockResolvedValue({});
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Configuration');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Configuration');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/sso/config', expect.objectContaining({
        method: 'POST',
        token: 'test-token',
      }));
      expect(mockToast).toHaveBeenCalledWith('SSO configuration saved!', 'success');
    });
  });

  it('shows saving state during save', async () => {
    mockApiFetch
      .mockResolvedValueOnce(MOCK_SAML_CONFIG)
      .mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Configuration');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Configuration');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Saving...');
    });
  });

  it('shows error toast on save failure', async () => {
    mockApiFetch
      .mockResolvedValueOnce(MOCK_SAML_CONFIG)
      .mockRejectedValueOnce(new Error('Save failed'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Save Configuration');
    });
    const saveBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Save Configuration');
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Save failed', 'error');
    });
  });

  // === Info Banner ===
  it('renders info banner about Business plan', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('SSO is available on the');
      expect(container.textContent).toContain('Business');
      expect(container.textContent).toContain('Upgrade now');
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    // Should still render with defaults
    await waitFor(() => {
      expect(container.textContent).toContain('SSO / SAML');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/components/Toast', () => ({ useToast: () => ({ toast: mockToast }) }));
    vi.doMock('@/lib/api', () => ({ apiFetch: (...args: unknown[]) => mockApiFetch(...args) }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/sso/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  // === Input Interactions ===
  it('updates metadata URL on input change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Metadata URL');
    });
    const metadataInput = container.querySelector('input[placeholder*="metadata.xml"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(metadataInput, { target: { value: 'https://new-idp.com/meta' } });
    });
    expect(metadataInput.value).toBe('https://new-idp.com/meta');
  });

  it('updates entity ID on input change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Entity ID');
    });
    const entityInput = container.querySelector('input[placeholder*="urn:hooksniff"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(entityInput, { target: { value: 'new-entity-id' } });
    });
    expect(entityInput.value).toBe('new-entity-id');
  });

  it('updates SSO URL on input change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('SSO URL');
    });
    const ssoInput = container.querySelector('input[placeholder*="sso"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(ssoInput, { target: { value: 'https://new-sso.com' } });
    });
    expect(ssoInput.value).toBe('https://new-sso.com');
  });

  it('updates certificate on textarea change', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SsoSettingsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('X.509 Certificate');
    });
    const textarea = container.querySelector('textarea');
    await act(async () => {
      fireEvent.change(textarea!, { target: { value: '-----BEGIN CERTIFICATE-----\nTEST\n-----END CERTIFICATE-----' } });
    });
    expect(textarea!.value).toContain('BEGIN CERTIFICATE');
  });
});
