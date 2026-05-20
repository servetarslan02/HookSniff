'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Flag, Repeat, Rocket, CheckCircle2, Triangle } from '@/components/icons';

interface InfraTabProps {
  featureFlags: any[];
  deployInfo: any;
}

export default function InfraTab({ featureFlags, deployInfo }: InfraTabProps) {
  const t = useTranslations('admin');

  return (
    <>
      {/* Feature Flags */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Flag size={20} strokeWidth={1.75} className="text-gray-400" />
          <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('featureFlagStatus')}</h2>
        </div>
        {featureFlags.length > 0 ? (
          <>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{featureFlags.filter(f => f.is_enabled).length} / {featureFlags.length}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('activeFlagCount')}: {featureFlags.filter(f => f.is_enabled).length}</p>
            <div className="mt-3 space-y-1">
              {featureFlags.slice(0, 3).map(f => (
                <div key={f.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${f.is_enabled ? (f.rollout_percentage ?? 100) >= 100 ? 'bg-emerald-500' : 'bg-amber-500' : 'bg-gray-400'}`} />
                  <span className="text-gray-600 dark:text-slate-400 truncate">{f.name}</span>
                  {f.is_enabled && (f.rollout_percentage ?? 100) < 100 && <span className="text-amber-500 dark:text-amber-400">({f.rollout_percentage}%)</span>}
                </div>
              ))}
              {featureFlags.length > 3 && <p className="text-xs text-gray-400 dark:text-slate-500">+{featureFlags.length - 3} {t('more') || 'more'}</p>}
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('noFeatureFlags') || 'No feature flags configured yet'}</p>
            <Link href="/admin/feature-flags" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium mt-1 inline-block">{t('createFlag') || 'Create flag'} →</Link>
          </div>
        )}
      </div>

      {/* Standard Webhooks + Deduplication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Triangle size={20} strokeWidth={1.75} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('standardWebhooks')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('standardWebhooksDesc')}</p>
          {(() => {
            const swFlag = featureFlags.find(f => f.name === 'standard_webhooks');
            const isEnabled = swFlag?.is_enabled;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('webhookPrefix')}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isEnabled ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>webhook-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('whsecSecret')}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isEnabled ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>whsec_</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('complianceStatus')}</span>
                  {isEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={12} strokeWidth={1.75} className="inline mr-0.5" />{t('active') || 'Active'}</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">{t('notConfigured')}</span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Repeat size={20} strokeWidth={1.75} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('deduplication')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('deduplicationDesc')}</p>
          {(() => {
            const dedupFlag = featureFlags.find(f => f.name === 'deduplication');
            const isEnabled = dedupFlag?.is_enabled;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('filteredEvents')}</span>
                  <span className={`text-lg font-bold ${isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{isEnabled ? '—' : '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('dedupWindow')}</span>
                  <span className={`text-sm ${isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{isEnabled ? (t('dedupWindowDefault') || '60s') : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('complianceStatus')}</span>
                  {isEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={12} strokeWidth={1.75} className="inline mr-0.5" />{t('active') || 'Active'}</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">{t('notConfigured')}</span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Last Deploy */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket size={20} strokeWidth={1.75} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lastDeploy')}</h2>
        </div>
        {deployInfo ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">v{deployInfo.version}</span>
            </div>
            {deployInfo.git_commit ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-600 dark:text-slate-400">{deployInfo.git_commit.slice(0, 7)}</span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-500 dark:text-slate-500">{t('commitNotAvailable') || 'commit: N/A'}</span>
            )}
            <span className="text-sm text-gray-500 dark:text-slate-400">{deployInfo.environment}</span>
            {deployInfo.build_time ? (
              <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(deployInfo.build_time).toLocaleString()}</span>
            ) : (
              <span className="text-xs text-gray-400 dark:text-slate-500">{t('buildTimeNotAvailable') || 'build time: N/A'}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">main</span>
            </div>
            <span className="text-sm text-amber-600 dark:text-amber-400">{t('deployInfoUnavailable') || 'Deploy info unavailable'}</span>
          </div>
        )}
      </div>
    </>
  );
}
