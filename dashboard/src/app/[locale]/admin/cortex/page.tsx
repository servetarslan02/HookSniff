'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { Activity, AlertTriangle, BarChart3, Brain, CheckCircle2, ChevronDown, Clock, Cpu, Gauge, Globe, Heart, Layers, LineChart, RefreshCw, Settings, Shield, ShieldCheck, TrendingDown, TrendingUp, Zap, ArrowRight, Info, Target } from '@/components/icons';

type Tab = 'overview' | 'anomalies' | 'healing' | 'predictions' | 'ml_quality' | 'proactive';

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
    { id: 'ml_quality' as Tab, label: 'ML Kalite', icon: Target },
    { id: 'proactive' as Tab, label: 'Proaktif', icon: Shield },
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
      {activeTab === 'ml_quality' && <MLQualityTab token={token} />}
      {activeTab === 'proactive' && <ProactiveTab token={token} />}
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
      detail: `Cortex %${pct} olasılıkla bu endpoint'in başarısız olacağını tahmin ediyor`,
      emoji: '🔴',
      advice: 'Şimdi önlem alın: endpoint\'i kontrol edin veya yedek adrese geçin',
    };
  }
  if (pct >= 40) {
    return {
      title: 'Sorun çıkma ihtimali var',
      detail: `Cortex %${pct} olasılıkla bir sorun bekliyor`,
      emoji: '🟠',
      advice: 'Endpoint\'inizi kontrol etmeniz önerilir',
    };
  }
  if (pct >= 20) {
    return {
      title: 'Küçük bir risk var',
      detail: `Cortex %${pct} olasılıkla hafif bir performans düşüşü bekliyor`,
      emoji: '🟡',
      advice: 'Şimdilik endişe verici değil, izleniyor',
    };
  }
  return {
    title: 'Düşük risk',
    detail: `Cortex %${pct} olasılıkla küçük bir dalgalanma bekliyor`,
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
        <p className="text-sm text-gray-500 dark:text-slate-400">
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

// ─── ML Kalite (ML Quality) ────────────────────────────────

interface ModelQuality {
  endpoint_id: string;
  model_type: string;
  total_predictions: number;
  avg_error_pct: number;
  accuracy_pct: number;
  error_stddev: number;
  quality_score: number;
}

function describeQuality(score: number, accuracy: number, avgError: number): { title: string; detail: string; emoji: string; color: string } {
  if (score >= 80) {
    return {
      title: 'Mükemmel kalite',
      detail: `Tahminler %${Math.round(accuracy)} doğrulukla çalışıyor, ortalama hata %${avgError.toFixed(1)}`,
      emoji: '🟢',
      color: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  if (score >= 60) {
    return {
      title: 'İyi kalite',
      detail: `Tahminler %${Math.round(accuracy)} doğrulukla çalışıyor, bazı iyileştirmeler yapılabilir`,
      emoji: '🟡',
      color: 'text-yellow-600 dark:text-yellow-400',
    };
  }
  if (score >= 40) {
    return {
      title: 'Düşük kalite',
      detail: `Tahminler %${Math.round(accuracy)} doğrulukla çalışıyor — model sıfırlanabilir`,
      emoji: '🟠',
      color: 'text-orange-600 dark:text-orange-400',
    };
  }
  return {
    title: 'Kritik kalite',
    detail: `Tahminler güvenilir değil — %${Math.round(accuracy)} doğruluk. Model sıfırlanmalı`,
    emoji: '🔴',
    color: 'text-red-600 dark:text-red-400',
  };
}

function MLQualityTab({ token }: { token: string | null }) {
  const [models, setModels] = useState<ModelQuality[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchQuality = () => {
    if (!token) return;
    apiFetch<any>('/cortex/ml/quality', { token })
      .then((d) => setModels(d.models || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuality(); }, [token]);

  const handleReset = async () => {
    if (!token || resetting) return;
    setResetting(true);
    try {
      await apiFetch<any>('/cortex/ml/quality/reset', { token, method: 'POST' });
      fetchQuality();
    } catch (e) {
      console.error('Failed to reset ML models', e);
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  const overallScore = models.length > 0
    ? Math.round(models.reduce((sum, m) => sum + m.quality_score, 0) / models.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">ML Model Kalitesi</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Cortex'in tahmin modellerinin doğruluğu. Modeller ne kadar doğru tahmin yapıyorsa, uyarılar o kadar güvenilir.
            </p>
          </div>
          {models.some(m => m.quality_score < 60) && (
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center gap-2"
            >
              <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
              Düşük Kaliteli Modelleri Sıfırla
            </button>
          )}
        </div>
      </div>

      {models.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              overallScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              overallScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className={`text-2xl font-bold ${
                overallScore >= 80 ? 'text-emerald-600' :
                overallScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>{overallScore}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Genel Kalite Skoru</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {models.length} model izleniyor — {models.filter(m => m.quality_score >= 60).length} sağlıklı
              </p>
            </div>
          </div>
        </div>
      )}

      {models.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Target size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Henüz model verisi yok</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            ML modellerinin kalite takibi için yeterli tahmin verisi gerekiyor. Birkaç saat sonra veri görünmeye başlayacak.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((m, i) => {
            const info = describeQuality(m.quality_score, m.accuracy_pct, m.avg_error_pct);
            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {m.model_type.replace(/_/g, ' ')}
                      </p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        m.quality_score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        m.quality_score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        m.quality_score >= 40 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        Skor: {Math.round(m.quality_score)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Doğruluk</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">%{Math.round(m.accuracy_pct)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Ort. Hata</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">%{m.avg_error_pct.toFixed(1)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Tahmin Sayısı</p>
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

// ─── Proaktif Korumа (Proactive Healing) ───────────────────

interface ProactiveInsight {
  id: number;
  customer_id: string;
  insight_type: string;
  title: string;
  severity: string;
  data: any;
  created_at: string;
}

function describeProactiveInsight(insight: ProactiveInsight): { title: string; detail: string; emoji: string; advice: string } {
  const type = insight.insight_type;
  const severity = insight.severity;
  const data = insight.data || {};

  const base = {
    title: insight.title || type.replace(/_/g, ' '),
    detail: data.description || data.detail || '',
    emoji: severity === 'critical' ? '🔴' : severity === 'warning' ? '🟠' : severity === 'info' ? '🟡' : '🟢',
    advice: data.advice || data.recommendation || '',
  };

  if (type === 'proactive_latency_trend') {
    return { ...base, detail: `Gecikme artıyor: ${data.trend || 'yükseliş trendi'}`, advice: base.advice || 'Endpoint\'i kontrol edin, sunucu yavaşlıyor olabilir' };
  }
  if (type === 'proactive_rate_limit_risk') {
    return { ...base, detail: `Hız sınırı riski: ${data.usage_pct || '?'}% kullanım`, advice: base.advice || 'Rate limit\'i artırmayı veya istekleri azaltmayı düşünün' };
  }
  if (type === 'proactive_stress_detection') {
    return { ...base, detail: `Sunucu stresi tespit edildi: ${data.metric || 'genel'}`, advice: base.advice || 'Sunucu kaynaklarını kontrol edin' };
  }
  if (type === 'proactive_cascade_risk') {
    return { ...base, detail: `${data.affected_endpoints || '?'} endpoint etkilenebilir`, advice: base.advice || 'Ana endpoint\'i onarın, diğerleri de etkilenebilir' };
  }

  return base;
}

function ProactiveTab({ token }: { token: string | null }) {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/proactive/status', { token })
      .then((d) => setInsights(d.proactive_insights || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Proaktif Korumа</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Cortex sorun çıkmadan önce uyarı verir. Gecikme artışı, sunucu stresi veya toplu kesinti riski tespit edilse burada gösterilir.
        </p>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Aktif Uyarı</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Kritik</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{warningCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Uyarı</p>
          </div>
        </div>
      )}

      {insights.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Shield size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Proaktif uyarı yok</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Cortex her şeyin normal olduğunu tespit etti. Sorun çıkma riski düşük.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const info = describeProactiveInsight(insight);
            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        insight.severity === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        insight.severity === 'info' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {insight.severity === 'critical' ? 'Kritik' : insight.severity === 'warning' ? 'Uyarı' : insight.severity === 'info' ? 'Bilgi' : 'Normal'}
                      </span>
                    </div>
                    {info.detail && <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>}
                    {info.advice && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <Info size={12} />
                          {info.advice}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(insight.created_at).toLocaleString('tr-TR')}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">
                        {insight.insight_type.replace(/_/g, ' ')}
                      </p>
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
