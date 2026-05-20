'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { RetryPolicyConfig } from '@/lib/api';
import { RefreshCw } from '@/components/icons';

const BACKOFF_OPTIONS = [
  { value: 'exponential', labelKey: 'exponential', descKey: 'exponentialDesc' },
  { value: 'linear', labelKey: 'linear', descKey: 'linearDesc' },
  { value: 'fixed', labelKey: 'fixed', descKey: 'fixedDesc' },
] as const;

export function RetryPolicyCard({
  initialMaxAttempts = 5,
  initialBackoff = 'exponential',
  initialDelay = 10,
  initialMaxDelay = 3600,
  onSave,
}: {
  initialMaxAttempts?: number;
  initialBackoff?: string;
  initialDelay?: number;
  initialMaxDelay?: number;
  onSave: (policy: RetryPolicyConfig) => Promise<void>;
}) {
  const t = useTranslations('endpointSettings');
  const [maxAttempts, setMaxAttempts] = useState(initialMaxAttempts);
  const [backoff, setBackoff] = useState(initialBackoff);
  const [initialDelaySecs, setInitialDelaySecs] = useState(initialDelay);
  const [maxDelay, setMaxDelay] = useState(initialMaxDelay);
  const [saving, setSaving] = useState(false);

  const previewDelays = () => {
    const delays: number[] = [];
    for (let i = 1; i <= Math.min(maxAttempts, 8); i++) {
      let delay: number;
      switch (backoff) {
        case 'exponential':
          delay = initialDelaySecs * Math.pow(2, i - 1);
          break;
        case 'linear':
          delay = initialDelaySecs * i;
          break;
        default:
          delay = initialDelaySecs;
      }
      delays.push(Math.min(delay, maxDelay));
    }
    return delays;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        max_attempts: maxAttempts,
        backoff: backoff as RetryPolicyConfig['backoff'],
        initial_delay_secs: initialDelaySecs,
        max_delay_secs: maxDelay,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl"><RefreshCw size={18} strokeWidth={1.75} /></span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('retryPolicy')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('maxAttempts')}
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t('maxAttemptsHint')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('backoffStrategy')}
          </label>
          <div className="space-y-2">
            {BACKOFF_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  backoff === opt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="backoff"
                  value={opt.value}
                  checked={backoff === opt.value}
                  onChange={(e) => setBackoff(e.target.value)}
                  className="mt-0.5 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{t(opt.labelKey)}</span>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t(opt.descKey)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('initialDelay')}
          </label>
          <input
            type="number"
            min={1}
            max={300}
            value={initialDelaySecs}
            onChange={(e) => setInitialDelaySecs(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('maxDelay')}
          </label>
          <input
            type="number"
            min={1}
            max={86400}
            value={maxDelay}
            onChange={(e) => setMaxDelay(Math.max(1, Math.min(86400, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t('maxDelayHint')}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
          {t('retrySchedulePreview')}
        </p>
        <div className="flex flex-wrap gap-2">
          {previewDelays().map((delay, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono"
            >
              #{i + 1}: {delay < 60 ? `${delay}s` : `${Math.round(delay / 60)}m`}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
        >
          {saving ? t('saving') : t('saveRetryPolicy')}
        </button>
      </div>
    </div>
  );
}
