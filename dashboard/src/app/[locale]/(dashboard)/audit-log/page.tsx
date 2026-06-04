'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const prevFilterRef = useRef(filter);

  const { data, isLoading, isFetching } = useAuditLogs({ page, limit: 50, action: filter || undefined });
  const entries = data?.entries ?? [];
  const hasMore = data?.has_more ?? false;

  // Accumulate entries from all loaded pages
  useEffect(() => {
    if (filter !== prevFilterRef.current) {
      setAllEntries(entries);
      setPage(1);
      prevFilterRef.current = filter;
    } else if (page === 1) {
      setAllEntries(entries);
    } else if (entries.length > 0) {
      setAllEntries((prev) => {
        const existingIds = new Set(prev.map((e: any) => e.id));
        const newItems = entries.filter((e: any) => !existingIds.has(e.id));
        return [...prev, ...newItems];
      });
    }
  }, [entries, page, filter]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [isFetching, hasMore]);

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
          onChange={(e) => { setFilter(e.target.value); setPage(1); setAllEntries([]); }}
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
      {isLoading && allEntries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{t('loading')}</p>
        </div>
      ) : allEntries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4"><ClipboardList size={18} strokeWidth={1.75} /></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noActivity')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            {t('noActivityDesc')}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto min-w-0">
            <VirtualTable
                data={allEntries}
                estimateSize={64}
                header={
                  <div className="flex bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50 min-w-[700px]">
                    <div className="w-[160px] shrink-0 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colTime')}</div>
                    <div className="w-[140px] shrink-0 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('colAction')}</div>
                    <div className="flex-1 min-w-[120px] px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">{t('colActor')}</div>
                    <div className="w-[140px] shrink-0 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:block">{t('colResource')}</div>
                    <div className="flex-1 min-w-[150px] px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:block">{t('colDetails')}</div>
                    <div className="w-[120px] shrink-0 px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:block">{t('colIp')}</div>
                  </div>
                }
                renderRow={(entry) => (
                  <div className="flex hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition border-b border-gray-200/50 dark:border-slate-700/50 min-w-[700px]">
                    <div className="w-[160px] shrink-0 px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400 overflow-hidden text-ellipsis">{new Date(entry.timestamp).toLocaleString()}</div>
                    <div className="w-[140px] shrink-0 px-3 sm:px-6 py-3 flex items-center gap-1.5">
                      <span className="shrink-0">{ACTION_ICONS[entry.action] || <Pin size={16} strokeWidth={1.75} />}</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">{t(`actions.${entry.action}`) !== `actions.${entry.action}` ? t(`actions.${entry.action}`) : entry.action}</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-600 dark:text-slate-400 overflow-hidden text-ellipsis hidden sm:flex items-center">{entry.actor_email || entry.actor}</div>
                    <div className="w-[140px] shrink-0 px-3 sm:px-6 py-3 text-xs sm:text-sm font-mono text-gray-500 dark:text-slate-400 overflow-hidden text-ellipsis hidden md:flex items-center">{entry.resource_type}/{entry.resource_id?.slice(0, 8)}</div>
                    <div className="flex-1 min-w-[150px] px-3 sm:px-6 py-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400 overflow-hidden text-ellipsis hidden lg:flex items-center">{entry.details ? (typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)) : '—'}</div>
                    <div className="w-[120px] shrink-0 px-3 sm:px-6 py-3 text-xs sm:text-sm font-mono text-gray-500 dark:text-slate-500 overflow-hidden text-ellipsis hidden lg:flex items-center">{entry.ip_address}</div>
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
