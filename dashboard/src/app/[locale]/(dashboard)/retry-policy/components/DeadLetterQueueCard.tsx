'use client';

import { useTranslations } from 'next-intl';
import type { GlobalRetryPolicy } from '../types';

export function DeadLetterQueueCard({
  policy,
  onChange,
}: {
  policy: GlobalRetryPolicy;
  onChange: (update: Partial<GlobalRetryPolicy>) => void;
}) {
  const t = useTranslations('retryPolicy');

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('deadLetterQueue')}</h2>
      <label className="flex items-center justify-between cursor-pointer mb-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">{t('enableDlq')}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400">{t('enableDlqDesc')}</div>
        </div>
        <div className={`w-11 h-6 rounded-full transition-colors ${policy.dead_letter_queue_enabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${policy.dead_letter_queue_enabled ? 'translate-x-5' : 'translate-x-0.5'} absolute top-0.5`} />
          <input
            type="checkbox"
            checked={policy.dead_letter_queue_enabled}
            onChange={(e) => onChange({ dead_letter_queue_enabled: e.target.checked })}
            className="sr-only"
          />
        </div>
      </label>
      {policy.dead_letter_queue_enabled && (
        <div>
          <label htmlFor="retry-max-age" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('maxAge')}</label>
          <input
            id="retry-max-age"
            type="number"
            min={1}
            value={policy.dead_letter_queue_max_age_hours}
            onChange={(e) => onChange({ dead_letter_queue_max_age_hours: parseInt(e.target.value) || 72 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
