'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { adminApi, broadcastsApi, type UserBroadcast } from '@/lib/api';
import { AlertTriangle, Bell, Shield, Users, DollarSign, XCircle, Megaphone, Wrench, Sparkles, Radio, CheckCircle2, Clock } from '@/components/icons';

interface AdminNotification {
  id: string;
  type: 'security' | 'system' | 'user' | 'billing' | 'broadcast';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  time: string;
  link?: string;
  resolved?: boolean;
}

export function AdminNotificationCenter() {
  const { token } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [broadcasts, setBroadcasts] = useState<UserBroadcast[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAdminNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const [securityData, queueData, broadcastData] = await Promise.all([
        adminApi.listSecurityEvents(token, { per_page: '5', resolved: 'false' }).catch(() => null),
        adminApi.getQueueStatus(token).catch(() => null),
        broadcastsApi.listActive(token).catch(() => null),
      ]);

      const items: AdminNotification[] = [];

      // Security events
      if (securityData?.events) {
        for (const event of securityData.events.slice(0, 3)) {
          items.push({
            id: `sec-${event.id}`,
            type: 'security',
            severity: event.severity as AdminNotification['severity'],
            title: getSecurityLabel(event.event_type),
            message: event.email ? `${event.email} · ${event.ip_address || ''}` : event.ip_address || '',
            time: event.created_at,
            link: '/admin/security',
          });
        }
      }

      // Queue status
      if (queueData) {
        if (queueData.failed_last_hour > 0) {
          items.push({
            id: 'queue-failed',
            type: 'system',
            severity: queueData.failed_last_hour > 10 ? 'critical' : 'high',
            title: 'Başarısız Teslimatlar',
            message: `Son 1 saatte ${queueData.failed_last_hour} başarısız teslimat`,
            time: new Date().toISOString(),
            link: '/admin/system',
          });
        }
        if (queueData.pending > 100) {
          items.push({
            id: 'queue-backlog',
            type: 'system',
            severity: 'medium',
            title: 'Kuyruk Birikmesi',
            message: `${queueData.pending} teslimat bekliyor`,
            time: new Date().toISOString(),
            link: '/admin/system',
          });
        }
      }

      setNotifications(items);
      if (broadcastData) setBroadcasts(broadcastData);
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchAdminNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleDismissBroadcast = async (id: string) => {
    if (!token) return;
    try {
      await broadcastsApi.dismiss(token, id);
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    } catch { /* ignore */ }
  };

  const totalCount = notifications.length + broadcasts.length;

  const severityColors: Record<string, string> = {
    critical: 'border-l-red-500 bg-red-50/30 dark:bg-red-500/5',
    high: 'border-l-orange-500 bg-orange-50/30 dark:bg-orange-500/5',
    medium: 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-500/5',
    low: 'border-l-blue-500',
    info: 'border-l-gray-400',
  };

  const severityIcons: Record<string, React.ReactNode> = {
    critical: <XCircle size={16} strokeWidth={1.75} className="text-red-500" />,
    high: <AlertTriangle size={16} strokeWidth={1.75} className="text-orange-500" />,
    medium: <Clock size={16} strokeWidth={1.75} className="text-amber-500" />,
    low: <Shield size={16} strokeWidth={1.75} className="text-blue-500" />,
    info: <CheckCircle2 size={16} strokeWidth={1.75} className="text-gray-400" />,
  };

  const typeIcons: Record<string, React.ReactNode> = {
    security: <Shield size={16} strokeWidth={1.75} className="text-red-500" />,
    system: <Wrench size={16} strokeWidth={1.75} className="text-amber-500" />,
    user: <Users size={16} strokeWidth={1.75} className="text-blue-500" />,
    billing: <DollarSign size={16} strokeWidth={1.75} className="text-green-500" />,
  };

  const broadcastTypeIcons: Record<string, React.ReactNode> = {
    maintenance: <Wrench size={16} strokeWidth={1.75} className="text-amber-500" />,
    feature: <Sparkles size={16} strokeWidth={1.75} className="text-emerald-500" />,
    announcement: <Radio size={16} strokeWidth={1.75} className="text-blue-500" />,
    incident: <XCircle size={16} strokeWidth={1.75} className="text-red-500" />,
  };

  const relativeTime = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'az önce';
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa önce`;
    return `${Math.floor(hours / 24)}g önce`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
        aria-label="Admin Bildirimleri"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Shield size={14} strokeWidth={1.75} className="text-red-500" />
              Admin Bildirimleri
            </h3>
            <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              {totalCount} adet
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {/* Broadcasts */}
            {broadcasts.map((b) => (
              <div
                key={`b-${b.id}`}
                className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition border-l-3 ${
                  b.severity === 'critical' ? 'border-l-red-500' : b.severity === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'
                } cursor-pointer`}
                onClick={() => {
                  handleDismissBroadcast(b.id);
                  if (b.link) router.push(b.link);
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5">{broadcastTypeIcons[b.broadcast_type] || <Megaphone size={16} strokeWidth={1.75} className="text-blue-500" />}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{b.broadcast_type}</span>
                      {b.severity === 'critical' && <span className="px-1 py-0.5 text-[9px] font-bold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded">KRİTİK</span>}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 truncate">{b.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-0.5 line-clamp-1">{b.message}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Admin notifications */}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition border-l-3 ${severityColors[n.severity] || 'border-l-gray-400'} cursor-pointer`}
                onClick={() => { if (n.link) router.push(n.link); }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5">{severityIcons[n.severity] || typeIcons[n.type] || <Bell size={16} strokeWidth={1.75} />}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">{n.type}</span>
                      <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${
                        n.severity === 'critical' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                        : n.severity === 'high' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }`}>
                        {n.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">{n.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-1">{relativeTime(n.time)}</p>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && broadcasts.length === 0 && (
              <div className="p-6 text-center">
                <CheckCircle2 size={32} strokeWidth={1.5} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">Her şey yolunda</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Admin bildirimi yok</p>
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-slate-700 text-center">
            <Link
              href="/admin/security"
              onClick={() => setOpen(false)}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Güvenlik Merkezi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function getSecurityLabel(eventType: string): string {
  const labels: Record<string, string> = {
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
    rate_limit_exceeded: 'Rate Limit Aşıldı',
  };
  return labels[eventType] || eventType;
}

export default AdminNotificationCenter;
