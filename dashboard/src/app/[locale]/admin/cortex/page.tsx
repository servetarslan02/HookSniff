'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { Activity, AlertTriangle, BarChart3, Brain, CheckCircle2, ChevronDown, Clock, Cpu, Gauge, Globe, Heart, Layers, LineChart, RefreshCw, Settings, Shield, ShieldCheck, TrendingDown, TrendingUp, Zap, ArrowRight, Info } from '@/components/icons';

type Tab = 'overview' | 'anomalies' | 'healing' | 'predictions';

interface CortexHealth {
  status: string;
  metrics: {
    hourly_stats_total: number;
    profiles_total: number;
    anomalies_24h: number;
    healing_actions_24h: number;
    action_memory_total: number;
    predictions_24h: number;
    active_insights: number;
  };
}

export default function CortexPage() {
  const t = useTranslations('cortex');
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [health, setHealth] = useState<CortexHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    if (!token) return;
    try {
      const data = await apiFetch<CortexHealth>('/cortex/health', { token });
      setHealth(data);
    } catch (e) {
      console.error('Failed to fetch cortex health', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchHealth(); }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Genel Bakış', icon: BarChart3 },
    { id: 'anomalies' as Tab, label: 'Sorunlar', icon: AlertTriangle },
    { id: 'healing' as Tab, label: 'Düzeltmeler', icon: ShieldCheck },
    { id: 'predictions' as Tab, label: 'Tahminler', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="text-brand-600" size={28} />
            Cortex — Akıllı Koruma
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Webhook'larınızı izler, sorunları tespit eder ve otomatik düzeltir</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {/* Status Banner */}
      {health && (
        <div className={`glass-card p-4 flex items-center gap-3 ${
          health.status === 'healthy' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-yellow-500'
        }`}>
          <div className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {health.status === 'healthy'
              ? `Her şey yolunda — ${health.metrics?.active_insights ?? 0} aktif öneri mevcut`
              : `Dikkat — ${health.metrics?.anomalies_24h ?? 0} sorun tespit edildi`
            }
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab health={health} token={token} />}
      {activeTab === 'anomalies' && <AnomaliesTab token={token} />}
      {activeTab === 'healing' && <HealingTab token={token} />}
      {activeTab === 'predictions' && <PredictionsTab token={token} />}
    </div>
  );
}

// ─── Genel Bakış ───────────────────────────────────────────

function OverviewTab({ health, token }: { health: CortexHealth | null; token: string | null }) {
  if (!health?.metrics) {
    return (
      <div className="glass-card p-8 text-center">
        <Brain size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
        <p className="text-gray-500 dark:text-slate-400">Henüz veri toplanıyor. Cortex'in başlaması için birkaç dakika bekleyin.</p>
      </div>
    );
  }
  const m = health.metrics;

  // Derive simple status messages from metrics
  const systemHealth = m.anomalies_24h === 0 && m.healing_actions_24h === 0
    ? { icon: '✅', text: 'Tüm endpoint\'ler sağlıklı', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    : m.anomalies_24h > 10
    ? { icon: '🚨', text: `${m.anomalies_24h} sorun tespit edildi — müdahale gerekebilir`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
    : { icon: '⚠️', text: `${m.anomalies_24h} küçük sorun tespit edildi, ${m.healing_actions_24h} düzeltme yapıldı`, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };

  const cards = [
    {
      label: 'İzlenen Endpoint',
      value: m.profiles_total,
      icon: Globe,
      color: 'text-blue-600',
      description: 'Aktif webhook adresleriniz',
    },
    {
      label: 'Sorun (Son 24 Saat)',
      value: m.anomalies_24h,
      icon: AlertTriangle,
      color: m.anomalies_24h > 0 ? 'text-orange-600' : 'text-emerald-600',
      description: m.anomalies_24h === 0 ? 'Hiç sorun yok' : 'Performans düşüşü veya hata artışı',
    },
    {
      label: 'Otomatik Düzeltme',
      value: m.healing_actions_24h,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      description: 'Cortex\'in otomatik yaptığı müdahaleler',
    },
    {
      label: 'Tahmin',
      value: m.predictions_24h,
      icon: TrendingUp,
      color: 'text-cyan-600',
      description: 'Olası gelecek sorunlar hakkında uyarı',
    },
    {
      label: 'Aktif Öneri',
      value: m.active_insights,
      icon: Zap,
      color: 'text-yellow-600',
      description: 'İncelemeniz gereken öneriler',
    },
    {
      label: 'Veri Noktası',
      value: m.hourly_stats_total,
      icon: BarChart3,
      color: 'text-purple-600',
      description: 'Toplanan saatlik istatistik',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Health Summary */}
      <div className={`glass-card p-4 flex items-center gap-3 ${systemHealth.bg}`}>
        <span className="text-2xl">{systemHealth.icon}</span>
        <div>
          <p className={`font-semibold ${systemHealth.color}`}>{systemHealth.text}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Son 24 saatte {m.hourly_stats_total} veri noktası toplandı, {m.profiles_total} endpoint izleniyor
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass-card p-5 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-slate-800`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{card.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{card.description}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sorunlar (Anomalies) ──────────────────────────────────

function describeAnomaly(score: number, factors: any, category: string): { title: string; detail: string; emoji: string } {
  const method = factors?.method || 'unknown';
  const sr = factors?.sr || factors?.success_rate;
  const latency = factors?.latency || factors?.latency_ms;

  if (score >= 80) {
    return {
      title: 'Kritik sorun — endpoint ciddi şekilde etkilenmiş',
      detail: sr ? `Başarı oranı %${Math.round(sr)}'ye düştü` : 'Performans ciddi şekilde düştü',
      emoji: '🔴',
    };
  }
  if (score >= 60) {
    return {
      title: 'Büyük sorun — endpoint yavaşlıyor',
      detail: latency ? `Gecikme ${Math.round(latency)}ms'ye çıktı` : 'Hata oranı normalden yüksek',
      emoji: '🟠',
    };
  }
  if (score >= 40) {
    return {
      title: 'Küçük sorun — performans hafif düştü',
      detail: 'Şiddetli değil ama izlenmeli',
      emoji: '🟡',
    };
  }
  return {
    title: 'Normal — küçük dalgalanma',
    detail: 'Endişe verici değil',
    emoji: '🟢',
  };
}

function AnomaliesTab({ token }: { token: string | null }) {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/anomalies', { token })
      .then((d) => setAnomalies(d.anomalies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* Summary */}
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
            const category = a[5] || 'low';
            const ts = a[6];
            const info = describeAnomaly(score, factors, category);

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

// ─── Düzeltmeler (Healing) ─────────────────────────────────

function describeHealingAction(actionType: string, reason: string, outcome: string): { title: string; detail: string; emoji: string; actionEmoji: string } {
  const isRecovered = outcome === 'recovered';

  const actions: Record<string, { title: string; detail: string; emoji: string }> = {
    'auto_disable': {
      title: isRecovered ? 'Endpoint geri açıldı' : 'Endpoint geçici olarak kapatıldı',
      detail: isRecovered ? 'Endpoint tekrar sağlıklı, otomatik açıldı' : 'Çok fazla hata olduğu için geçici olarak devre dışı bırakıldı',
      emoji: isRecovered ? '✅' : '🚫',
    },
    'circuit_tighten': {
      title: 'Güvenlik duvarı sıkılaştırıldı',
      detail: 'Hata oranı yüksek olduğu için koruma hassasiyeti artırıldı',
      emoji: '🛡️',
    },
    'retry_slowdown': {
      title: 'Tekrar deneme yavaşlatıldı',
      detail: 'Sunucu zorlanıyor, denemeler arası süre artırıldı',
      emoji: '⏳',
    },
    'rate_limit_reduce': {
      title: 'Hız sınırı düşürüldü',
      detail: 'Sunucuyu korumak için istek sayısı azaltıldı',
      emoji: '🚦',
    },
    'fallback_url_switch': {
      title: 'Yedek adrese geçildi',
      detail: 'Ana adreste sorun var, yedek adrese yönlendirildi',
      emoji: '🔀',
    },
    'retry_increase': {
      title: 'Tekrar deneme sayısı artırıldı',
      detail: 'Başarısız iletimler için daha fazla deneme yapılacak',
      emoji: '🔄',
    },
    'timeout_adjust': {
      title: 'Zaman aşımı artırıldı',
      detail: 'Sunucu yavaş yanıt veriyor, bekleme süresi uzatıldı',
      emoji: '⏰',
    },
    'proactive_throttle': {
      title: 'Önleyici yavaşlatma uygulandı',
      detail: 'Gecikme artıyor, sorun olmadan önlem alındı',
      emoji: '🔮',
    },
    'cascade_alert': {
      title: 'Toplu sorun uyarısı',
      detail: 'Birden fazla endpoint aynı anda etkilendi',
      emoji: '🌊',
    },
  };

  const info = actions[actionType] || {
    title: actionType.replace(/_/g, ' '),
    detail: reason || 'Bilinmeyen aksiyon',
    emoji: '⚙️',
  };

  return { ...info, actionEmoji: isRecovered ? '✅' : '⚡' };
}

function HealingTab({ token }: { token: string | null }) {
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
      {/* Summary */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Otomatik Düzeltmeler</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Cortex sorun tespit ettiğinde otomatik müdahale eder. Tüm düzeltmeler burada listelenir.
        </p>
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
                      {ts && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ts).toLocaleString('tr-TR')}
                        </p>
                      )}
                      {reason && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          Sebep: {reason}
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

// ─── Tahminler (Predictions) ───────────────────────────────

function describePrediction(probability: number, factors: any): { title: string; detail: string; emoji: string; advice: string } {
  const pct = Math.round(probability * 100);
  const method = factors?.method || 'unknown';

  if (pct >= 70) {
    return {
      title: 'Yüksek ihtimalle sorun çıkacak',
      detail: `Cortex %{pct} olasılıkla bu endpoint'in başarısız olacağını tahmin ediyor`,
      emoji: '🔴',
      advice: 'Şimdi önlem alın: endpoint\'i kontrol edin veya yedek adrese geçin',
    };
  }
  if (pct >= 40) {
    return {
      title: 'Sorun çıkma ihtimali var',
      detail: `Cortex %{pct} olasılıkla bir sorun bekliyor`,
      emoji: '🟠',
      advice: 'Endpoint\'inizi kontrol etmeniz önerilir',
    };
  }
  if (pct >= 20) {
    return {
      title: 'Küçük bir risk var',
      detail: `Cortex %{pct} olasılıkla hafif bir performans düşüşü bekliyor`,
      emoji: '🟡',
      advice: 'Şimdilik endişe verici değil, izleniyor',
    };
  }
  return {
    title: 'Düşük risk',
    detail: `Cortex %{pct} olasılıkla küçük bir dalgalanma bekliyor`,
    emoji: '🟢',
    advice: 'Her şey normal görünüyor',
  };
}

function PredictionsTab({ token }: { token: string | null }) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/predictions', { token })
      .then((d) => setPredictions(d.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Gelecek Tahminleri</h3>
        <p className="text-sm text-gray-500 dark:sentence-400">
          Cortex geçmiş verileri analiz ederek gelecekteki olası sorunları tahmin eder. Ne kadar çok veri toplanırsa tahminler o kadar doğru olur.
        </p>
      </div>

      {predictions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Brain size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Henüz tahmin yok</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Tahmin üretilmesi için en az birkaç saatlik veri gerekiyor. Cortex veri topladıkça tahminler burada görünecek.
          </p>
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
                      }`}>
                        %{Math.round(probability * 100)} ihtimal
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Info size={12} />
                        {info.advice}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {ts && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ts).toLocaleString('tr-TR')}
                        </p>
                      )}
                      {factors?.method && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {factors.method === 'ml_time_series' ? '🧠 Zaman serisi analizi' :
                           factors.method === 'trend_fallback' ? '📊 Trend analizi' :
                           factors.method}
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
