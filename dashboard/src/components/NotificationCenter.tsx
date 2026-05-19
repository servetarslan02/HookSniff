'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { notificationsApi, broadcastsApi, teamsApi, type Notification, type UserBroadcast } from '@/lib/api';
import { AlertTriangle, Bell, Circle, CreditCard, Users, Megaphone, Wrench, Sparkles, Radio, XCircle } from 'lucide-react';

export function NotificationCenter() {
  const t = useTranslations('nav');
  const { token } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [broadcasts, setBroadcasts] = useState<UserBroadcast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const [notifData, countData, broadcastData, broadcastCountData] = await Promise.all([
        notificationsApi.list(token, { page: 1 }).catch(() => null),
        notificationsApi.getUnreadCount(token).catch(() => null),
        broadcastsApi.listActive(token).catch(() => null),
        broadcastsApi.getUnreadCount(token).catch(() => null),
      ]);
      if (notifData) setNotifications(notifData.notifications || []);
      if (countData) setUnreadCount(countData.unread_count || 0);
      if (broadcastData) setBroadcasts(broadcastData || []);
      if (broadcastCountData) setBroadcastCount(broadcastCountData.unread_count || 0);
    } catch {
      // Silently fail - notifications are non-critical
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await notificationsApi.markAsRead(token, id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await notificationsApi.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const extractInviteToken = (n: Notification): string | null => {
    if (n.type !== 'team_invite' || !n.link) return null;
    const match = n.link.match(/[?&]invite_token=([^&]+)/);
    return match ? match[1] : null;
  };

  const handleAcceptInvite = async (n: Notification) => {
    if (!token) return;
    const inviteToken = extractInviteToken(n);
    if (!inviteToken) {
      // No token in link, just navigate to team page
      router.push('/team-mgmt');
      return;
    }
    setAcceptingId(n.id);
    try {
      await teamsApi.acceptInvite(token, inviteToken);
      await notificationsApi.markAsRead(token, n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      router.push('/team-mgmt');
    } catch {
      // Mark as read anyway and redirect
      await notificationsApi.markAsRead(token, n.id).catch(() => {});
      router.push('/team-mgmt');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineInvite = async (n: Notification) => {
    if (!token) return;
    try {
      await notificationsApi.deleteNotification(token, n.id);
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleDismissBroadcast = async (id: string) => {
    if (!token) return;
    try {
      await broadcastsApi.dismiss(token, id);
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
      setBroadcastCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const totalCount = unreadCount + broadcastCount;

  const broadcastTypeIcons: Record<string, React.ReactNode> = {
    maintenance: <Wrench size={16} strokeWidth={1.75} className="text-amber-500" />,
    feature: <Sparkles size={16} strokeWidth={1.75} className="text-emerald-500" />,
    announcement: <Radio size={16} strokeWidth={1.75} className="text-blue-500" />,
    incident: <XCircle size={16} strokeWidth={1.75} className="text-red-500" />,
  };

  const severityColors: Record<string, string> = {
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
    critical: 'border-l-red-500',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    webhook_failed: <Circle size={16} strokeWidth={1.75} />,
    alert: <AlertTriangle size={16} strokeWidth={1.75} />,
    system: <Bell size={16} strokeWidth={1.75} />,
    billing: <CreditCard size={16} strokeWidth={1.75} />,
    team_invite: <Users size={16} strokeWidth={1.75} />,
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
        aria-label={t("notifications")}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('notificationsTitle') || 'Notifications'}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition"
              >
                {t('markAllRead') || 'Mark all read'}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {/* Broadcasts first */}
            {broadcasts.map((b) => (
              <div
                key={`b-${b.id}`}
                className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition border-l-3 ${severityColors[b.severity] || 'border-l-blue-500'} cursor-pointer`}
                onClick={() => {
                  handleDismissBroadcast(b.id);
                  if (b.link) router.push(b.link);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">
                    {broadcastTypeIcons[b.broadcast_type] || <Megaphone size={16} strokeWidth={1.75} className="text-blue-500" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">
                        {b.broadcast_type}
                      </span>
                      {b.severity === 'critical' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                      {b.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5 line-clamp-2">
                      {b.message}
                    </p>
                    {b.link_text && (
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-medium">
                        → {b.link_text}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500 dark:text-slate-600 mt-1">
                      {new Date(b.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Megaphone size={14} strokeWidth={1.75} className="text-gray-300 dark:text-slate-600 shrink-0 mt-1" />
                </div>
              </div>
            ))}

            {/* Notifications */}
            {notifications.length === 0 && broadcasts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-slate-500 text-sm">
                {t('noNotifications') || 'No notifications'}
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                    !n.read ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''
                  } ${n.type !== 'team_invite' ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (n.type !== 'team_invite') {
                      if (!n.read) handleMarkAsRead(n.id);
                      if (n.link) router.push(n.link);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">{typeIcons[n.type] || <Bell size={16} strokeWidth={1.75} />}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>

                      {/* Team invite actions */}
                      {n.type === 'team_invite' && !n.read && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAcceptInvite(n)}
                            disabled={acceptingId === n.id}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                          >
                            {acceptingId === n.id ? '...' : (t('acceptInvite') || 'Kabul Et')}
                          </button>
                          <button
                            onClick={() => handleDeclineInvite(n)}
                            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
                          >
                            {t('declineInvite') || 'Reddet'}
                          </button>
                        </div>
                      )}
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-slate-700 text-center">
            <Link
              href="/account?tab=notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >
              {t('viewAllNotifications') || 'View all notifications →'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
