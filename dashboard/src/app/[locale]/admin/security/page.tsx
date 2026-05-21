'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTranslations } from 'next-intl';
import {
  Shield, AlertTriangle, AlertCircle, Info, Ban, Unlock,
  CheckCircle2, XCircle, Search, Globe, Clock, RefreshCw,
  Download, Eye,
} from '@/components/icons';

// ── Types ─────────────────────────────────────────────────

interface SecurityEvent {
  id: string; event_type: string; severity: string; customer_id: string | null;
  email: string | null; ip_address: string | null; user_agent: string | null;
  details: Record<string, unknown>; resolved: boolean; resolved_by: string | null;
  resolved_at: string | null; created_at: string;
}

interface IpBlockEntry {
  id: string; ip_address: string; reason: string | null; blocked_by: string | null;
  auto_blocked: boolean; event_id: string | null; is_active: boolean;
  expires_at: string | null; created_at: string;
}

interface BlockIpForm { ip_address: string; reason: string; expires_hours: string; }
const emptyBlockForm: BlockIpForm = { ip_address: '', reason: '', expires_hours: '' };

// ── Constants ─────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-300 dark:border-red-500/40',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-300 dark:border-orange-500/40',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-300 dark:border-amber-500/40',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-300 dark:border-blue-500/40',
};
const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  critical: <AlertCircle size={14} strokeWidth={1.75} />,
  high: <AlertTriangle size={14} strokeWidth={1.75} />,
  medium: <Info size={14} strokeWidth={1.75} />,
  low: <Info size={14} strokeWidth={1.75} />,
};
const SEVERITY_BAR_COLORS: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-blue-500',
};
const EVENT_TYPE_LABELS: Record<string, string> = {
  brute_force_login: 'Brute Force Giriş', brute_force_api: 'Brute Force API',
  credential_stuffing: 'Credential Stuffing', password_spray: 'Password Spray',
  sql_injection_attempt: 'SQL Injection', xss_attempt: 'XSS Saldırısı',
  path_traversal_attempt: 'Path Traversal', scanner_detected: 'Tarayıcı Tespit',
  suspicious_user_agent: 'Şüpheli UA', disabled_account_login: 'Pasif Hesap Girişi',
  password_reset_abuse: 'Şifre Sıfırlama İstismarı', account_enumeration: 'Hesap Numaralandırma',
  rate_limit_exceeded: 'Rate Limit Aşıldı', unusual_location: 'Olağandışı Konum',
  login_new_device: 'Yeni Cihaz Girişi',
};
const SEVERITY_OPTIONS = ['all', 'critical', 'high', 'medium', 'low'];
const RESOLVED_OPTIONS = ['all', 'unresolved', 'resolved'];

// ── Helpers ───────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

function isValidIp(ip: string): boolean {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) return m.slice(1).every(o => parseInt(o) <= 255);
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':');
}

function getSinceParam(range: string): string | undefined {
  if (!range) return undefined;
  const ms = range === '24h' ? 86400000 : range === '7d' ? 604800000 : 2592000000;
  return new Date(Date.now() - ms).toISOString();
}

// ── Main Component ────────────────────────────────────────

export default function AdminSecurityPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const t = useTranslations('security');

  const DATE_RANGE_OPTIONS = [
    { value: '', label: t('allTime') }, { value: '24h', label: t('last24h') },
    { value: '7d', label: t('last7d') }, { value: '30d', label: t('last30d') },
  ];

  const [tab, setTab] = useState<'events' | 'blocklist' | 'analytics'>('events');
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState<BlockIpForm>(emptyBlockForm);
  const [blockIpError, setBlockIpError] = useState('');
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);
  const [resolveAllTarget, setResolveAllTarget] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterResolved, setFilterResolved] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [searchIp, setSearchIp] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // ── React Query: Stats (stale 30s) ──
  const { data: stats } = useQuery({
    queryKey: ['admin', 'security-stats'],
    queryFn: () => adminApi.getSecurityStats(token!),
    enabled: !!token,
    staleTime: 30_000,
  });

  // ── React Query: Events (stale 15s, filter-aware) ──
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['admin', 'security-events', filterSeverity, filterResolved, searchIp, filterDateRange],
    queryFn: async () => {
      const params: Record<string, string> = { per_page: '100' };
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      if (filterResolved !== 'all') params.resolved = filterResolved === 'resolved' ? 'true' : 'false';
      if (searchIp) params.ip = searchIp;
      const since = getSinceParam(filterDateRange);
      if (since) params.since = since;
      return adminApi.listSecurityEvents(token!, params);
    },
    enabled: !!token && tab === 'events',
    staleTime: 15_000,
  });
  const events: SecurityEvent[] = eventsData?.events || [];

  // ── React Query: Blocklist (stale 30s) ──
  const { data: blocklistData, isLoading: blocklistLoading } = useQuery({
    queryKey: ['admin', 'ip-blocklist'],
    queryFn: () => adminApi.listIpBlocklist(token!),
    enabled: !!token && tab === 'blocklist',
    staleTime: 30_000,
  });
  const blocklist: IpBlockEntry[] = blocklistData?.entries || [];

  // ── Mutations ──
  const resolveMutation = useMutation({
    mutationFn: (id: string) => adminApi.resolveSecurityEvent(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'security'] }); toast(t('eventResolved'), 'success'); },
    onError: () => toast(t('resolveFailed'), 'error'),
  });

  const resolveAllMutation = useMutation({
    mutationFn: () => adminApi.resolveAllSecurityEvents(token!, {}),
    onSuccess: (data: { resolved_count: number }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'security'] });
      toast(`${data.resolved_count} ${t('eventsResolved')}`, 'success');
      setResolveAllTarget(false);
    },
    onError: () => toast('Toplu çözümleme başarısız', 'error'),
  });

  const blockMutation = useMutation({
    mutationFn: (payload: { ip_address: string; reason?: string; expires_hours?: number }) =>
      adminApi.blockIp(token!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ip-blocklist'] });
      toast('IP bloklandı', 'success');
      setBlockForm(emptyBlockForm);
      setShowBlockForm(false);
    },
    onError: () => toast(t('blockFailed'), 'error'),
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminApi.unblockIp(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'ip-blocklist'] });
      toast('IP bloğu kaldırıldı', 'success');
      setUnblockTarget(null);
    },
    onError: () => toast('Kaldırılamadı', 'error'),
  });

  // ── Handlers ──
  const handleBlockIp = () => {
    const ip = blockForm.ip_address.trim();
    if (!ip) return;
    if (!isValidIp(ip)) { setBlockIpError('Geçerli bir IP adresi girin'); return; }
    setBlockIpError('');
    const payload: { ip_address: string; reason?: string; expires_hours?: number } = { ip_address: ip };
    if (blockForm.reason.trim()) payload.reason = blockForm.reason.trim();
    if (blockForm.expires_hours) payload.expires_hours = parseInt(blockForm.expires_hours);
    blockMutation.mutate(payload);
  };

  const handleBlockFromEvent = (ip: string) => {
    setBlockForm({ ip_address: ip, reason: t('autoFromSecurity'), expires_hours: '' });
    setBlockIpError('');
    setShowBlockForm(true);
    setTab('blocklist');
  };

  const handleExport = () => {
    if (!events.length) return;
    const csv = ['ID,Tip,Severity,Email,IP,User Agent,Resolved,Date',
      ...events.map(e => `"${e.id}","${e.event_type}","${e.severity}","${e.email || ''}","${e.ip_address || ''}","${(e.user_agent || '').replace(/"/g, '""')}","${e.resolved}","${e.created_at}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            <Shield size={24} strokeWidth={1.75} className="inline mr-2" />{t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {tab === 'events' && events.length > 0 && (
            <button onClick={handleExport} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5">
              <Download size={14} strokeWidth={1.75} /> CSV İndir
            </button>
          )}
          {stats && stats.unresolved_events > 0 && (
            <button onClick={() => setResolveAllTarget(true)} className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition flex items-center gap-1.5">
              <CheckCircle2 size={14} strokeWidth={1.75} /> {t('resolveAll')} ({stats.unresolved_events})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass-card p-3 sm:p-4"><div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total_events}</div><div className="text-xs text-gray-500 dark:text-slate-400">{t('totalEvents')}</div></div>
          <div className="glass-card p-3 sm:p-4 border-l-4 border-red-500"><div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.unresolved_events}</div><div className="text-xs text-gray-500 dark:text-slate-400">{t('unresolved')}</div></div>
          <div className="glass-card p-3 sm:p-4 border-l-4 border-orange-500"><div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.critical_events}</div><div className="text-xs text-gray-500 dark:text-slate-400">{t('criticalDays')}</div></div>
          <div className="glass-card p-3 sm:p-4 border-l-4 border-amber-500"><div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.high_events}</div><div className="text-xs text-gray-500 dark:text-slate-400">{t('highDays')}</div></div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full">🔴 Brute Force: {stats.recent_brute_force} (24sa)</span>
          <span className="px-3 py-1.5 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full">🟠 Credential Stuffing: {stats.recent_credential_stuffing} (24sa)</span>
          <span className="px-3 py-1.5 text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full">🟣 Injection: {stats.recent_injection_attempts} (24sa)</span>
        </div>
      )}

      {/* Tab Toggle */}
      <div className="flex flex-wrap bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit max-w-full overflow-x-auto">
        {([
          { key: 'events' as const, label: t('securityEvents'), icon: <AlertTriangle size={14} strokeWidth={1.75} /> },
          { key: 'analytics' as const, label: 'Analytics', icon: <Eye size={14} strokeWidth={1.75} /> },
          { key: 'blocklist' as const, label: 'IP Blocklist', icon: <Ban size={14} strokeWidth={1.75} /> },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${tab === t.key ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ═══ ANALYTICS TAB ═══ */}
      {tab === 'analytics' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('eventTypes')}</h3>
            {stats.events_by_type.length > 0 ? (
              <div className="space-y-2.5">
                {stats.events_by_type.map((item) => {
                  const max = stats.events_by_type[0]?.count || 1;
                  return (
                    <div key={item.event_type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-slate-400">{EVENT_TYPE_LABELS[item.event_type] || item.event_type}</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(item.count / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">Veri yok</p>}
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Severity Dağılımı (30 gün)</h3>
            {stats.events_by_severity.length > 0 ? (
              <div className="space-y-2.5">
                {stats.events_by_severity.map((item) => {
                  const total = stats.events_by_severity.reduce((s, e) => s + e.count, 0);
                  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.severity} className="flex items-center gap-3">
                      <span className={`w-20 text-xs font-medium ${SEVERITY_COLORS[item.severity]?.split(' ')[1] || 'text-gray-600'}`}>{item.severity.toUpperCase()}</span>
                      <div className="flex-1 h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${SEVERITY_BAR_COLORS[item.severity] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-900 dark:text-white w-12 text-right">{item.count}</span>
                      <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">Veri yok</p>}
          </div>
          {stats.top_ips.length > 0 && (
            <div className="glass-card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4"><Globe size={14} strokeWidth={1.75} className="inline mr-1.5" />En Çok Olay Olan IP'ler (7 gün)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stats.top_ips.map((ip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <button onClick={() => handleBlockFromEvent(ip.ip_address)} className="text-sm font-mono text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition">{ip.ip_address}</button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{ip.count} olay</span>
                      <button onClick={() => handleBlockFromEvent(ip.ip_address)} className="text-xs text-red-500 hover:text-red-700 transition" title="Bu IP'yi blokla"><Ban size={12} strokeWidth={1.75} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ EVENTS TAB ═══ */}
      {tab === 'events' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? t('allSeverity') : s.toUpperCase()}</option>)}
            </select>
            <select value={filterResolved} onChange={(e) => setFilterResolved(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              {RESOLVED_OPTIONS.map(r => <option key={r} value={r}>{r === 'all' ? t('allStatus') : r === 'unresolved' ? t('unresolved') : t('resolvedFilter')}</option>)}
            </select>
            <select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              {DATE_RANGE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchIp} onChange={(e) => setSearchIp(e.target.value)} placeholder="IP ara..." className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
            </div>
            <button onClick={() => refetchEvents()} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <RefreshCw size={16} strokeWidth={1.75} />
            </button>
          </div>

          {eventsLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="glass-card p-4 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" /></div>)}</div>
          ) : events.length === 0 ? (
            <div className="glass-card p-12 text-center"><Shield size={48} strokeWidth={1.25} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-gray-500 dark:text-slate-400 text-sm">{t('noEvents')}</p></div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const isExpanded = expandedEvent === event.id;
                return (
                  <div key={event.id} className={`glass-card transition-all ${event.resolved ? 'opacity-60' : ''} border-l-4 ${event.severity === 'critical' ? 'border-red-500' : event.severity === 'high' ? 'border-orange-500' : event.severity === 'medium' ? 'border-amber-500' : 'border-blue-500'}`}>
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedEvent(isExpanded ? null : event.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[event.severity]}`}>{SEVERITY_ICONS[event.severity]}{event.severity.toUpperCase()}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{EVENT_TYPE_LABELS[event.event_type] || event.event_type}</span>
                            {event.resolved && <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full"><CheckCircle2 size={12} strokeWidth={1.75} /> {t('resolvedBadge')}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                            {event.email && <span>📧 {event.email}</span>}
                            {event.ip_address && (
                              <button onClick={(e) => { e.stopPropagation(); handleBlockFromEvent(event.ip_address!); }} className="inline-flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400 transition" title="Bu IP'yi blokla">
                                <Globe size={12} strokeWidth={1.75} /> {event.ip_address}<Ban size={10} strokeWidth={1.75} />
                              </button>
                            )}
                            <span><Clock size={12} strokeWidth={1.75} className="inline" /> {relativeTime(event.created_at)}</span>
                          </div>
                          {(() => { const d = event.details; return d?.reason ? <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{String(d.reason)}</p> : null; })()}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!event.resolved && (
                            <button onClick={(e) => { e.stopPropagation(); resolveMutation.mutate(event.id); }} className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition">
                              <CheckCircle2 size={14} strokeWidth={1.75} className="inline mr-1" />Çöz
                            </button>
                          )}
                          {isExpanded ? <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg> : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-slate-700/50 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div><span className="text-[11px] text-gray-400 uppercase">Olay ID</span><p className="text-xs font-mono text-gray-700 dark:text-slate-300">{event.id}</p></div>
                          <div><span className="text-[11px] text-gray-400 uppercase">Müşteri ID</span><p className="text-xs font-mono text-gray-700 dark:text-slate-300">{event.customer_id || '—'}</p></div>
                          <div><span className="text-[11px] text-gray-400 uppercase">Email</span><p className="text-xs text-gray-700 dark:text-slate-300">{event.email || '—'}</p></div>
                          <div><span className="text-[11px] text-gray-400 uppercase">IP Adresi</span><p className="text-xs font-mono text-gray-700 dark:text-slate-300">{event.ip_address || '—'}</p></div>
                          <div className="sm:col-span-2"><span className="text-[11px] text-gray-400 uppercase">User Agent</span><p className="text-xs text-gray-700 dark:text-slate-300 break-all">{event.user_agent || '—'}</p></div>
                          <div><span className="text-[11px] text-gray-400 uppercase">Tarih</span><p className="text-xs text-gray-700 dark:text-slate-300">{new Date(event.created_at).toLocaleString()}</p></div>
                          <div><span className="text-[11px] text-gray-400 uppercase">{t('resolvedBadge')}</span><p className="text-xs text-gray-700 dark:text-slate-300">{event.resolved ? `Evet (${event.resolved_at ? new Date(event.resolved_at).toLocaleString() : ''})` : 'Hayır'}</p></div>
                        </div>
                        {event.details && Object.keys(event.details).length > 0 && (
                          <div className="mt-3"><span className="text-[11px] text-gray-400 uppercase">Detaylar</span><pre className="mt-1 text-xs font-mono text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 rounded-lg p-3 overflow-x-auto max-h-32">{JSON.stringify(event.details, null, 2)}</pre></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ BLOCKLIST TAB ═══ */}
      {tab === 'blocklist' && (
        <>
          {!showBlockForm ? (
            <button onClick={() => { setBlockForm(emptyBlockForm); setBlockIpError(''); setShowBlockForm(true); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5">
              <Ban size={16} strokeWidth={1.75} /> {t('blockIp')}
            </button>
          ) : (
            <div className="glass-card p-6 border-2 border-red-200 dark:border-red-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Ban size={18} strokeWidth={1.75} className="inline mr-1.5" />{t('blockIp')}</h2>
                <button onClick={() => setShowBlockForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><XCircle size={20} strokeWidth={1.75} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">IP Adresi *</label>
                  <input type="text" value={blockForm.ip_address} onChange={(e) => { setBlockForm({ ...blockForm, ip_address: e.target.value }); setBlockIpError(''); }} placeholder="192.168.1.1" className={`w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${blockIpError ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} />
                  {blockIpError && <p className="text-xs text-red-500 mt-1">{blockIpError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Sebep</label>
                  <input type="text" value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="Brute force saldırısı" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Süre (saat, boş = kalıcı)</label>
                  <input type="number" value={blockForm.expires_hours} onChange={(e) => setBlockForm({ ...blockForm, expires_hours: e.target.value })} placeholder="24" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowBlockForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition">İptal</button>
                  <button onClick={handleBlockIp} disabled={blockMutation.isPending || !blockForm.ip_address.trim()} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition">
                    {blockMutation.isPending ? t('blocking') : t('block')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {blocklistLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card p-4 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-2" /><div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" /></div>)}</div>
          ) : blocklist.length === 0 ? (
            <div className="glass-card p-12 text-center"><Ban size={48} strokeWidth={1.25} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-gray-500 dark:text-slate-400 text-sm">{t('noBlockedIps')}</p></div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white"><Ban size={14} strokeWidth={1.75} className="inline mr-1.5" />Bloklu IP'ler ({blocklist.filter(b => b.is_active).length} aktif)</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {blocklist.map((entry) => (
                  <div key={entry.id} className={`px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${!entry.is_active ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{entry.ip_address}</span>
                        {entry.auto_blocked && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded">OTOMATİK</span>}
                        {!entry.is_active && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded">KALDIRILDI</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {entry.reason && <span>📝 {entry.reason}</span>}
                        <span>{relativeTime(entry.created_at)}</span>
                        {entry.expires_at && <span>⏰ Bitiş: {new Date(entry.expires_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    {entry.is_active && (
                      <button onClick={() => setUnblockTarget(entry.id)} className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition shrink-0">
                        <Unlock size={14} strokeWidth={1.75} className="inline mr-1" />Bloğu Kaldır
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog open={!!unblockTarget} title="IP Bloğunu Kaldır" message="Bu IP adresinin bloğunu kaldırmak istediğinize emin misiniz?" confirmLabel="Bloğu Kaldır" cancelLabel={t('cancel')} variant="default" onConfirm={() => unblockTarget && unblockMutation.mutate(unblockTarget)} onCancel={() => setUnblockTarget(null)} />
      <ConfirmDialog open={resolveAllTarget} title={t('resolveAllTitle')} message={`${stats?.unresolved_events || 0} çözülmemiş olay var. Tümünü çözmek istediğinize emin misiniz?`} confirmLabel={t('resolveAll')} cancelLabel={t('cancel')} variant="default" onConfirm={() => resolveAllMutation.mutate()} onCancel={() => setResolveAllTarget(false)} loading={resolveAllMutation.isPending} />
    </div>
  );
}
