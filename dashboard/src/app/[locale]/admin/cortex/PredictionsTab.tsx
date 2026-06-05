'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { useCachedFetch } from './useCortexCache';
import { Brain, Clock, Info, ExternalLink } from '@/components/icons';
import { PrefetchLink } from '@/components/PrefetchLink';

function describePrediction(probability: number, factors: any, t: any): { title: string; detail: string; severity: string; advice: string } {
  const pct = Math.round(probability * 100);
  const currentSr = factors?.current_sr ? Math.round(factors.current_sr * 100) : null;
  const trendSlope = factors?.trend_slope;
  const method = factors?.method;
  const hours = factors?.hours_analyzed;

  // Build meaningful detail
  let detail = t('detail.minimal', {v: pct});
  if (pct >= 70) detail = t('detail.high', {v: pct});
  else if (pct >= 40) detail = t('detail.medium', {v: pct});
  else if (pct >= 20) detail = t('detail.low', {v: pct});

  // Add context from factors
  const contextParts = [];
  if (currentSr !== null) contextParts.push(`Success rate: ${currentSr}%`);
  if (trendSlope !== null && trendSlope !== undefined) {
    contextParts.push(trendSlope < 0 ? '📉 Declining trend' : '📈 Improving trend');
  }
  if (hours) contextParts.push(`${hours}h analyzed`);
  if (method) contextParts.push(`Method: ${method}`);

  if (contextParts.length > 0) detail += ` (${contextParts.join(' · ')})`;

  if (pct >= 70) return { title: t('severity.high'), detail, severity: 'high', advice: t('advice.high') };
  if (pct >= 40) return { title: t('severity.medium'), detail, severity: 'medium', advice: t('advice.medium') };
  if (pct >= 20) return { title: t('severity.low'), detail, severity: 'low', advice: t('advice.low') };
  return { title: t('severity.minimal'), detail, severity: 'minimal', advice: t('advice.minimal') };
}

export function PredictionsTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.predictions');
  const tc = useTranslations('cortex.common');
  const { data, loading, error } = useCachedFetch<any>(
    'predictions',
    () => apiFetch<any>('/cortex/predictions', { token: token! }),
    [token]
  );
  const predictions = data?.predictions || [];

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('description')}</p>
      </div>

      {predictions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Brain size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.slice(0, 20).map((p: any, i: number) => {
            const endpointId = p[1] || '';
            const probability = p[4] || 0;
            const factors = p[5] || {};
            const ts = p[7];
            const info = describePrediction(probability, factors, t);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    info.severity === 'high' ? 'bg-red-500' :
                    info.severity === 'medium' ? 'bg-orange-500' :
                    info.severity === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        probability >= 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        probability >= 0.4 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        probability >= 0.2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>{t('probability', {v: Math.round(probability * 100)})}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    {endpointId && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <ExternalLink size={11} />
                        <PrefetchLink href={`/endpoints/${endpointId}`} className="hover:underline">
                          {t('endpointLink') || 'View endpoint'}: {endpointId.substring(0, 8)}...
                        </PrefetchLink>
                      </p>
                    )}
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1"><Info size={12} /> {info.advice}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {ts && <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(ts).toLocaleString()}</p>}
                      {factors?.method && <p className="text-xs text-gray-400 dark:text-slate-500">{factors.method === 'ml_time_series' ? t('method.timeSeries') : factors.method === 'trend_fallback' ? t('method.trend') : factors.method}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
