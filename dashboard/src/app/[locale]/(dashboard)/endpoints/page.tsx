'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { endpointsApi, type Endpoint } from '@/lib/api';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

/* ─── Hook0-style: Basit tablo + Create butonu ─── */

export default function EndpointsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const t = useTranslations('endpoints');
  const tc = useTranslations('common');

  useEffect(() => {
    if (!token) return;
    endpointsApi.list(token)
      .then(setEndpoints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newUrl) return;
    setCreating(true);
    setError('');
    try {
      const ep = await endpointsApi.create(token, { url: newUrl, description: newDesc || undefined });
      setEndpoints((prev) => [ep, ...prev]);
      setNewUrl('');
      setNewDesc('');
      setShowCreate(false);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToCreate'));
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await endpointsApi.delete(token, deleteId);
      setEndpoints((prev) => prev.filter((ep) => ep.id !== deleteId));
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToDelete'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Başlık + Create ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
        >
          + {t('newEndpoint')}
        </button>
      </div>

      {/* ── Create Form (Hook0 gibi kart) ── */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('create')}</h3>
          {error && (
            <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="endpoint-url" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('urlLabel')}</label>
              <input
                id="endpoint-url"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t('form.urlPlaceholder')}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endpoint-desc" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('descriptionLabel')}</label>
              <input
                id="endpoint-desc"
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
              >
                {creating ? tc('creating') : tc('create')}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(''); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {tc('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tablo (Hook0 gibi) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {endpoints.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noEndpointsYet')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('name')}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">URL</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status')}</th>
                  <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep) => (
                  <tr key={ep.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{ep.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-900 dark:text-gray-200 max-w-xs truncate">{ep.url}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        ep.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ep.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        {ep.is_active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/endpoints/${ep.id}`)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition mr-3"
                        title={t('settingsTitle')}
                      >
                        ⚙️
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(ep.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title={t('deleteTitle')}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteTitle')}
        message={t('deleteConfirm')}
        confirmLabel={t('delete')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
