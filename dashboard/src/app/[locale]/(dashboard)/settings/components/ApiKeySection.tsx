'use client';


import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export function ApiKeySection({ apiKey }: { apiKey: string | null }) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('api')}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('apiDesc')}</p>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={apiKey ? '••••••••••••••••••••••••••••••••' : t('noApiKey')}
            readOnly
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 font-mono text-sm text-gray-700 dark:text-slate-300"
          />
          <button
            type="button"
            onClick={copyApiKey}
            disabled={!apiKey}
            className="bg-gray-900 dark:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-slate-600 transition disabled:opacity-40 whitespace-nowrap"
          >
            {copied ? `✓ ${tc('copied')}` : tc('copy')}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {t('keepSecret')}{' '}
          <a href={`/core`} className="text-brand-600 dark:text-brand-400 hover:underline">
            {t('manageApiKeys')} →
          </a>
        </p>
      </div>
    </div>
  );
}
