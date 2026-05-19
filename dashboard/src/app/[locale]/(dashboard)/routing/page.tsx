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
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🔀</div>
            <p className="text-gray-500 dark:text-slate-400 mb-4">{t('noEndpoints')}</p>
            <a href="/webhooks" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition">
              {t('createEndpoint') || 'Create Endpoint'}
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {endpoints.map((ep) => (
              <div key={ep.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <a href={`/endpoints/${ep.id}`} className="text-sm font-mono text-gray-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:underline truncate block">
                      {ep.url}
                    </a>
                    {ep.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {ep.routing_strategy && (
                      <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-sm text-xs">{ep.routing_strategy}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${ep.is_active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                      {ep.is_active ? tc('active') : tc('inactive')}
                    </span>
                    <a href={`/endpoints/${ep.id}`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline ml-2">
                      {t('configure')} →
                    </a>
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
