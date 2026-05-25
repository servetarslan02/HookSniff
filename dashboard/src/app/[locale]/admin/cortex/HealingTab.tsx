'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Clock, ShieldCheck } from '@/components/icons';

function describeHealingAction(actionType: string, reason: string, outcome: string): { title: string; detail: string; emoji: string; actionEmoji: string } {
  const isRecovered = outcome === 'recovered';
  const actions: Record<string, { title: string; detail: string; emoji: string }> = {
    'auto_disable': { title: isRecovered ? 'Endpoint geri açıldı' : 'Endpoint geçici olarak kapatıldı', detail: isRecovered ? 'Endpoint tekrar sağlıklı, otomatik açıldı' : 'Çok fazla hata olduğu için geçici olarak devre dışı bırakıldı', emoji: isRecovered ? '✅' : '🚫' },
    'circuit_tighten': { title: 'Güvenlik duvarı sıkılaştırıldı', detail: 'Hata oranı yüksek olduğu için koruma hassasiyeti artırıldı', emoji: '🛡️' },
    'retry_slowdown': { title: 'Tekrar deneme yavaşlatıldı', detail: 'Sunucu zorlanıyor, denemeler arası süre artırıldı', emoji: '⏳' },
    'rate_limit_reduce': { title: 'Hız sınırı düşürüldü', detail: 'Sunucuyu korumak için istek sayısı azaltıldı', emoji: '🚦' },
    'fallback_url_switch': { title: 'Yedek adrese geçildi', detail: 'Ana adreste sorun var, yedek adrese yönlendirildi', emoji: '🔀' },
    'retry_increase': { title: 'Tekrar deneme sayısı artırıldı', detail: 'Başarısız iletimler için daha fazla deneme yapılacak', emoji: '🔄' },
    'timeout_adjust': { title: 'Zaman aşımı artırıldı', detail: 'Sunucu yavaş yanıt veriyor, bekleme süresi uzatıldı', emoji: '⏰' },
    'proactive_throttle': { title: 'Önleyici yavaşlatma uygulandı', detail: 'Gecikme artıyor, sorun olmadan önlem alındı', emoji: '🔮' },
    'cascade_alert': { title: 'Toplu sorun uyarısı', detail: 'Birden fazla endpoint aynı anda etkilendi', emoji: '🌊' },
  };
  const info = actions[actionType] || { title: actionType.replace(/_/g, ' '), detail: reason || 'Bilinmeyen aksiyon', emoji: '⚙️' };
  return { ...info, actionEmoji: isRecovered ? '✅' : '⚡' };
}

export function HealingTab({ token }: { token: string | null }) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/healing/actions', { token })
      .then((d) => setActions(d.actions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Otomatik Düzeltmeler</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">Cortex sorun tespit ettiğinde otomatik müdahale eder. Tüm düzeltmeler burada listelenir.</p>
      </div>

      {actions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Düzeltme yapılmadı</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Tüm endpoint'ler sağlıklı, müdahale gerekmedi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.slice(0, 20).map((a: any, i: number) => {
            const actionType = a[2] || '';
            const reason = a[3] || '';
            const outcome = a[5] || 'pending';
            const ts = a[7];
            const info = describeHealingAction(actionType, reason, outcome);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        outcome === 'recovered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        outcome === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {outcome === 'recovered' ? 'Çözüldü' : outcome === 'pending' ? 'Devam ediyor' : outcome}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {ts && <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(ts).toLocaleString('tr-TR')}</p>}
                      {reason && <p className="text-xs text-gray-400 dark:text-slate-500">Sebep: {reason}</p>}
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
