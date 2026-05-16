'use client';

import { useTranslations } from 'next-intl';
import { useSchemas } from '@/hooks/useDashboardData';

export default function SchemasPage() {
  const t = useTranslations('schemas');
  const tc = useTranslations('common');
  const { data, isLoading } = useSchemas();
  const schemas = data?.schemas ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : schemas.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">{t('noSchemas')}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {schemas.map((s) => (
              <div key={s.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</div>
                    {s.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{s.description}</p>}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">v{s.version}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
