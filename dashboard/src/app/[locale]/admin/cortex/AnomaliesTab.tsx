'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, Clock } from '@/components/icons';

function describeAnomaly(score: number, factors: any, t: any): { title: string; detail: string; severity: string } {
  const sr = factors?.sr || factors?.success_rate;
  const latency = factors?.latency || factors?.latency_ms;

  if (score >= 80) {
    return { title: t('severity.critical'), detail: sr ? t('detail.srDropped', {v: Math.round(sr)}) : t('detail.performanceDropped'), severity: 'critical' };
  }
  if (score >= 60) {
    return { title: t('severity.major'), detail: latency ? t('detail.latencyIncreased', {v: Math.round(latency)}) : t('detail.errorRateHigh'), severity: 'major' };
  }
  if (score >= 40) {
    return { title: t('severity.minor'), detail: t('detail.shouldMonitor'), severity: 'minor' };
  }
  return { title: t('severity.normal'), detail: t('detail.noConcern'), severity: 'normal' };
}

export function AnomaliesTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.anomalies');
  const tc = useTranslations('cortex.common');
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/anomalies', { token })
      .then((d) => setAnomalies(d.anomalies || []))
      .catch((err) => { console.error('[AnomaliesTab] fetch error:', err); setError(err?.message || tc('dataLoadError')); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('description')}
        </p>
      </div>

      {anomalies.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.slice(0, 20).map((a: any, i: number) => {
            const score = a[3] || 0;
            const factors = a[4] || {};
            const ts = a[6];
            const info = describeAnomaly(score, factors, t);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    info.severity === 'critical' ? 'bg-red-500' :
                    info.severity === 'major' ? 'bg-orange-500' :
                    info.severity === 'minor' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        score >= 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        score >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        score >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {tc('score')}: {score}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {ts && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ts).toLocaleString()}
                        </p>
                      )}
                      {factors?.method && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {factors.method === 'ml' ? t('detectedBy.ml') : t('detectedBy.formula')}
                        </p>
                      )}
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
