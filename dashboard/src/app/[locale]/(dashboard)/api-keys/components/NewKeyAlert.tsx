'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Key } from 'lucide-react';

export function NewKeyAlert({
  newKey,
  onDismiss,
}: {
  newKey: string;
  onDismiss: () => void;
}) {
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-6 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-500/10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl"><Key size={18} strokeWidth={1.75} /></span>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
          {t('newKeyCreated')}
        </h3>
      </div>
      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
        {t('saveKeyNow')}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg text-sm font-mono break-all border border-green-200 dark:border-green-500/30 text-gray-900 dark:text-white">
          {newKey}
        </code>
        <button type="button"
          onClick={copyKey}
          className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition whitespace-nowrap"
        >
          {copied ? <><Check size={14} strokeWidth={1.75} className="inline mr-0.5" />{tc('copied')}</> : tc('copyToClipboard')}
        </button>
      </div>
      <button type="button"
        onClick={onDismiss}
        className="mt-3 text-sm text-green-700 dark:text-green-400 hover:underline"
      >
        {t('dismiss')}
      </button>
    </div>
  );
}
