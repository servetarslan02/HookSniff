'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface Trial {
  id: number;
  model_type: string;
  params: Record<string, number>;
  score: number;
  metric: string;
  created_at: string;
}

export function AutoMLTab() {
  const t = useTranslations('cortex.autoML');
  const { token } = useAuth();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!token || fetchedRef.current) return;
    fetchedRef.current = true;
    // Get automl trials - try all endpoints until we find trials
    apiFetch<{ stats: Array<{ endpoint_id: string }> }>('/cortex/stats', { token })
      .then(async (d) => {
        const endpoints = d?.stats || [];
        let allTrials: Trial[] = [];
        for (const ep of endpoints) {
          try {
            const trialData = await apiFetch<{ trials: Trial[] }>(`/cortex/automl/trials/${ep.endpoint_id}`, { token });
            if (trialData.trials?.length) { allTrials = trialData.trials; break; }
          } catch { /* skip */ }
        }
        setTrials(allTrials);
      })
      .catch(() => setTrials([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <span className="text-sm text-gray-500">{t('trialCount', {n: trials.length})}</span>
      </div>

      {trials.length === 0 ? (
        <div className="glass-card p-4 sm:p-6 md:p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('empty')}</p>
          <p className="text-xs text-gray-400 mt-2">POST /cortex/automl/run {'{ "endpoint_id": "...", "model_type": "adaptive_threshold" }'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trials.sort((a, b) => b.score - a.score).map((trial, i) => {
            // Translate model type
            const modelKey = `modelTypes.${trial.model_type}`;
            const modelName = t(modelKey) !== modelKey ? t(modelKey) : trial.model_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            // Translate metric
            const metricNames: Record<string, string> = { mae: t('metrics.mae') || 'Mean Absolute Error', mse: t('metrics.mse') || 'Mean Squared Error', rmse: t('metrics.rmse') || 'Root Mean Squared Error', r2: t('metrics.r2') || 'R² Score', accuracy: t('metrics.accuracy') || 'Accuracy' };
            const metricName = metricNames[trial.metric] || trial.metric;

            // Translate parameter names
            const paramNames: Record<string, string> = {
              max_depth: t('params.maxDepth') || 'Max Depth',
              n_estimators: t('params.nEstimators') || 'Number of Trees',
              learning_rate: t('params.learningRate') || 'Learning Rate',
              min_samples_split: t('params.minSamplesSplit') || 'Min Samples to Split',
              min_samples_leaf: t('params.minSamplesLeaf') || 'Min Samples per Leaf',
              max_features: t('params.maxFeatures') || 'Max Features',
              subsample: t('params.subsample') || 'Subsample Ratio',
              colsample_bytree: t('params.colsampleBytree') || 'Column Sample Ratio',
            };

            // Lower score = better for error metrics (MAE, MSE, RMSE)
            const isLowerBetter = ['mae', 'mse', 'rmse'].includes(trial.metric);
            const scoreDisplay = isLowerBetter ? trial.score.toFixed(2) : (trial.score * 100).toFixed(1) + '%';

            return (
              <div key={trial.id} className={`glass-card p-3 ${i === 0 ? 'border-l-4 border-emerald-500' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{modelName}</span>
                    {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{t('best')}</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{scoreDisplay}</span>
                    <span className="text-xs text-gray-500 ml-1">{metricName}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(trial.params).map(([k, v]) => (
                    <span key={k} className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                      <span className="text-gray-500 dark:text-slate-400">{paramNames[k] || k}:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-slate-300">{typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(3)) : v}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
