'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { useCachedFetch } from './useCortexCache';
import { RefreshCw, Target } from '@/components/icons';

interface ModelQuality {
  endpoint_id: string;
  model_type: string;
  total_predictions: number;
  avg_error_pct: number;
  accuracy_pct: number;
  error_stddev: number;
  quality_score: number;
}

function describeQuality(score: number, accuracy: number, avgError: number, t: any): { title: string; detail: string; severity: string; color: string } {
  if (score >= 80) return { title: t('quality.excellent'), detail: t('detail.excellent', {acc: Math.round(accuracy), err: avgError.toFixed(1)}), severity: 'excellent', color: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 60) return { title: t('quality.good'), detail: t('detail.good', {acc: Math.round(accuracy)}), severity: 'good', color: 'text-yellow-600 dark:text-yellow-400' };
  if (score >= 40) return { title: t('quality.low'), detail: t('detail.low', {acc: Math.round(accuracy)}), severity: 'low', color: 'text-orange-600 dark:text-orange-400' };
  return { title: t('quality.critical'), detail: t('detail.critical', {acc: Math.round(accuracy)}), severity: 'critical', color: 'text-red-600 dark:text-red-400' };
}

export function MLQualityTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.mlQuality');
  const tc = useTranslations('cortex.common');
  const { data, loading, error, refetch } = useCachedFetch<any>(
    'mlQuality',
    () => apiFetch<any>('/cortex/ml/quality', { token: token! }),
    [token]
  );
  const models = data?.models || [];
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!token || resetting) return;
    setResetting(true);
    try { await apiFetch<any>('/cortex/ml/quality/reset', { token, method: 'POST' }); refetch(); }
    catch (e) { console.error('Failed to reset ML models', e); }
    finally { setResetting(false); }
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  const overallScore = models.length > 0 ? Math.round(models.reduce((sum, m) => sum + m.quality_score, 0) / models.length) : 0;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('description')}</p>
          </div>
          {models.some(m => m.quality_score < 60) && (
            <button onClick={handleReset} disabled={resetting}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center gap-2">
              <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
              {t('resetButton')}
            </button>
          )}
        </div>
      </div>

      {models.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              overallScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' : overallScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className={`text-2xl font-bold ${overallScore >= 80 ? 'text-emerald-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{overallScore}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('overallScore')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('modelSummary', {total: models.length, healthy: models.filter(m => m.quality_score >= 60).length})}</p>
            </div>
          </div>
        </div>
      )}

      {models.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Target size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">{t('empty.info')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((m, i) => {
            const info = describeQuality(m.quality_score, m.accuracy_pct, m.avg_error_pct, t);
            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    info.severity === 'excellent' ? 'bg-green-500' :
                    info.severity === 'good' ? 'bg-yellow-500' :
                    info.severity === 'low' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.model_type.replace(/_/g, ' ')}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        m.quality_score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        m.quality_score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        m.quality_score >= 40 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>{tc('score')}: {Math.round(m.quality_score)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('metric.accuracy')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">%{Math.round(m.accuracy_pct)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('metric.avgError')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">%{m.avg_error_pct.toFixed(1)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400">{t('metric.predictionCount')}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.total_predictions}</p>
                      </div>
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
