'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface ActivityTabProps {
  auditLogs: any[];
  stats: any;
  mrr: number;
}

export default function ActivityTab({ auditLogs, stats, mrr }: ActivityTabProps) {
  const t = useTranslations('admin');
  const locale = useLocale();

  return (
    <>
      {/* Recent Activity */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentActivity')}</h2>
          <Link href="/admin/activity" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">
            {t('viewAll')} →
          </Link>
        </div>
        <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
          {auditLogs.length > 0 ? auditLogs.map((entry: any) => (
            <div key={entry.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.action.replace(/[._]/g, ' ')}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{entry.resource_type}{entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}…` : ''}</p>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                  {new Date(entry.created_at).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )) : (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">{t('noActivity')}</div>
          )}
        </div>
      </div>

      {/* Recent Signups + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentSignups')}</h2>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {stats?.recent_signups?.length ? stats.recent_signups.map((user: any) => (
              <div key={user.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">{user.plan}</span>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">{t('noRecentSignups')}</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/system" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <span className="text-2xl">🖥️</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('viewSystemHealth')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('systemHealth')}</p>
              </div>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('userManagement')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('totalUsers')}: {stats?.total_users || 0}</p>
              </div>
            </Link>
            <Link href="/admin/revenue" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('revenue')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">MRR: {t('currencySymbol')}{mrr.toLocaleString()}</p>
              </div>
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('platformSettings')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('settingsNav')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
