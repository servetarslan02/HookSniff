'use client';

import { useTranslations } from 'next-intl';

interface ApiKey {
  id: string;
  name: string | null;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export function KeyList({
  keys,
  loading,
  onRotate,
  onDelete,
  actionLoading,
}: {
  keys: ApiKey[];
  loading: boolean;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}) {
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('yourKeys')}</h2>
        <span className="text-sm text-gray-500 dark:text-slate-400">{t('keyCount', { count: keys.length })}</span>
      </div>
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('loadingKeys')}
          </div>
        </div>
      ) : keys.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <p className="text-gray-500 dark:text-slate-400">{t('noKeys')}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {keys.map((key) => (
            <div
              key={key.id}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {key.name && (
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{key.name}</span>
                  )}
                  <code className="text-sm font-mono text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                    {key.prefix}…
                  </code>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      key.is_active
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {key.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                  {t('createdDate', { date: new Date(key.created_at).toLocaleDateString() })}
                  {key.last_used_at && (
                    <> · {t('lastUsed', { date: new Date(key.last_used_at).toLocaleDateString() })}</>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => onRotate(key.id)}
                  disabled={actionLoading === key.id}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg transition hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  🔄 {t('rotate')}
                </button>
                <button type="button"
                  onClick={() => onDelete(key.id)}
                  disabled={actionLoading === key.id}
                  className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 dark:hover:bg-red-500 border border-red-300 dark:border-red-500/30 rounded-lg transition disabled:opacity-50"
                >
                  🗑 {tc('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
