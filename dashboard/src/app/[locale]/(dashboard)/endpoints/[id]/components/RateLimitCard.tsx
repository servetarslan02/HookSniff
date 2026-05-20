'use client';

import { useTranslations } from 'next-intl';
import type { Endpoint } from '@/lib/api';
import { Zap } from '@/components/icons';

export function RateLimitCard({ endpoint }: { endpoint: Endpoint }) {
  const t = useTranslations('endpointSettings');

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl"><Zap size={18} strokeWidth={1.75} /></span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('rateLimits')}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('apiRequests')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {endpoint.routing_strategy === 'round-robin' ? '100' : '1,000'}
            <span className="text-sm font-normal text-gray-500 dark:text-slate-500 ml-1">{t('perMin')}</span>
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('avgResponse')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {endpoint.avg_response_ms ?? 0}
            <span className="text-sm font-normal text-gray-500 dark:text-slate-500 ml-1">{t('msUnit')}</span>
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('failureStreak')}</p>
          <p className={`text-2xl font-bold ${(endpoint.failure_streak ?? 0) >= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {endpoint.failure_streak ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
