'use client';

import { useTranslations } from 'next-intl';
import { type Delivery } from '@/lib/api';
import { Link } from '@/i18n/navigation';

interface RecentDeliveriesTableProps {
  deliveries: Delivery[];
  loading?: boolean;
}

export function RecentDeliveriesTable({ deliveries, loading }: RecentDeliveriesTableProps) {
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-10 bg-gray-100 dark:bg-slate-800 rounded-sm" />
        ))}
      </div>
    );
  }

  if (!deliveries.length) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
        {t('noDeliveriesYet')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-800">
            <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-slate-400">{t('event')}</th>
            <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-slate-400">{t('status')}</th>
            <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-slate-400">{t('time')}</th>
            <th className="text-right py-2 px-4 font-medium text-gray-500 dark:text-slate-400">{t('action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
          {deliveries.slice(0, 5).map((d) => (
            <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <td className="py-2.5 px-4 font-medium text-gray-900 dark:text-white">{d.event}</td>
              <td className="py-2.5 px-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  d.status === 'delivered' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                  d.status === 'failed' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                  'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {d.status}
                </span>
              </td>
              <td className="py-2.5 px-4 text-gray-500 dark:text-slate-400 text-xs">
                {new Date(d.created_at).toLocaleString()}
              </td>
              <td className="py-2.5 px-4 text-right">
                <Link href={`/deliveries/${d.id}`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  {t('view')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
