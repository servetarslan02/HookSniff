'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FlaskConical } from 'lucide-react';

export function ResponseInspector({
  response,
  status,
  headers,
  duration,
}: {
  response: unknown;
  status: number | null;
  headers: Record<string, React.ReactNode>;
  duration: number | null;
}) {
  const t = useTranslations('playground');
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  if (!response && !status) {
    return (
      <div className="text-center text-gray-500 dark:text-slate-500 py-16">
        <div className="text-4xl mb-3"><FlaskConical size={18} strokeWidth={1.75} /></div>
        <p>{t('sendToInspect')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status < 300
                ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                : status < 400
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400'
                  : status < 500
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
            }`}
          >
            {status} {status < 300 ? t('statusOk') : status < 400 ? t('statusRedirect') : status < 500 ? t('statusClientError') : t('statusServerError')}
          </span>
        )}
        {duration !== null && (
          <span className="text-sm text-gray-500 dark:text-slate-400">
            ⏱ {duration}ms
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700">
        {(['body', 'headers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[400px]">
        {activeTab === 'body'
          ? JSON.stringify(response, null, 2)
          : Object.entries(headers)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n') || t('noHeaders')}
      </pre>
    </div>
  );
}
