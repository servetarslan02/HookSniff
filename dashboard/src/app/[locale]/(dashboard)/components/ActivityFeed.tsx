'use client';

import { useTranslations } from 'next-intl';
import { type Delivery } from '@/lib/api';

interface ActivityFeedProps {
  deliveries: Delivery[];
  loading?: boolean;
}

export function ActivityFeed({ deliveries, loading }: ActivityFeedProps) {
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-slate-700" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!deliveries.length) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
        {t('noRecentActivity')}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {deliveries.slice(0, 5).map((d) => (
        <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
          <span className={`w-2 h-2 rounded-full ${
            d.status === 'delivered' ? 'bg-emerald-500' :
            d.status === 'failed' ? 'bg-red-500' :
            d.status === 'pending' ? 'bg-yellow-500' :
            'bg-gray-400'
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{d.event}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{d.endpoint_id}</p>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-slate-500 whitespace-nowrap">
            {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
}
