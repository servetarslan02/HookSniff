'use client';

import { useTranslations } from 'next-intl';

export function DetailRow({
  label,
  value,
  mono,
  copyable,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const t = useTranslations('deliveryDetail');
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-slate-400 shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm text-gray-900 dark:text-white truncate ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </span>
        {copyable && onCopy && (
          <button type="button"
            onClick={onCopy}
            className="shrink-0 p-1 rounded-sm text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
            title={t('copyTitle')}
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
