'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, Circle, Globe, Key, Monitor, Shield, ShieldCheck } from '@/components/icons';

export default function SsoDocsPage() {
  const t = useTranslations('docsSso');

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <ShieldCheck size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-slate-400">
          {t('subtitle')}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg">
          <AlertTriangle size={16} />
          <span>{t('ssoAvailable')}</span>
        </div>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('howItWorks')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: t('chooseProvider'), desc: t('chooseProviderDesc'), icon: <Key size={20} /> },
            { step: '2', title: t('configure'), desc: t('configureDesc'), icon: <Globe size={20} /> },
            { step: '3', title: t('activate'), desc: t('activateDesc'), icon: <Shield size={20} /> },
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('setupByProvider')}</h2>

        {/* Azure AD / Entra ID */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><Monitor size={16} /></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('azureAd')}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">{t('oidc')}</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>{t('azureStep1')}</li>
            <li>{t('azureStep2Name')}</li>
            <li>{t('azureStep3')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://your-api.trycloudflare.com/v1/sso/oidc/callback</code></li>
            <li>{t('azureStep4')}</li>
            <li>{t('azureStep5')}</li>
            <li>{t('azureStep6')}
              <ul className="ml-6 mt-1 space-y-1">
                <li>• {t('providerOidc')}</li>
                <li>• {t('issuerUrl')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://login.microsoftonline.com/{'{tenant-id}'}/v2.0</code></li>
                <li>• {t('clientId')}: your Application (client) ID</li>
                <li>• {t('clientSecret')}: the secret value you copied</li>
              </ul>
            </li>
            <li>{t('clickSaveTest')}</li>
          </ol>
        </div>

        {/* Google Workspace */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600"><Circle size={16} className="fill-red-600" /></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('googleWorkspace')}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">{t('oidc')}</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>{t('googleStep1')}</li>
            <li>{t('googleStep2')}</li>
            <li>{t('googleStep3')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://your-api.trycloudflare.com/v1/sso/oidc/callback</code></li>
            <li>{t('googleStep4')}</li>
            <li>{t('azureStep6')}
              <ul className="ml-6 mt-1 space-y-1">
                <li>• {t('providerOidc')}</li>
                <li>• {t('issuerUrl')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://accounts.google.com</code></li>
                <li>• {t('clientId')}: your Client ID</li>
                <li>• {t('clientSecret')}: your Client Secret</li>
              </ul>
            </li>
            <li>{t('clickSaveTest')}</li>
          </ol>
        </div>

        {/* Okta */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600"><Circle size={16} className="fill-gray-600" /></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('okta')}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">{t('oidc')}</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>{t('oktaStep1')}</li>
            <li>{t('oktaStep2')}</li>
            <li>{t('oktaStep3')}</li>
            <li>{t('oktaStep4')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://your-api.trycloudflare.com/v1/sso/oidc/callback</code></li>
            <li>{t('googleStep4')}</li>
            <li>{t('azureStep6')}
              <ul className="ml-6 mt-1 space-y-1">
                <li>• {t('providerOidc')}</li>
                <li>• {t('issuerUrl')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://{'{your-org}'}.okta.com</code></li>
                <li>• {t('clientId')}: your Client ID</li>
                <li>• {t('clientSecret')}: your Client Secret</li>
              </ul>
            </li>
            <li>{t('clickSaveTest')}</li>
          </ol>
        </div>

        {/* Keycloak */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600"><Shield size={16} /></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('keycloak')}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">{t('oidc')}</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>{t('keycloakStep1')}</li>
            <li>{t('keycloakStep2')}</li>
            <li>{t('keycloakStep3')}</li>
            <li>{t('keycloakStep4')}</li>
            <li>{t('keycloakStep5')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://your-api.trycloudflare.com/v1/sso/oidc/callback</code></li>
            <li>{t('keycloakStep6')}</li>
            <li>{t('azureStep6')}
              <ul className="ml-6 mt-1 space-y-1">
                <li>• {t('providerOidc')}</li>
                <li>• {t('issuerUrl')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://{'{your-keycloak}'}/realms/{'{realm-name}'}</code></li>
                <li>• {t('clientId')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">hooksniff</code></li>
                <li>• {t('clientSecret')}: the secret from Credentials tab</li>
              </ul>
            </li>
            <li>{t('clickSaveTest')}</li>
          </ol>
        </div>

        {/* OneLogin */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600"><Circle size={16} className="fill-green-600" /></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('onelogin')}</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">{t('samL')}</span>
          </div>
          <ol className="space-y-3 text-sm text-gray-700 dark:text-slate-300 list-decimal list-inside">
            <li>{t('oneloginStep1')}</li>
            <li>{t('oneloginStep2')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://your-api.trycloudflare.com/v1/sso/saml/callback</code></li>
            <li>{t('oneloginStep3')}: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">urn:hooksniff:sp</code></li>
            <li>{t('oneloginStep4')}</li>
            <li>{t('azureStep6')}
              <ul className="ml-6 mt-1 space-y-1">
                <li>• Provider: <strong>SAML 2.0</strong></li>
                <li>• Metadata URL: your OneLogin metadata URL</li>
                <li>• SSO URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">https://{'{your-org}'}.onelogin.com/trust/saml2/http-post/sso/{'{app-id}'}</code></li>
                <li>• Certificate: paste the X.509 certificate</li>
              </ul>
            </li>
            <li>{t('clickSaveTest')}</li>
          </ol>
        </div>
      </section>

      {/* Domain Verification */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('domainVerificationTitle')}</h2>
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t('domainVerificationDesc')}
          </p>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-mono text-sm">
            <div className="text-gray-500 dark:text-slate-500 mb-1"># {t('addTxtRecord')}</div>
            <div className="text-gray-900 dark:text-white">
              Name: <span className="text-brand-600 dark:text-brand-400">_hooksniff.{'{your-domain}'}.com</span>
            </div>
            <div className="text-gray-900 dark:text-white">
              Value: <span className="text-emerald-600 dark:text-emerald-400">hooksniff-verify-{'{generated-token}'}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('afterVerify')}
          </p>
        </div>
      </section>

      {/* Auto Team Join */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('autoTeamJoinTitle')}</h2>
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t('autoTeamJoinDesc')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { role: t('roleViewer') || 'Viewer', desc: t('roleViewerDesc'), color: 'gray' },
              { role: t('roleAnalyst') || 'Analyst', desc: t('roleAnalystDesc'), color: 'amber' },
              { role: t('roleDeveloper') || 'Developer', desc: t('roleDeveloperDesc'), color: 'blue' },
              { role: t('roleAdmin') || 'Admin', desc: t('roleAdminDesc'), color: 'red' },
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('troubleshooting')}</h2>
        <div className="space-y-3">
          {[
            { q: t('q1'), a: t('a1') },
            { q: t('q2'), a: t('a2') },
            { q: t('q3'), a: t('a3') },
            { q: t('q4'), a: t('a4') },
            { q: t('q5'), a: t('a5') },
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('ssoApiReference') || 'API Reference'}</h2>
        <div className="glass-card p-6">
          <div className="space-y-3 text-sm">
            {[
              { method: 'GET', path: '/v1/sso/config', desc: t('getConfig') },
              { method: 'POST', path: '/v1/sso/config', desc: t('createUpdateConfig') },
              { method: 'DELETE', path: '/v1/sso/config', desc: t('deleteConfig') },
              { method: 'POST', path: '/v1/sso/test', desc: t('testConnection') },
              { method: 'GET', path: '/v1/sso/login', desc: t('initiateLogin') },
              { method: 'GET', path: '/v1/sso/providers', desc: t('listProviders') },
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
