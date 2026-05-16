'use client';

import { useTranslations } from 'next-intl';
import { API_BASE } from '@/lib/api';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useRouter } from '@/i18n/navigation';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';



// ─── Types ───
interface ComponentStatus {
  name: string;
  icon?: string;
  status: 'healthy' | 'degraded' | 'down' | 'unhealthy' | 'unknown';
  latency_ms: number | null;
  description: string;
  last_checked: string;
  uptime_30d?: number;
}

interface IncidentUpdate {
  time: string;
  message: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  created_at: string;
  resolved_at: string | null;
  affected_components: string[];
  updates: IncidentUpdate[];
}

interface Maintenance {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  affected_components: string[];
  description: string;
}

interface HistoryDay {
  date: string;
  uptime: number;
  incidents: string[];
}

interface StatusData {
  overall_status: 'operational' | 'degraded' | 'down';
  uptime_30d: number;
  components: ComponentStatus[];
  checked_at: string;
  response_times?: Record<string, number[]>;
}

// ─── Helpers ───
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatRelativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function uptimeColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-400';
  if (pct >= 99) return 'bg-lime-400';
  if (pct >= 95) return 'bg-yellow-400';
  if (pct >= 90) return 'bg-orange-400';
  return 'bg-red-400';
}

function uptimeCalendarColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 99) return 'bg-lime-500';
  if (pct >= 95) return 'bg-yellow-500';
  if (pct >= 90) return 'bg-orange-500';
  if (pct > 0) return 'bg-red-500';
  return 'bg-gray-600';
}

function latencyColor(ms: number | null): string {
  if (ms === null || ms === 0) return 'text-gray-500 dark:text-slate-500';
  if (ms < 200) return 'text-emerald-600 dark:text-emerald-400';
  if (ms < 500) return 'text-yellow-600 dark:text-yellow-400';
  if (ms < 1000) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function sparkBarColor(ms: number): string {
  if (ms < 200) return 'bg-emerald-400';
  if (ms < 500) return 'bg-yellow-400';
  if (ms < 1000) return 'bg-orange-400';
  return 'bg-red-400';
}

// ─── Status Badge (system health) ───
// NOTE: This is intentionally separate from @/components/StatusBadge.
// The shared StatusBadge handles delivery statuses (delivered, failed, pending, etc.)
// while this one handles system/infra health statuses (healthy, degraded, down, investigating, etc.)
// They share the same visual pattern but different status vocabularies.
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    healthy: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Operational' },
    operational: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Operational' },
    degraded: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Degraded' },
    unhealthy: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Unhealthy' },
    down: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Down' },
    investigating: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Investigating' },
    identified: { bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', label: 'Identified' },
    monitoring: { bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', label: 'Monitoring' },
    resolved: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Resolved' },
    unknown: { bg: 'bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-slate-700', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400', label: 'Unknown' },
  };
  const style = styles[status] || styles.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// ─── Status Banner ───
function StatusBanner({ status, checkedAt }: { status: string; checkedAt: string }) {
  const router = useRouter();
  const t = useTranslations('status');
  const configs: Record<string, { bg: string; border: string; text: string; icon: string; title: string }> = {
    operational: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-800 dark:text-emerald-300', icon: '✅', title: t('allOperational') },
    degraded: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-800 dark:text-amber-300', icon: '⚠️', title: t('someDegraded') },
    down: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-800 dark:text-red-300', icon: '🔴', title: t('majorOutage') },
  };
  const c = configs[status] || configs.operational;
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-5 mb-6`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{c.icon}</span>
        <div className="flex-1">
          <h2 className={`text-lg font-bold ${c.text}`}>{c.title}</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {t('lastChecked', { time: formatRelativeTime(checkedAt) })} • {t('autoRefresh')}
          </p>
        </div>
        <button
          className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => router.refresh()}
        >
          ↻ {t('refresh')}
        </button>
      </div>
    </div>
  );
}

// ─── Sparkline (pure CSS) ───
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-end gap-px h-6">{Array.from({ length: 24 }).map((_, i) => <div key={i} className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-t-sm" style={{ height: '4px' }} />)}</div>;
  }
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-6" title={`Response times (last ${data.length}h): ${data.join(', ')}ms`}>
      {Array.from({ length: 24 }).map((_, i) => {
        const val = data[i] ?? 0;
        const height = val > 0 ? Math.max(4, (val / max) * 24) : 4;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-sm transition-all ${val > 0 ? sparkBarColor(val) : 'bg-gray-200 dark:bg-slate-700'}`}
            style={{ height: `${height}px` }}
            title={val > 0 ? `${val}ms` : 'No data'}
          />
        );
      })}
    </div>
  );
}

// ─── 90-Day Uptime Calendar ───
function UptimeCalendar({ history }: { history: HistoryDay[] }) {
  const t = useTranslations('status');
  const [hoveredDay, setHoveredDay] = useState<HistoryDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Group by month for labels
  const months: { label: string; count: number }[] = [];
  let currentMonth = '';
  for (const day of history) {
    const month = new Date(day.date).toLocaleString('en-US', { month: 'short' });
    if (month !== currentMonth) {
      months.push({ label: month, count: 1 });
      currentMonth = month;
    } else {
      months[months.length - 1].count++;
    }
  }

  return (
    <div className="mt-4">
      <div className="flex gap-px flex-wrap" style={{ gap: '2px' }}>
        {history.map((day) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-xs cursor-pointer hover:ring-1 hover:ring-white/50 transition-all ${uptimeCalendarColor(day.uptime)}`}
            onMouseEnter={(e) => {
              setHoveredDay(day);
              setTooltipPos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoveredDay(null)}
          />
        ))}
      </div>
      {/* Month labels */}
      <div className="flex gap-px mt-1" style={{ gap: '2px' }}>
        {months.map((m) => (
          <div key={m.label + m.count} className="text-[10px] text-gray-500 dark:text-slate-500" style={{ width: `${m.count * 14}px` }}>
            {m.label}
          </div>
        ))}
      </div>
      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 36 }}
        >
          <div className="font-medium">{formatDate(hoveredDay.date)}</div>
          <div>{hoveredDay.uptime.toFixed(2)}% uptime</div>
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500 dark:text-slate-500">
        <span>100%</span>
        <div className="flex gap-0.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-lime-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-orange-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-gray-600" />
        </div>
        <span>0%</span>
        <span className="ml-2">{t("noData")}</span>
      </div>
    </div>
  );
}

// ─── Uptime Bar (30-day) ───
function UptimeBar({ history }: { history: HistoryDay[] }) {
  const t = useTranslations('status');
  const last30 = history.slice(-30);
  const avgUptime = last30.reduce((s, d) => s + d.uptime, 0) / last30.length;

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">{t('last30Days')}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgUptime.toFixed(2)}%</span>
          {last30.length >= 2 && (
            <span className={`text-xs font-medium ${last30[last30.length - 1].uptime >= last30[last30.length - 2].uptime ? 'text-emerald-500' : 'text-red-500'}`}>
              {last30[last30.length - 1].uptime >= last30[last30.length - 2].uptime ? '↑' : '↓'}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-0.5 h-8">
        {last30.map((day) => (
          <div
            key={day.date}
            className={`flex-1 rounded-xs transition-all hover:opacity-80 cursor-help ${uptimeColor(day.uptime)}`}
            title={`${formatDate(day.date)}: ${day.uptime.toFixed(2)}%`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500 dark:text-slate-500">30 days ago</span>
        <span className="text-xs text-gray-500 dark:text-slate-500">{t("today")}</span>
      </div>
    </div>
  );
}

// ─── Component Row ───
function ComponentRow({ component, responseTimes }: { component: ComponentStatus; responseTimes: number[] }) {
  const t = useTranslations('status');
  const currentLatency = component.latency_ms;
  const uptime = component.uptime_30d;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-lg">{component.icon || '🔧'}</span>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{component.name}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{component.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Uptime % */}
          {uptime !== undefined && uptime !== null && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 dark:text-slate-500">{t("uptime")}</div>
              <div className={`text-sm font-semibold ${uptime >= 99.5 ? 'text-emerald-600 dark:text-emerald-400' : uptime >= 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {uptime.toFixed(2)}%
              </div>
            </div>
          )}
          {/* Latency */}
          {currentLatency !== null && currentLatency > 0 && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 dark:text-slate-500">{t("latency")}</div>
              <div className={`text-sm font-semibold ${latencyColor(currentLatency)}`}>
                {currentLatency}ms
              </div>
            </div>
          )}
          <StatusBadge status={component.status} />
        </div>
      </div>
      {/* Sparkline */}
      {responseTimes.length > 0 && (
        <div className="mt-2">
          <Sparkline data={responseTimes} />
        </div>
      )}
    </div>
  );
}

// ─── Incident Log ───
function IncidentLog({ incidents }: { incidents: Incident[] }) {
  const t = useTranslations('status');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group by date
  const grouped: Record<string, Incident[]> = {};
  for (const inc of incidents) {
    const date = new Date(inc.created_at).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(inc);
  }

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-500">
        <div className="text-3xl mb-2">🎉</div>
        <p>{t('noIncidents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{formatDate(date)}</h3>
          <div className="space-y-3">
            {grouped[date].map((inc) => (
              <div key={inc.id} className="border border-gray-100 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  onClick={() => setExpandedId(expandedId === inc.id ? null : inc.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${inc.severity === 'critical' ? 'bg-red-500' : inc.severity === 'major' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{inc.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${inc.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : inc.severity === 'major' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inc.status} />
                    <span className={`text-xs text-gray-500 transition-transform ${expandedId === inc.id ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>
                {expandedId === inc.id && (
                  <div className="px-4 pb-3 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500 mt-2 mb-3">
                      <span>{t('affects', { components: inc.affected_components.join(', ') })}</span>
                      {inc.resolved_at && <span>• {t('resolvedAt', { time: formatRelativeTime(inc.resolved_at) })}</span>}
                    </div>
                    <div className="space-y-2">
                      {inc.updates.map((update, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-xs text-gray-500 dark:text-slate-500 shrink-0 w-14">
                            {new Date(update.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <StatusBadge status={update.status} />
                            <p className="text-gray-600 dark:text-slate-300 mt-1">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Maintenance Section ───
function MaintenanceSection({ maintenance }: { maintenance: Maintenance[] }) {
  const t = useTranslations('status');
  const upcoming = maintenance.filter(m => m.status === 'scheduled' || m.status === 'in_progress');
  const past = maintenance.filter(m => m.status === 'completed');

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{t("upcoming")}</h3>
          <div className="space-y-3">
            {upcoming.map((m) => (
              <div key={m.id} className="border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">🔧 {m.title}</span>
                  <StatusBadge status={m.status === 'in_progress' ? 'monitoring' : 'identified'} />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{m.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-500">
                  <span>📅 {formatDateTime(m.scheduled_start)} — {formatDateTime(m.scheduled_end)}</span>
                  <span>• Affects: {m.affected_components.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{t("pastMaintenance")}</h3>
          <div className="space-y-2">
            {past.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-gray-900 dark:text-white">{m.title}</span>
                  <span className="text-gray-500 dark:text-slate-500 ml-2 text-xs">({m.affected_components.join(', ')})</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-500">{formatDate(m.scheduled_start)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-slate-500">
          <p className="text-sm">{t("noScheduled")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Fallback Data ───
function unreachableData(): StatusData {
  return {
    overall_status: 'down',
    uptime_30d: 0,
    components: [
      { name: 'API', icon: '⚡', status: 'unknown', latency_ms: null, description: 'HookSniff REST API (Cloud Run)', last_checked: new Date().toISOString() },
      { name: 'Dashboard', icon: '🖥️', status: 'unknown', latency_ms: null, description: 'Next.js frontend (Vercel)', last_checked: new Date().toISOString() },
      { name: 'Worker', icon: '⚙️', status: 'unknown', latency_ms: null, description: 'Background delivery worker (Cloud Run)', last_checked: new Date().toISOString() },
      { name: 'Database', icon: '🗄️', status: 'unknown', latency_ms: null, description: 'PostgreSQL (Neon)', last_checked: new Date().toISOString() },
      { name: 'Cache', icon: '💾', status: 'unknown', latency_ms: null, description: 'Redis (Upstash)', last_checked: new Date().toISOString() },
      { name: 'Email Service', icon: '📧', status: 'unknown', latency_ms: null, description: 'Gmail API', last_checked: new Date().toISOString() },
      { name: 'Storage', icon: '☁️', status: 'unknown', latency_ms: null, description: 'Cloudflare R2', last_checked: new Date().toISOString() },
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
              🔔 {t('subscribeToUpdates')}
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
