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

  // Billing usage derived values
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

  if (loading) return <div className="p-8 text-gray-500 dark:text-slate-400">{t('loading')}</div>;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400">
          {error instanceof Error ? error.message : t('failedToLoad')}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>

      {/* Profile */}
      {profile && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('profile')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('email')}</p>
              <p className="font-medium text-gray-900 dark:text-white">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('plan')}</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{profile.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('memberSince')}</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(profile.created_at).toLocaleDateString(locale)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      {usage && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('usage')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('webhooksUsed')}</p>
              <p className="text-2xl font-bold text-purple-500">{usage.total_deliveries?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('endpoints')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{usage.total_endpoints || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('successRate')}</p>
              <p className="text-2xl font-bold text-green-500">{usage.success_rate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Limits */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{tb('usageOverview')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Webhook Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{tb('webhooksThisMonth')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookUsed.toLocaleString()} / {webhookLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all duration-500',
                  webhookPercent > 80 ? 'bg-red-500' : webhookPercent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                )}
                style={{ width: `${webhookPercent}%` }}
              />
            </div>
            {webhookPercent > 80 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                ⚠️ {tb('approachingLimit')}
              </p>
            )}
          </div>

          {/* Endpoint Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{tb('endpoints')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {endpointUsed} / {endpointLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all duration-500',
                  endpointPercent > 80 ? 'bg-red-500' : endpointPercent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                )}
                style={{ width: `${endpointPercent}%` }}
              />
            </div>
          </div>

          {/* Data Retention */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{tb('dataRetention')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {planLimits?.retention ?? '—'} {tb('days')}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500 bg-brand-500"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">
              {tb('retentionDesc')}
            </p>
          </div>
        </div>

        {/* Plan Limits Grid */}
        {planLimits && (
          <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.endpoints}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{tb('endpoints')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.webhooks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{tb('webhooksMonth')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.rateLimit.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{tb('rateLimit')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.retention}<span className="text-base">d</span></p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{tb('dataRetention')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
