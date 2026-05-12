'use client';

import { useTranslations } from 'next-intl';
import { StatusBadge } from '@/components/StatusBadge';
import type { DeliveryDetail } from '@/lib/api';

function getHttpStatusColor(code?: number): string {
  if (!code) return 'text-gray-500 dark:text-slate-500';
  if (code < 300) return 'text-emerald-600 dark:text-emerald-400';
  if (code < 400) return 'text-blue-600 dark:text-blue-400';
  if (code < 500) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export function DeliveryOverviewCards({ delivery }: { delivery: DeliveryDetail }) {
  const t = useTranslations('deliveryDetail');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('statusLabel')}</p>
        <StatusBadge status={delivery.status} size="lg" />
      </div>
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('eventLabel')}</p>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-sm font-mono text-gray-700 dark:text-slate-300">
          {delivery.event || '—'}
        </span>
      </div>
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('attemptsLabel')}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{delivery.attempt_count}</p>
      </div>
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('responseLabel')}</p>
        {delivery.response_status ? (
          <p className={`text-2xl font-bold font-mono ${getHttpStatusColor(delivery.response_status)}`}>
            {delivery.response_status}
          </p>
        ) : (
          <p className="text-2xl font-bold text-gray-300 dark:text-slate-600">—</p>
        )}
      </div>
    </div>
  );
}
