'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import { useSsoConfig } from '@/hooks/useDashboardData';

/* ─── SSO/SAML Configuration Page (Enterprise Only) ─── */
export default function SsoSettingsPage() {
  const t = useTranslations('sso');
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { data: ssoConfig, isLoading: loading } = useSsoConfig();

  const isEnterprise = user?.plan === 'enterprise';

  const [provider, setProvider] = useState<'saml' | 'oidc'>('saml');
  const [metadata, setMetadata] = useState('');
  const [entityId, setEntityId] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [certificate, setCertificate] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Populate form fields when config loads
  useEffect(() => {
    if (ssoConfig?.provider) {
      setProvider(ssoConfig.provider as 'saml' | 'oidc');
      setEnabled(ssoConfig.enabled || false);
      setMetadata(ssoConfig.metadata_url || ssoConfig.issuer_url || '');
      setEntityId(ssoConfig.entity_id || ssoConfig.client_id || '');
      setSsoUrl(ssoConfig.sso_url || '');
    }
  }, [ssoConfig]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { provider, enabled };
      if (provider === 'saml') {
        body.metadata_url = metadata || null;
        body.entity_id = entityId || null;
        body.sso_url = ssoUrl || null;
        if (certificate) body.certificate = certificate;
      } else {
        body.issuer_url = metadata || null;
        body.client_id = entityId || null;
        if (certificate) body.client_secret = certificate;
      }
      await apiFetch('/sso/config', { method: 'POST', body, token });
      toast(t('saved'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!token) return;
    setTesting(true);
    try {
      const { ssoApi } = await import('@/lib/api');
      const result = await ssoApi.testSso(token);
      if (result.valid) {
        toast(result.message || t('testSuccess'), 'success');
      } else {
        const issues = result.issues ? (Array.isArray(result.issues) ? result.issues.join(', ') : result.issues) : null;
        toast(issues || result.message || t('testFailed'), 'error');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : t('testFailed'), 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!window.confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    try {
      const { ssoApi } = await import('@/lib/api');
      await ssoApi.deleteSso(token);
      toast(t('deleted'), 'success');
      setEnabled(false);
      setMetadata('');
      setEntityId('');
      setSsoUrl('');
      setCertificate('');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('deleteFailed'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const ssoLoginUrl = user?.email
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/v1/sso/login?email=${encodeURIComponent(user.email)}`
    : null;

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

  // ── Non-Enterprise: show upgrade prompt ──
  if (!isEnterprise) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('enterpriseOnlyTitle') || 'SSO requires an Enterprise plan'}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {t('enterpriseOnlyDesc') || 'Single Sign-On is available for Enterprise customers. Contact sales to enable SSO for your organization.'}
          </p>
          <a
            href="/pricing"
            className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
          >
            {t('upgradeNow')}
          </a>
        </div>
      </div>
    );
  }

  // ── Enterprise: show full SSO config ──
  const hasConfig = ssoConfig?.provider;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Provider Selection */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('provider')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'saml' as const, name: 'SAML 2.0', desc: 'Okta, OneLogin, Azure AD, Google Workspace', icon: '🏛️' },
            { id: 'oidc' as const, name: 'OpenID Connect', desc: 'Auth0, Keycloak, AWS Cognito', icon: '🔑' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`p-4 rounded-xl border-2 text-left transition ${
                provider === p.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
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

      {/* SAML Configuration */}
      {provider === 'saml' && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('samlConfiguration')}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="sso-metadata-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('metadataUrl')}</label>
              <input
                id="sso-metadata-url"
                type="url"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder="https://idp.example.com/metadata.xml"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="sso-entity-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('entityId')}</label>
              <input
                id="sso-entity-id"
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="urn:hooksniff:sp"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="sso-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('ssoUrl')}</label>
              <input
                id="sso-url"
                type="url"
                value={ssoUrl}
                onChange={(e) => setSsoUrl(e.target.value)}
                placeholder="https://idp.example.com/sso"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="sso-certificate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('x509Certificate')}
                {ssoConfig?.certificate_set && (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs">✓ {t('certificateSet')}</span>
                )}
              </label>
              <textarea
                id="sso-certificate"
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                placeholder={ssoConfig?.certificate_set ? '•••••••• (leave empty to keep existing certificate)' : '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* OIDC Configuration */}
      {provider === 'oidc' && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('oidcConfiguration')}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="sso-issuer-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('issuerUrl')}</label>
              <input
                id="sso-issuer-url"
                type="url"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder="https://accounts.google.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="sso-client-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('clientId')}</label>
              <input
                id="sso-client-id"
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="your-client-id"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="sso-client-secret" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('clientSecret')}
                {ssoConfig?.client_secret_set && (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs">✓ {t('clientSecretSet')}</span>
                )}
              </label>
              <input
                id="sso-client-secret"
                type="password"
                autoComplete="off"
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                placeholder={ssoConfig?.client_secret_set ? '•••••••• (leave empty to keep existing secret)' : 'your-client-secret'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Enable/Save/Test */}
      {provider && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{t('enableSso')}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{t('enableSsoDesc')}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
            </label>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {saving ? t('saving') : t('saveConfiguration')}
            </button>
            <button type="button"
              onClick={handleTest}
              disabled={testing || !hasConfig}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {testing ? t('testing') : t('testConnection')}
            </button>
            {hasConfig && (
              <button type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? '...' : t('deleteConfig')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* SSO Login URL */}
      {hasConfig?.enabled && ssoLoginUrl && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('ssoLoginUrl')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{t('ssoLoginUrlDesc')}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-mono text-gray-800 dark:text-slate-200 break-all">
              {ssoLoginUrl}
            </code>
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(ssoLoginUrl); toast('Copied!', 'success'); }}
              className="px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              title="Copy"
            >
              📋
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
