'use client';

import { useState, useEffect, Activity } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { AlertTriangle, BarChart3, Brain, Globe, RefreshCw, Shield, ShieldCheck, TrendingUp, Zap, Target } from '@/components/icons';
import { Tab, CortexHealth } from './types';
import { AnomaliesTab } from './AnomaliesTab';
import { HealingTab } from './HealingTab';
import { PredictionsTab } from './PredictionsTab';
import { MLQualityTab } from './MLQualityTab';
import { ProactiveTab } from './ProactiveTab';
import { DriftTab } from './DriftTab';
import { ModelMonitorTab } from './ModelMonitorTab';
import { ABTestTab } from './ABTestTab';
import { AutoMLTab } from './AutoMLTab';

export default function CortexPage() {
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
    { id: 'drift' as Tab, label: 'Drift', icon: TrendingUp },
    { id: 'monitor' as Tab, label: 'Model İzleme', icon: Zap },
    { id: 'ab_tests' as Tab, label: 'A/B Tests', icon: Globe },
    { id: 'automl' as Tab, label: 'AutoML', icon: Brain },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="text-brand-600" size={28} />
            Cortex — Akıllı Koruma
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Webhook'larınızı izler, sorunları tespit eder ve otomatik düzeltir</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-2">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {health && (
        <div className={`glass-card p-4 flex items-center gap-3 ${health.status === 'healthy' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-yellow-500'}`}>
          <div className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {health.status === 'healthy'
              ? `Her şey yolunda — ${health.metrics?.active_insights ?? 0} aktif öneri mevcut`
              : `Dikkat — ${health.metrics?.anomalies_24h ?? 0} sorun tespit edildi`}
          </span>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <Activity mode={activeTab === 'overview' ? 'visible' : 'hidden'}><OverviewTab health={health} /></Activity>
      <Activity mode={activeTab === 'anomalies' ? 'visible' : 'hidden'}><AnomaliesTab token={token} /></Activity>
      <Activity mode={activeTab === 'healing' ? 'visible' : 'hidden'}><HealingTab token={token} /></Activity>
      <Activity mode={activeTab === 'predictions' ? 'visible' : 'hidden'}><PredictionsTab token={token} /></Activity>
      <Activity mode={activeTab === 'ml_quality' ? 'visible' : 'hidden'}><MLQualityTab token={token} /></Activity>
      <Activity mode={activeTab === 'proactive' ? 'visible' : 'hidden'}><ProactiveTab token={token} /></Activity>
      <Activity mode={activeTab === 'drift' ? 'visible' : 'hidden'}><DriftTab /></Activity>
      <Activity mode={activeTab === 'monitor' ? 'visible' : 'hidden'}><ModelMonitorTab /></Activity>
      <Activity mode={activeTab === 'ab_tests' ? 'visible' : 'hidden'}><ABTestTab /></Activity>
      <Activity mode={activeTab === 'automl' ? 'visible' : 'hidden'}><AutoMLTab /></Activity>
    </div>
  );
}

function OverviewTab({ health }: { health: CortexHealth | null }) {
  if (!health?.metrics) {
    return (
      <div className="glass-card p-8 text-center">
        <Brain size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
        <p className="text-gray-500 dark:text-slate-400">Henüz veri toplanıyor. Cortex'in başlaması için birkaç dakika bekleyin.</p>
      </div>
    );
  }
  const m = health.metrics;

  const systemHealth = m.anomalies_24h === 0 && m.healing_actions_24h === 0
    ? { icon: '✅', text: 'Tüm endpoint\'ler sağlıklı', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    : m.anomalies_24h > 10
    ? { icon: '🚨', text: `${m.anomalies_24h} sorun tespit edildi — müdahale gerekebilir`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
    : { icon: '⚠️', text: `${m.anomalies_24h} küçük sorun tespit edildi, ${m.healing_actions_24h} düzeltme yapıldı`, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };

  const cards = [
    { label: 'İzlenen Endpoint', value: m.profiles_total, icon: Globe, color: 'text-blue-600', description: 'Aktif webhook adresleriniz' },
    { label: 'Sorun (Son 24 Saat)', value: m.anomalies_24h, icon: AlertTriangle, color: m.anomalies_24h > 0 ? 'text-orange-600' : 'text-emerald-600', description: m.anomalies_24h === 0 ? 'Hiç sorun yok' : 'Performans düşüşü veya hata artışı' },
    { label: 'Otomatik Düzeltme', value: m.healing_actions_24h, icon: ShieldCheck, color: 'text-emerald-600', description: 'Cortex\'in otomatik yaptığı müdahaleler' },
    { label: 'Tahmin', value: m.predictions_24h, icon: TrendingUp, color: 'text-cyan-600', description: 'Olası gelecek sorunlar hakkında uyarı' },
    { label: 'Aktif Öneri', value: m.active_insights, icon: Zap, color: 'text-yellow-600', description: 'İncelemeniz gereken öneriler' },
    { label: 'Veri Noktası', value: m.hourly_stats_total, icon: BarChart3, color: 'text-purple-600', description: 'Toplanan saatlik istatistik' },
    { label: 'ML Tahmin', value: m.ml_predictions_total, icon: Brain, color: 'text-indigo-600', description: m.ml_predictions_total === 0 ? 'Henüz tahmin üretilmedi' : `${m.ml_quality_samples_24h} kalite ölçümü (24s)` },
    { label: 'Proaktif Uyarı', value: m.proactive_insights, icon: Shield, color: m.proactive_insights > 0 ? 'text-orange-600' : 'text-emerald-600', description: m.proactive_insights === 0 ? 'Sorun yok, sistem izliyor' : 'Dikkat gereken durumlar var' },
  ];

  return (
    <div className="space-y-4">
      <div className={`glass-card p-4 flex items-center gap-3 ${systemHealth.bg}`}>
        <span className="text-2xl">{systemHealth.icon}</span>
        <div>
          <p className={`font-semibold ${systemHealth.color}`}>{systemHealth.text}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Son 24 saatte {m.hourly_stats_total} veri noktası toplandı, {m.profiles_total} endpoint izleniyor
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass-card p-5 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-slate-800">
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
