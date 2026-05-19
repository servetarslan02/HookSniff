'use client';

import { useState } from 'react';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/hooks/useDashboardData';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Circle, AlertTriangle, Bell, CreditCard, Users } from 'lucide-react';

type NotifType = 'all' | 'webhook_failed' | 'alert' | 'system' | 'billing';

const typeIcons: Record<string, React.ReactNode> = {
  webhook_failed: <Circle size={20} strokeWidth={1.75} className="text-red-500 fill-red-500" />,
  alert: <AlertTriangle size={20} strokeWidth={1.75} className="text-amber-500" />,
  system: <Bell size={20} strokeWidth={1.75} className="text-gray-400" />,
  billing: <CreditCard size={20} strokeWidth={1.75} className="text-gray-400" />,
  team_invite: <Users size={20} strokeWidth={1.75} className="text-gray-400" />,
};

const TYPE_FILTER_KEYS: NotifType[] = ['all', 'webhook_failed', 'alert', 'system', 'billing'];
const TYPE_I18N_MAP: Record<string, string> = {
  all: 'all',
  webhook_failed: 'webhookFailed',
  alert: 'alerts',
  system: 'system',
  billing: 'billing',
};

/** Format type string for display: "webhook_failed" → "Webhook Failed" */
function formatType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Relative time string: "2m ago", "3h ago", "5d ago" */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const typeFilter = (searchParams.get('type') || 'all') as NotifType;
  const readFilter = (searchParams.get('read') || 'all') as 'all' | 'read' | 'unread';
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const t = useTranslations('notifications');
  const tc = useTranslations('common');
  const perPage = 20;

  const { data, isLoading, error, refetch } = useNotifications({
    page,
    type: typeFilter === 'all' ? undefined : typeFilter,
    read: readFilter === 'all' ? undefined : readFilter === 'read',
  });

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unread_count ?? 0;

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch {
      toast(t('failedToMarkRead'), 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast(t('allReadSuccess'), 'success');
    } catch {
      toast(t('failedToMarkAllRead'), 'error');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast(t('deleted'), 'success');
    } catch {
      toast(t('deleteFailed'), 'error');
    }
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(total / perPage);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value === null) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button type="button"
            onClick={handleMarkAllAsRead}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition"
          >
            {t('markAllRead')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTER_KEYS.map((notifType) => (
            <button
              key={notifType}
              onClick={() => updateFilter('type', notifType === 'all' ? null : notifType)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                typeFilter === notifType
                  ? 'bg-gray-900 dark:bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {t(TYPE_I18N_MAP[notifType] as any)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => updateFilter('read', f === 'all' ? null : f)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                readFilter === f
                  ? 'bg-gray-900 dark:bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? t('all') : f === 'unread' ? t('unread') : t('read')}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="glass-card overflow-hidden">
        {/* ── Loading Skeleton ── */}
        {isLoading && (
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded bg-gray-200 dark:bg-slate-700 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error State ── */}
        {!isLoading && error && (
          <div className="p-12 text-center">
            <AlertTriangle size={48} strokeWidth={1.75} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 mb-3">{t('failedToLoad')}</p>
            <button type="button" onClick={() => refetch()}
              className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition">
              {tc('retry')}
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="p-12 text-center">
            <Bell size={48} strokeWidth={1.75} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-500">{t('noNotifications')}</p>
          </div>
        )}

        {/* ── Notification Items ── */}
        {!isLoading && !error && notifications.length > 0 && (
          <>
            <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                    !n.read ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5">{typeIcons[n.type] || <Bell size={20} strokeWidth={1.75} className="text-gray-400" />}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm ${
                            !n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'
                          }`}
                        >
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 dark:text-slate-500" title={new Date(n.created_at).toLocaleString()}>
                          {relativeTime(n.created_at)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                          {formatType(n.type)}
                        </span>
                      </div>
                      {n.link && (
                        <div className="mt-2">
                          <Link
                            href={n.link}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/20 transition"
                          >
                            {t('viewDetails')} →
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.read && (
                        <button type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition"
                        >
                          {t('markRead')}
                        </button>
                      )}
                      <button type="button"
                        onClick={() => handleDelete(n.id)}
                        className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
                      >
                        {tc('delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > perPage && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {tc('showing', { from: (page - 1) * perPage + 1, to: Math.min(page * perPage, total), total })}
                </span>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(Math.max(1, page - 1)));
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    {tc('previous')}
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">
                    {tc('pageOf', { page, totalPages })}
                  </span>
                  <button type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(Math.min(totalPages, page + 1)));
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    {tc('next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteNotification')}
        message={t('deleteConfirm')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
