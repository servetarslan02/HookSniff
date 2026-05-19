'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

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

  const copyApiKey = async () => {
    if (apiKey) {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(apiKey);
        } else {
          const ta = document.createElement('textarea');
          ta.value = apiKey;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
      } catch {
        // Silent fail
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
          <span className="text-base">🗝️</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('api')}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t('apiDesc')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-mono text-sm text-gray-500 dark:text-slate-400 truncate">
          {apiKey ? '••••••••••••••••••••••••••••••••' : t('noApiKey')}
        </div>
        <button
          type="button"
          onClick={copyApiKey}
          disabled={!apiKey}
          className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-40 whitespace-nowrap"
        >
          {copied ? <><Check size={14} strokeWidth={1.75} className="inline mr-0.5" />{tc('copied')}</> : tc('copy')}
        </button>
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
        {t('keepSecret')}{' '}
        <a href="/core" className="text-brand-600 dark:text-brand-400 hover:underline">
          {t('manageApiKeys')} →
        </a>
      </p>
    </div>
  );
}
