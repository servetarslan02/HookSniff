'use client';


import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import { useSsoConfig, useTeams } from '@/hooks/useDashboardData';
import { AlertTriangle, BarChart3, Building2, Check, CheckCircle2, ClipboardList, Eye, ExternalLink, Globe, Key, Pencil, Shield, ShieldCheck, Users, XCircle } from '@/components/icons';

// ── IdP Templates ───────────────────────────────────────────
const IDP_TEMPLATES = [
  {
    id: 'azure',
    name: 'Microsoft Azure AD',
    icon: '🪟',
    provider: 'oidc' as const,
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
    provider: 'oidc' as const,
    issuerUrl: 'https://accounts.google.com',
    clientIdPlaceholder: 'Client ID from Google Cloud Console',
    helpUrl: 'https://console.cloud.google.com/apis/credentials',
    hint: 'Create OAuth 2.0 Client ID in Google Cloud Console → APIs & Services → Credentials',
  },
  {
    id: 'okta',
    name: 'Okta',
    icon: '🔵',
    provider: 'oidc' as const,
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
    provider: 'oidc' as const,
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
    provider: 'oidc' as const,
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
    provider: 'saml' as const,
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
    provider: 'saml' as const,
    metadataPlaceholder: 'https://{your-adfs}/FederationMetadata/2007-06/FederationMetadata.xml',
    ssoUrlPlaceholder: 'https://{your-adfs}/adfs/ls/',
    entityIdPlaceholder: 'urn:hooksniff:sp',
    helpUrl: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/development/ad-fs-openid-connect-oauth-flows-scenarios',
    hint: 'Add a Relying Party Trust in AD FS Management → Trust Relationships',
  },
];

// ── Friendly error messages ─────────────────────────────────
function getFriendlyError(error: string): { title: string; message: string; action?: string } {
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

/* ─── SSO/SAML Configuration Page (Enterprise Only) ─── */
export function SsoContent({ teamId: teamIdProp }: { teamId?: string } = {}) {
 const t = useTranslations('sso');
 const { token, user } = useAuth();
 const { toast } = useToast();
 const searchParams = useSearchParams();
 
 // team_id: prop > URL param > null
 const teamId = teamIdProp || searchParams.get('team_id') || undefined;
 
 const { data: ssoConfig, isLoading: loading, refetch } = useSsoConfig(teamId);

 const isEnterprise = user?.plan === 'enterprise';

 const [provider, setProvider] = useState<'saml' | 'oidc'>('saml');
 const [metadata, setMetadata] = useState('');
 const [entityId, setEntityId] = useState('');
 const [ssoUrl, setSsoUrl] = useState('');
 const [certificate, setCertificate] = useState('');
 const [saving, setSaving] = useState(false);
 const [testing, setTesting] = useState(false);
 const [defaultTeamId, setDefaultTeamId] = useState<string>('');
 const [defaultRole, setDefaultRole] = useState<string>('viewer');
 const [clientSecret, setClientSecret] = useState('');

 const { data: teams = [] } = useTeams();
 const [testPassed, setTestPassed] = useState(false);
 const [deleting, setDeleting] = useState(false);
 const [enforcing, setEnforcing] = useState(false);
 const [showEnforceModal, setShowEnforceModal] = useState(false);
 const [adminBypass, setAdminBypass] = useState(true);
 const [domainInput, setDomainInput] = useState('');
 const [txtRecord, setTxtRecord] = useState('');
 const [generatingTxt, setGeneratingTxt] = useState(false);
 const [verifyingDomain, setVerifyingDomain] = useState(false);
 const [domainVerified, setDomainVerified] = useState<boolean | null>(null);
 const [selectedTemplate, setSelectedTemplate] = useState<string>('');
 const [testAndActivateLoading, setTestAndActivateLoading] = useState(false);
 const [friendlyError, setFriendlyError] = useState<{ title: string; message: string; action?: string } | null>(null);

 const isConfigured = ssoConfig?.provider;
 const isEnforced = ssoConfig?.enabled;

 // Populate form fields when config loads
 useEffect(() => {
  if (ssoConfig?.provider) {
   setProvider(ssoConfig.provider as 'saml' | 'oidc');
   setMetadata(ssoConfig.metadata_url || ssoConfig.issuer_url || '');
   setEntityId(ssoConfig.entity_id || ssoConfig.client_id || '');
   setSsoUrl(ssoConfig.sso_url || '');
   setDefaultTeamId(ssoConfig.default_team_id || '');
   setDefaultRole(ssoConfig.default_role || 'viewer');
   setDomainInput(ssoConfig.verified_domain || '');
   setAdminBypass(ssoConfig.admin_bypass ?? true);
  }
 }, [ssoConfig]);

 // ── Handlers ──

 // Apply IdP template
 const handleTemplateSelect = (templateId: string) => {
  setSelectedTemplate(templateId);
  const template = IDP_TEMPLATES.find(t => t.id === templateId);
  if (!template) return;
  
  setProvider(template.provider);
  setFriendlyError(null);
  
  if (template.provider === 'oidc') {
   if ('issuerUrl' in template && template.issuerUrl) {
    setMetadata(template.issuerUrl);
   } else {
    setMetadata('');
   }
   setEntityId('');
   setClientSecret('');
  } else {
   setMetadata('');
   setSsoUrl('');
   setEntityId(template.entityIdPlaceholder || 'urn:hooksniff:sp');
   setCertificate('');
  }
 };

 // Auto-detect: when issuer URL changes, try to identify IdP
 const handleMetadataChange = useCallback((value: string) => {
  setMetadata(value);
  setFriendlyError(null);
  
  if (!value || selectedTemplate) return;
  
  const lower = value.toLowerCase();
  if (lower.includes('login.microsoftonline.com')) {
   setSelectedTemplate('azure');
   setProvider('oidc');
  } else if (lower.includes('accounts.google.com')) {
   setSelectedTemplate('google');
   setProvider('oidc');
  } else if (lower.includes('.okta.com')) {
   setSelectedTemplate('okta');
   setProvider('oidc');
  } else if (lower.includes('auth0.com')) {
   setSelectedTemplate('auth0');
   setProvider('oidc');
  } else if (lower.includes('/realms/')) {
   setSelectedTemplate('keycloak');
   setProvider('oidc');
  } else if (lower.includes('onelogin.com')) {
   setSelectedTemplate('onelogin');
   setProvider('saml');
  } else if (lower.includes('/adfs/') || lower.includes('federationmetadata')) {
   setSelectedTemplate('adfs');
   setProvider('saml');
  }
 }, [selectedTemplate]);

 // Test & Activate in one step
 const handleTestAndActivate = async () => {
  if (!token) return;
  setTestAndActivateLoading(true);
  setFriendlyError(null);
  
  try {
   // Step 1: Save config
   const body: Record<string, unknown> = {
    provider,
    enabled: false,
    admin_bypass: adminBypass,
   };
   if (teamId) body.team_id = teamId;
   if (provider === 'saml') {
    body.metadata_url = metadata || null;
    body.entity_id = entityId || null;
    body.sso_url = ssoUrl || null;
    if (certificate) body.certificate = certificate;
   } else {
    body.issuer_url = metadata || null;
    body.client_id = entityId || null;
    if (clientSecret) body.client_secret = clientSecret;
   }
   if (domainInput.trim()) body.verified_domain = domainInput.trim();
   body.default_team_id = defaultTeamId || null;
   body.default_role = defaultRole || 'viewer';
   
   await apiFetch('/sso/config', { method: 'POST', body, token });
   
   // Step 2: Test connection
   const { ssoApi } = await import('@/lib/api');
   const result = await ssoApi.testSso(token, teamId);
   
   if (!result.valid) {
    const errorMsg = result.issues ? (Array.isArray(result.issues) ? result.issues[0] : result.issues) : result.message || 'Test failed';
    setFriendlyError(getFriendlyError(errorMsg));
    toast(errorMsg, 'error');
    setTestAndActivateLoading(false);
    return;
   }
   
   // Step 3: Activate SSO
   body.enabled = true;
   await apiFetch('/sso/config', { method: 'POST', body, token });
   
   setTestPassed(true);
   toast(t('ssoActivated') || 'SSO activated successfully! 🎉', 'success');
   refetch();
  } catch (err) {
   const msg = err instanceof Error ? err.message : 'Unknown error';
   setFriendlyError(getFriendlyError(msg));
   toast(msg, 'error');
  } finally {
   setTestAndActivateLoading(false);
  }
 };

 const handleSave = async () => {
  if (!token) return;
  setSaving(true);
  try {
   const body: Record<string, unknown> = {
    provider,
    enabled: isEnforced ?? false,
    admin_bypass: adminBypass,
   };
   if (teamId) body.team_id = teamId;
   if (provider === 'saml') {
    body.metadata_url = metadata || null;
    body.entity_id = entityId || null;
    body.sso_url = ssoUrl || null;
    if (certificate) body.certificate = certificate;
   } else {
    body.issuer_url = metadata || null;
    body.client_id = entityId || null;
    if (clientSecret) body.client_secret = clientSecret;
   }
   // Verified domain
   if (domainInput.trim()) body.verified_domain = domainInput.trim();
   // Auto team join settings
   body.default_team_id = defaultTeamId || null;
   body.default_role = defaultRole || 'viewer';
   await apiFetch('/sso/config', { method: 'POST', body, token });
   toast(t('saved'), 'success');
   setFriendlyError(null);
   refetch();
  } catch (err) {
   const msg = err instanceof Error ? err.message : t('saveFailed');
   setFriendlyError(getFriendlyError(msg));
   toast(msg, 'error');
  } finally {
   setSaving(false);
  }
 };

 const handleTest = async () => {
  if (!token) return;
  setTesting(true);
  setTestPassed(false);
  try {
   const { ssoApi } = await import('@/lib/api');
   const result = await ssoApi.testSso(token, teamId);
   if (result.valid) {
    setTestPassed(true);
    setFriendlyError(null);
    toast(result.message || t('testSuccess'), 'success');
   } else {
    const issues = result.issues ? (Array.isArray(result.issues) ? result.issues.join(', ') : result.issues) : null;
    const errorMsg = issues || result.message || t('testFailed');
    setFriendlyError(getFriendlyError(errorMsg));
    toast(errorMsg, 'error');
   }
  } catch (err) {
   const msg = err instanceof Error ? err.message : t('testFailed');
   setFriendlyError(getFriendlyError(msg));
   toast(msg, 'error');
  } finally {
   setTesting(false);
  }
 };

 const handleEnforce = async () => {
  if (!token) return;
  setEnforcing(true);
  try {
   const body: Record<string, unknown> = {
    provider: ssoConfig?.provider || provider,
    enabled: true,
    admin_bypass: adminBypass,
   };
   if (teamId) body.team_id = teamId;
   await apiFetch('/sso/config', { method: 'POST', body, token });
   toast(t('enforced'), 'success');
   setShowEnforceModal(false);
   refetch();
  } catch (err) {
   toast(err instanceof Error ? err.message : t('enforceFailed'), 'error');
  } finally {
   setEnforcing(false);
  }
 };

 const handleDisable = async () => {
  if (!token) return;
  if (!window.confirm(t('disableConfirm'))) return;
  setEnforcing(true);
  try {
   const body: Record<string, unknown> = {
    provider: ssoConfig?.provider || provider,
    enabled: false,
   };
   if (teamId) body.team_id = teamId;
   await apiFetch('/sso/config', { method: 'POST', body, token });
   toast(t('disabled'), 'success');
   refetch();
  } catch (err) {
   toast(err instanceof Error ? err.message : t('disableFailed'), 'error');
  } finally {
   setEnforcing(false);
  }
 };

 const handleDelete = async () => {
  if (!token) return;
  if (!window.confirm(t('deleteConfirm'))) return;
  setDeleting(true);
  try {
   const { ssoApi } = await import('@/lib/api');
   await ssoApi.deleteSso(token, teamId);
   toast(t('deleted'), 'success');
   setMetadata('');
   setEntityId('');
   setSsoUrl('');
   setCertificate('');
   setClientSecret('');
   setTestPassed(false);
   refetch();
  } catch (err) {
   toast(err instanceof Error ? err.message : t('deleteFailed'), 'error');
  } finally {
   setDeleting(false);
  }
 };

 const handleGenerateTxtRecord = async () => {
  if (!token || !domainInput.trim()) return;
  setGeneratingTxt(true);
  setTxtRecord('');
  setDomainVerified(null);
  try {
   const result = await apiFetch<{ txt_record: string; instructions: string }>('/sso/verify-domain', {
    method: 'POST',
    body: { domain: domainInput.trim() },
    token,
   });
   setTxtRecord(result.txt_record);
  } catch (err) {
   toast(err instanceof Error ? err.message : (t('generateTxtFailed') || 'Failed to generate TXT record'), 'error');
  } finally {
   setGeneratingTxt(false);
  }
 };

 const handleVerifyDomain = async () => {
  if (!token || !domainInput.trim()) return;
  setVerifyingDomain(true);
  setDomainVerified(null);
  try {
   const result = await apiFetch<{ verified: boolean; message: string }>('/sso/verify-domain/check', {
    method: 'POST',
    body: { domain: domainInput.trim() },
    token,
   });
   setDomainVerified(result.verified);
   if (result.verified) {
    toast(result.message, 'success');
    refetch();
   } else {
    toast(result.message, 'error');
   }
  } catch (err) {
   toast(err instanceof Error ? err.message : (t('verifyFailed') || 'Verification failed'), 'error');
   setDomainVerified(false);
  } finally {
   setVerifyingDomain(false);
  }
 };

 const ssoLoginUrl = user?.email
  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/v1/sso/login?email=${encodeURIComponent(user.email)}`
  : null;

 // ── Loading ──
 if (loading) {
  return (
   <div className="space-y-6">
    <div className="glass-card p-6 animate-pulse">
     <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
     <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
    </div>
   </div>
  );
 }

 // ── Non-Enterprise: upgrade prompt ──
 if (!isEnterprise) {
  return (
   <div className="space-y-8">
    <div>
     <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
     <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
    </div>
    <div className="glass-card p-8 text-center">
     <div className="text-5xl mb-4"><ShieldCheck size={18} strokeWidth={1.75} /></div>
     <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('enterpriseOnlyTitle')}</h2>
     <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{t('enterpriseOnlyDesc')}</p>
     <a href="/billing" className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
      {t('upgradeNow')}
     </a>
     <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
      <a href="/docs/sso" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">
       {t('learnMore') || 'Learn how SSO works →'}
      </a>
     </p>
    </div>
   </div>
  );
 }

 // ── Enterprise: full SSO config ──
 return (
  <div className="space-y-8">
   {/* Header */}
   <div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
    <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
    <a href="/docs/sso" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm text-brand-600 dark:text-brand-400 hover:underline">
     <ShieldCheck size={14} strokeWidth={1.75} />
     {t('setupGuide') || 'View SSO setup guide →'}
    </a>
   </div>

   {/* Status Banner */}
   {isEnforced && (
    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
     <div className="flex items-center gap-3">
      <span className="text-2xl"><CheckCircle2 size={18} strokeWidth={1.75} /></span>
      <div>
       <div className="font-semibold text-emerald-800 dark:text-emerald-300">{t('ssoActive')}</div>
       <div className="text-sm text-emerald-600 dark:text-emerald-400">{t('ssoActiveDesc')}</div>
      </div>
     </div>
     <button
      type="button"
      onClick={handleDisable}
      disabled={enforcing}
      className="px-4 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"
     >
      {t('disableSso')}
     </button>
    </div>
   )}

   {/* Step 1: IdP Template Selection */}
   <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-4">
     <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">1</span>
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('selectIdP') || 'Select Your Identity Provider'}</h2>
    </div>
    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('selectIdPHint') || 'Choose your IdP to auto-configure settings. You can also set up manually.'}</p>
    
    {/* Template Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
     {IDP_TEMPLATES.map((tmpl) => (
      <button
       key={tmpl.id}
       type="button"
       onClick={() => handleTemplateSelect(tmpl.id)}
       disabled={isEnforced}
       className={`p-3 rounded-xl border-2 text-left transition ${
        selectedTemplate === tmpl.id
         ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
         : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
       } ${isEnforced ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
       <div className="text-2xl mb-1">{tmpl.icon}</div>
       <div className="text-sm font-medium text-gray-900 dark:text-white">{tmpl.name}</div>
       <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{tmpl.provider === 'oidc' ? 'OIDC' : 'SAML'}</div>
      </button>
     ))}
    </div>
    
    {/* Selected template hint */}
    {selectedTemplate && (() => {
     const tmpl = IDP_TEMPLATES.find(t => t.id === selectedTemplate);
     if (!tmpl) return null;
     return (
      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
       <span className="text-blue-500 mt-0.5">💡</span>
       <div className="flex-1">
        <p className="text-sm text-blue-700 dark:text-blue-300">{tmpl.hint}</p>
        {tmpl.helpUrl && (
         <a href={tmpl.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
          <ExternalLink size={12} /> {t('viewGuide') || 'View setup guide'}
         </a>
        )}
       </div>
      </div>
     );
    })()}
   </div>

   {/* Step 2: Provider Selection (Manual) */}
   <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-4">
     <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">2</span>
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('provider')}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {[
      { id: 'saml' as const, name: 'SAML 2.0', desc: 'Okta, OneLogin, Azure AD, Google Workspace', icon: <Building2 size={16} strokeWidth={1.75} /> },
      { id: 'oidc' as const, name: 'OpenID Connect', desc: 'Auth0, Keycloak, AWS Cognito', icon: <Key size={16} strokeWidth={1.75} /> },
     ].map((p) => (
      <button
       key={p.id}
       onClick={() => setProvider(p.id)}
       disabled={isEnforced}
       className={`p-4 rounded-xl border-2 text-left transition ${
        provider === p.id
         ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
         : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
       } ${isEnforced ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
       <div className="flex items-center gap-3">
        <span className="text-2xl">{p.icon}</span>
        <div>
         <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
         <div className="text-xs text-gray-500 dark:text-slate-400">{p.desc}</div>
        </div>
       </div>
      </button>
     ))}
    </div>
   </div>

   {/* Verified Domain */}
   <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-4">
     <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold"><Globe size={18} strokeWidth={1.75} /></span>
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('verifiedDomain') || 'Verified Domain'}</h2>
    </div>
    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('verifiedDomainDesc') || 'Email domain for automatic SSO user discovery. Users with this domain will be matched to this organization.'}</p>

    {ssoConfig?.verified_domain ? (
     <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
      <span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={18} strokeWidth={1.75} /></span>
      <span className="text-sm font-mono font-medium text-emerald-800 dark:text-emerald-300">{ssoConfig.verified_domain}</span>
      <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-auto">{t('verified') || 'Verified'}</span>
     </div>
    ) : (
     <div className="space-y-3">
      <div className="flex gap-2">
       <input
        type="text"
        value={domainInput}
        onChange={(e) => setDomainInput(e.target.value)}
        placeholder="company.com"
        disabled={isEnforced}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed"
       />
       <button
        type="button"
        onClick={handleGenerateTxtRecord}
        disabled={!domainInput.trim() || generatingTxt || isEnforced}
        className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
       >
        {generatingTxt ? '...' : (t('generateTxt') || 'Generate')}
       </button>
      </div>

      {txtRecord && (
       <div className="space-y-3">
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
         <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('addTxtRecord') || 'Add this TXT record to your DNS:'}</p>
         <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono text-gray-800 dark:text-slate-200 break-all">{txtRecord}</code>
          <button
           type="button"
           onClick={() => { navigator.clipboard.writeText(txtRecord); toast('Copied!', 'success'); }}
           className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          ><ClipboardList size={18} strokeWidth={1.75} /></button>
         </div>
         <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
          {t('txtRecordName') || 'Name'}: <code className="font-mono">_hooksniff.{domainInput}</code>
         </p>
        </div>
        <button
         type="button"
         onClick={handleVerifyDomain}
         disabled={verifyingDomain}
         className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
         {verifyingDomain ? (t('verifying') || 'Verifying...') : (t('verifyDomain') || 'Verify Domain')}
        </button>
        {domainVerified === true && (
         <p className="text-sm text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('domainVerified') || 'Domain verified successfully!'}</p>
        )}
        {domainVerified === false && (
         <p className="text-sm text-red-600 dark:text-red-400"><XCircle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('domainVerifyFailed') || 'TXT record not found. Please add the record and try again.'}</p>
        )}
       </div>
      )}
     </div>
    )}
    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{t('verifiedDomainHint') || 'TXT record verification. Users with this email domain will be auto-matched.'}</p>
   </div>

   {/* Step 3: SAML Configuration */}
   {provider === 'saml' && (
    <div className="glass-card p-6">
     <div className="flex items-center gap-2 mb-4">
      <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">3</span>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('samlConfiguration')}</h2>
     </div>
     <div className="space-y-4">
      <div>
       <label htmlFor="sso-metadata-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('metadataUrl')}</label>
       <input id="sso-metadata-url" type="url" value={metadata} onChange={(e) => handleMetadataChange(e.target.value)} placeholder={IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.metadataPlaceholder || "https://idp.example.com/metadata.xml"} disabled={isEnforced}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
      </div>
      <div>
       <label htmlFor="sso-entity-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('entityId')}</label>
       <input id="sso-entity-id" type="text" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder={IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.entityIdPlaceholder || "urn:hooksniff:sp"} disabled={isEnforced}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
      </div>
      <div>
       <label htmlFor="sso-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('ssoUrl')}</label>
       <input id="sso-url" type="url" value={ssoUrl} onChange={(e) => setSsoUrl(e.target.value)} placeholder={IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.ssoUrlPlaceholder || "https://idp.example.com/sso"} disabled={isEnforced}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
      </div>
      <div>
       <label htmlFor="sso-certificate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {t('x509Certificate')}
        {ssoConfig?.certificate_set && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs"><Check size={16} strokeWidth={1.75} className="inline mr-1" /> {t('certificateSet')}</span>}
       </label>
       <textarea id="sso-certificate" value={certificate} onChange={(e) => setCertificate(e.target.value)} rows={4} disabled={isEnforced}
        placeholder={ssoConfig?.certificate_set ? '•••••••• (leave empty to keep)' : '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
      </div>
     </div>
    </div>
   )}

   {/* Step 3: OIDC Configuration */}
   {provider === 'oidc' && (
    <div className="glass-card p-6">
     <div className="flex items-center gap-2 mb-4">
      <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">3</span>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('oidcConfiguration')}</h2>
     </div>
     <div className="space-y-4">
      <div>
       <label htmlFor="sso-issuer-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('issuerUrl')}</label>
       <input id="sso-issuer-url" type="url" value={metadata} onChange={(e) => handleMetadataChange(e.target.value)} placeholder={IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.issuerPlaceholder || "https://accounts.google.com"} disabled={isEnforced}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
       {selectedTemplate && IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.hint && (
        <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400">💡 {IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.hint}</p>
       )}
      </div>
      <div>
       <label htmlFor="sso-client-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('clientId')}</label>
       <input id="sso-client-id" type="text" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder={IDP_TEMPLATES.find(t => t.id === selectedTemplate)?.clientIdPlaceholder || "your-client-id"} disabled={isEnforced}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
      </div>
      <div>
       <label htmlFor="sso-client-secret" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {t('clientSecret')}
        {ssoConfig?.client_secret_set && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs"><Check size={16} strokeWidth={1.75} className="inline mr-1" /> {t('clientSecretSet')}</span>}
       </label>
       <input id="sso-client-secret" type="password" autoComplete="off" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} disabled={isEnforced}
        placeholder={ssoConfig?.client_secret_set ? '•••••••• (leave empty to keep)' : 'your-client-secret'}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
      </div>
     </div>
    </div>
   )}

   {/* Auto Team Join */}
   <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-4">
     <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold"><Users size={18} strokeWidth={1.75} /></span>
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('autoTeamJoin')}</h2>
    </div>
    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('autoTeamJoinDesc')}</p>
    <div className="space-y-4">
     <div>
      <label htmlFor="sso-default-team" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('defaultTeam')}</label>
      <select
       id="sso-default-team"
       value={defaultTeamId}
       onChange={(e) => setDefaultTeamId(e.target.value)}
       disabled={isEnforced}
       className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
       <option value="">{t('noAutoJoin')}</option>
       {teams.map((team) => (
        <option key={team.id} value={team.id}>{team.name}</option>
       ))}
      </select>
     </div>
     {defaultTeamId && (
      <>
       <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
        <span className="text-amber-500 mt-0.5"><AlertTriangle size={18} strokeWidth={1.75} /></span>
        <p className="text-xs text-amber-700 dark:text-amber-300">
         {t('autoTeamJoinWarning') || 'All users who sign in via SSO will be automatically added to this team. Make sure this is the correct team.'}
        </p>
       </div>
       <div>
        <label htmlFor="sso-default-role" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('defaultRole')}</label>
       <select
        id="sso-default-role"
        value={defaultRole}
        onChange={(e) => setDefaultRole(e.target.value)}
        disabled={isEnforced}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
       >
        <option value="viewer"><Eye size={16} strokeWidth={1.75} className="inline mr-1" /> {t('roleViewer')}</option>
        <option value="analyst"><BarChart3 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('roleAnalyst')}</option>
        <option value="developer"><Pencil size={16} strokeWidth={1.75} className="inline mr-1" /> {t('roleDeveloper')}</option>
        <option value="admin"><Shield size={16} strokeWidth={1.75} className="inline mr-1" /> {t('roleAdmin')}</option>
       </select>
       </div>
      </>
     )}
    </div>
   </div>

   {/* Friendly Error Display */}
   {friendlyError && (
    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
     <div className="flex items-start gap-3">
      <span className="text-red-500 mt-0.5">⚠️</span>
      <div className="flex-1">
       <div className="font-semibold text-red-800 dark:text-red-300">{friendlyError.title}</div>
       <p className="text-sm text-red-700 dark:text-red-400 mt-1">{friendlyError.message}</p>
       {friendlyError.action && (
        <button
         type="button"
         onClick={() => setFriendlyError(null)}
         className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium hover:underline"
        >
         {friendlyError.action} →
        </button>
       )}
      </div>
      <button type="button" onClick={() => setFriendlyError(null)} className="text-red-400 hover:text-red-600">×</button>
     </div>
    </div>
   )}

   {/* Step 4: Save & Test */}
   <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-4">
     <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">4</span>
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('saveAndTest')}</h2>
    </div>
    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('saveAndTestDesc')}</p>
    <div className="flex gap-3 flex-wrap">
     <button type="button" onClick={handleSave} disabled={saving || isEnforced}
      className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50">
      {saving ? t('saving') : t('saveConfiguration')}
     </button>
     <button type="button" onClick={handleTest} disabled={testing || !isConfigured}
      className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50">
      {testing ? t('testing') : t('testConnection')}
     </button>
     {!isEnforced && (
      <button type="button" onClick={handleTestAndActivate} disabled={testAndActivateLoading || !isConfigured}
      className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2">
      {testAndActivateLoading ? (
       <><span className="animate-spin">⏳</span> {t('testingAndActivating') || 'Testing & Activating...'}</>
      ) : (
       <><ShieldCheck size={16} /> {t('testAndActivate') || 'Test & Activate'}</>
      )}
     </button>
     )}
     {testPassed && (
      <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
       <CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('testPassed')}
      </span>
     )}
    </div>
   </div>

   {/* Step 5: Enforce SSO (legacy, kept for manual enforce) */}
   {isConfigured && !isEnforced && (
    <div className="glass-card p-6">
     <div className="flex items-center gap-2 mb-4">
      <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">5</span>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('enforceSso')}</h2>
     </div>
     <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('enforceSsoDesc')}</p>
     <button
      type="button"
      onClick={() => setShowEnforceModal(true)}
      disabled={!testPassed && !ssoConfig?.enabled}
      className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50"
     >
      {t('enforceSsoButton')}
     </button>
     {!testPassed && !ssoConfig?.enabled && (
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{t('testFirst')}</p>
     )}
    </div>
   )}

   {/* SSO Login URL */}
   {isEnforced && ssoLoginUrl && (
    <div className="glass-card p-6">
     <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('ssoLoginUrl')}</h2>
     <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{t('ssoLoginUrlDesc')}</p>
     <div className="flex items-center gap-2">
      <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-mono text-gray-800 dark:text-slate-200 break-all">{ssoLoginUrl}</code>
      <button type="button" onClick={() => { navigator.clipboard.writeText(ssoLoginUrl); toast('Copied!', 'success'); }}
       className="px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition" title="Copy"><ClipboardList size={18} strokeWidth={1.75} /></button>
     </div>
    </div>
   )}

   {/* Delete */}
   {isConfigured && !isEnforced && (
    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
     <button type="button" onClick={handleDelete} disabled={deleting}
      className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
      {deleting ? '...' : t('deleteConfig')}
     </button>
    </div>
   )}

   {/* ── Enforce Confirmation Modal ── */}
   {showEnforceModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('enforceModalTitle')}</h3>

      <div className="space-y-3 mb-6">
       <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
        <span className="text-orange-500 mt-0.5"><AlertTriangle size={18} strokeWidth={1.75} /></span>
        <p className="text-sm text-orange-700 dark:text-orange-300">{t('enforceWarning1')}</p>
       </div>
       <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
        <span className="text-orange-500 mt-0.5"><AlertTriangle size={18} strokeWidth={1.75} /></span>
        <p className="text-sm text-orange-700 dark:text-orange-300">{t('enforceWarning2')}</p>
       </div>
      </div>

      <label className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
       <input
        type="checkbox"
        checked={adminBypass}
        onChange={(e) => setAdminBypass(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
       />
       <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{t('adminBypass')}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400">{t('adminBypassDesc')}</div>
       </div>
      </label>

      <div className="flex gap-3">
       <button
        type="button"
        onClick={() => setShowEnforceModal(false)}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
       >
        {t('cancel')}
       </button>
       <button
        type="button"
        onClick={handleEnforce}
        disabled={enforcing}
        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50"
       >
        {enforcing ? t('enforcing') : t('enforceConfirm')}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
