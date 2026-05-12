'use client';

import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { StatusBadge } from '@/components/tremor';
import type { Delivery } from '@/lib/api';

export function RecentDeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const params = useParams();
  const username = (params?.username as string) || 'dashboard';

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentDeliveries')}</h2>
        <Link
          href={`/${username}/deliveries`}
          className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
        >
          {t('viewAll')}
        </Link>
      </div>
      {deliveries.length === 0 ? (
        <div className="p-12 text-center text-gray-500 dark:text-slate-400">
          {t('noDeliveries')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {deliveries.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                    {d.id.slice(0, 12)}…
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-mono text-gray-700 dark:text-slate-300">
                      {d.event || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                    {d.attempt_count}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                    {new Date(d.created_at).toLocaleString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
