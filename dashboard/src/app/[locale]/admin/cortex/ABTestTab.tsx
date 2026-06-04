'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface AbTest {
  id: number;
  endpoint_id: string;
  model_type: string;
  variant_a: string;
  variant_b: string;
  split_ratio: number;
  status: string;
  winner: string | null;
  created_at: string;
}

export function ABTestTab() {
  const t = useTranslations('cortex.abTest');
  const tc = useTranslations('cortex.common');
  const { token } = useAuth();
  const [tests, setTests] = useState<AbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ ab_tests: AbTest[] }>('/cortex/ab-tests', { token })
      .then(d => setTests(d.ab_tests ?? []))
      .catch((err) => { console.error('[ABTestTab] fetch error:', err); setError(err?.message || tc('dataLoadError')); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <span className="text-sm text-gray-500">{t('testCount', {n: tests.length})}</span>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(abtest => (
            <div key={abtest.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{abtest.model_type}</span>
                  <span className="ml-2 text-xs text-gray-500">{t('endpoint')} {abtest.endpoint_id.slice(0, 8)}...</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${abtest.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t(`statusLabels.${abtest.status}`) !== `statusLabels.${abtest.status}` ? t(`statusLabels.${abtest.status}`) : abtest.status}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <div className="flex-1 p-2 rounded bg-gray-50 dark:bg-slate-800 text-center">
                  <div className="font-medium">A: {abtest.variant_a}</div>
                  <div className="text-xs text-gray-500">{(abtest.split_ratio * 100).toFixed(0)}% {t('traffic')}</div>
                </div>
                <div className="flex items-center text-gray-400">vs</div>
                <div className="flex-1 p-2 rounded bg-gray-50 dark:bg-slate-800 text-center">
                  <div className="font-medium">B: {abtest.variant_b}</div>
                  <div className="text-xs text-gray-500">{((1 - abtest.split_ratio) * 100).toFixed(0)}% {t('traffic')}</div>
                </div>
              </div>
              {abtest.winner && (
 <div className="mt-2 text-sm text-emerald-600 font-medium"> {t('winner', {v: abtest.winner})}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
