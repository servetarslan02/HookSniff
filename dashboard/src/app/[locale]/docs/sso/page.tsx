'use client';

import {useTranslations} from 'next-intl';
import {AlertTriangle, CheckCircle2, Copy, ExternalLink, Globe, Key, Shield, ShieldCheck, Users} from '@/components/icons';
import {useState} from 'react';

export default function SsoDocsPage() {
  const t = useTranslations('docs.sso');
  const [copiedText, setCopiedText] = useState('');

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <ShieldCheck size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Single Sign-On (SSO)</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-slate-400">
          HookSniff supports SAML 2.0 and OpenID Connect (OIDC) for enterprise single sign-on.
          This guide walks you through setup for the most popular identity providers.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg">
          <AlertTriangle size={16} />
          <span>SSO is available on the <strong>Enterprise</strong> plan.</span>
        </div>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Choose Provider', desc: 'Select SAML 2.0 or OpenID Connect and pick your identity provider', icon: <Key size={20} /> },
            { step: '2', title: 'Configure', desc: 'Enter your IdP credentials and verify your domain', icon: <Globe size={20} /> },
            { step: '3', title: 'Activate', desc: 'Test the connection and enable SSO for your team', icon: <Shield size={20} /> },
          ].map((s) => (
            <div key={s.step} className="glass-card p-5">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold mb-3">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Setup by Provider */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Setup by Identity Provider</h2>

        {/* Azure AD / Entra ID */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">🪟</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Microsoft Azure AD (Entra ID)</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">OIDC</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>Go to <strong>Azure Portal → Azure Active Directory → App registrations → New registration</strong></li>
            <li>Name: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">HookSniff</code></li>
            <li>Redirect URI: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/oidc/callback</code></li>
            <li>Copy <strong>Application (client) ID</strong> and <strong>Directory (tenant) ID</strong></li>
            <li>Go to <strong>Certificates & secrets → New client secret</strong> → copy the value</li>
            <li>In HookSniff SSO page:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Provider: <strong>OIDC</strong></li>
                <li>• Issuer URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://login.microsoftonline.com/{'{tenant-id}'}/v2.0</code></li>
                <li>• Client ID: your Application (client) ID</li>
                <li>• Client Secret: the secret value you copied</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> → <strong>Test Connection</strong> → <strong>Activate SSO</strong></li>
          </ol>
        </div>

        {/* Google Workspace */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">🔴</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Google Workspace</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">OIDC</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>Go to <strong>Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID</strong></li>
            <li>Application type: <strong>Web application</strong></li>
            <li>Authorized redirect URI: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/oidc/callback</code></li>
            <li>Copy <strong>Client ID</strong> and <strong>Client Secret</strong></li>
            <li>In HookSniff SSO page:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Provider: <strong>OIDC</strong></li>
                <li>• Issuer URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://accounts.google.com</code></li>
                <li>• Client ID: your Client ID</li>
                <li>• Client Secret: your Client Secret</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> → <strong>Test Connection</strong> → <strong>Activate SSO</strong></li>
          </ol>
        </div>

        {/* Okta */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600">🔵</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Okta</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">OIDC</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>Go to <strong>Okta Admin → Applications → Create App Integration</strong></li>
            <li>Sign-in method: <strong>OIDC - OpenID Connect</strong></li>
            <li>Application type: <strong>Web Application</strong></li>
            <li>Sign-in redirect URI: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/oidc/callback</code></li>
            <li>Copy <strong>Client ID</strong> and <strong>Client Secret</strong></li>
            <li>In HookSniff SSO page:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Provider: <strong>OIDC</strong></li>
                <li>• Issuer URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://{'{your-org}'}.okta.com</code></li>
                <li>• Client ID: your Client ID</li>
                <li>• Client Secret: your Client Secret</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> → <strong>Test Connection</strong> → <strong>Activate SSO</strong></li>
          </ol>
        </div>

        {/* Keycloak */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">🦁</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Keycloak</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">OIDC</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>Create a new <strong>Realm</strong> (or use existing)</li>
            <li>Go to <strong>Clients → Create client</strong></li>
            <li>Client type: <strong>OpenID Connect</strong></li>
            <li>Client ID: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">hooksniff</code></li>
            <li>Valid redirect URIs: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/oidc/callback</code></li>
            <li>Go to <strong>Credentials</strong> tab → copy <strong>Client Secret</strong></li>
            <li>In HookSniff SSO page:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Provider: <strong>OIDC</strong></li>
                <li>• Issuer URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://{'{your-keycloak}'}/realms/{'{realm-name}'}</code></li>
                <li>• Client ID: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">hooksniff</code></li>
                <li>• Client Secret: the secret from Credentials tab</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> → <strong>Test Connection</strong> → <strong>Activate SSO</strong></li>
          </ol>
        </div>

        {/* OneLogin */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">🟢</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">OneLogin</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">SAML</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>Go to <strong>Applications → Add App → SAML Custom Connector (Advanced)</strong></li>
            <li>Set <strong>ACS URL</strong>: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/saml/callback</code></li>
            <li>Set <strong>Entity ID</strong>: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">urn:hooksniff:sp</code></li>
            <li>Copy the <strong>SAML Metadata URL</strong> or download the certificate</li>
            <li>In HookSniff SSO page:
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Provider: <strong>SAML 2.0</strong></li>
                <li>• Metadata URL: your OneLogin metadata URL</li>
                <li>• SSO URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://{'{your-org}'}.onelogin.com/trust/saml2/http-post/sso/{'{app-id}'}</code></li>
                <li>• Certificate: paste the X.509 certificate</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> → <strong>Test Connection</strong> → <strong>Activate SSO</strong></li>
          </ol>
        </div>
      </section>

      {/* Domain Verification */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Domain Verification</h2>
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            To auto-match users by email domain, verify domain ownership with a DNS TXT record:
          </p>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-mono text-sm">
            <div className="text-gray-500 dark:text-slate-500 mb-1"># Add this TXT record to your DNS:</div>
            <div className="text-gray-900 dark:text-white">
              Name: <span className="text-brand-600 dark:text-brand-400">_hooksniff.{'{your-domain}'}.com</span>
            </div>
            <div className="text-gray-900 dark:text-white">
              Value: <span className="text-emerald-600 dark:text-emerald-400">hooksniff-verify-{'{generated-token}'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            After adding the record, click <strong>Verify Domain</strong> in the SSO settings. DNS propagation may take up to 48 hours.
          </p>
        </div>
      </section>

      {/* Auto Team Join */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auto Team Join</h2>
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            When enabled, users who sign in via SSO are automatically added to a team with a specified role:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { role: 'Viewer', desc: 'Read-only access', color: 'gray' },
              { role: 'Analyst', desc: 'View analytics & reports', color: 'amber' },
              { role: 'Developer', desc: 'Create endpoints & send webhooks', color: 'blue' },
              { role: 'Admin', desc: 'Full access including billing', color: 'red' },
            ].map((r) => (
              <div key={r.role} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="font-medium text-gray-900 dark:text-white text-sm">{r.role}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Troubleshooting</h2>
        <div className="space-y-3">
          {[
            { q: '"SSO configuration not found"', a: 'Make sure you saved the config and SSO is enabled. Check that you\'re on the correct team.' },
            { q: '"Invalid or expired SSO state"', a: 'The login session expired (10 min limit). Try logging in again.' },
            { q: '"Token exchange failed"', a: 'Check your Client ID and Client Secret are correct. Ensure the redirect URI matches exactly.' },
            { q: '"Domain not verified"', a: 'Add the DNS TXT record and wait up to 48 hours for propagation, then click Verify Domain.' },
            { q: 'Users not auto-joining team', a: 'Make sure Auto Team Join is configured and the verified domain matches users\' email domain.' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4">
              <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">❓ {item.q}</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* API Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Reference</h2>
        <div className="glass-card p-6">
          <div className="space-y-3 text-sm">
            {[
              { method: 'GET', path: '/v1/sso/config', desc: 'Get SSO configuration' },
              { method: 'POST', path: '/v1/sso/config', desc: 'Create/update SSO config' },
              { method: 'DELETE', path: '/v1/sso/config', desc: 'Delete SSO config' },
              { method: 'POST', path: '/v1/sso/test', desc: 'Test SSO connection' },
              { method: 'GET', path: '/v1/sso/login', desc: 'Initiate SSO login' },
              { method: 'GET', path: '/v1/sso/providers', desc: 'List SSO providers for domain' },
            ].map((ep, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  ep.method === 'GET' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                  ep.method === 'POST' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>{ep.method}</span>
                <code className="text-xs font-mono text-gray-700 dark:text-slate-300">{ep.path}</code>
                <span className="text-xs text-gray-500 dark:text-slate-400 ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
