'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePortalProfile, usePortalUsage } from '@/hooks/useDashboardData';

export default function PortalPage() {
  const t = useTranslations('portal');
  const locale = useLocale();
  const { data: profile, isLoading: profileLoading, error: profileError } = usePortalProfile();
  const { data: usage, isLoading: usageLoading } = usePortalUsage();

  const loading = profileLoading || usageLoading;
  const error = profileError;

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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {profile && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('profile')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('email')}</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('plan')}</p>
              <p className="font-medium capitalize">{profile.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('memberSince')}</p>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString(locale)}</p>
            </div>
          </div>
        </div>
      )}

      {usage && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">{t('usage')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('webhooksUsed')}</p>
              <p className="text-2xl font-bold text-purple-500">{usage.total_deliveries?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('endpoints')}</p>
              <p className="text-2xl font-bold">{usage.total_endpoints || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('successRate')}</p>
              <p className="text-2xl font-bold">{usage.success_rate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
