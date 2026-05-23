'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { Activity, AlertTriangle, BarChart3, Brain, CheckCircle2, ChevronDown, Clock, Cpu, Gauge, Globe, Heart, Layers, LineChart, RefreshCw, Settings, Shield, ShieldCheck, TrendingDown, TrendingUp, Zap } from '@/components/icons';

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
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'anomalies' as Tab, label: 'Anomalies', icon: AlertTriangle },
    { id: 'healing' as Tab, label: 'Healing', icon: ShieldCheck },
    { id: 'predictions' as Tab, label: 'Predictions', icon: Brain },
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
            Cortex Intelligence
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Smart system engine — monitoring, learning, healing</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Status Banner */}
      {health && (
        <div className="glass-card p-4 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Cortex is {health.status} — {health.metrics?.active_insights ?? 0} active insights
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

function OverviewTab({ health, token }: { health: CortexHealth | null; token: string | null }) {
  if (!health?.metrics) return <p className="text-gray-500 dark:text-slate-400 text-center py-8">No data yet. Cortex needs time to collect metrics.</p>;
  const m = health.metrics;

  const cards = [
    { label: 'Hourly Stats', value: m.hourly_stats_total, icon: Clock, color: 'text-blue-600' },
    { label: 'Profiles', value: m.profiles_total, icon: Layers, color: 'text-purple-600' },
    { label: 'Anomalies (24h)', value: m.anomalies_24h, icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Healing Actions', value: m.healing_actions_24h, icon: ShieldCheck, color: 'text-emerald-600' },
    { label: 'Action Memory', value: m.action_memory_total, icon: Brain, color: 'text-pink-600' },
    { label: 'Predictions', value: m.predictions_24h, icon: TrendingUp, color: 'text-cyan-600' },
    { label: 'Active Insights', value: m.active_insights, icon: Zap, color: 'text-yellow-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <card.icon size={18} className={card.color} />
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
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
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Anomalies</h3>
      {anomalies.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-center py-8">No anomalies detected yet. Cortex needs data to start scoring.</p>
      ) : (
        <div className="space-y-3">
          {anomalies.slice(0, 20).map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                a[3] >= 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                a[3] >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {a[3]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{typeof a[5] === 'string' ? a[5] : 'unknown'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{a[6] ? new Date(a[6]).toLocaleString() : ''}</p>
                {a[4] && typeof a[4] === 'object' && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {Object.entries(a[4]).map(([k, v]) => `${k}: ${typeof v === 'number' ? Math.round(v as number) : v}`).join(' · ')}
                  </p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                a[5] === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                a[5] === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {typeof a[5] === 'string' ? a[5] : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Healing Actions</h3>
      {actions.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-center py-8">No healing actions taken yet. All endpoints healthy.</p>
      ) : (
        <div className="space-y-3">
          {actions.slice(0, 20).map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                a[5] === 'recovered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                a[5] === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {a[5] === 'recovered' ? <CheckCircle2 size={16} /> : <Shield size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{a[2]}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{a[3] || ''}</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(a[7]).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Failure Predictions</h3>
      {predictions.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-center py-8">No predictions generated yet. Needs at least 3 hours of data.</p>
      ) : (
        <div className="space-y-3">
          {predictions.slice(0, 20).map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold ${
                p[3] >= 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                p[3] >= 0.4 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {Math.round(p[3] * 100)}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{p[2]}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Endpoint: {p[1].slice(0, 8)}...</p>
              </div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(p[6]).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
