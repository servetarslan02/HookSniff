'use client';

import { useTranslations } from 'next-intl';
import { useEndpoints } from '@/hooks/useDashboardData';

export default function RoutingPage() {
  const t = useTranslations('routing');
  const tc = useTranslations('common');
  const { data: endpoints = [], isLoading } = useEndpoints();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : endpoints.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">{t('noEndpoints')}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {endpoints.map((ep) => (
              <div key={ep.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <code className="text-sm font-mono text-gray-700 dark:text-slate-300">{ep.url}</code>
                    {ep.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {ep.routing_strategy && (
                      <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-sm text-xs">{ep.routing_strategy}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${ep.is_active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                      {ep.is_active ? tc('active') : tc('inactive')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
