// ── SSO Utilities ─────────────────────────────────────────────
// IdP templates and friendly error messages for SSO configuration.

export interface IdpTemplate {
  id: string;
  name: string;
  icon: string;
  provider: 'saml' | 'oidc';
  issuerUrl?: string;
  issuerPrefix?: string;
  issuerSuffix?: string;
  issuerPlaceholder?: string;
  clientIdPlaceholder?: string;
  metadataPlaceholder?: string;
  ssoUrlPlaceholder?: string;
  entityIdPlaceholder?: string;
  helpUrl: string;
  hint: string;
}

export const IDP_TEMPLATES: IdpTemplate[] = [
  {
    id: 'azure',
    name: 'Microsoft Azure AD',
    icon: '🪟',
    provider: 'oidc',
    issuerPrefix: 'https://login.microsoftonline.com/',
    issuerSuffix: '/v2.0',
    issuerPlaceholder: 'https://login.microsoftonline.com/{tenant-id}/v2.0',
    clientIdPlaceholder: 'Application (client) ID',
    helpUrl: 'https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app',
    hint: 'Find your Tenant ID in Azure Portal → Azure Active Directory → Overview',
  },
  {
    id: 'google',
    name: 'Google Workspace',
    icon: '🔴',
    provider: 'oidc',
    issuerUrl: 'https://accounts.google.com',
    clientIdPlaceholder: 'Client ID from Google Cloud Console',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    hint: 'Create OAuth 2.0 Client ID in Google Cloud Console → APIs & Services → Credentials',
  },
  {
    id: 'okta',
    name: 'Okta',
    icon: '🔵',
    provider: 'oidc',
    issuerPrefix: 'https://',
    issuerSuffix: '.okta.com',
    issuerPlaceholder: 'https://{your-org}.okta.com',
    clientIdPlaceholder: 'Client ID from Okta Admin',
    helpUrl: 'https://help.okta.com/en-us/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm',
    hint: 'Create a Web Application in Okta Admin → Applications → Create App Integration',
  },
  {
    id: 'keycloak',
    name: 'Keycloak',
    icon: '🦁',
    provider: 'oidc',
    issuerPrefix: 'https://',
    issuerSuffix: '/realms/{realm}',
    issuerPlaceholder: 'https://{your-keycloak}/realms/{realm-name}',
    clientIdPlaceholder: 'Client ID (e.g. hooksniff)',
    helpUrl: 'https://www.keycloak.org/docs/latest/server_admin/',
    hint: 'Create a Client in Keycloak Admin → Clients → Create client',
  },
  {
    id: 'auth0',
    name: 'Auth0',
    icon: '🔑',
    provider: 'oidc',
    issuerPrefix: 'https://',
    issuerSuffix: '.auth0.com',
    issuerPlaceholder: 'https://{your-tenant}.auth0.com',
    clientIdPlaceholder: 'Client ID from Auth0 Dashboard',
    helpUrl: 'https://auth0.com/docs/get-started/auth0-overview/create-applications',
    hint: 'Create a Regular Web Application in Auth0 Dashboard → Applications',
  },
  {
    id: 'onelogin',
    name: 'OneLogin',
    icon: '🟢',
    provider: 'saml',
    metadataPlaceholder: 'https://{your-org}.onelogin.com/saml/metadata/{app-id}',
    ssoUrlPlaceholder: 'https://{your-org}.onelogin.com/trust/saml2/http-post/sso/{app-id}',
    entityIdPlaceholder: 'urn:hooksniff:sp',
    helpUrl: 'https://onelogin.servicecloud.support/s/article/SAML-connector',
    hint: 'Create a SAML Custom Connector (Advanced) in OneLogin Admin → Applications',
  },
  {
    id: 'adfs',
    name: 'AD FS',
    icon: '🏛️',
    provider: 'saml',
    metadataPlaceholder: 'https://{your-adfs}/FederationMetadata/2007-06/FederationMetadata.xml',
    ssoUrlPlaceholder: 'https://{your-adfs}/adfs/ls/',
    entityIdPlaceholder: 'urn:hooksniff:sp',
    helpUrl: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/development/ad-fs-openid-connect-oauth-flows-scenarios',
    hint: 'Add a Relying Party Trust in AD FS Management → Trust Relationships',
  },
];

// ── Friendly error messages ─────────────────────────────────

export function getFriendlyError(error: string): { title: string; message: string; action?: string } {
  const lower = error.toLowerCase();

  if (lower.includes('oidc discovery') || lower.includes('openid-configuration')) {
    return {
      title: 'Issuer URL yanıt vermiyor',
      message: 'Issuer URL\'niz doğru çalışmıyor. URL\'in sonunda /.well-known/openid-configuration ekleyerek tarayıcınızda kontrol edin.',
      action: 'URL\'i kontrol et',
    };
  }
  if (lower.includes('token exchange') || lower.includes('authorization code')) {
    return {
      title: 'Token alınamadı',
      message: 'Client ID veya Client Secret hatalı olabilir. Bilgileri IdP konsolundan kontrol edin.',
      action: 'Bilgileri kontrol et',
    };
  }
  if (lower.includes('certificate') || lower.includes('x509')) {
    return {
      title: 'Sertifika hatası',
      message: 'Sertifika PEM formatında olmalı. IdP\'den indirdiğiniz sertifikayı olduğu gibi yapıştırın.',
      action: 'Sertifikayı yeniden yapıştır',
    };
  }
  if (lower.includes('metadata') || lower.includes('entitydescriptor')) {
    return {
      title: 'Metadata URL geçersiz',
      message: 'Metadata URL\'niz SAML metadata döndürmüyor. URL\'i tarayıcınızda açıp XML içerdiğini kontrol edin.',
      action: 'URL\'i kontrol et',
    };
  }
  if (lower.includes('domain') || lower.includes('dns') || lower.includes('txt')) {
    return {
      title: 'Domain doğrulanamadı',
      message: 'DNS TXT kaydı bulunamadı. Kaydı eklediyseniz, DNS yayılması 48 saat sürebilir.',
      action: 'DNS kaydını kontrol et',
    };
  }
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('fetch')) {
    return {
      title: 'Bağlantı hatası',
      message: 'IdP sunucusuna bağlanılamıyor. URL\'in doğru olduğundan ve sunucunun çalıştığından emin olun.',
      action: 'URL\'i kontrol et',
    };
  }
  if (lower.includes('unauthorized') || lower.includes('401')) {
    return {
      title: 'Yetkilendirme hatası',
      message: 'Client Secret yanlış veya süresi dolmuş. IdP konsolundan yeni bir secret oluşturun.',
      action: 'Secret\'ı yenile',
    };
  }

  return {
    title: 'Bir hata oluştu',
    message: error,
  };
}
