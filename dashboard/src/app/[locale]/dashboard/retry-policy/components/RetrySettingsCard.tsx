'use client';

import { useTranslations } from 'next-intl';
import type { GlobalRetryPolicy } from '../types';
import { BACKOFF_OPTIONS } from '../types';

export function RetrySettingsCard({
  policy,
  onChange,
}: {
  policy: GlobalRetryPolicy;
  onChange: (update: Partial<GlobalRetryPolicy>) => void;
}) {
  const t = useTranslations('retryPolicy');

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('retrySettings')}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="retry-max-attempts" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('maxAttempts')}</label>
          <input
            id="retry-max-attempts"
            type="number"
            min={1}
            max={20}
            value={policy.default_max_attempts}
            onChange={(e) => onChange({ default_max_attempts: parseInt(e.target.value) || 5 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('backoffStrategy')}</label>
          <div className="space-y-2">
            {BACKOFF_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${
                  policy.default_backoff === opt.value
                    ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20'
                    : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750'
                }`}
              >
                <input
                  type="radio"
                  name="backoff"
                  value={opt.value}
                  checked={policy.default_backoff === opt.value}
                  onChange={(e) => onChange({ default_backoff: e.target.value as GlobalRetryPolicy['default_backoff'] })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{t(opt.labelKey)}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t(opt.descKey)}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="retry-initial-delay" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('initialDelay')}</label>
            <input
              id="retry-initial-delay"
              type="number"
              min={1}
              value={policy.default_initial_delay_secs}
              onChange={(e) => onChange({ default_initial_delay_secs: parseInt(e.target.value) || 10 })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="retry-max-delay" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('maxDelay')}</label>
            <input
              id="retry-max-delay"
              type="number"
              min={1}
              value={policy.default_max_delay_secs}
              onChange={(e) => onChange({ default_max_delay_secs: parseInt(e.target.value) || 3600 })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="retry-timeout" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('requestTimeout')}</label>
          <input
            id="retry-timeout"
            type="number"
            min={5}
            max={120}
            value={policy.timeout_secs}
            onChange={(e) => onChange({ timeout_secs: parseInt(e.target.value) || 30 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
