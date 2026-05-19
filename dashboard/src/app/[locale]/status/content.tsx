'use client';

import { useTranslations } from 'next-intl';
import { API_BASE } from '@/lib/api';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

import type { StatusData, HistoryDay, Incident, Maintenance } from './components/types';
import { uptimeColor } from './components/utils';
import { StatusBanner } from './components/StatusBanner';
import { UptimeCalendar } from './components/UptimeCalendar';
import { UptimeBar } from './components/UptimeBar';
import { ComponentRow } from './components/ComponentRow';
import { IncidentLog } from './components/IncidentLog';
import { MaintenanceSection } from './components/MaintenanceSection';
import { Bell, Cloud, Database, HardDrive, Mail, Monitor, Settings, Zap } from 'lucide-react';

// ─── Fallback Data ───
function unreachableData(): StatusData {
  return {
    overall_status: 'down',
    uptime_30d: 0,
    components: [
      { name: 'API', icon: <Zap size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'HookSniff REST API (Cloud Run)', last_checked: new Date().toISOString() },
      { name: 'Dashboard', icon: <Monitor size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'Next.js frontend (Vercel)', last_checked: new Date().toISOString() },
      { name: 'Worker', icon: <Settings size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'Background delivery worker (Cloud Run)', last_checked: new Date().toISOString() },
      { name: 'Database', icon: <Database size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'PostgreSQL (Neon)', last_checked: new Date().toISOString() },
      { name: 'Cache', icon: <HardDrive size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'Redis (Upstash)', last_checked: new Date().toISOString() },
      { name: 'Email Service', icon: <Mail size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'Gmail API', last_checked: new Date().toISOString() },
      { name: 'Storage', icon: <Cloud size={16} strokeWidth={1.75} />, status: 'unknown', latency_ms: null, description: 'Cloudflare R2', last_checked: new Date().toISOString() },
    ],
    checked_at: new Date().toISOString(),
    response_times: {},
  };
}

// ─── Main Status Page ───
export function StatusPageContent() {
  const t = useTranslations('status');
  const [data, setData] = useState<StatusData>(unreachableData());
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'api' | 'fallback' | 'static'>('static');

  const loadData = useCallback(async () => {
    // Strategy: /api/status → /v1/status → static fallback
    let loaded = false;

    // 1. Try our own aggregator
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('/api/status', { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (res.ok) {
        const json: StatusData = await res.json();
        setData(json);
        setDataSource('api');
        loaded = true;
      }
    } catch { /* continue */ }

    // 2. Try HookSniff API directly
    if (!loaded) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${API_BASE}/status`, { signal: controller.signal, mode: 'cors' });
        clearTimeout(timeout);
        if (res.ok) {
          const json: StatusData = await res.json();
          setData(json);
          setDataSource('fallback');
          loaded = true;
        }
      } catch { /* continue */ }
    }

    // 3. Static fallback from public/status.json
    if (!loaded) {
      try {
        const res = await fetch('/status.json', { cache: 'force-cache' });
        if (res.ok) {
          const json: StatusData = await res.json();
          setData(json);
          setDataSource('static');
        } else {
          setData(unreachableData());
        }
      } catch {
        setData(unreachableData());
      }
    }

    // Load supplementary data (non-critical)
    const loadSupplemental = async () => {
      try {
        const [histRes, incRes, mntRes] = await Promise.all([
          fetch('/status-history.json', { cache: 'force-cache' }).catch(() => null),
          fetch('/incidents.json', { cache: 'force-cache' }).catch(() => null),
          fetch('/maintenance.json', { cache: 'force-cache' }).catch(() => null),
        ]);
        if (histRes?.ok) setHistory(await histRes.json());
        if (incRes?.ok) setIncidents(await incRes.json());
        if (mntRes?.ok) setMaintenance(await mntRes.json());
      } catch { /* non-critical */ }
    };
    await loadSupplemental();

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Enrich components with uptime from history
  const enrichedComponents = useMemo(() => {
    if (history.length === 0) return data.components;
    return data.components.map(comp => {
      // If component already has uptime_30d, use it
      if (comp.uptime_30d !== undefined && comp.uptime_30d !== null) return comp;
      // Otherwise estimate from overall history
      const last30 = history.slice(-30);
      const avg = last30.reduce((s, d) => s + d.uptime, 0) / last30.length;
      return { ...comp, uptime_30d: avg };
    });
  }, [data.components, history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-3xl mb-3">🪝</div>
          <p className="text-gray-500 dark:text-slate-400">{t('loadingStatus')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl">🪝</span>
            <span className="font-bold text-gray-900 dark:text-white">HookSniff</span>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('subscribeToUpdates')}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("systemStatus")}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {t('realTimeMonitoring')}
            {dataSource === 'static' && (
              <span className="ml-2 text-amber-500">{t('showingCachedData')}</span>
            )}
          </p>
        </div>

        {/* Status Banner */}
        <StatusBanner status={data.overall_status} checkedAt={data.checked_at} />

        {/* 90-Day Uptime Calendar */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('uptimeLast90Days')}</h2>
            <UptimeCalendar history={history.slice(-90)} />
          </div>
        )}

        {/* 30-Day Uptime Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("overallUptime")}</h2>
          {history.length > 0 ? (
            <UptimeBar history={history} />
          ) : (
            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-slate-400">{t('last30Days')}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.uptime_30d}%</span>
              </div>
              <div className="flex gap-0.5 h-8">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className={`flex-1 rounded-xs ${uptimeColor(data.uptime_30d)} transition-all hover:opacity-80`} title={`Day ${30 - i}: ${data.uptime_30d}%`} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Components */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("components")}</h2>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {enrichedComponents.map((comp) => (
              <ComponentRow
                key={comp.name}
                component={comp}
                responseTimes={data.response_times?.[comp.name] || []}
              />
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("incidentHistory")}</h2>
          <IncidentLog incidents={incidents} />
        </div>

        {/* Maintenance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("scheduledMaintenance")}</h2>
          <MaintenanceSection maintenance={maintenance} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-slate-500 space-y-1">
          <p>
            Version {process.env.NEXT_PUBLIC_VERSION || '0.1.0'} •{' '}
            <Link href="/" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">hooksniff.vercel.app</Link>{' '}
            •{' '}
            <Link href="/docs" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">{t("docs")}</Link>
          </p>
          <p className="text-xs">{t('poweredBy')}</p>
        </div>
      </div>
    </div>
  );
}
