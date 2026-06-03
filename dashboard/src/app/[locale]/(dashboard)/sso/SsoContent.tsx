'use client';

import { memo, useMemo } from 'react';
import { AlertTriangle, BarChart3, Building2, Check, CheckCircle2, ClipboardList, Eye, EyeOff, ExternalLink, Globe, Key, Pencil, Shield, ShieldCheck, Users, XCircle } from '@/components/icons';
import { RoleGuard, ReadOnlyBadge } from '@/components/RoleGuard';
import { IDP_TEMPLATES } from './sso-utils';
import { useSsoHandlers } from './useSsoHandlers';

/* ─── Sub-sections (memoized to prevent unnecessary re-renders) ─── */
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
      </div>
    </div>
  );
});

const UpgradePrompt = memo(function UpgradePrompt({ t }: { t: (key: string) => string }) {
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
});

/* ─── SSO/SAML Configuration Page (Enterprise Only) ─── */
export function SsoContent({ teamId: teamIdProp }: { teamId?: string } = {}) {
  const h = useSsoHandlers(teamIdProp);

  // ── Loading ──
  if (h.loading) {
    return <LoadingSkeleton />;
  }

  // ── Non-Enterprise: upgrade prompt ──
  if (!h.isEnterprise) {
    return <UpgradePrompt t={h.t} />;
  }

  // ── Enterprise: full SSO config ──
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{h.t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{h.t('subtitle')}</p>
        <ReadOnlyBadge />
        <a href="/docs/sso" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm text-brand-600 dark:text-brand-400 hover:underline">
          <ShieldCheck size={14} strokeWidth={1.75} />
          {h.t('setupGuide') || 'View SSO setup guide →'}
        </a>
      </div>

      {/* Status Banner */}
      {h.isEnforced && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl"><CheckCircle2 size={18} strokeWidth={1.75} /></span>
            <div>
              <div className="font-semibold text-emerald-800 dark:text-emerald-300">{h.t('ssoActive')}</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">{h.t('ssoActiveDesc')}</div>
            </div>
          </div>
          <button type="button" onClick={h.handleDisable} disabled={h.enforcing}
            className="px-4 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition">
            {h.t('disableSso')}
          </button>
        </div>
      )}

      {/* Step 1: IdP Template Selection */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">1</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('selectIdP') || 'Select Your Identity Provider'}</h2>
        </div>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <select value={h.selectedTemplate} onChange={(e) => h.handleTemplateSelect(e.target.value)} disabled={h.isEnforced}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed appearance-none">
              <option value="">{h.t('manualSetup') || '⚙️ Manual Setup'}</option>
              {IDP_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>{tmpl.icon} {tmpl.name} ({tmpl.provider === 'oidc' ? 'OIDC' : 'SAML'})</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">{h.t('selectIdPHint') || 'Choose your IdP to auto-configure settings.'}</p>
          </div>
        </div>
        {h.selectedTemplate && (() => {
          const tmpl = IDP_TEMPLATES.find(t => t.id === h.selectedTemplate);
          if (!tmpl) return null;
          return (
            <div className="flex items-start gap-3 mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
              <span className="text-blue-500 mt-0.5">💡</span>
              <div className="flex-1">
                <p className="text-sm text-blue-700 dark:text-blue-300">{tmpl.hint}</p>
                {tmpl.helpUrl && (
                  <a href={tmpl.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink size={12} /> {h.t('viewGuide') || 'View setup guide'}
                  </a>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Step 2: Provider Selection */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">2</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('provider')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'saml' as const, name: 'SAML 2.0', desc: 'Okta, OneLogin, Azure AD, Google Workspace', icon: <Building2 size={16} strokeWidth={1.75} /> },
            { id: 'oidc' as const, name: 'OpenID Connect', desc: 'Auth0, Keycloak, AWS Cognito', icon: <Key size={16} strokeWidth={1.75} /> },
          ].map((p) => (
            <button key={p.id} onClick={() => h.setProvider(p.id)} disabled={h.isEnforced}
              className={`p-4 rounded-xl border-2 text-left transition ${h.provider === p.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'} ${h.isEnforced ? 'opacity-60 cursor-not-allowed' : ''}`}>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('verifiedDomain') || 'Verified Domain'}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{h.t('verifiedDomainDesc') || 'Email domain for automatic SSO user discovery.'}</p>
        {h.ssoConfig?.verified_domain ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
            <span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={18} strokeWidth={1.75} /></span>
            <span className="text-sm font-mono font-medium text-emerald-800 dark:text-emerald-300">{h.ssoConfig.verified_domain}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-auto">{h.t('verified') || 'Verified'}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" value={h.domainInput} onChange={(e) => h.setDomainInput(e.target.value)} placeholder="company.com" disabled={h.isEnforced}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
              <button type="button" onClick={h.handleGenerateTxtRecord} disabled={!h.domainInput.trim() || h.generatingTxt || h.isEnforced}
                className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50">
                {h.generatingTxt ? '...' : (h.t('generateTxt') || 'Generate')}
              </button>
            </div>
            {h.txtRecord && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{h.t('addTxtRecord') || 'Add this TXT record to your DNS:'}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-gray-800 dark:text-slate-200 break-all">{h.txtRecord}</code>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(h.txtRecord); h.t && h.t('saved'); }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"><ClipboardList size={18} strokeWidth={1.75} /></button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                    {h.t('txtRecordName') || 'Name'}: <code className="font-mono">_hooksniff.{h.domainInput}</code>
                  </p>
                </div>
                <button type="button" onClick={h.handleVerifyDomain} disabled={h.verifyingDomain}
                  className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">
                  {h.verifyingDomain ? (h.t('verifying') || 'Verifying...') : (h.t('verifyDomain') || 'Verify Domain')}
                </button>
                {h.domainVerified === true && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('domainVerified') || 'Domain verified successfully!'}</p>
                )}
                {h.domainVerified === false && (
                  <p className="text-sm text-red-600 dark:text-red-400"><XCircle size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('domainVerifyFailed') || 'TXT record not found.'}</p>
                )}
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{h.t('verifiedDomainHint') || 'TXT record verification.'}</p>
      </div>

      {/* Step 3: SAML Configuration */}
      {h.provider === 'saml' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">3</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('samlConfiguration')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="sso-metadata-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('metadataUrl')}</label>
              <div className="flex gap-2">
                <input id="sso-metadata-url" type="url" value={h.metadata} onChange={(e) => h.handleMetadataChange(e.target.value)}
                  placeholder={IDP_TEMPLATES.find(t => t.id === h.selectedTemplate)?.metadataPlaceholder || "https://idp.example.com/metadata.xml"} disabled={h.isEnforced}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
                {h.metadata && !h.isEnforced && (
                  <button type="button" onClick={h.handleFetchSamlMetadata} disabled={h.fetchingMetadata}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap">
                    {h.fetchingMetadata ? '...' : (h.t('fetchMetadata') || '🔍 Fetch')}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="sso-entity-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('entityId')}</label>
              <input id="sso-entity-id" type="text" value={h.entityId} onChange={(e) => h.setEntityId(e.target.value)}
                placeholder={IDP_TEMPLATES.find(t => t.id === h.selectedTemplate)?.entityIdPlaceholder || "urn:hooksniff:sp"} disabled={h.isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('ssoUrl')}</label>
              <input id="sso-url" type="url" value={h.ssoUrl} onChange={(e) => h.setSsoUrl(e.target.value)}
                placeholder={IDP_TEMPLATES.find(t => t.id === h.selectedTemplate)?.ssoUrlPlaceholder || "https://idp.example.com/sso"} disabled={h.isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-certificate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {h.t('x509Certificate')}
                {h.ssoConfig?.certificate_set && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs"><Check size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('certificateSet')}</span>}
              </label>
              <textarea id="sso-certificate" value={h.certificate} onChange={(e) => h.setCertificate(e.target.value)} rows={4} disabled={h.isEnforced}
                placeholder={h.ssoConfig?.certificate_set ? '•••••••• (leave empty to keep)' : '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: OIDC Configuration */}
      {h.provider === 'oidc' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">3</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('oidcConfiguration')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="sso-issuer-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('issuerUrl')}</label>
              <input id="sso-issuer-url" type="url" value={h.metadata} onChange={(e) => h.handleMetadataChange(e.target.value)}
                placeholder={IDP_TEMPLATES.find(t => t.id === h.selectedTemplate)?.issuerPlaceholder || "https://accounts.google.com"} disabled={h.isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-client-id" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('clientId')}</label>
              <input id="sso-client-id" type="text" value={h.entityId} onChange={(e) => h.setEntityId(e.target.value)}
                placeholder={IDP_TEMPLATES.find(t => t.id === h.selectedTemplate)?.clientIdPlaceholder || "your-client-id"} disabled={h.isEnforced}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="sso-client-secret" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {h.t('clientSecret')}
                {h.ssoConfig?.client_secret_set && <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-xs"><Check size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('clientSecretSet')}</span>}
              </label>
              <input id="sso-client-secret" type="password" autoComplete="off" value={h.clientSecret} onChange={(e) => h.setClientSecret(e.target.value)} disabled={h.isEnforced}
                placeholder={h.ssoConfig?.client_secret_set ? '•••••••• (leave empty to keep)' : 'your-client-secret'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>
      )}

      {/* Auto Team Join */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold"><Users size={18} strokeWidth={1.75} /></span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('autoTeamJoin')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{h.t('autoTeamJoinDesc')}</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="sso-default-team" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('defaultTeam')}</label>
            <select id="sso-default-team" value={h.defaultTeamId} onChange={(e) => h.setDefaultTeamId(e.target.value)} disabled={h.isEnforced}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="">{h.t('noAutoJoin')}</option>
              {h.teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
            </select>
          </div>
          {h.defaultTeamId && (
            <>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <span className="text-amber-500 mt-0.5"><AlertTriangle size={18} strokeWidth={1.75} /></span>
                <p className="text-xs text-amber-700 dark:text-amber-300">{h.t('autoTeamJoinWarning') || 'All SSO users will be auto-added to this team.'}</p>
              </div>
              <div>
                <label htmlFor="sso-default-role" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('defaultRole')}</label>
                <select id="sso-default-role" value={h.defaultRole} onChange={(e) => h.setDefaultRole(e.target.value)} disabled={h.isEnforced}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="viewer"><Eye size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('roleViewer')}</option>
                  <option value="analyst"><BarChart3 size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('roleAnalyst')}</option>
                  <option value="developer"><Pencil size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('roleDeveloper')}</option>
                  <option value="admin"><Shield size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('roleAdmin')}</option>
                </select>
              </div>

              {/* Role Mapping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('roleMapping') || 'Role Mapping'}</label>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">{h.t('roleMappingDesc') || 'Map IdP groups to HookSniff roles.'}</p>
                <div className="space-y-2">
                  {h.roleEntries.map((entry, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={entry.group}
                        onChange={(e) => { const next = [...h.roleEntries]; next[i] = { ...next[i], group: e.target.value }; h.setRoleEntries(next); }}
                        disabled={h.isEnforced} placeholder={h.t('groupName') || 'Group name'}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm disabled:opacity-60" />
                      <select value={entry.role}
                        onChange={(e) => { const next = [...h.roleEntries]; next[i] = { ...next[i], role: e.target.value }; h.setRoleEntries(next); }}
                        disabled={h.isEnforced}
                        className="w-36 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm disabled:opacity-60">
                        <option value="viewer">Viewer</option><option value="analyst">Analyst</option><option value="developer">Developer</option><option value="admin">Admin</option>
                      </select>
                      {!h.isEnforced && (
                        <button type="button" onClick={() => h.setRoleEntries(h.roleEntries.filter((_, j) => j !== i))}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><XCircle size={16} strokeWidth={1.75} /></button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 items-center pt-2 border-t border-gray-100 dark:border-slate-700">
                    <span className="flex-1 text-sm text-gray-500 dark:text-slate-400 font-medium">{h.t('defaultRoleLabel') || 'Default (unmatched)'}</span>
                    <select value={h.defaultMappingRole} onChange={(e) => h.setDefaultMappingRole(e.target.value)} disabled={h.isEnforced}
                      className="w-36 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm disabled:opacity-60">
                      <option value="viewer">Viewer</option><option value="analyst">Analyst</option><option value="developer">Developer</option><option value="admin">Admin</option>
                    </select>
                  </div>
                  {!h.isEnforced && (
                    <button type="button" onClick={() => h.setRoleEntries([...h.roleEntries, { group: '', role: 'viewer' }])}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition">
                      + {h.t('addMapping') || 'Add Mapping'}
                    </button>
                  )}
                </div>
                {h.roleMappingError && <p className="text-xs text-red-500 mt-1">{h.roleMappingError}</p>}
              </div>

              {/* Team Mapping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('teamMapping') || 'Team Mapping'}</label>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">{h.t('teamMappingDesc') || 'Map email domains to teams.'}</p>
                <div className="space-y-2">
                  {h.teamEntries.map((entry, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={entry.domain}
                        onChange={(e) => { const next = [...h.teamEntries]; next[i] = { ...next[i], domain: e.target.value }; h.setTeamEntries(next); }}
                        disabled={h.isEnforced} placeholder={h.t('emailDomain') || 'e.g. engineering.company.com'}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono disabled:opacity-60" />
                      <select value={entry.teamId}
                        onChange={(e) => { const next = [...h.teamEntries]; next[i] = { ...next[i], teamId: e.target.value }; h.setTeamEntries(next); }}
                        disabled={h.isEnforced}
                        className="w-48 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm disabled:opacity-60">
                        <option value="">{h.t('selectTeam') || 'Select team...'}</option>
                        {h.teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                      </select>
                      {!h.isEnforced && (
                        <button type="button" onClick={() => h.setTeamEntries(h.teamEntries.filter((_, j) => j !== i))}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><XCircle size={16} strokeWidth={1.75} /></button>
                      )}
                    </div>
                  ))}
                  {!h.isEnforced && (
                    <button type="button" onClick={() => h.setTeamEntries([...h.teamEntries, { domain: '', teamId: '' }])}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition">
                      + {h.t('addMapping') || 'Add Mapping'}
                    </button>
                  )}
                </div>
                {h.teamMappingError && <p className="text-xs text-red-500 mt-1">{h.teamMappingError}</p>}
              </div>

              {/* SCIM */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{h.t('scimProvisioning') || 'SCIM Provisioning'}</h3>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{h.t('enableScim') || 'Enable SCIM'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{h.t('enableScimDesc') || 'Allow IdPs to provision users via SCIM 2.0'}</p>
                  </div>
                  <button type="button" role="switch" aria-checked={h.scimEnabled} onClick={() => h.setScimEnabled(!h.scimEnabled)} disabled={h.isEnforced}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${h.scimEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ease-in-out ${h.scimEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {h.scimEnabled && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label htmlFor="sso-scim-token" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{h.t('scimToken') || 'SCIM Bearer Token'}</label>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{h.t('scimTokenDesc') || 'Token for SCIM API authentication.'}</p>
                      <div className="flex gap-2">
                        <input id="sso-scim-token" type={h.showScimToken ? 'text' : 'password'} value={h.scimToken} onChange={(e) => h.setScimToken(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm" placeholder="Enter SCIM token" />
                        <button type="button" onClick={() => h.setShowScimToken(!h.showScimToken)}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          {h.showScimToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>{h.t('scimEndpoint') || 'SCIM Endpoint'}:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/v1/sso/scim/v2/
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Friendly Error */}
      {h.friendlyError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <div className="flex-1">
              <div className="font-semibold text-red-800 dark:text-red-300">{h.friendlyError.title}</div>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{h.friendlyError.message}</p>
              {h.friendlyError.action && (
                <button type="button" onClick={() => h.setFriendlyError(null)} className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium hover:underline">
                  {h.friendlyError.action} →
                </button>
              )}
            </div>
            <button type="button" onClick={() => h.setFriendlyError(null)} className="text-red-400 hover:text-red-600">×</button>
          </div>
        </div>
      )}

      {/* Step 4: Save & Test */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">4</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('saveAndTest')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{h.t('saveAndTestDesc')}</p>
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={h.handleSave} disabled={h.saving || h.isEnforced}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50">
            {h.saving ? h.t('saving') : h.t('saveConfiguration')}
          </button>
          <button type="button" onClick={h.handleTest} disabled={h.testing || !h.isConfigured}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50">
            {h.testing ? h.t('testing') : h.t('testConnection')}
          </button>
          {!h.isEnforced && (
            <button type="button" onClick={h.handleTestAndActivate} disabled={h.testAndActivateLoading || !h.isConfigured}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2">
              {h.testAndActivateLoading ? (
                <><span className="animate-spin">⏳</span> {h.t('testingAndActivating') || 'Testing & Activating...'}</>
              ) : (
                <><ShieldCheck size={16} /> {h.t('testAndActivate') || 'Test & Activate'}</>
              )}
            </button>
          )}
          {h.testPassed && (
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" /> {h.t('testPassed')}
            </span>
          )}
        </div>
      </div>

      {/* Step 5: Enforce SSO */}
      {h.isConfigured && !h.isEnforced && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">5</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.t('enforceSso')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{h.t('enforceSsoDesc')}</p>
          <RoleGuard require="canManageTeam">
            <button type="button" onClick={() => h.setShowEnforceModal(true)} disabled={!h.testPassed && !h.ssoConfig?.enabled}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50">
              {h.t('enforceSsoButton')}
            </button>
          </RoleGuard>
          {!h.testPassed && !h.ssoConfig?.enabled && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{h.t('testFirst')}</p>
          )}
        </div>
      )}

      {/* SSO Login URL */}
      {h.isEnforced && h.ssoLoginUrl && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{h.t('ssoLoginUrl')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{h.t('ssoLoginUrlDesc')}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-mono text-gray-800 dark:text-slate-200 break-all">{h.ssoLoginUrl}</code>
            <button type="button" onClick={() => { navigator.clipboard.writeText(h.ssoLoginUrl!); }}
              className="px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition" title="Copy"><ClipboardList size={18} strokeWidth={1.75} /></button>
          </div>
        </div>
      )}

      {/* Delete */}
      {h.isConfigured && !h.isEnforced && (
        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <RoleGuard require="canManageTeam">
            <button type="button" onClick={h.handleDelete} disabled={h.deleting}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              {h.deleting ? '...' : h.t('deleteConfig')}
            </button>
          </RoleGuard>
        </div>
      )}

      {/* Enforce Modal */}
      {h.showEnforceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{h.t('enforceModalTitle')}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                <span className="text-orange-500 mt-0.5"><AlertTriangle size={18} strokeWidth={1.75} /></span>
                <p className="text-sm text-orange-700 dark:text-orange-300">{h.t('enforceWarning1')}</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                <span className="text-orange-500 mt-0.5"><AlertTriangle size={18} strokeWidth={1.75} /></span>
                <p className="text-sm text-orange-700 dark:text-orange-300">{h.t('enforceWarning2')}</p>
              </div>
            </div>
            <label className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
              <input type="checkbox" checked={h.adminBypass} onChange={(e) => h.setAdminBypass(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{h.t('adminBypass')}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{h.t('adminBypassDesc')}</div>
              </div>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => h.setShowEnforceModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                {h.t('cancel')}
              </button>
              <button type="button" onClick={h.handleEnforce} disabled={h.enforcing}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition disabled:opacity-50">
                {h.enforcing ? h.t('enforcing') : h.t('enforceConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
