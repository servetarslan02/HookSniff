import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Building2, Clock, CreditCard, Eye, FileText, Globe, Key, KeyRound, Link, Package, Pencil, ScrollText, Settings, Shield, ShieldCheck, Star, Target, User, Users, Zap } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Organization — HookSniff Docs',
  description: 'Manage teams, SSO, and audit logs',
};

export default async function OrganizationDocsPage() {
  const t = await getTranslations('docsOrganization');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><Building2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('overview')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('overviewDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><Users size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('tabTeam')}</li>
          <li><ShieldCheck size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('tabSso')}</li>
          <li><ScrollText size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('tabAudit')}</li>
        </ul>
        <div className="mt-4 p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1"><Target size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('teamSelector')}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">{t('teamSelectorDesc')}</p>
        </div>
      </section>

      {/* ━━━ TEAM MANAGEMENT ━━━ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><Users size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('teamMgmt')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          {t('teamMgmtDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('createTeam')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('createTeamDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('inviteMembers')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('inviteMembersDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('roles')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('rolesDesc')}
        </p>
        <div className="space-y-3 not-prose mb-6">
          <div className="p-4 border border-purple-200 dark:border-purple-900/30 rounded-xl bg-purple-50/50 dark:bg-purple-900/10">
            <div className="flex items-center gap-2 mb-1">
              <span><Shield size={16} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-purple-800 dark:text-purple-400 text-sm">{t('roleAdmin')}</h4>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">{t('roleAdminDesc')}</p>
          </div>
          <div className="p-4 border border-blue-200 dark:border-blue-900/30 rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
            <div className="flex items-center gap-2 mb-1">
              <span><Pencil size={16} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 text-sm">{t('roleEditor')}</h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">{t('roleEditorDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span><Eye size={16} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('roleViewer')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('roleViewerDesc')}</p>
          </div>
        </div>

        {/* Permission Matrix */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('roleTable')}</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('permAction')}</th>
                  <th className="px-4 py-3 text-center font-medium text-purple-700 dark:text-purple-400">{t('permAdmin')}</th>
                  <th className="px-4 py-3 text-center font-medium text-blue-700 dark:text-blue-400">{t('permEditor')}</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-slate-400">{t('permViewer')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {[
                  { action: t('permCreateEndpoint'), admin: true, editor: true, viewer: false },
                  { action: t('permSendWebhook'), admin: true, editor: true, viewer: false },
                  { action: t('permViewDelivery'), admin: true, editor: true, viewer: true },
                  { action: t('permManageApiKey'), admin: true, editor: true, viewer: false },
                  { action: t('permInviteMember'), admin: true, editor: false, viewer: false },
                  { action: t('permRemoveMember'), admin: true, editor: false, viewer: false },
                  { action: t('permChangeRole'), admin: true, editor: false, viewer: false },
                  { action: t('permDeleteTeam'), admin: true, editor: false, viewer: false },
                  { action: t('permManageSso'), admin: true, editor: false, viewer: false },
                ].map(({ action, admin, editor, viewer }) => (
                  <tr key={action}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{action}</td>
                    <td className="px-4 py-3 text-center">{admin ? <Check size={14} strokeWidth={1.75} className=\"text-emerald-500\" /> : <X size={14} strokeWidth={1.75} className=\"text-red-500\" />}</td>
                    <td className="px-4 py-3 text-center">{editor ? <Check size={14} strokeWidth={1.75} className=\"text-emerald-500\" /> : <X size={14} strokeWidth={1.75} className=\"text-red-500\" />}</td>
                    <td className="px-4 py-3 text-center">{viewer ? <Check size={14} strokeWidth={1.75} className=\"text-emerald-500\" /> : <X size={14} strokeWidth={1.75} className=\"text-red-500\" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('transferOwnership')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('transferOwnershipDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('deleteTeam')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('deleteTeamDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('leaveTeam')}</h3>
        <p className="text-gray-600 dark:text-slate-400">
          {t('leaveTeamDesc')}
        </p>
      </section>

      {/* ━━━ SSO ━━━ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><ShieldCheck size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('ssoTitle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('ssoDesc')}
        </p>

        <div className="p-4 border border-amber-200 dark:border-amber-900/30 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span><Star size={16} strokeWidth={1.75} className="text-amber-500" /></span>
            <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">{t('ssoEnterprise')}</h4>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">{t('ssoEnterpriseDesc')}</p>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoProviders')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl"><Building2 size={20} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('ssoSaml')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoSamlDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl"><Key size={20} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('ssoOidc')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoOidcDesc')}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoSetup')}</h3>

        <div className="space-y-4 not-prose mb-6">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">1</span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('ssoStep1')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoStep1Desc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">2</span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('ssoStep2')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('ssoStep2Saml')}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoStep2Oidc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">3</span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('ssoStep3')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoStep3Desc')}</p>
          </div>
          <div className="p-4 border border-orange-200 dark:border-orange-900/30 rounded-xl bg-orange-50/50 dark:bg-orange-900/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-bold">4</span>
              <h4 className="font-semibold text-orange-800 dark:text-orange-400 text-sm">{t('ssoStep4')}</h4>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">{t('ssoStep4Desc')}</p>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li><AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-amber-500" /> {t('ssoEnforce1')}</li>
              <li><AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-amber-500" /> {t('ssoEnforce2')}</li>
            </ul>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoAdminBypass')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          {t('ssoAdminBypassDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoAutoJoin')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('ssoAutoJoinDesc')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{t('ssoAutoJoinTeam')}</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoAutoJoinTeamDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{t('ssoAutoJoinRole')}</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('ssoAutoJoinRoleDesc')}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoVerifiedDomain')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('ssoVerifiedDomainDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-2 font-medium">{t('ssoVerifiedDomainHow')}</p>
        <ol className="list-decimal list-inside text-gray-600 dark:text-slate-400 space-y-1 mb-6">
          <li>{t('ssoDomainStep1')}</li>
          <li>{t('ssoDomainStep2')}</li>
          <li>{t('ssoDomainStep3')}</li>
          <li>{t('ssoDomainStep4')}</li>
        </ol>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoLoginUrl')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-2">
          {t('ssoLoginUrlDesc')}
        </p>
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-2">
          <code className="text-sm font-mono text-gray-800 dark:text-slate-200">{'https://hooksniff.vercel.app/v1/sso/login?email=user@company.com'}</code>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          {t('ssoLoginUrlNote')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('ssoDisable')}</h3>
        <p className="text-gray-600 dark:text-slate-400">
          {t('ssoDisableDesc')}
        </p>
      </section>

      {/* ━━━ AUDIT LOG ━━━ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><ScrollText size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditTitle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          {t('auditDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('auditFilters')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('auditFiltersDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('auditColumns')}</h3>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-6">
          <li><Clock size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditColTime')}</li>
          <li><Zap size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditColAction')}</li>
          <li><User size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditColActor')}</li>
          <li><Package size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditColResource')}</li>
          <li><FileText size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditColDetails')}</li>
          <li><Globe size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditColIp')}</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('auditActions')}</h3>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><Key size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditAuth')}</li>
          <li><Link size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditEndpoint')}</li>
          <li><KeyRound size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditApiKey')}</li>
          <li><Package size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditWebhook')}</li>
          <li><Users size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditTeam')}</li>
          <li><Settings size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditSettings')}</li>
          <li><CreditCard size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('auditBilling')}</li>
        </ul>
      </section>

      {/* ━━━ API REFERENCE ━━━ */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('apiReference')}</h2>
        <div className="space-y-4 not-prose">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl"><Users size={20} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('apiTeams')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('apiTeamsDesc')}</p>
            <div className="text-xs font-mono text-gray-500 dark:text-slate-500 space-y-1">
              <div>GET /v1/teams</div>
              <div>POST /v1/teams</div>
              <div>POST /v1/teams/:id/invite</div>
              <div>DELETE /v1/teams/:id/members/:uid</div>
              <div>PUT /v1/teams/:id/members/:uid/role</div>
              <div>POST /v1/teams/:id/leave</div>
              <div>POST /v1/teams/:id/transfer</div>
              <div>DELETE /v1/teams/:id</div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl"><ShieldCheck size={20} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('apiSso')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('apiSsoDesc')}</p>
            <div className="text-xs font-mono text-gray-500 dark:text-slate-500 space-y-1">
              <div>GET /sso/config</div>
              <div>POST /sso/config</div>
              <div>DELETE /sso/config</div>
              <div>POST /sso/test</div>
              <div>POST /sso/verify-domain</div>
              <div>GET /sso/login?email=...</div>
              <div>POST /sso/saml/callback</div>
              <div>GET /sso/oidc/callback</div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl"><ScrollText size={20} strokeWidth={1.75} /></span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('apiAudit')}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('apiAuditDesc')}</p>
            <div className="text-xs font-mono text-gray-500 dark:text-slate-500">
              <div>GET /v1/audit-logs?page=1&amp;limit=50&amp;action=auth</div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
