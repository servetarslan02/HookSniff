'use client';

import { useTranslations, useLocale } from 'next-intl';
import { clsx } from 'clsx';
import { usePortalProfile, usePortalUsage, useBillingUsage } from '@/hooks/useDashboardData';
import { usePlans } from '@/hooks/usePlans';

export default function PortalPage() {
  const t = useTranslations('portal');
  const tb = useTranslations('billing');
  const locale = useLocale();
  const { data: profile, isLoading: profileLoading, error: profileError } = usePortalProfile();
  const { data: usage, isLoading: usageLoading } = usePortalUsage();
  const { data: billingUsage, isLoading: billingLoading } = useBillingUsage();
  const { getPlanLimits } = usePlans();

  const loading = profileLoading || usageLoading || billingLoading;
  const error = profileError;
  const currentPlan = profile?.plan || 'developer';
  const planLimits = getPlanLimits(currentPlan);

  const webhookUsed = billingUsage
    ? billingUsage.webhooks?.used ?? billingUsage.deliveries_used ?? 0
    : 0;
  const webhookLimit = billingUsage
    ? billingUsage.webhooks?.limit ?? billingUsage.deliveries_limit ?? 10000
    : 10000;
  const endpointUsed = billingUsage
    ? billingUsage.endpoints?.used ?? billingUsage.endpoints_count ?? 0
    : 0;
  const endpointLimit = billingUsage
    ? billingUsage.endpoints?.limit ?? billingUsage.endpoints_limit ?? 5
    : 5;

  const webhookPercent = webhookLimit > 0 ? Math.round((webhookUsed / webhookLimit) * 100) : 0;
  const endpointPercent = endpointLimit > 0 ? Math.round((endpointUsed / endpointLimit) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
          {error instanceof Error ? error.message : t('failedToLoad')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle') || 'Your account overview and usage'}</p>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="h-16 bg-linear-to-r from-brand-500 via-purple-500 to-pink-500" />
          <div className="px-6 pb-5 -mt-6">
            <div className="flex items-end gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white dark:ring-slate-800 shadow-lg">
                {(profile.email || 'U')[0].toUpperCase()}
              </div>
              <div className="pb-0.5">
                <div className="text-base font-semibold text-gray-900 dark:text-white">{profile.email}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {t('memberSince')}: {new Date(profile.created_at).toLocaleDateString(locale)}
                </div>
              </div>
              <div className="ml-auto pb-0.5">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20 capitalize">
                  {profile.plan}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📊</span>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('usage')}</h2>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700 ml-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('webhooksUsed')}
              value={usage.total_deliveries?.toLocaleString() || '0'}
              color="text-purple-500"
              icon="🪝"
            />
            <StatCard
              label={t('endpoints')}
              value={String(usage.total_endpoints || 0)}
              color="text-blue-500"
              icon="🔗"
            />
            <StatCard
              label={t('successRate')}
              value={`${usage.success_rate?.toFixed(1) || 0}%`}
              color="text-emerald-500"
              icon="✅"
            />
          </div>
        </div>
      )}

      {/* Plan Limits */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">📈</span>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tb('usageOverview')}</h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700 ml-2" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
          {/* Webhook Usage */}
          <UsageBar
            label={tb('webhooksThisMonth')}
            used={webhookUsed}
            limit={webhookLimit}
            percent={webhookPercent}
            warning={webhookPercent > 80}
          />

          {/* Endpoint Usage */}
          <UsageBar
            label={tb('endpoints')}
            used={endpointUsed}
            limit={endpointLimit}
            percent={endpointPercent}
            warning={endpointPercent > 80}
          />

          {/* Data Retention */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{tb('dataRetention')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {planLimits?.retention ?? '—'} {tb('days')}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-brand-500" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">{tb('retentionDesc')}</p>
          </div>

          {/* Plan Limits Grid */}
          {planLimits && (
            <div className="pt-5 border-t border-gray-100 dark:border-slate-700/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <LimitCard value={planLimits.endpoints} label={tb('endpoints')} />
                <LimitCard value={planLimits.webhooks.toLocaleString()} label={tb('webhooksMonth')} />
                <LimitCard value={planLimits.rateLimit.toLocaleString()} label={tb('rateLimit')} />
                <LimitCard value={`${planLimits.retention}d`} label={tb('dataRetention')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 text-center">
      <span className="text-lg mb-2 block">{icon}</span>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function UsageBar({ label, used, limit, percent, warning }: { label: string; used: number; limit: number; percent: number; warning?: boolean }) {
  const tb = useTranslations('billing');
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
        <div
          className={clsx(
            'h-2 rounded-full transition-all duration-500',
            warning ? 'bg-red-500' : percent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {warning && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">⚠️ {tb('approachingLimit')}</p>
      )}
    </div>
  );
}

function LimitCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-900">
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
