'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { applicationsApi, type Application } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

/* ─── Hook0-style: Applications tablosu ─── */

export default function ApplicationsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const t = useTranslations('applications');
  const tc = useTranslations('common');

  useEffect(() => {
    if (!token) return;
    applicationsApi.list(token)
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName) return;
    setCreating(true);
    setError('');
    try {
      const app = await applicationsApi.create(token, { name: newName, description: newDesc || undefined });
      setApps((prev) => [app, ...prev]);
      setNewName('');
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
      await applicationsApi.delete(token, deleteId);
      setApps((prev) => prev.filter((a) => a.id !== deleteId));
      toast(t('deleted') || 'Uygulama silindi', 'success');
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
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title') || 'Uygulamalar'}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('subtitle') || 'Web kancalarınız için yalıtılmış ortam'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
        >
          + {t('create') || 'Uygulama oluştur'}
        </button>
      </div>

      {/* ── Create Form ── */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('create') || 'Uygulama oluştur'}</h3>
          {error && (
            <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="app-name" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('nameLabel') || 'İsim'}
              </label>
              <input
                id="app-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('namePlaceholder') || 'Benim Uygulamam'}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="app-desc" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('descriptionLabel') || 'Açıklama'}
              </label>
              <input
                id="app-desc"
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('descriptionPlaceholder') || 'Opsiyonel açıklama'}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
              >
                {creating ? (tc('creating') || 'Oluşturuluyor...') : (tc('create') || 'Oluştur')}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(''); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {tc('cancel') || 'İptal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tablo (Hook0 gibi) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {apps.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('empty') || 'Henüz uygulama yok'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('nameLabel') || 'İsim'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">ID</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('endpoints') || 'Endpoint\'ler'}</th>
                  <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('actions') || 'Eylemler'}</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3">
                      <Link href={`/applications/${app.id}`} className="text-gray-900 dark:text-white font-medium hover:underline">
                        {app.name}
                      </Link>
                      {app.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{app.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{app.id}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{app.endpoint_count}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(app.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title={t('delete') || 'Sil'}
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
        title={t('deleteTitle') || 'Uygulamayı sil'}
        message={t('deleteConfirm') || 'Bu uygulamayı silmek istediğinize emin misiniz? Tüm endpoint ve teslimat kayıtları da silinecek.'}
        confirmLabel={t('delete') || 'Sil'}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
