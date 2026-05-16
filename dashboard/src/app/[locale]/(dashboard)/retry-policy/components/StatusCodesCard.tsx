'use client';

import { useTranslations } from 'next-intl';
import { STATUS_CODES } from '../types';

export function StatusCodesCard({
  selectedCodes,
  onToggle,
}: {
  selectedCodes: number[];
  onToggle: (code: number) => void;
}) {
  const t = useTranslations('retryPolicy');

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('retryOnStatusCodes')}</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        {t('retryOnStatusCodesDesc')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_CODES.map((sc) => (
          <label
            key={sc.code}
            className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition ${
              selectedCodes.includes(sc.code)
                ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20'
                : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedCodes.includes(sc.code)}
              onChange={() => onToggle(sc.code)}
              className="w-4 h-4 rounded-sm text-brand-600"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">{sc.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
