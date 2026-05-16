'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuditLogs } from '@/hooks/useDashboardData';

/* ─── Types ─── */
const ACTION_ICONS: Record<string, string> = {
  'auth.login': '🔑',
  'auth.logout': '👋',
  'auth.register': '👤',
  'endpoint.create': '🔗',
  'endpoint.update': '✏️',
  'endpoint.delete': '🗑️',
  'apikey.create': '🔑',
  'apikey.rotate': '🔄',
  'apikey.delete': '🗑️',
  'webhook.send': '📦',
  'webhook.replay': '🔄',
  'team.invite': '👥',
  'team.remove': '👋',
  'settings.update': '⚙️',
  'billing.update': '💳',
  'schema.create': '📋',
  'portal.update': '🖼️',
};

export default function AuditLogPage() {
  const t = useTranslations('auditLog');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useAuditLogs({ page, limit: 50, action: filter || undefined });
  const entries = data?.entries ?? [];
  const hasMore = data?.has_more ?? false;

  const loadMore = () => setPage((p) => p + 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
        >
          <option value="">{t('filterAll')}</option>
          <option value="auth">{t('filterAuth')}</option>
          <option value="endpoint">{t('filterEndpoints')}</option>
          <option value="apikey">{t('filterApiKeys')}</option>
          <option value="webhook">{t('filterWebhooks')}</option>
          <option value="team">{t('filterTeam')}</option>
          <option value="settings">{t('filterSettings')}</option>
          <option value="billing">{t('filterBilling')}</option>
        </select>
      </div>

      {/* Entries */}
      {isLoading && entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{t('loading')}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noActivity')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            {t('noActivityDesc')}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colTime')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colAction')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colActor')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colResource')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colDetails')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colIp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{ACTION_ICONS[entry.action] || '📌'}</span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{entry.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{entry.actor_email || entry.actor}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-slate-400">
                      {entry.resource_type}/{entry.resource_id?.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate">
                      {entry.details
                        ? typeof entry.details === 'string'
                          ? entry.details
                          : JSON.stringify(entry.details)
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-slate-500">{entry.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-4 text-center border-t border-gray-200/50 dark:border-slate-700/50">
              <button
                onClick={loadMore}
                disabled={isFetching}
                className="px-6 py-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium disabled:opacity-50"
              >
                {isFetching ? t('loading') : t('loadMore')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
