'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useAdminAuditLogs } from '@/hooks/useAdminData';
import { useTranslations } from 'next-intl';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  REGISTER: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  ENDPOINT_CREATE: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ENDPOINT_DELETE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  ENDPOINT_UPDATE: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  API_KEY_CREATE: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
  API_KEY_DELETE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  IMPERSONATE: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
  PASSWORD_CHANGE: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  '2FA_ENABLE': 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  '2FA_DISABLE': 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  SETTINGS_UPDATE: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  FEATURE_FLAG_CREATE: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  FEATURE_FLAG_UPDATE: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  FEATURE_FLAG_DELETE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  FEATURE_FLAG_LIST: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  ALERT_CREATE: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400',
  ALERT_UPDATE: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ALERT_DELETE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  DELIVERY_REPLAY: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
  USER_PLAN_CHANGE: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400',
  USER_STATUS_CHANGE: 'bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400',
  USER_EMAIL_SEND: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  USER_GDPR_EXPORT: 'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400',
  USER_GDPR_DELETE: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  ADMIN_TEST_WEBHOOK: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  BULK_REPLAY: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
};

const ACTION_ICONS: Record<string, string> = {
  LOGIN: '🔑',
  REGISTER: '👤',
  ENDPOINT_CREATE: '➕',
  ENDPOINT_DELETE: '🗑️',
  ENDPOINT_UPDATE: '✏️',
  API_KEY_CREATE: '🔐',
  API_KEY_DELETE: '🗑️',
  IMPERSONATE: '👁️',
  PASSWORD_CHANGE: '🔒',
  '2FA_ENABLE': '🛡️',
  '2FA_DISABLE': '🛡️',
  SETTINGS_UPDATE: '⚙️',
  FEATURE_FLAG_CREATE: '🚩',
  FEATURE_FLAG_UPDATE: '🚩',
  FEATURE_FLAG_DELETE: '🚩',
  FEATURE_FLAG_LIST: '🚩',
  ALERT_CREATE: '🚨',
  ALERT_UPDATE: '🚨',
  ALERT_DELETE: '🚨',
  DELIVERY_REPLAY: '↩️',
  USER_PLAN_CHANGE: '💳',
  USER_STATUS_CHANGE: '👤',
  USER_EMAIL_SEND: '📧',
  USER_GDPR_EXPORT: '📤',
  USER_GDPR_DELETE: '🗑️',
  ADMIN_TEST_WEBHOOK: '🧪',
  BULK_REPLAY: '↩️',
};

const KNOWN_ACTIONS = [
  'LOGIN',
  'REGISTER',
  'ENDPOINT_CREATE',
  'ENDPOINT_DELETE',
  'ENDPOINT_UPDATE',
  'API_KEY_CREATE',
  'API_KEY_DELETE',
  'IMPERSONATE',
  'PASSWORD_CHANGE',
  '2FA_ENABLE',
  '2FA_DISABLE',
  'SETTINGS_UPDATE',
  'FEATURE_FLAG_CREATE',
  'FEATURE_FLAG_UPDATE',
  'FEATURE_FLAG_DELETE',
  'FEATURE_FLAG_LIST',
  'ALERT_CREATE',
  'ALERT_UPDATE',
  'ALERT_DELETE',
  'DELIVERY_REPLAY',
  'USER_PLAN_CHANGE',
  'USER_STATUS_CHANGE',
  'USER_EMAIL_SEND',
  'USER_GDPR_EXPORT',
  'USER_GDPR_DELETE',
  'ADMIN_TEST_WEBHOOK',
  'BULK_REPLAY',
];

const perPage = 20;

export default function AdminActivityPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const { data, isLoading, error, refetch } = useAdminAuditLogs({
    limit: perPage,
    offset: (page - 1) * perPage,
    action: actionFilter || undefined,
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / perPage);

  const formatAction = (action: string) => {
    return action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300';
  };

  const getActionIcon = (action: string) => {
    return ACTION_ICONS[action] || '📋';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('activityLog')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('activityDesc')}
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition"
        >
          ← {tc('back')}
        </Link>
      </div>

      {/* Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="action-filter" className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {t('filterByAction')}:
          </label>
          <select
            id="action-filter"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">{t('allActions')}</option>
            {KNOWN_ACTIONS.map((a) => (
              <option key={a} value={a}>{formatAction(a)}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-slate-400 ml-auto">
            {tc('showing', { from: Math.min((page - 1) * perPage + 1, total), to: Math.min(page * perPage, total), total })}
          </span>
        </div>
      </div>

      {/* Activity List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">{tc('loading')}</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
              <span className="text-red-700 dark:text-red-400 text-sm">{tc('error')}</span>
              <button type="button"
                onClick={() => refetch()}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
              >
                {tc('retry')}
              </button>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <span className="text-4xl block mb-3" aria-hidden="true">📋</span>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noActivity')}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-800/30 border-b border-gray-200/50 dark:border-slate-700/50 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">{t('action')}</div>
              <div className="col-span-2">{t('resource')}</div>
              <div className="col-span-2">{t('adminUser')}</div>
              <div className="col-span-2">{t('timestamp')}</div>
              <div className="col-span-3">{t('details')}</div>
            </div>

            <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                >
                  {/* Action */}
                  <div className="md:col-span-3 flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">{getActionIcon(entry.action)}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                      {formatAction(entry.action)}
                    </span>
                  </div>

                  {/* Resource */}
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-900 dark:text-white">{entry.resource_type}</span>
                    {entry.resource_id && (
                      <p className="text-xs font-mono text-gray-500 dark:text-slate-400 truncate">
                        {entry.resource_id.slice(0, 8)}…
                      </p>
                    )}
                  </div>

                  {/* Admin */}
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {entry.customer_email || entry.customer_id?.slice(0, 8) + '…'}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {new Date(entry.created_at).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-3">
                    {entry.details ? (
                      <pre className="text-xs font-mono text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 rounded-lg p-2 overflow-x-auto max-h-20">
                        {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-slate-500">—</span>
                    )}
                    {entry.ip_address && (
                      <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-1">
                        IP: {entry.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {total > perPage && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {t('page')} {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    {tc('previous')}
                  </button>
                  <button type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
    </div>
  );
}
