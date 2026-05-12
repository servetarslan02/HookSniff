'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface ApiKey {
  id: string;
  name: string | null;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [rotateTarget, setRotateTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const data = await apiFetch<ApiKey[]>('/api-keys', { token: token || undefined });
      setKeys(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    setCreating(true);
    setError('');
    try {
      const data = await apiFetch<{ key: string }>('/api-keys', {
        method: 'POST',
        body: { name: keyName || undefined },
        token: token || undefined,
      });
      setNewKey(data.key);
      setKeyName('');
      fetchKeys();
    } catch (e: unknown) {
      setError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    setActionLoading(id);
    try {
      await apiFetch(`/api-keys/${id}`, {
        method: 'DELETE',
        token: token || undefined,
      });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (e: unknown) {
      setError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const rotateKey = async (id: string) => {
    setActionLoading(id);
    try {
      const data = await apiFetch<{ key: string }>(`/api-keys/${id}/rotate`, {
        method: 'POST',
        token: token || undefined,
      });
      setNewKey(data.key);
      fetchKeys();
    } catch (e: unknown) {
      setError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setActionLoading(null);
      setRotateTarget(null);
    }
  };

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button onClick={() => setError('')} aria-label={t("dismissError")} className="text-red-400 hover:text-red-600 transition">✕</button>
        </div>
      )}

      {/* New Key Alert */}
      {newKey && (
        <div className="glass-card p-6 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-500/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔑</span>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
              {t('newKeyCreated')}
            </h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            {t('saveKeyNow')}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg text-sm font-mono break-all border border-green-200 dark:border-green-500/30 text-gray-900 dark:text-white">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition whitespace-nowrap"
            >
              {copied ? `✓ ${tc('copied')}` : tc('copyToClipboard')}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-sm text-green-700 dark:text-green-400 hover:underline"
          >
            {t('dismiss')}
          </button>
        </div>
      )}

      {/* Create Key */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createNewKey')}</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder={t('keyNamePlaceholder')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="px-6 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 whitespace-nowrap"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {tc('creating')}
              </span>
            ) : (
              t('createKey')
            )}
          </button>
        </div>
      </div>

      {/* Key List */}
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
                    <code className="text-sm font-mono text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
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
                  <button
                    onClick={() => setRotateTarget(key.id)}
                    disabled={actionLoading === key.id}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg transition hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    🔄 {t('rotate')}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(key.id)}
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('deleteTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('deleteDesc')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={() => deleteKey(deleteTarget)}
                disabled={actionLoading === deleteTarget}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60"
              >
                {actionLoading === deleteTarget ? tc('deleting') : tc('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate Confirmation Modal */}
      {rotateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRotateTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('rotateTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('rotateDesc')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRotateTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={() => rotateKey(rotateTarget)}
                disabled={actionLoading === rotateTarget}
                className="px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition disabled:opacity-60"
              >
                {actionLoading === rotateTarget ? t('rotating') : t('rotate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
