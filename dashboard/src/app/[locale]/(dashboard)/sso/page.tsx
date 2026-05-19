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
  const { data: ssoConfig, isLoading: loading, refetch } = useSsoConfig();

  const isEnterprise = user?.plan === 'enterprise';

  const [provider, setProvider] = useState<'saml' | 'oidc'>('saml');
  const [metadata, setMetadata] = useState('');
  const [entityId, setEntityId] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [certificate, setCertificate] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enforcing, setEnforcing] = useState(false);
  const [showEnforceModal, setShowEnforceModal] = useState(false);
  const [adminBypass, setAdminBypass] = useState(true);

  const isConfigured = ssoConfig?.provider;
  const isEnforced = ssoConfig?.enabled;

  // Populate form fields when config loads
  useEffect(() => {
    if (ssoConfig?.provider) {
      setProvider(ssoConfig.provider as 'saml' | 'oidc');
      setMetadata(ssoConfig.metadata_url || ssoConfig.issuer_url || '');
      setEntityId(ssoConfig.entity_id || ssoConfig.client_id || '');
      setSsoUrl(ssoConfig.sso_url || '');
    }
  }, [ssoConfig]);

  // ── Handlers ──

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { provider, enabled: false };
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
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('saveFailed'), 'error');
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
      const result = await ssoApi.testSso(token);
      if (result.valid) {
        setTestPassed(true);
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

  const handleEnforce = async () => {
    if (!token) return;
    setEnforcing(true);
    try {
      const body: Record<string, unknown> = {
        provider: ssoConfig?.provider || provider,
        enabled: true,
        admin_bypass: adminBypass,
      };
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
      await ssoApi.deleteSso(token);
      toast(t('deleted'), 'success');
      setMetadata('');
      setEntityId('');
      setSsoUrl('');
      setCertificate('');
      setTestPassed(false);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('deleteFailed'), 'error');
    } finally {
      setDeleting(false);
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
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('enterpriseOnlyTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{t('enterpriseOnlyDesc')}</p>
          <a href="/billing-section" className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
            {t('upgradeNow')}
          </a>
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
      </div>

      {/* Status Banner */}
      {isEnforced && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
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

      {/* Step 1: Provider Selection */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">1</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('provider')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'saml' as const, name: 'SAML 2.0', desc: 'Okta, OneLogin, Azure AD, Google Workspace', icon: '🏛️' },
            { id: 'oidc' as const, name: 'OpenID Connect', desc: 'Auth0, Keycloak, AWS Cognito', icon: '🔑' },
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

      {/* Step 2: SAML Configuration */}
      {provider === 'saml' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">2</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('samlConfiguration')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="sso-metadata-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('metadataUrl')}</label>
              <input id="sso-metadata-url" type="url" value={metadata} onChange={(e) => setMetadata(e.target.value)} placeholder="https://idp.example.com/metadata.xml" disabled={isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-entity-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('entityId')}</label>
              <input id="sso-entity-id" type="text" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="urn:hooksniff:sp" disabled={isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('ssoUrl')}</label>
              <input id="sso-url" type="url" value={ssoUrl} onChange={(e) => setSsoUrl(e.target.value)} placeholder="https://idp.example.com/sso" disabled={isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-certificate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('x509Certificate')}
                {ssoConfig?.certificate_set && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs">✓ {t('certificateSet')}</span>}
              </label>
              <textarea id="sso-certificate" value={certificate} onChange={(e) => setCertificate(e.target.value)} rows={4} disabled={isEnforced}
                placeholder={ssoConfig?.certificate_set ? '•••••••• (leave empty to keep)' : '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: OIDC Configuration */}
      {provider === 'oidc' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">2</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('oidcConfiguration')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="sso-issuer-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('issuerUrl')}</label>
              <input id="sso-issuer-url" type="url" value={metadata} onChange={(e) => setMetadata(e.target.value)} placeholder="https://accounts.google.com" disabled={isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-client-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('clientId')}</label>
              <input id="sso-client-id" type="text" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="your-client-id" disabled={isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-client-secret" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('clientSecret')}
                {ssoConfig?.client_secret_set && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs">✓ {t('clientSecretSet')}</span>}
              </label>
              <input id="sso-client-secret" type="password" autoComplete="off" value={certificate} onChange={(e) => setCertificate(e.target.value)} disabled={isEnforced}
                placeholder={ssoConfig?.client_secret_set ? '•••••••• (leave empty to keep)' : 'your-client-secret'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Save & Test */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">3</span>
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
          {testPassed && (
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              ✅ {t('testPassed')}
            </span>
          )}
        </div>
      </div>

      {/* Step 4: Enforce SSO */}
      {isConfigured && !isEnforced && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">4</span>
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
              className="px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition" title="Copy">📋</button>
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
                <span className="text-orange-500 mt-0.5">⚠️</span>
                <p className="text-sm text-orange-700 dark:text-orange-300">{t('enforceWarning1')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                <span className="text-orange-500 mt-0.5">⚠️</span>
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
