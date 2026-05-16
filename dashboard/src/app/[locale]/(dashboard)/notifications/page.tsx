'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
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

type NotifType = 'all' | 'webhook_failed' | 'alert' | 'system' | 'billing';

const typeIcons: Record<string, string> = {
  webhook_failed: '🔴',
  alert: '⚠️',
  system: '🔔',
  billing: '💳',
};

const TYPE_FILTER_KEYS: NotifType[] = ['all', 'webhook_failed', 'alert', 'system', 'billing'];
const TYPE_I18N_MAP: Record<string, string> = {
  all: 'all',
  webhook_failed: 'webhookFailed',
  alert: 'alerts',
  system: 'system',
  billing: 'billing',
};

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

  const { data, isLoading } = useNotifications({
    page,
    type: typeFilter === 'all' ? undefined : typeFilter,
    read: readFilter === 'all' ? undefined : readFilter === 'read',
  });

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast(t('allReadSuccess'), 'success');
    } catch {
      toast(t("failedToMarkAllRead"), "error");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button type="button"
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition"
        >
          {t('markAllRead')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTER_KEYS.map((notifType) => (
            <button
              key={notifType}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                if (notifType === 'all') params.delete('type');
                else params.set('type', notifType);
                const qs = params.toString();
                router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
              }}
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
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                if (f === 'all') params.delete('read');
                else params.set('read', f);
                const qs = params.toString();
                router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
              }}
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
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-500 animate-pulse">
            {t('loadingNotifications')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-500 dark:text-slate-500">{t('noNotifications')}</p>
          </div>
        ) : (
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
                    <span className="text-xl mt-0.5">{typeIcons[n.type] || '🔔'}</span>
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
                          <span className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 dark:text-slate-500">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                          {n.type.replace('_', ' ')}
                        </span>
                      </div>
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

      {/* HS-043: Delete confirmation dialog */}
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
