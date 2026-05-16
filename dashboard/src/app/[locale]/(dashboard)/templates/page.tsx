'use client';

import { useTranslations } from 'next-intl';
import { useTemplates } from '@/hooks/useDashboardData';

export default function TemplatesPage() {
  const t = useTranslations('templatesPage');
  const tc = useTranslations('common');
  const { data, isLoading, error, refetch } = useTemplates();
  const templates = data?.templates ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error instanceof Error ? error.message : tc('unknownError')}</span>
          <button onClick={() => refetch()} className="text-sm text-red-600 dark:text-red-400 underline">{tc('retry')}</button>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noTemplates')}</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="glass-card p-6 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tpl.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{tpl.description}</p>
              {tpl.event_types && tpl.event_types.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tpl.event_types.map((ev) => (
                    <span key={ev} className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-sm text-xs">{ev}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
