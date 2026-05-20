'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi } from '@/lib/api';

import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Ban,
  Unlock,
  CheckCircle2,
  XCircle,
  Search,
  Globe,
  Clock,
  RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  customer_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface SecurityStats {
  total_events: number;
  unresolved_events: number;
  critical_events: number;
  high_events: number;
  events_by_type: Array<{ event_type: string; count: number }>;
  events_by_severity: Array<{ severity: string; count: number }>;
  top_ips: Array<{ ip_address: string; count: number }>;
  recent_brute_force: number;
  recent_credential_stuffing: number;
  recent_injection_attempts: number;
}

interface IpBlockEntry {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_by: string | null;
  auto_blocked: boolean;
  event_id: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface BlockIpForm {
  ip_address: string;
  reason: string;
  expires_hours: string;
}

const emptyBlockForm: BlockIpForm = { ip_address: '', reason: '', expires_hours: '' };

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

const EVENT_TYPE_LABELS: Record<string, string> = {
  brute_force_login: 'Brute Force Giriş',
  brute_force_api: 'Brute Force API',
  credential_stuffing: 'Credential Stuffing',
  password_spray: 'Password Spray',
  sql_injection_attempt: 'SQL Injection',
  xss_attempt: 'XSS Saldırısı',
  path_traversal_attempt: 'Path Traversal',
  scanner_detected: 'Tarayıcı Tespit',
  suspicious_user_agent: 'Şüpheli UA',
  disabled_account_login: 'Pasif Hesap Girişi',
  password_reset_abuse: 'Şifre Sıfırlama İstismarı',
  account_enumeration: 'Hesap Numaralandırma',
  rate_limit_exceeded: 'Rate Limit Aşıldı',
  unusual_location: 'Olağandışı Konum',
  login_new_device: 'Yeni Cihaz Girişi',
};

function relativeTime(dateStr: string): string {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa önce`;
  const days = Math.floor(hours / 24);
  return `${days}g önce`;
}

// ── Main Component ────────────────────────────────────────

export default function AdminSecurityPage() {
  const { token } = useAuth();
  const { toast } = useToast();


  const [tab, setTab] = useState<'events' | 'blocklist'>('events');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [blocklist, setBlocklist] = useState<IpBlockEntry[]>([]);
  const [blocklistLoading, setBlocklistLoading] = useState(true);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState<BlockIpForm>(emptyBlockForm);
  const [blocking, setBlocking] = useState(false);
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<string>('all');
  const [searchIp, setSearchIp] = useState('');

  // ── Fetch data ──

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminApi.getSecurityStats(token);
      setStats(data);
    } catch { /* silent */ }
  }, [token]);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    setEventsLoading(true);
    try {
      const params: Record<string, string> = { per_page: '100' };
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      if (filterResolved !== 'all') params.resolved = filterResolved === 'resolved' ? 'true' : 'false';
      if (searchIp) params.ip = searchIp;
      const data = await adminApi.listSecurityEvents(token, params);
      setEvents(data.events || []);
    } catch { /* silent */ }
    finally { setEventsLoading(false); }
  }, [token, filterSeverity, filterResolved, searchIp]);

  const fetchBlocklist = useCallback(async () => {
    if (!token) return;
    setBlocklistLoading(true);
    try {
      const data = await adminApi.listIpBlocklist(token);
      setBlocklist(data.entries || []);
    } catch { /* silent */ }
    finally { setBlocklistLoading(false); }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === 'events') fetchEvents(); else fetchBlocklist(); }, [tab, fetchEvents, fetchBlocklist]);

  // ── Actions ──

  const handleResolve = async (id: string) => {
    if (!token) return;
    try {
      await adminApi.resolveSecurityEvent(token, id);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
      toast('Olay çözüldü', 'success');
      fetchStats();
    } catch { toast('Çözülemedi', 'error'); }
  };

  const handleBlockIp = async () => {
    if (!token || !blockForm.ip_address.trim()) return;
    setBlocking(true);
    try {
      const payload: { ip_address: string; reason?: string; expires_hours?: number } = { ip_address: blockForm.ip_address.trim() };
      if (blockForm.reason.trim()) payload.reason = blockForm.reason.trim();
      if (blockForm.expires_hours) payload.expires_hours = parseInt(blockForm.expires_hours);
      await adminApi.blockIp(token, payload);
      toast('IP bloklandı', 'success');
      setBlockForm(emptyBlockForm);
      setShowBlockForm(false);
      fetchBlocklist();
    } catch { toast('Bloklanamadı', 'error'); }
    finally { setBlocking(false); }
  };

  const handleUnblock = async () => {
    if (!token || !unblockTarget) return;
    try {
      await adminApi.unblockIp(token, unblockTarget);
      setBlocklist(prev => prev.map(b => b.id === unblockTarget ? { ...b, is_active: false } : b));
      toast('IP bloğu kaldırıldı', 'success');
      setUnblockTarget(null);
    } catch { toast('Kaldırılamadı', 'error'); }
  };

  const handleBlockFromEvent = (ip: string) => {
    setBlockForm({ ip_address: ip, reason: 'Güvenlik olayından otomatik', expires_hours: '' });
    setShowBlockForm(true);
    setTab('blocklist');
  };

  // ── Render ──

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          <Shield size={24} strokeWidth={1.75} className="inline mr-2" />
          Güvenlik İzleme
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Şüpheli aktiviteleri izleyin, IP adreslerini bloklayın.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_events}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Toplam Olay</div>
          </div>
          <div className="glass-card p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.unresolved_events}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Çözülmemiş</div>
          </div>
          <div className="glass-card p-4 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.critical_events}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Kritik (7 gün)</div>
          </div>
          <div className="glass-card p-4 border-l-4 border-amber-500">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.high_events}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Yüksek (7 gün)</div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full">
            🔴 Brute Force: {stats.recent_brute_force} (24sa)
          </span>
          <span className="px-3 py-1.5 text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full">
            🟠 Credential Stuffing: {stats.recent_credential_stuffing} (24sa)
          </span>
          <span className="px-3 py-1.5 text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-full">
            🟣 Injection: {stats.recent_injection_attempts} (24sa)
          </span>
        </div>
      )}

      {/* Tab Toggle */}
      <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'events'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <AlertTriangle size={14} strokeWidth={1.75} className="inline mr-1.5" />
          Güvenlik Olayları
        </button>
        <button
          onClick={() => setTab('blocklist')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'blocklist'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          <Ban size={14} strokeWidth={1.75} className="inline mr-1.5" />
          IP Blok Listesi
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          EVENTS TAB
          ═══════════════════════════════════════════════════ */}
      {tab === 'events' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tüm Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterResolved}
              onChange={(e) => setFilterResolved(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="all">Tüm Durum</option>
              <option value="unresolved">Çözülmemiş</option>
              <option value="resolved">Çözülmüş</option>
            </select>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchIp}
                onChange={(e) => setSearchIp(e.target.value)}
                placeholder="IP ara..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={fetchEvents}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <RefreshCw size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Events List */}
          {eventsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Shield size={48} strokeWidth={1.25} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">Güvenlik olayı bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`glass-card p-4 transition-all ${event.resolved ? 'opacity-60' : ''} border-l-4 ${
                    event.severity === 'critical' ? 'border-red-500' :
                    event.severity === 'high' ? 'border-orange-500' :
                    event.severity === 'medium' ? 'border-amber-500' : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[event.severity]}`}>
                          {SEVERITY_ICONS[event.severity]}
                          {event.severity.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                        </span>
                        {event.resolved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full">
                            <CheckCircle2 size={12} strokeWidth={1.75} /> Çözüldü
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 flex-wrap">
                        {event.email && <span>📧 {event.email}</span>}
                        {event.ip_address && (
                          <button
                            onClick={() => handleBlockFromEvent(event.ip_address!)}
                            className="inline-flex items-center gap-1 hover:text-red-600 dark:hover:text-red-400 transition"
                            title="Bu IP'yi blokla"
                          >
                            <Globe size={12} strokeWidth={1.75} /> {event.ip_address}
                            <Ban size={10} strokeWidth={1.75} />
                          </button>
                        )}
                        <span><Clock size={12} strokeWidth={1.75} className="inline" /> {relativeTime(event.created_at)}</span>
                      </div>
                      {(() => {
                        const d = event.details as Record<string, unknown> | undefined;
                        return d?.reason ? (
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            {String(d.reason)}
                          </p>
                        ) : null;
                      })()}
                    </div>
                    {!event.resolved && (
                      <button
                        onClick={() => handleResolve(event.id)}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition shrink-0"
                      >
                        <CheckCircle2 size={14} strokeWidth={1.75} className="inline mr-1" />
                        Çöz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════
          BLOCKLIST TAB
          ═══════════════════════════════════════════════════ */}
      {tab === 'blocklist' && (
        <>
          {/* Block IP Form */}
          {!showBlockForm ? (
            <button
              onClick={() => { setBlockForm(emptyBlockForm); setShowBlockForm(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Ban size={16} strokeWidth={1.75} />
              IP Blokla
            </button>
          ) : (
            <div className="glass-card p-6 border-2 border-red-200 dark:border-red-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Ban size={18} strokeWidth={1.75} className="inline mr-1.5" />
                  IP Blokla
                </h2>
                <button onClick={() => setShowBlockForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                  <XCircle size={20} strokeWidth={1.75} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">IP Adresi *</label>
                  <input
                    type="text"
                    value={blockForm.ip_address}
                    onChange={(e) => setBlockForm({ ...blockForm, ip_address: e.target.value })}
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Sebep</label>
                  <input
                    type="text"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                    placeholder="Brute force saldırısı"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Süre (saat, boş = kalıcı)</label>
                  <input
                    type="number"
                    value={blockForm.expires_hours}
                    onChange={(e) => setBlockForm({ ...blockForm, expires_hours: e.target.value })}
                    placeholder="24"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowBlockForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition">
                    İptal
                  </button>
                  <button
                    onClick={handleBlockIp}
                    disabled={blocking || !blockForm.ip_address.trim()}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition"
                  >
                    {blocking ? 'Bloklanıyor...' : 'Blokle'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Blocklist */}
          {blocklistLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : blocklist.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Ban size={48} strokeWidth={1.25} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">Bloklu IP yok</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  <Ban size={14} strokeWidth={1.75} className="inline mr-1.5" />
                  Bloklu IP'ler ({blocklist.filter(b => b.is_active).length} aktif)
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {blocklist.map((entry) => (
                  <div
                    key={entry.id}
                    className={`px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                      !entry.is_active ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                          {entry.ip_address}
                        </span>
                        {entry.auto_blocked && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded">
                            OTOMATİK
                          </span>
                        )}
                        {!entry.is_active && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded">
                            KALDIRILDI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {entry.reason && <span>📝 {entry.reason}</span>}
                        <span>{relativeTime(entry.created_at)}</span>
                        {entry.expires_at && (
                          <span>⏰ Bitiş: {new Date(entry.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {entry.is_active && (
                      <button
                        onClick={() => setUnblockTarget(entry.id)}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition shrink-0"
                      >
                        <Unlock size={14} strokeWidth={1.75} className="inline mr-1" />
                        Bloğu Kaldır
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Top IPs */}
      {stats && stats.top_ips.length > 0 && tab === 'events' && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            <Globe size={14} strokeWidth={1.75} className="inline mr-1.5" />
            En Çok Olay Olan IP'ler (7 gün)
          </h3>
          <div className="space-y-1.5">
            {stats.top_ips.map((ip, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <button
                  onClick={() => handleBlockFromEvent(ip.ip_address)}
                  className="text-sm font-mono text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  {ip.ip_address}
                </button>
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{ip.count} olay</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unblock Confirmation */}
      <ConfirmDialog
        open={!!unblockTarget}
        title="IP Bloğunu Kaldır"
        message="Bu IP adresinin bloğunu kaldırmak istediğinize emin misiniz? Bu IP tekrar erişim sağlayabilecek."
        confirmLabel="Bloğu Kaldır"
        cancelLabel="İptal"
        variant="default"
        onConfirm={handleUnblock}
        onCancel={() => setUnblockTarget(null)}
      />
    </div>
  );
}
