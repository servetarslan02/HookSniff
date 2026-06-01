'use client';

import { useState, useEffect } from 'react';
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
  const { token } = useAuth();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    // Get all automl trials across endpoints
    apiFetch<{ trials: Trial[] }>('/cortex/automl/trials/00000000-0000-0000-0000-000000000000', { token })
      .then(d => setTrials(d.trials ?? []))
      .catch(() => setTrials([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AutoML Optimizasyon Denemeleri</h2>
        <span className="text-sm text-gray-500">{trials.length} deneme</span>
      </div>

      {trials.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">Henüz AutoML denemesi yok. API'den optimizasyon başlatın.</p>
          <p className="text-xs text-gray-400 mt-2">POST /cortex/automl/run {`{ "endpoint_id": "...", "model_type": "adaptive_threshold" }`}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trials.sort((a, b) => b.score - a.score).map((t, i) => (
            <div key={t.id} className={`glass-card p-3 ${i === 0 ? 'border-l-4 border-emerald-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-700 dark:text-slate-300">{t.model_type}</span>
                  {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">En İyi</span>}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{t.score.toFixed(1)} {t.metric}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.entries(t.params).map(([k, v]) => (
                  <span key={k} className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {k}: {typeof v === 'number' ? v.toFixed(3) : v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
