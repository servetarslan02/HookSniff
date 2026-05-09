'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';

/* ─── SSO/SAML Configuration Page ─── */
export default function SsoSettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = useState<'saml' | 'oidc' | ''>('');
  const [metadata, setMetadata] = useState('');
  const [entityId, setEntityId] = useState('');
  const [ssoUrl, setSsoUrl] = useState('');
  const [certificate, setCertificate] = useState('');
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const res = await fetch(`${API}/sso/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          metadata_url: metadata,
          entity_id: entityId,
          sso_url: ssoUrl,
          certificate,
          enabled,
        }),
      });
      if (res.ok) {
        toast('SSO configuration saved!', 'success');
      } else if (res.status === 404) {
        // Backend endpoint doesn't exist yet — save locally
        try { localStorage.setItem('hooksniff_sso_config', JSON.stringify({ provider, metadata, entityId, ssoUrl, certificate, enabled })); } catch {}
        toast('SSO config saved locally (backend endpoint pending)', 'success');
      } else {
        toast('Failed to save SSO config', 'error');
      }
    } catch {
      // Network error or endpoint doesn't exist — save locally
      try { localStorage.setItem('hooksniff_sso_config', JSON.stringify({ provider, metadata, entityId, ssoUrl, certificate, enabled })); } catch {}
      toast('SSO config saved locally (backend endpoint pending)', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔐 SSO / SAML</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Configure Single Sign-On for your organization. Enterprise plan required.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Provider</h2>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SAML Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Metadata URL</label>
              <input
                type="url"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder="https://idp.example.com/metadata.xml"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Entity ID</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="urn:hooksniff:sp"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">SSO URL</label>
              <input
                type="url"
                value={ssoUrl}
                onChange={(e) => setSsoUrl(e.target.value)}
                placeholder="https://idp.example.com/sso"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">X.509 Certificate</label>
              <textarea
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                placeholder="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">OpenID Connect Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Issuer URL</label>
              <input
                type="url"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                placeholder="https://accounts.google.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client ID</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="your-client-id"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client Secret</label>
              <input
                type="password"
                value={certificate}
                onChange={(e) => setCertificate(e.target.value)}
                placeholder="your-client-secret"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Enable/Save */}
      {provider && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Enable SSO</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">When enabled, all team members must authenticate via SSO.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
            </label>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          💡 SSO is available on the <strong>Business</strong> plan. <a href="/pricing" className="underline">Upgrade now</a> to enable SSO for your organization.
        </p>
      </div>
    </div>
  );
}
