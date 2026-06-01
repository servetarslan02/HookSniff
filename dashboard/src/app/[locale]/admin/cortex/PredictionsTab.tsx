'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Brain, Clock, Info } from '@/components/icons';

function describePrediction(probability: number, _factors: any): { title: string; detail: string; emoji: string; advice: string } {
  const pct = Math.round(probability * 100);
  if (pct >= 70) return { title: 'Yüksek ihtimalle sorun çıkacak', detail: `Cortex %${pct} olasılıkla bu endpoint'in başarısız olacağını tahmin ediyor`, emoji: '🔴', advice: 'Şimdi önlem alın: endpoint\'i kontrol edin veya yedek adrese geçin' };
  if (pct >= 40) return { title: 'Sorun çıkma ihtimali var', detail: `Cortex %${pct} olasılıkla bir sorun bekliyor`, emoji: '🟠', advice: 'Endpoint\'inizi kontrol etmeniz önerilir' };
  if (pct >= 20) return { title: 'Küçük bir risk var', detail: `Cortex %${pct} olasılıkla hafif bir performans düşüşü bekliyor`, emoji: '🟡', advice: 'Şimdilik endişe verici değil, izleniyor' };
  return { title: 'Düşük risk', detail: `Cortex %${pct} olasılıkla küçük bir dalgalanma bekliyor`, emoji: '🟢', advice: 'Her şey normal görünüyor' };
}

export function PredictionsTab({ token }: { token: string | null }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/predictions', { token })
      .then((d) => setPredictions(d.predictions || []))
      .catch((err) => { console.error('[PredictionsTab] fetch error:', err); setError(err?.message || 'Veri yüklenirken hata oluştu'); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Gelecek Tahminleri</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">Cortex geçmiş verileri analiz ederek gelecekteki olası sorunları tahmin eder.</p>
      </div>

      {predictions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Brain size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Henüz tahmin yok</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tahmin üretilmesi için en az birkaç saatlik veri gerekiyor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.slice(0, 20).map((p: any, i: number) => {
            const probability = p[4] || 0;
            const factors = p[5] || {};
            const ts = p[7];
            const info = describePrediction(probability, factors);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        probability >= 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        probability >= 0.4 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        probability >= 0.2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>%{Math.round(probability * 100)} ihtimal</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1"><Info size={12} /> {info.advice}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {ts && <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(ts).toLocaleString('tr-TR')}</p>}
                      {factors?.method && <p className="text-xs text-gray-400 dark:text-slate-500">{factors.method === 'ml_time_series' ? '🧠 Zaman serisi analizi' : factors.method === 'trend_fallback' ? '📊 Trend analizi' : factors.method}</p>}
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
