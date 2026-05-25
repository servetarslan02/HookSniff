'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuditLogs } from '@/hooks/useDashboardData';
import { VirtualTable } from '@/components/VirtualTable';
import { ClipboardList, CreditCard, Image, Key, Link2, LogOut, Package, Pencil, Pin, RefreshCw, Settings, Trash2, User, UserMinus, Users } from '@/components/icons';

/* ─── Types ─── */
const ACTION_ICONS: Record<string, React.ReactNode> = {
  'auth.login': <Key size={16} strokeWidth={1.75} />,
  'auth.logout': <LogOut size={16} strokeWidth={1.75} />,
  'auth.register': <User size={16} strokeWidth={1.75} />,
  'endpoint.create': <Link2 size={16} strokeWidth={1.75} />,
  'endpoint.update': <Pencil size={16} strokeWidth={1.75} />,
  'endpoint.delete': <Trash2 size={16} strokeWidth={1.75} />,
  'apikey.create': <Key size={16} strokeWidth={1.75} />,
  'apikey.rotate': <RefreshCw size={16} strokeWidth={1.75} />,
  'apikey.delete': <Trash2 size={16} strokeWidth={1.75} />,
  'webhook.send': <Package size={16} strokeWidth={1.75} />,
  'webhook.replay': <RefreshCw size={16} strokeWidth={1.75} />,
  'team.invite': <Users size={16} strokeWidth={1.75} />,
  'team.remove': <UserMinus size={16} strokeWidth={1.75} />,
  'settings.update': <Settings size={16} strokeWidth={1.75} />,
  'billing.update': <CreditCard size={16} strokeWidth={1.75} />,
  'schema.create': <ClipboardList size={16} strokeWidth={1.75} />,
  'portal.update': <Image size={16} strokeWidth={1.75} />,
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-xs sm:text-sm text-gray-900 dark:text-white"
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
          <div className="text-5xl mb-4"><ClipboardList size={18} strokeWidth={1.75} /></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noActivity')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            {t('noActivityDesc')}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <VirtualTable
                data={entries}
                estimateSize={56}
                header={
                  <div className="grid grid-cols-[140px_120px_minmax(100px,1fr)_120px_minmax(100px,1fr)_100px] bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colTime')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colAction')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">{t('colActor')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:block">{t('colResource')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:block">{t('colDetails')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:block">{t('colIp')}</div>
                  </div>
                }
                renderRow={(entry) => (
                  <div className="grid grid-cols-[140px_120px_minmax(100px,1fr)_120px_minmax(100px,1fr)_100px] hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition border-b border-gray-200/50 dark:border-slate-700/50">
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-1.5 sm:gap-2">
                      <span>{ACTION_ICONS[entry.action] || <Pin size={16} strokeWidth={1.75} />}</span>
                      <span className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white">{entry.action}</span>
                    </div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hidden sm:flex items-center">{entry.actor_email || entry.actor}</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-500 dark:text-slate-400 hidden md:flex items-center">{entry.resource_type}/{entry.resource_id?.slice(0, 8)}</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-xs truncate hidden lg:flex items-center">{entry.details ? (typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)) : '—'}</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-500 dark:text-slate-500 hidden lg:flex items-center">{entry.ip_address}</div>
                  </div>
                )}
              />
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
