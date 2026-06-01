'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, Clock } from '@/components/icons';

function describeAnomaly(score: number, factors: any): { title: string; detail: string; emoji: string } {
  const sr = factors?.sr || factors?.success_rate;
  const latency = factors?.latency || factors?.latency_ms;

  if (score >= 80) {
    return { title: 'Kritik sorun — endpoint ciddi şekilde etkilenmiş', detail: sr ? `Başarı oranı %${Math.round(sr)}'ye düştü` : 'Performans ciddi şekilde düştü', emoji: '🔴' };
  }
  if (score >= 60) {
    return { title: 'Büyük sorun — endpoint yavaşlıyor', detail: latency ? `Gecikme ${Math.round(latency)}ms'ye çıktı` : 'Hata oranı normalden yüksek', emoji: '🟠' };
  }
  if (score >= 40) {
    return { title: 'Küçük sorun — performans hafif düştü', detail: 'Şiddetli değil ama izlenmeli', emoji: '🟡' };
  }
  return { title: 'Normal — küçük dalgalanma', detail: 'Endişe verici değil', emoji: '🟢' };
}

export function AnomaliesTab({ token }: { token: string | null }) {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/anomalies', { token })
      .then((d) => setAnomalies(d.anomalies || []))
      .catch((err) => { console.error('[AnomaliesTab] fetch error:', err); setError(err?.message || 'Veri yüklenirken hata oluştu'); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Tespit Edilen Sorunlar</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Cortex her 5 dakikada bir endpoint'lerinizi kontrol eder. Ani hata artışı, yavaşlama veya kesinti tespit ederse burada gösterir.
        </p>
      </div>

      {anomalies.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Hiç sorun yok</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tüm endpoint'ler normal çalışıyor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.slice(0, 20).map((a: any, i: number) => {
            const score = a[3] || 0;
            const factors = a[4] || {};
            const ts = a[6];
            const info = describeAnomaly(score, factors);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        score >= 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        score >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        score >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        Skor: {score}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {ts && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ts).toLocaleString('tr-TR')}
                        </p>
                      )}
                      {factors?.method && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {factors.method === 'ml' ? '🧠 ML ile tespit edildi' : '📊 Formül ile tespit edildi'}
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
