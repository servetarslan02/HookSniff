'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { formatRelativeTime } from './utils';
import { CircleDot } from 'lucide-react';

export function StatusBanner({ status, checkedAt }: { status: string; checkedAt: string }) {
  const router = useRouter();
  const t = useTranslations('status');
  const configs: Record<string, { bg: string; border: string; text: string; icon: string; title: string }> = {
    operational: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-800 dark:text-emerald-300', icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('allOperational') },
    degraded: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-800 dark:text-amber-300', icon: <AlertTriangle size={20} strokeWidth={1.75} className="text-amber-500" />, title: t('someDegraded') },
    down: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-800 dark:text-red-300', icon: <CircleDot size={16} strokeWidth={1.75} />, title: t('majorOutage') },
  };
  const c = configs[status] || configs.operational;
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-5 mb-6`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{c.icon}</span>
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${c.text}`}>{c.title}</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {t('lastChecked', { time: formatRelativeTime(checkedAt) })} • {t('autoRefresh')}
          </p>
        </div>
        <button
          className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => router.refresh()}
        >
          ↻ {t('refresh')}
        </button>
      </div>
    </div>
  );
}
