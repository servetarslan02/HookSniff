'use client';


import { useTranslations } from 'next-intl';
import type { GlobalRetryPolicy } from '../types';
import { Lightbulb } from '@/components/icons';

export function DelayPreviewCard({ policy }: { policy: GlobalRetryPolicy }) {
  const t = useTranslations('retryPolicy');

  const getDelayPreview = () => {
    const delays: number[] = [];
    let delay = policy.default_initial_delay_secs;
    for (let i = 0; i < policy.default_max_attempts; i++) {
      delays.push(delay);
      if (policy.default_backoff === 'exponential') delay = Math.min(delay * 2, policy.default_max_delay_secs);
      else if (policy.default_backoff === 'linear') delay = Math.min(delay + policy.default_initial_delay_secs, policy.default_max_delay_secs);
    }
    return delays;
  };

  return (
    <div className="glass-card p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('delayPreview')}</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        {t('delayPreviewDesc')}
      </p>
      <div className="space-y-2">
        {getDelayPreview().map((delay, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-slate-400 w-20">{t('attempt', { n: i + 1 })}</span>
            <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-brand-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min((delay / policy.default_max_delay_secs) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm font-mono text-gray-700 dark:text-slate-300 w-20 text-right">
              {delay < 60 ? `${delay}s` : `${Math.round(delay / 60)}m`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
        <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">{t('totalRetryTime')}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {(() => {
            const total = getDelayPreview().reduce((a, b) => a + b, 0);
            if (total < 60) return `${total}s`;
            if (total < 3600) return `${Math.round(total / 60)}m`;
            return `${(total / 3600).toFixed(1)}h`;
          })()}
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <Lightbulb size={16} strokeWidth={1.75} className="inline mr-1" /> <strong>{t("tip")}</strong> {t('tipContent')} <a href={`/core`} className="underline">{t('endpointSettingsLink')}</a>.
        </p>
      </div>
    </div>
  );
}
